import store from 'appRedux/store';

/**
 * Service for handling push notifications and sounds for incoming calls
 */
class NotificationService {
  private static notificationSound: HTMLAudioElement;

  /**
   * Initialize the notification service
   */
  public static async initialize() {
    console.log('Initializing NotificationService...');

    // Check if notifications are supported
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications');
      return;
    }

    // Load notification sound
    try {
      this.notificationSound = new Audio('/notification.mp3');
      this.notificationSound.preload = 'auto';

      await new Promise((resolve, reject) => {
        this.notificationSound.oncanplaythrough = resolve;
        this.notificationSound.onerror = reject;
      });
    } catch (error) {
      console.error('Failed to load notification sound:', error);
    }

    // Handle autoplay restrictions
    try {
      await this.initializeAudio();
    } catch (error) {
      console.warn('Audio initialization failed:', error);
    }

    // Register service worker for all browsers (if supported)
    if ('serviceWorker' in navigator && window.isSecureContext) {
      try {
        await navigator.serviceWorker.register('/notification-worker.js');
        console.log('Service Worker registered');
      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  }

  /**
   * Show notification for incoming call
   * @param fromUsername
   * @param isVideo
   * @param isGroup
   * @param groupName
   */
  public static async showIncomingCallNotification(
    fromUsername: string,
    isVideo: boolean,
    isGroup: boolean = false,
    groupName?: string
  ) {
    // Check if user is already in a call
    const callState = store.getState().call;
    if (callState.isOngoing) return;

    // Check document visibility
    if (!document.hidden) {
      console.log('App is visible - skipping notification');
      return;
    }

    // Check notification permission
    if (Notification.permission !== 'granted') {
      console.log('Notifications not allowed');
      return;
    }

    // Generate unique tag for each notification
    const tag = `call-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Play notification sound
    await this.playNotificationSound();

    try {
      const title = isGroup ? `Incoming ${isVideo ? 'Video' : 'Audio'} Call` : fromUsername;

      const body = isGroup
        ? `${fromUsername} is calling ${groupName}`
        : `Incoming ${isVideo ? 'video' : 'audio'} call`;

      // Try service worker notification first
      if ('serviceWorker' in navigator) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.showNotification(title, {
            body: body,
            icon: '/favicon.ico',
            badge: '/favicon.ico',
            tag: tag,
            requireInteraction: true,
            data: { url: window.location.href },
            silent: true
          });
          return;
        } catch (swError) {
          console.error('Service Worker notification failed:', swError);
        }
      }

      // Fallback to regular notifications
      const notification = new Notification(title, {
        body: body,
        icon: '/favicon.ico',
        tag: tag,
        silent: true
      });

      notification.onclick = () => {
        window.focus();
        notification.close();
      };
    } catch (error) {
      console.error('Notification creation failed:', error);
    }
  }

  /**
   * Play notification sound with autoplay handling
   */
  private static async playNotificationSound() {
    if (!this.notificationSound) return;

    try {
      this.notificationSound.currentTime = 0;
      await this.notificationSound.play();
    } catch (error) {
      console.error('Error playing sound:', error);
      // Handle autoplay restrictions
      if (error instanceof Error && 'name' in error && error.name === 'NotAllowedError') {
        await this.initializeAudio();
        await this.notificationSound.play();
      }
    }
  }

  /**
   * Initialize audio context to bypass autoplay restrictions
   */
  private static async initializeAudio() {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    gainNode.gain.value = 0;
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.start();
    await new Promise((resolve) => {
      return setTimeout(resolve, 1);
    });
    oscillator.stop();
  }
}

export default NotificationService;
