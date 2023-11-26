import { Storage } from '@google-cloud/storage';
import fs from 'fs';
import ffmpeg from 'fluent-ffmpeg';

const storage = new Storage();

const rawVideoBucketName = "daniels-yt-raw-videos";
const processedVideoBucketName = "daniels-yt-processed-videos";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

/**
 * Creates the local directories for raw and processed videos
 */
export function setupDirectories() {
    ensureDirectoryExists(localRawVideoPath);
    ensureDirectoryExists(localProcessedVideoPath);
}


/**
 * @param rawVideoName - The name of the file to conver from {@link localRawVideoPath}
 * @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}
 * @returns A promise that resolves when the video has been converted
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
            reject(`File ${filePath} does not exist`) {
                fs.unlink(filePath, (err) => {
                    if (err) {
                        console.log(`An error occured while trying to delete ${filePath}: ${err.message}`);
                        reject(err);
                    }
                    else {
                        console.log(`File ${filePath} successfully deleted.`);
                        resolve();
                    }
                });
            }
        } else {
            console.log(`File not found at ${filePath}, Delete process failed.`);
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

