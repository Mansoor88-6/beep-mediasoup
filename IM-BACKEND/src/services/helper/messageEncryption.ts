import crypto from "crypto";

// Constants for encryption
const ALGORITHM = "aes-256-cbc";
const KEY_LENGTH = 32; // 32 bytes for AES-256
const IV_LENGTH = 16; // 16 bytes for AES

export class MessageEncryptionService {
  /**
   * Encrypts a message using AES encryption
   * @param message The message to encrypt (can be text or JSON stringified object)
   * @param chatKey The unique key for the chat (should be same for all participants)
   * @returns The encrypted message data
   */
  public static encryptMessage(
    message: string | object,
    chatKey: string
  ): string {
    try {
      const messageStr =
        typeof message === "object" ? JSON.stringify(message) : message;

      // Derive a 32-byte key using PBKDF2
      const key = crypto.pbkdf2Sync(
        chatKey,
        "salt",
        100000,
        KEY_LENGTH,
        "sha256"
      );

      // Generate a random IV
      const iv = crypto.randomBytes(IV_LENGTH);

      // Create cipher
      const cipher = crypto.createCipheriv(ALGORITHM, key, iv);

      // Encrypt the message
      let encrypted = cipher.update(messageStr, "utf8", "hex");
      encrypted += cipher.final("hex");

      // Combine IV and encrypted data
      return iv.toString("hex") + ":" + encrypted;
    } catch (error) {
      throw new Error(`Failed to encrypt message: ${error.message}`);
    }
  }

  /**
   * Decrypts an encrypted message
   * @param encryptedMessage The encrypted message to decrypt
   * @param chatKey The unique key for the chat (should be same for all participants)
   * @returns The decrypted message
   */
  public static decryptMessage(
    encryptedMessage: string,
    chatKey: string
  ): string {
    try {
      // Split IV and encrypted data
      const [ivHex, encryptedData] = encryptedMessage.split(":");

      // Convert IV back to Buffer
      const iv = Buffer.from(ivHex, "hex");

      // Derive the same key using PBKDF2
      const key = crypto.pbkdf2Sync(
        chatKey,
        "salt",
        100000,
        KEY_LENGTH,
        "sha256"
      );

      // Create decipher
      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);

      // Decrypt the message
      let decrypted = decipher.update(encryptedData, "hex", "utf8");
      decrypted += decipher.final("utf8");

      return decrypted;
    } catch (error) {
      throw new Error(`Failed to decrypt message: ${error.message}`);
    }
  }

  /**
   * Generates a unique encryption key for a new chat
   * This should be shared with all participants securely
   * @returns A unique chat encryption key
   */
  public static generateChatKey(): string {
    return crypto.randomBytes(KEY_LENGTH).toString("hex");
  }
}
