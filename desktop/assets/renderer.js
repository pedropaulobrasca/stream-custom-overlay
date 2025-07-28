class OveractionDesktopUI {
    constructor() {
        this.isConnected = false;
        this.blockedKeys = new Set();
        this.punishmentLog = [];
        
        this.initializeUI();
        this.setupEventListeners();
        this.checkInitialStatus();
    }

    initializeUI() {
        this.elements = {
            statusDot: document.getElementById('statusDot'),
            statusText: document.getElementById('statusText'),
            apiUrl: document.getElementById('apiUrl'),
            token: document.getElementById('token'),
            connectBtn: document.getElementById('connectBtn'),
            disconnectBtn: document.getElementById('disconnectBtn'),
            errorMessage: document.getElementById('errorMessage'),
            blockedKeys: document.getElementById('blockedKeys'),
            noBlocksMessage: document.getElementById('noBlocksMessage'),
            punishmentLog: document.getElementById('punishmentLog')
        };
    }

    setupEventListeners() {
        // Connection buttons
        this.elements.connectBtn.addEventListener('click', () => this.connect());
        this.elements.disconnectBtn.addEventListener('click', () => this.disconnect());

        // Electron API event listeners
        window.electronAPI.onConnectionStatus((status) => {
            this.updateConnectionStatus(status);
        });

        window.electronAPI.onPunishmentReceived((punishment) => {
            this.handlePunishment(punishment);
        });
    }

    async checkInitialStatus() {
        try {
            const status = await window.electronAPI.getConnectionStatus();
            this.updateConnectionStatus(status);
        } catch (error) {
            console.error('Failed to check initial status:', error);
        }
    }

    async connect() {
        const apiUrl = this.elements.apiUrl.value.trim();
        const token = this.elements.token.value.trim();

        if (!apiUrl || !token) {
            this.showError('Please enter both API URL and token');
            return;
        }

        this.elements.connectBtn.disabled = true;
        this.elements.connectBtn.textContent = 'Connecting...';
        this.hideError();

        try {
            const result = await window.electronAPI.connectToAPI(apiUrl, token);
            
            if (result.success) {
                this.updateConnectionStatus(true);
                this.logMessage('Connected to Overaction API successfully');
            } else {
                this.showError(result.error || 'Connection failed');
            }
        } catch (error) {
            this.showError(`Connection error: ${error.message}`);
        } finally {
            this.elements.connectBtn.disabled = false;
            this.elements.connectBtn.textContent = 'Connect';
        }
    }

    async disconnect() {
        try {
            await window.electronAPI.disconnectFromAPI();
            this.updateConnectionStatus(false);
            this.logMessage('Disconnected from API');
            this.clearBlockedKeys();
        } catch (error) {
            console.error('Disconnect error:', error);
        }
    }

    updateConnectionStatus(connected) {
        this.isConnected = connected;
        
        if (connected) {
            this.elements.statusDot.classList.add('connected');
            this.elements.statusText.textContent = 'Connected';
            this.elements.connectBtn.classList.add('hidden');
            this.elements.disconnectBtn.classList.remove('hidden');
        } else {
            this.elements.statusDot.classList.remove('connected');
            this.elements.statusText.textContent = 'Disconnected';
            this.elements.connectBtn.classList.remove('hidden');
            this.elements.disconnectBtn.classList.add('hidden');
        }
    }

    handlePunishment(punishment) {
        console.log('Received punishment:', punishment);
        
        this.logMessage(`Punishment received: Block ${this.getKeyDisplayName(punishment.type)} for ${this.formatDuration(punishment.duration)}`);
        
        // Extract key from punishment type (e.g., 'block_key_e' -> 'e')
        const keyMatch = punishment.type.match(/block_key_(.+)/);
        if (keyMatch) {
            const key = keyMatch[1];
            this.addBlockedKey(key, punishment.duration);
        }
    }

    addBlockedKey(key, duration) {
        this.blockedKeys.add(key);
        this.updateBlockedKeysDisplay();
        
        // Remove the key after the duration
        setTimeout(() => {
            this.removeBlockedKey(key);
        }, duration);
    }

    removeBlockedKey(key) {
        this.blockedKeys.delete(key);
        this.updateBlockedKeysDisplay();
        this.logMessage(`Key ${key.toUpperCase()} unblocked`);
    }

    clearBlockedKeys() {
        this.blockedKeys.clear();
        this.updateBlockedKeysDisplay();
    }

    updateBlockedKeysDisplay() {
        const container = this.elements.blockedKeys;
        const noMessage = this.elements.noBlocksMessage;
        
        container.innerHTML = '';
        
        if (this.blockedKeys.size === 0) {
            noMessage.style.display = 'block';
        } else {
            noMessage.style.display = 'none';
            
            this.blockedKeys.forEach(key => {
                const keyElement = document.createElement('div');
                keyElement.className = 'blocked-key';
                keyElement.innerHTML = `
                    <span>${key.toUpperCase()}</span>
                    <span style="opacity: 0.7;">🔒</span>
                `;
                container.appendChild(keyElement);
            });
        }
    }

    logMessage(message) {
        const timestamp = new Date().toLocaleTimeString();
        this.punishmentLog.unshift({ timestamp, message });
        
        // Keep only last 50 messages
        if (this.punishmentLog.length > 50) {
            this.punishmentLog = this.punishmentLog.slice(0, 50);
        }
        
        this.updatePunishmentLog();
    }

    updatePunishmentLog() {
        const container = this.elements.punishmentLog;
        
        if (this.punishmentLog.length === 0) {
            container.innerHTML = '<div style="color: #94a3b8; text-align: center;">No punishments received yet</div>';
            return;
        }
        
        container.innerHTML = this.punishmentLog.map(entry => `
            <div class="punishment-entry">
                <span class="timestamp">[${entry.timestamp}]</span>
                <span>${entry.message}</span>
            </div>
        `).join('');
    }

    showError(message) {
        this.elements.errorMessage.textContent = message;
        this.elements.errorMessage.classList.remove('hidden');
    }

    hideError() {
        this.elements.errorMessage.classList.add('hidden');
    }

    getKeyDisplayName(punishmentType) {
        const keyMap = {
            'block_key_e': 'E Key (Skills)',
            'block_key_q': 'Q Key (Skills)',
            'block_key_w': 'W Key (Skills)',
            'block_key_r': 'R Key (Skills)',
            'block_key_d': 'D Key (Dismount)',
            'block_key_f': 'F Key (Interact)',
            'block_key_space': 'Space (Mount)',
            'block_key_tab': 'Tab (Target)',
        };
        
        return keyMap[punishmentType] || punishmentType;
    }

    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        
        if (minutes > 0) {
            const remainingSeconds = seconds % 60;
            return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
        }
        
        return `${seconds}s`;
    }
}

// Initialize the UI when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new OveractionDesktopUI();
});