/**
 * Service for handling call-related audio sounds
 */
class AudioService {
  private static incomingCallSound: HTMLAudioElement;
  private static outgoingCallSound: HTMLAudioElement;
  private static callEndSound: HTMLAudioElement;

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

      console.log('AudioService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize AudioService:', error);
    }
  }

  /**
   * Preload a sound file
   * @param audio
   */
  private static preloadSound(audio: HTMLAudioElement): Promise<void> {
    return new Promise((resolve, reject) => {
      audio.oncanplaythrough = () => {
        return resolve();
      };
      audio.onerror = reject;
    });
  }

  /**
   * Play incoming call sound
   */
  public static playIncomingCall() {
    this.stopAll(); // Stop any playing sounds first
    this.incomingCallSound?.play().catch((error) => {
      console.error('Failed to play incoming call sound:', error);
    });
  }

  /**
   * Play outgoing call sound
   */
  public static playOutgoingCall() {
    this.stopAll(); // Stop any playing sounds first
    this.outgoingCallSound?.play().catch((error) => {
      console.error('Failed to play outgoing call sound:', error);
    });
  }

  /**
   * Play call end sound
   */
  public static playCallEnd() {
    this.stopAll(); // Stop any playing sounds first
    this.callEndSound?.play().catch((error) => {
      console.error('Failed to play call end sound:', error);
    });
  }

  /**
   * Stop all sounds
   */
  public static stopAll() {
    [this.incomingCallSound, this.outgoingCallSound, this.callEndSound].forEach((sound) => {
      if (sound) {
        sound.pause();
        sound.currentTime = 0;
      }
    });
  }
}

export default AudioService;
