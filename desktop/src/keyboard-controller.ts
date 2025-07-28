import { EventEmitter } from 'events';
import { globalShortcut } from 'electron';

export class KeyboardController extends EventEmitter {
  private blockedKeys: Set<string> = new Set();
  private activeTimeouts: Map<string, NodeJS.Timeout> = new Map();
  private registeredShortcuts: Set<string> = new Set();
  private isHookActive = false;

  // Electron accelerator mappings for common Albion Online keys  
  private readonly KEY_ACCELERATORS: { [key: string]: string } = {
    'e': 'E',
    'q': 'Q',  
    'w': 'W',
    'r': 'R',
    'd': 'D',
    'f': 'F',
    'space': 'Space',
    'tab': 'Tab',
    '1': '1',
    '2': '2',
    '3': '3',
    '4': '4',
    '5': '5',
  };

  constructor() {
    super();
    this.initializeHook();
  }

  private async initializeHook() {
    try {
      this.isHookActive = true;
      console.log('Keyboard controller initialized successfully');
      console.log('Note: Key blocking will be active when punishment is received');
    } catch (error) {
      console.error('Failed to initialize keyboard controller:', error);
      this.isHookActive = false;
    }
  }

  public blockKey(key: string, durationMs: number): void {
    const normalizedKey = key.toLowerCase();
    
    if (!this.KEY_ACCELERATORS[normalizedKey]) {
      console.error(`Unsupported key: ${key}`);
      return;
    }

    console.log(`Blocking key "${normalizedKey}" for ${durationMs}ms`);
    
    // Clear any existing timeout for this key
    if (this.activeTimeouts.has(normalizedKey)) {
      clearTimeout(this.activeTimeouts.get(normalizedKey)!);
      this.unregisterShortcut(normalizedKey);
    }

    // Add key to blocked set
    this.blockedKeys.add(normalizedKey);
    
    // Register global shortcut to block the key
    this.registerShortcut(normalizedKey);
    
    // Set timeout to unblock the key
    const timeout = setTimeout(() => {
      this.unblockKey(normalizedKey);
    }, durationMs);
    
    this.activeTimeouts.set(normalizedKey, timeout);
    
    // Emit event for UI updates
    this.emit('key-blocked-start', {
      key: normalizedKey,
      duration: durationMs,
      endsAt: Date.now() + durationMs
    });
  }

  private registerShortcut(key: string): void {
    const accelerator = this.KEY_ACCELERATORS[key];
    if (!accelerator) return;

    try {
      const success = globalShortcut.register(accelerator, () => {
        console.log(`Blocked key press: ${key.toUpperCase()}`);
        this.emit('key-blocked', { key, timestamp: Date.now() });
        // Do nothing - this effectively blocks the key
      });

      if (success) {
        this.registeredShortcuts.add(key);
        console.log(`Successfully registered shortcut for key: ${key.toUpperCase()}`);
      } else {
        console.warn(`Failed to register shortcut for key: ${key.toUpperCase()}`);
      }
    } catch (error) {
      console.error(`Error registering shortcut for key ${key}:`, error);
    }
  }

  private unregisterShortcut(key: string): void {
    const accelerator = this.KEY_ACCELERATORS[key];
    if (!accelerator) return;

    try {
      globalShortcut.unregister(accelerator);
      this.registeredShortcuts.delete(key);
      console.log(`Unregistered shortcut for key: ${key.toUpperCase()}`);
    } catch (error) {
      console.error(`Error unregistering shortcut for key ${key}:`, error);
    }
  }

  public unblockKey(key: string): void {
    const normalizedKey = key.toLowerCase();
    
    this.blockedKeys.delete(normalizedKey);
    
    if (this.activeTimeouts.has(normalizedKey)) {
      clearTimeout(this.activeTimeouts.get(normalizedKey)!);
      this.activeTimeouts.delete(normalizedKey);
    }
    
    // Unregister the global shortcut
    this.unregisterShortcut(normalizedKey);
    
    console.log(`Unblocked key: ${normalizedKey}`);
    
    // Emit event for UI updates
    this.emit('key-blocked-end', { key: normalizedKey });
  }

  public getBlockedKeys(): string[] {
    return Array.from(this.blockedKeys);
  }

  public isKeyBlocked(key: string): boolean {
    return this.blockedKeys.has(key.toLowerCase());
  }

  public clearAllBlocks(): void {
    // Clear all timeouts
    for (const timeout of this.activeTimeouts.values()) {
      clearTimeout(timeout);
    }
    
    // Unregister all shortcuts
    for (const key of this.registeredShortcuts) {
      this.unregisterShortcut(key);
    }
    
    this.activeTimeouts.clear();
    this.blockedKeys.clear();
    this.registeredShortcuts.clear();
    
    console.log('All key blocks cleared');
    this.emit('all-blocks-cleared');
  }

  public getHookStatus(): boolean {
    return this.isHookActive;
  }

  public destroy(): void {
    this.clearAllBlocks();
    globalShortcut.unregisterAll();
    this.isHookActive = false;
  }
}