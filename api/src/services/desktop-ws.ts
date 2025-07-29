import WebSocket, { WebSocketServer } from "ws";
import { IncomingMessage } from "http";
import { EventEmitter } from "events";

interface DesktopClient {
  id: string;
  ws: WebSocket;
  authenticated: boolean;
  userId?: string;
  connectedAt: Date;
}

interface PunishmentMessage {
  type: "punishment";
  data: {
    id: string;
    type: string;
    duration: number;
    triggeredBy: string;
  };
}

export class DesktopWebSocketService extends EventEmitter {
  private clients: Map<string, DesktopClient> = new Map();
  private server: WebSocketServer | null = null;

  constructor() {
    super();
  }

  public initialize(server: any): void {
    this.server = new WebSocketServer({
      server,
      path: "/streamer-events",
    });

    this.server.on("connection", (ws: WebSocket, req: IncomingMessage) => {
      this.handleConnection(ws, req);
    });

    console.log("Desktop WebSocket service initialized on /streamer-events");
  }

  private handleConnection(ws: WebSocket, req: IncomingMessage): void {
    const clientId = this.generateClientId();
    const client: DesktopClient = {
      id: clientId,
      ws,
      authenticated: false,
      connectedAt: new Date(),
    };

    this.clients.set(clientId, client);
    console.log(`Desktop client connected: ${clientId}`);

    // Check for token in query params
    const url = new globalThis.URL(req.url!, `http://${req.headers.host}`);
    const token = url.searchParams.get("token");

    if (token) {
      // For now, accept any token - in production, validate against user database
      client.authenticated = true;
      client.userId = "streamer-" + token.substring(0, 8);
      console.log(`Desktop client authenticated: ${clientId}`);

      this.sendMessage(client, {
        type: "auth_success",
        message: "Authentication successful",
      });
    } else {
      this.sendMessage(client, {
        type: "auth_required",
        message: "Authentication token required",
      });
    }

    ws.on("message", (data: WebSocket.Data) => {
      this.handleMessage(client, data);
    });

    ws.on("close", () => {
      this.handleDisconnection(clientId);
    });

    ws.on("error", (error) => {
      console.error(`WebSocket error for client ${clientId}:`, error);
      this.handleDisconnection(clientId);
    });

    // Send ping every 30 seconds to keep connection alive
    const pingInterval = globalThis.setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        this.sendMessage(client, { type: "ping" });
      } else {
        globalThis.clearInterval(pingInterval);
      }
    }, 30000);
  }

  private handleMessage(client: DesktopClient, data: WebSocket.Data): void {
    try {
      const message = JSON.parse(data.toString());

      switch (message.type) {
      case "pong":
        // Client responded to ping
        break;

      case "identify":
        console.log("Desktop client identified:", message);
        break;

      default:
        console.log(`Unknown message from desktop client ${client.id}:`, message);
      }
    } catch (error) {
      console.error(`Invalid message from desktop client ${client.id}:`, error);
    }
  }

  private handleDisconnection(clientId: string): void {
    const client = this.clients.get(clientId);
    if (client) {
      console.log(`Desktop client disconnected: ${clientId}`);
      this.clients.delete(clientId);
    }
  }

  private sendMessage(client: DesktopClient, message: any): void {
    if (client.ws.readyState === WebSocket.OPEN) {
      try {
        client.ws.send(JSON.stringify(message));
      } catch (error) {
        console.error(`Failed to send message to client ${client.id}:`, error);
      }
    }
  }

  public sendPunishment(punishment: PunishmentMessage["data"]): void {
    const message: PunishmentMessage = {
      type: "punishment",
      data: punishment,
    };

    // Send to all authenticated desktop clients
    for (const client of this.clients.values()) {
      if (client.authenticated) {
        this.sendMessage(client, message);
      }
    }

    console.log(`Sent punishment to ${this.getAuthenticatedClientsCount()} desktop clients:`, punishment);
  }

  public sendPunishmentEnd(punishmentId: string): void {
    const message = {
      type: "punishment_end",
      data: { id: punishmentId },
    };

    // Send to all authenticated desktop clients
    for (const client of this.clients.values()) {
      if (client.authenticated) {
        this.sendMessage(client, message);
      }
    }

    console.log(`Sent punishment end to ${this.getAuthenticatedClientsCount()} desktop clients:`, punishmentId);
  }

  public getConnectedClientsCount(): number {
    return this.clients.size;
  }

  public getAuthenticatedClientsCount(): number {
    let count = 0;
    for (const client of this.clients.values()) {
      if (client.authenticated) count++;
    }
    return count;
  }

  private generateClientId(): string {
    return "desktop_" + Math.random().toString(36).substring(2) + Date.now().toString(36);
  }

  public close(): void {
    if (this.server) {
      // Close all client connections
      for (const client of this.clients.values()) {
        client.ws.close(1000, "Server shutdown");
      }

      this.clients.clear();
      this.server.close();
      console.log("Desktop WebSocket service closed");
    }
  }
}

// Singleton instance
export const desktopWS = new DesktopWebSocketService();
