import express from "express";
import { 
  convertVideo,
  generateThumbnail,
  uploadThumbnail,
  thumbnailPath,
  uploadProcessedVideo,
  deleteProcessedVideo,
  deleteRawVideo,
  downloadRawVideo,
  setupDirectories } from './storage';
import { isVideoNew, setVideo } from "./firestore";

setupDirectories();

const app = express();
app.use(express.json());

app.post("/process-video", async (req, res) => {
    // Get the bucket and filename from the Cloud Pub/Sub message.
    let data;
    try {
        const message = Buffer.from(req.body.message.data, 'base64').toString('utf-8');
        data = JSON.parse(message);
        if (!data.name) {
            throw new Error("Invalid message payload received.");
        }
    } catch (err) {
        console.error(err);
        res.status(400).send("Bad Request: missing filename");
    }

    const inputFileName = data.name; // Has format <UID>-<DATE>.<FILE_EXTENSION>
    const outputFileName = `processed-${inputFileName}`;
    const videoId = inputFileName.split('.')[0];
    let thumbnailUrl: "" | string = "";

    if (!isVideoNew(videoId)) {
      return res.status(400).send("Bad Request: video is already processing or processed");
    } else {
      await setVideo(videoId, {
        id: videoId,
        uid: videoId.split("-")[0],
        status: "processing"
      });
    }

    // Download the raw video from Cloud Storage
    await downloadRawVideo(inputFileName);

    try {
      const thumbnailFileName = `thumbnail-${videoId}.png`;
      //const thumbnailFilePath = `${thumbnailPath}/${thumbnailFileName}`;
      await generateThumbnail(`./raw-videos/${inputFileName}`, thumbnailPath, thumbnailFileName);
      thumbnailUrl = await uploadThumbnail(thumbnailFileName);

    } catch (err) {
      console.error(`Thumbnail generation or upload failed: ${err}`);
    }

    // Convert the video to 360p
    try {
        await convertVideo(inputFileName, outputFileName);

    } catch (err) {
        await Promise.all([deleteRawVideo(inputFileName), deleteProcessedVideo(outputFileName)]);
        console.error(`Video conversion failed: ${err}`);
        return res.status(500).send("Internal Server Error: video conversion failed");
    }

    // Upload the processed video to Cloud Storage
    await uploadProcessedVideo(outputFileName);

    setVideo(videoId, {
      status: "processed",
      filename: outputFileName,
      thumbnailUrl: thumbnailUrl
    });

    await Promise.all([deleteRawVideo(inputFileName), deleteProcessedVideo(outputFileName)]);

    return res.status(200).send("Processing finished successfully");
});

const port = process.env.PORT || 3000; 
app.listen(port, () => {
    console.log(`Video processing service is running on port ${port}`);
});
