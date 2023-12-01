import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const storage = new Storage();

const rawVideoBucketName = "daniels-yt-raw-videos";
const processedVideoBucketName = "daniels-yt-processed-videos";
const thumbnailBucketName = "daniels-yt-thumbnails"

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";
export const thumbnailPath = "./thumbnails"

/**
 * Creates the local directories for raw and processed videos.
 */
export function setupDirectories() {
    ensureDirectoryExists(localRawVideoPath);
    ensureDirectoryExists(localProcessedVideoPath);
    ensureDirectoryExists(thumbnailPath);
}

/**
 * @param rawVideoName - The name of the file to conver from {@link localRawVideoPath}
 * @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}
 * @returns A promise that resolves when the video has been converted.
 */
export function convertVideo(rawVideoName: string, processedVideoName: string) {
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${localRawVideoPath}/${rawVideoName}`)
        .outputOptions("-vf", "scale=-1:360" ) // 360p
        .on("end", () => {
            console.log("Processing finished successfully");
            resolve();
        })
        .on("error", (err) => {
            console.log(`An error occured: ${err.message}`);
            reject();
        })
        .save(`${localProcessedVideoPath}/${processedVideoName}`);
    });
}

/**
 * @param videoPath - The path of the video to generate a thumbnail for.
 * @param thumbnailPath - The path of the thumbnail to generate.
 * @returns A promise that resolves when the thumbnail has been generated.
 */
export function generateThumbnail(videoPath: string, thumbnailPath: string, fileName: string): Promise<string> {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .on('end', () => resolve(thumbnailPath))
      .on('error', (err: Error) => reject(err))
      .screenshots({
        count: 1,
        folder: thumbnailPath,
        size: '320x240',
        filename: fileName
      });
  });
}

/**
 * Uploads a thumbnail to Google Cloud Storage and returns its public URL.
 * @param thumbnailFileName The name of the thumbnail file to upload.
 * @returns The public URL of the uploaded thumbnail.
 */
export async function uploadThumbnail(thumbnailFileName: string): Promise<string> {
  const bucket = storage.bucket(thumbnailBucketName);
  const localThumbnailPath = `./thumbnails/${thumbnailFileName}`;

  await bucket.upload(localThumbnailPath, { destination: thumbnailFileName })
  .then(() => console.log(`Thumbnail uploaded successfully: ${thumbnailFileName}`))
  .catch(err => console.error(`Error uploading thumbnail ${thumbnailFileName}: ${err}`));

  // Make the file publicly accessible
  await bucket.file(thumbnailFileName).makePublic();

  // Construct the public URL
  const publicUrl = `https://storage.googleapis.com/${thumbnailBucketName}/${thumbnailFileName}`;
  console.log(`Thumbnail uploaded to ${publicUrl}`);
  
  return publicUrl;
}

/**
 * @param fileName - The name of the file to download from the...
 * {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} directory
 * @returns A promise that resolves when the file has been downloaded.
 */
export async function downloadRawVideo(fileName: string) {
    await storage.bucket(rawVideoBucketName)
        .file(fileName)
        .download({ destination: `${localRawVideoPath}/${fileName}` });

    console.log(
        `gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}`
    )
}

/**
 * @param fileName - The name of the file to upload from the...
 * {@link localProcessedVideoPath} directory into the {@link processedVideoBucketName} bucket.
 * @returns A promise that resolves when the file has been uploaded.
 */
export async function uploadProcessedVideo(fileName: string) {
    const bucket = storage.bucket(processedVideoBucketName);

    await bucket.upload(`${localProcessedVideoPath}/${fileName}`, {
        destination: fileName
    });

    console.log(
        `${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}`
    );

    await bucket.file(fileName).makePublic();
}

/**
 * @param fileName - The name of the file to delete from the...
 *  {@link localRawVideoPath} directory.
 * @returns A promise that resolves when the file has been deleted.
 */
export function deleteRawVideo(fileName: string) {
    return deleteFile(`${localRawVideoPath}/${fileName}`);
}

/**
 * @param fileName - The name of the file to delete from the...
 *  {@link localProcessedVideoPath} directory.
 * @returns A promise that resolves when the file has been deleted.
 */
export function deleteProcessedVideo(fileName: string) {
    return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

/**
 * @param filePath - The path of the file to delete.
 * @returns A promise that resolves when the file has been deleted.
 */
function deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
            fs.unlink(filePath, (err) => {
                if (err) {
                    console.error(`Failed to delete file at ${filePath}`, err);
                    reject(err);
                } else {
                    console.log(`File deleted at ${filePath}`);
                    resolve();
                }
            });
            } else {
                console.log(`File not found at ${filePath}, skipping delete.`);
                resolve();
            }
    });
}


/**
 * Ensures a directory exists, creating it otherwise.
 * @param dirPath - The path of the directory to check.
 */
function ensureDirectoryExists(dirPath: string) {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, { recursive: true }); // recursive: true enables the creation of nested directories
        console.log(`Directory created at ${dirPath}`);
    }
}

