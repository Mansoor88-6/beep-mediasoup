// import sharp from "sharp";
// import { v4 as uuidv4 } from "uuid";
// import path from "path";
// import fs from "fs";
// import ffmpeg from "fluent-ffmpeg";
// import { logger } from "@config/logger";

// export interface MediaMetadata {
//   url: string;
//   thumbnailUrl?: string;
//   type: string;
//   fileName: string;
//   fileSize: number;
//   mimeType: string;
//   width?: number;
//   height?: number;
//   duration?: number;
// }

// export class MediaHandler {
//   private static UPLOAD_DIR = "uploads";
//   private static THUMBNAIL_DIR = "uploads/thumbnails";
//   private static MAX_THUMBNAIL_SIZE = 300;

//   static async init(): Promise<void> {
//     // Ensure upload and thumbnail directories exist
//     if (!fs.existsSync(MediaHandler.UPLOAD_DIR)) {
//       fs.mkdirSync(MediaHandler.UPLOAD_DIR);
//     }
//     if (!fs.existsSync(MediaHandler.THUMBNAIL_DIR)) {
//       fs.mkdirSync(MediaHandler.THUMBNAIL_DIR);
//     }
//   }

//   private static async generateVideoThumbnail(
//     videoPath: string,
//     thumbnailPath: string
//   ): Promise<{ width: number; height: number; duration: number }> {
//     return new Promise((resolve, reject) => {
//       // Check if ffmpeg is installed
//       ffmpeg.getAvailableCodecs((err, codecs) => {
//         if (err) {
//           logger.error("FFmpeg not properly installed:", err);
//           reject(
//             new Error(
//               "FFmpeg not properly installed. Please install FFmpeg first."
//             )
//           );
//           return;
//         }

//         logger.info("Generating video thumbnail for:", videoPath);

//         ffmpeg(videoPath)
//           .on("start", (commandLine) => {
//             logger.info("FFmpeg process started:", commandLine);
//           })
//           .on("error", (err) => {
//             logger.error("Error generating video thumbnail:", err);
//             reject(err);
//           })
//           .on("end", () => {
//             logger.info("Thumbnail generation completed:", thumbnailPath);
//           })
//           .screenshots({
//             timestamps: ["00:00:01"],
//             filename: path.basename(thumbnailPath),
//             folder: path.dirname(thumbnailPath),
//             size: `${MediaHandler.MAX_THUMBNAIL_SIZE}x?`,
//           })
//           .ffprobe((err, data) => {
//             if (err) {
//               logger.error("Error getting video metadata:", err);
//               reject(err);
//               return;
//             }

//             const videoStream = data.streams.find(
//               (s) => s.codec_type === "video"
//             );

//             if (!videoStream) {
//               logger.error("No video stream found in the file");
//               reject(new Error("No video stream found in the file"));
//               return;
//             }

//             resolve({
//               width: videoStream.width || 0,
//               height: videoStream.height || 0,
//               duration: Math.floor(data.format.duration || 0),
//             });
//           });
//       });
//     });
//   }

//   private static async getAudioDuration(audioPath: string): Promise<number> {
//     return new Promise((resolve, reject) => {
//       ffmpeg.ffprobe(audioPath, (err, data) => {
//         if (err) {
//           logger.error("Error getting audio duration:", err);
//           reject(err);
//           return;
//         }

//         const duration = Math.floor(data.format.duration || 0);
//         resolve(duration);
//       });
//     });
//   }

//   static async processMedia(
//     file: Express.Multer.File,
//     type?: string,
//     duration?: number
//   ): Promise<MediaMetadata> {
//     const uniqueFileName = `${uuidv4()}${path.extname(file.originalname)}`;
//     const filePath = path.join(MediaHandler.UPLOAD_DIR, uniqueFileName);

//     fs.renameSync(file.path, filePath);

//     const metadata: MediaMetadata = {
//       url: `/uploads/${uniqueFileName}`,
//       type: type || this.getMediaType(file.mimetype),
//       fileName: file.originalname,
//       fileSize: file.size,
//       mimeType: file.mimetype,
//     };

//     try {
//       // For voice messages, ensure we have duration
//       if (metadata.type === "voice") {
//         metadata.duration = duration || (await this.getAudioDuration(filePath));
//       }

//       // Generate thumbnail based on media type
//       const thumbnailFileName = `thumb_${uniqueFileName}${
//         metadata.type === "video" ? ".jpg" : path.extname(file.originalname)
//       }`;

//       const thumbnailPath = path.join(
//         MediaHandler.THUMBNAIL_DIR,
//         thumbnailFileName
//       );

//       logger.info("Processing media:", {
//         type: metadata.type,
//         fileName: metadata.fileName,
//         filePath,
//         thumbnailPath,
//         duration: metadata.duration,
//       });

//       if (metadata.type === "image") {
//         try {
//           const imageInfo = await sharp(filePath).metadata();
//           metadata.width = imageInfo.width;
//           metadata.height = imageInfo.height;

//           await sharp(filePath)
//             .resize(
//               MediaHandler.MAX_THUMBNAIL_SIZE,
//               MediaHandler.MAX_THUMBNAIL_SIZE,
//               {
//                 fit: "inside",
//                 withoutEnlargement: true,
//               }
//             )
//             .toFile(thumbnailPath);

//           metadata.thumbnailUrl = `/uploads/thumbnails/${thumbnailFileName}`;
//         } catch (error) {
//           logger.error("Failed to generate image thumbnail:", error);
//           throw error;
//         }
//       } else if (metadata.type === "video") {
//         try {
//           const videoInfo = await this.generateVideoThumbnail(
//             filePath,
//             thumbnailPath
//           );
//           metadata.width = videoInfo.width;
//           metadata.height = videoInfo.height;
//           metadata.duration = videoInfo.duration;
//           metadata.thumbnailUrl = `/uploads/thumbnails/${thumbnailFileName}`;
//         } catch (error) {
//           logger.error("Failed to generate video thumbnail:", error);
//           throw error;
//         }
//       }
//     } catch (error) {
//       logger.error("Error in processMedia:", error);
//       throw error;
//     }

//     return metadata;
//   }

//   private static getMediaType(mimeType: string): string {
//     if (mimeType.startsWith("image/")) return "image";
//     if (mimeType.startsWith("video/")) return "video";
//     if (mimeType.startsWith("audio/")) return "audio";
//     return "document";
//   }
// }
