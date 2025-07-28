import { EventEmitter } from 'events';
import WebSocket from 'ws';

interface PunishmentEvent {
  id: string;
  type: string;
  duration: number;
  triggeredBy: string;
  timestamp: number;
}

interface ConnectionConfig {
  apiUrl: string;
  token: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
}

export class ApiConnection extends EventEmitter {
  private ws: WebSocket | null = null;
  private config: ConnectionConfig | null = null;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private isConnected = false;

  constructor() {
    super();
  }

  public async connect(apiUrl: string, token: string): Promise<void> {
    if (this.isConnecting || this.isConnected) {
      throw new Error('Already connected or connecting');
    }

    this.config = {
      apiUrl: apiUrl.replace('http', 'ws'), // Convert HTTP to WebSocket URL
      token,
      reconnectInterval: 5000, // 5 seconds
      maxReconnectAttempts: 10
    };

    return this.establishConnection();
  }

  private async establishConnection(): Promise<void> {
    if (!this.config) {
      throw new Error('Connection config not set');
    }

    this.isConnecting = true;

    return new Promise((resolve, reject) => {
      try {
        // Construct WebSocket URL for streamer events
        const wsUrl = `${this.config!.apiUrl}/streamer-events?token=${this.config!.token}`;
        
        console.log('Connecting to:', wsUrl);
        this.ws = new WebSocket(wsUrl);

        this.ws.on('open', () => {
          console.log('Connected to Overaction API');
          this.isConnected = true;
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          
          // Send identification message
          this.send({
            type: 'identify',
            clientType: 'desktop',
            version: '1.0.0'
          });

          this.emit('connected');
          resolve();
        });

        this.ws.on('message', (data: WebSocket.Data) => {
          try {
            const message = JSON.parse(data.toString());
            this.handleMessage(message);
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error);
          }
        });

        this.ws.on('close', (code: number, reason: Buffer) => {
          console.log(`WebSocket closed: ${code} - ${reason.toString()}`);
          this.isConnected = false;
          this.isConnecting = false;
          this.ws = null;
          
          this.emit('disconnected', { code, reason: reason.toString() });
          
          // Attempt to reconnect if not manually disconnected
          if (code !== 1000 && this.config && this.reconnectAttempts < this.config.maxReconnectAttempts) {
            this.scheduleReconnect();
          }
        });

        this.ws.on('error', (error: Error) => {
          console.error('WebSocket error:', error);
          this.isConnecting = false;
          
          if (!this.isConnected) {
            reject(error);
          }
          
          this.emit('error', error);
        });

        // Connection timeout
        setTimeout(() => {
          if (this.isConnecting) {
            this.isConnecting = false;
            reject(new Error('Connection timeout'));
          }
        }, 10000);

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.reconnectAttempts++;
    const delay = this.config!.reconnectInterval * Math.min(this.reconnectAttempts, 5); // Max 25 seconds

    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);

    this.reconnectTimer = setTimeout(async () => {
      try {
        await this.establishConnection();
      } catch (error) {
        console.error('Reconnection failed:', error);
      }
    }, delay);
  }

  private handleMessage(message: any): void {
    console.log('Received message:', message);

    switch (message.type) {
      case 'punishment':
        this.handlePunishment(message.data);
        break;
      
      case 'punishment_end':
        this.handlePunishmentEnd(message.data);
        break;
      
      case 'ping':
        this.send({ type: 'pong' });
        break;
      
      case 'error':
        console.error('API Error:', message.error);
        this.emit('api-error', message.error);
        break;
      
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  private handlePunishment(punishmentData: any): void {
    const punishment: PunishmentEvent = {
      id: punishmentData.id,
      type: punishmentData.type,
      duration: punishmentData.duration,
      triggeredBy: punishmentData.triggeredBy,
      timestamp: Date.now()
    };

    console.log('Processing punishment:', punishment);
    this.emit('punishment', punishment);
  }

  private handlePunishmentEnd(punishmentData: any): void {
    console.log('Punishment ended:', punishmentData);
    this.emit('punishment-end', punishmentData);
  }

  public send(data: any): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      console.warn('Cannot send message: WebSocket not connected');
      return;
    }

    try {
      this.ws.send(JSON.stringify(data));
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  }

  public disconnect(): void {
    // Clear reconnect timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }

    // Close WebSocket connection
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
    }

    // Reset state
    this.isConnected = false;
    this.isConnecting = false;
    this.reconnectAttempts = 0;
    this.config = null;
    this.ws = null;

    console.log('Disconnected from API');
  }

  public getConnectionStatus(): boolean {
    return this.isConnected;
  }

  public getReconnectAttempts(): number {
    return this.reconnectAttempts;
  }
}