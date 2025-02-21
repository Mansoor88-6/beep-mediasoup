/**
 * Service for handling call-related audio sounds
 */
class AudioService {
  private static incomingCallSound: HTMLAudioElement;
  private static outgoingCallSound: HTMLAudioElement;
  private static callEndSound: HTMLAudioElement;
  private static currentlyPlaying: HTMLAudioElement | null = null;

  /**
   * Initialize the audio service and load all sounds
   */
  public static async initialize() {
    try {
      // Load all audio files
      this.incomingCallSound = new Audio('/sounds/incoming-call.mp3');
      this.outgoingCallSound = new Audio('/sounds/outgoing-call.mp3');
      this.callEndSound = new Audio('/sounds/call-end.mp3');

      // Configure audio settings
      [this.incomingCallSound, this.outgoingCallSound].forEach((sound) => {
        sound.loop = true;
        sound.preload = 'auto';
      });

      this.callEndSound.loop = false;
      this.callEndSound.preload = 'auto';

      // Preload all sounds
      await Promise.all([
        this.preloadSound(this.incomingCallSound),
        this.preloadSound(this.outgoingCallSound),
        this.preloadSound(this.callEndSound)
      ]);
    } catch (error) {
      console.error('Failed to initialize AudioService:', error);
    }
  }

  /**
   * Preload a sound
   * @param sound - The sound to preload
   */
  private static async preloadSound(sound: HTMLAudioElement): Promise<void> {
    try {
      await sound.load();
    } catch (error) {
      console.warn('Failed to preload sound:', error);
    }
  }

  /**
   * Stop all currently playing sounds
   */
  public static stopAll() {
    try {
      if (this.currentlyPlaying) {
        this.currentlyPlaying.pause();
        this.currentlyPlaying.currentTime = 0;
        this.currentlyPlaying = null;
      }

      [this.incomingCallSound, this.outgoingCallSound, this.callEndSound].forEach((sound) => {
        if (sound) {
          sound.pause();
          sound.currentTime = 0;
        }
      });
    } catch (error) {
      console.warn('Error stopping sounds:', error);
    }
  }

  /**
   * Play the incoming call sound
   */
  public static async playIncomingCall() {
    try {
      await this.stopAll();
      this.currentlyPlaying = this.incomingCallSound;
      await this.incomingCallSound.play();
    } catch (error) {
      console.warn('Failed to play incoming call sound:', error);
    }
  }

  /**
   * Play the outgoing call sound
   */
  public static async playOutgoingCall() {
    try {
      await this.stopAll();
      this.currentlyPlaying = this.outgoingCallSound;
      await this.outgoingCallSound.play();
    } catch (error) {
      console.warn('Failed to play outgoing call sound:', error);
    }
  }

  /**
   * Play the call end sound
   */
  public static async playCallEnd() {
    try {
      await this.stopAll();
      this.currentlyPlaying = this.callEndSound;
      await this.callEndSound.play();
      // Reset after playing
      this.callEndSound.onended = () => {
        this.currentlyPlaying = null;
      };
    } catch (error) {
      console.warn('Failed to play call end sound:', error);
    }
  }
}

export default AudioService;
