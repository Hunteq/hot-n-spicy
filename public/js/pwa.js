// PWA functionality
class PWAHelper {
    constructor() {
        this.deferredPrompt = null;
        this.init();
    }

    init() {
        this.registerServiceWorker();
        this.setupInstallPrompt();
        this.setupOfflineDetection();
    }

    // Register Service Worker
    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
                navigator.serviceWorker.register('/sw.js')
                    .then((registration) => {
                        console.log('SW registered: ', registration);
                    })
                    .catch((registrationError) => {
                        console.log('SW registration failed: ', registrationError);
                    });
            });
        }
    }

    // Handle Install Prompt
    setupInstallPrompt() {
        // Listen for beforeinstallprompt event
        window.addEventListener('beforeinstallprompt', (e) => {
            console.log('beforeinstallprompt event fired');
            // Prevent Chrome 67 and earlier from automatically showing the prompt
            e.preventDefault();
            // Stash the event so it can be triggered later
            this.deferredPrompt = e;
            
            // Show install prompt after 5 seconds
            setTimeout(() => {
                this.showInstallPrompt();
            }, 5000);
        });

        // Handle install button click
        const installConfirm = document.getElementById('installConfirm');
        const installCancel = document.getElementById('installCancel');
        const installPrompt = document.getElementById('installPrompt');

        if (installConfirm && installCancel) {
            installConfirm.addEventListener('click', () => {
                this.hideInstallPrompt();
                this.promptInstallation();
            });

            installCancel.addEventListener('click', () => {
                this.hideInstallPrompt();
                // Don't show again for 30 days
                localStorage.setItem('installPromptDismissed', Date.now());
            });
        }
    }

    showInstallPrompt() {
        // Check if user recently dismissed the prompt
        const lastDismissed = localStorage.getItem('installPromptDismissed');
        if (lastDismissed && (Date.now() - lastDismissed) < (30 * 24 * 60 * 60 * 1000)) {
            return;
        }

        // Check if already installed
        if (this.isAppInstalled()) {
            return;
        }

        const installPrompt = document.getElementById('installPrompt');
        if (installPrompt && this.deferredPrompt) {
            installPrompt.style.display = 'block';
        }
    }

    hideInstallPrompt() {
        const installPrompt = document.getElementById('installPrompt');
        if (installPrompt) {
            installPrompt.style.display = 'none';
        }
    }

    async promptInstallation() {
        if (this.deferredPrompt) {
            // Show the install prompt
            this.deferredPrompt.prompt();
            
            // Wait for the user to respond to the prompt
            const { outcome } = await this.deferredPrompt.userChoice;
            console.log(`User response to the install prompt: ${outcome}`);
            
            // Clear the saved prompt since it can't be used again
            this.deferredPrompt = null;
        }
    }

    isAppInstalled() {
        return window.matchMedia('(display-mode: standalone)').matches || 
               window.navigator.standalone ||
               document.referrer.includes('android-app://');
    }

    // Offline Detection
    setupOfflineDetection() {
        window.addEventListener('online', () => {
            this.updateOnlineStatus(true);
        });

        window.addEventListener('offline', () => {
            this.updateOnlineStatus(false);
        });

        // Initial check
        this.updateOnlineStatus(navigator.onLine);
    }

    updateOnlineStatus(online) {
        const statusElement = document.getElementById('onlineStatus') || this.createOnlineStatusElement();
        
        if (online) {
            statusElement.textContent = 'Online';
            statusElement.className = 'online-status online';
            setTimeout(() => {
                statusElement.style.display = 'none';
            }, 3000);
        } else {
            statusElement.textContent = 'Offline - Some features limited';
            statusElement.className = 'online-status offline';
            statusElement.style.display = 'block';
        }
    }

    createOnlineStatusElement() {
        const statusElement = document.createElement('div');
        statusElement.id = 'onlineStatus';
        statusElement.className = 'online-status';
        statusElement.style.cssText = `
            position: fixed;
            top: 70px;
            right: 20px;
            padding: 8px 16px;
            border-radius: 4px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            z-index: 1000;
            display: none;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        `;
        document.body.appendChild(statusElement);
        return statusElement;
    }
}

// Initialize PWA when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PWAHelper();
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = PWAHelper;
}