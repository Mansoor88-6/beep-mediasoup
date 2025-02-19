import { ONE, ZERO } from 'constant';

/**
 * Audio Service.
 */
export default class AudioService {
  private audio: HTMLAudioElement;

  /**
   * Initializes the file reading.
   * @param {string} audioFilePath - prm
   */
  constructor(audioFilePath: string) {
    this.audio = new Audio(audioFilePath);
    this.audio.loop = true; // Loop the audio by default
  }

  /**
   * Start playing the audio
   */
  public start(): void {
    this.audio.play();
  }

  /**
   * Pause the audio
   */
  public pause(): void {
    this.audio.pause();
  }

  /**
   * Stop the audio and reset its playback position
   */
  public stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
  }

  /**
   * Optionally set valume to 0.0 to 1.0
   * @param {number} volume - prm
   */
  public setVolume(volume: number): void {
    if (volume >= ZERO && volume <= ONE) {
      this.audio.volume = volume;
    } else {
      // console.warn('Volume must be between 0.0 and 1.0');
    }
  }
}
