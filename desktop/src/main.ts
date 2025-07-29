import { app, BrowserWindow, ipcMain, Tray, Menu, nativeImage } from 'electron';
import * as path from 'path';
import { KeyboardController } from './keyboard-controller';
import { ApiConnection } from './api-connection';

class OveractionDesktop {
  private mainWindow: BrowserWindow | null = null;
  private tray: Tray | null = null;
  private keyboardController: KeyboardController;
  private apiConnection: ApiConnection;
  private isConnected = false;

  constructor() {
    this.keyboardController = new KeyboardController();
    this.apiConnection = new ApiConnection();
    
    this.setupApp();
    this.setupIPC();
  }

  private setupApp() {
    app.whenReady().then(() => {
      this.createWindow();
      this.createTray();
      this.connectToAPI();
    });

    app.on('window-all-closed', () => {
      // Keep app running in system tray
      if (process.platform !== 'darwin') {
        // Don't quit, just hide to tray
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });
  }

  private createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 400,
      height: 600,
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      },
      icon: path.join(__dirname, '../assets/icon.png'),
      title: 'Overaction Desktop',
      resizable: false,
      minimizable: true,
      closable: true
    });

    // Load the HTML interface
    this.mainWindow.loadFile(path.join(__dirname, '../assets/index.html'));

    // Hide to tray when closed
    this.mainWindow.on('close', (event) => {
      if (!(app as any).isQuiting) {
        event.preventDefault();
        this.mainWindow?.hide();
      }
    });
  }

  private createTray() {
    const icon = nativeImage.createFromPath(path.join(__dirname, '../assets/icon.png'));
    this.tray = new Tray(icon.resize({ width: 16, height: 16 }));
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show Overaction',
        click: () => {
          this.mainWindow?.show();
        }
      },
      {
        label: this.isConnected ? 'Connected ✅' : 'Disconnected ❌',
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          (app as any).isQuiting = true;
          app.quit();
        }
      }
    ]);

    this.tray.setContextMenu(contextMenu);
    this.tray.setToolTip('Overaction Desktop - Streamer Controls');
    
    this.tray.on('click', () => {
      this.mainWindow?.show();
    });
  }

  private setupIPC() {
    // Handle connection status updates
    ipcMain.handle('get-connection-status', () => {
      return this.isConnected;
    });

    // Handle API connection requests
    ipcMain.handle('connect-to-api', async (event, apiUrl: string, token: string) => {
      try {
        await this.apiConnection.connect(apiUrl, token);
        this.isConnected = true;
        this.updateTrayMenu();
        return { success: true };
      } catch (error) {
        console.error('Failed to connect to API:', error);
        return { success: false, error: String(error) };
      }
    });

    // Handle disconnect requests
    ipcMain.handle('disconnect-from-api', () => {
      this.apiConnection.disconnect();
      this.isConnected = false;
      this.updateTrayMenu();
    });
  }

  private updateTrayMenu() {
    if (!this.tray) return;
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Show Overaction',
        click: () => {
          this.mainWindow?.show();
        }
      },
      {
        label: this.isConnected ? 'Connected ✅' : 'Disconnected ❌',
        enabled: false
      },
      { type: 'separator' },
      {
        label: 'Quit',
        click: () => {
          (app as any).isQuiting = true;
          app.quit();
        }
      }
    ]);

    this.tray.setContextMenu(contextMenu);
  }

  private async connectToAPI() {
    // Setup API event handlers
    this.apiConnection.on('punishment', (punishment) => {
      console.log('Received punishment:', punishment);
      this.handlePunishment(punishment);
    });

    this.apiConnection.on('connected', () => {
      this.isConnected = true;
      this.updateTrayMenu();
      this.mainWindow?.webContents.send('connection-status', true);
    });

    this.apiConnection.on('disconnected', () => {
      this.isConnected = false;
      this.updateTrayMenu();
      this.mainWindow?.webContents.send('connection-status', false);
    });
  }

  private handlePunishment(punishment: any) {
    // Handle blocking actions
    if (punishment.type.startsWith('block_key_')) {
      const key = punishment.type.replace('block_key_', '');
      this.keyboardController.blockKey(key, punishment.duration);
    }
    // Handle key press actions
    else if (punishment.type.startsWith('press_key_')) {
      const key = punishment.type.replace('press_key_', '');
      this.keyboardController.pressKey(key);
    }
    else {
      console.log('Unknown punishment type:', punishment.type);
    }

    // Notify the UI
    this.mainWindow?.webContents.send('punishment-received', punishment);
  }
}

// Create the app instance
new OveractionDesktop();