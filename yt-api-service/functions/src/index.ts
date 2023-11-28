import {initializeApp} from "firebase-admin/app";
import {Firestore} from "firebase-admin/firestore";
import * as functions from "firebase-functions";
import * as logger from "firebase-functions/logger";
import {onCall} from "firebase-functions/v2/https";
import {Storage} from "@google-cloud/storage";


initializeApp();

const firestore = new Firestore();
const storage = new Storage();

const rawVideoBucketName = "daniels-yt-raw-videos";

export const createUser = functions.region("europe-west2").auth.user().onCreate(
  (user) => {
    const userInfo = {
      uid: user.uid,
      email: user.email,
      photoURL: user.photoURL,
    };
    firestore.collection("users").doc(user.uid).set(userInfo);
    logger.info(`User Created: ${JSON.stringify(userInfo)}`);
    return;
  }
);


export const generateUploadUrl = onCall({maxInstances: 10}, async (request) => {
  // Check if the user is authenticated
  if (!request.auth) {
    throw new functions.https.HttpsError(
      "failed-precondition",
      "The function must be called while authenticated."
    );
  }

  const auth = request.auth;
  const data = request.data;
  const bucket = storage.bucket(rawVideoBucketName);

  // Generate a unique filename for upload
  const fileName = `${auth.uid}-${Date.now()}.${data.fileExtension}`;

  // Get a v4 signed URL for uploading file
  const [url] = await bucket.file(fileName).getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 15 * 60 * 1000, // 15 minutes
  });

  return {url, fileName};
});
