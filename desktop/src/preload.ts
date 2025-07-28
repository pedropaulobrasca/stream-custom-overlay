import { contextBridge, ipcRenderer } from 'electron';

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Connection management
  getConnectionStatus: () => ipcRenderer.invoke('get-connection-status'),
  connectToAPI: (apiUrl: string, token: string) => 
    ipcRenderer.invoke('connect-to-api', apiUrl, token),
  disconnectFromAPI: () => ipcRenderer.invoke('disconnect-from-api'),

  // Event listeners
  onConnectionStatus: (callback: (status: boolean) => void) => {
    ipcRenderer.on('connection-status', (event, status) => callback(status));
  },
  
  onPunishmentReceived: (callback: (punishment: any) => void) => {
    ipcRenderer.on('punishment-received', (event, punishment) => callback(punishment));
  },

  // Remove event listeners
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
});

// Types for TypeScript support
declare global {
  interface Window {
    electronAPI: {
      getConnectionStatus: () => Promise<boolean>;
      connectToAPI: (apiUrl: string, token: string) => Promise<{success: boolean, error?: string}>;
      disconnectFromAPI: () => Promise<void>;
      onConnectionStatus: (callback: (status: boolean) => void) => void;
      onPunishmentReceived: (callback: (punishment: any) => void) => void;
      removeAllListeners: (channel: string) => void;
    }
  }
}