# Welcome to my YouTube Clone
This project is a simplified YouTube clone, where the core functionality of the website is implemented.
It is focused on keeping the design as simple as possible, while still addressing some scalability tradeoffs.
<br><br>

## Background
YouTube is a video sharing platform that allows users to upload, view, rate, share, and comment on videos.

The scope of YouTube is very large, such that even "trivial" features like rating and commenting on videos are actually quite complex at this scale (1B+ daily active users). For this reason, I'll be focusing mostly on uploading and viewing videos.
<br><br>

## Features
- Users can sign in/out using their Google account.
- Users can upload videos while signed in.
- Videos should be transcoded to multiple formats (e.g. 360p, 720p).
- Users can view a list of uploaded videos (signed in or not).
- Users can view individual videos (signed in or not).
<br><br>

## Architecture Overview
![image](https://github.com/daniel-maxwell/YouTube-Clone/assets/66431847/9f018ef7-3790-4b02-babd-64b5c891ebc0)
<br><br>

## Video Storage (Cloud Storage)
Google Cloud Storage is used to host the raw and processed videos. This is a simple, scalable, and cost effective solution for storing and serving large files.
<br><br>

## Video Upload Events (Cloud Pub/Sub)
When a video is uploaded, a message is published to a Cloud Pub/Sub topic. This creates a durability layer for video upload events and processing of videos asynchronously.
<br><br>

## Video Processing Workers (Cloud Run)
When a video upload event is published, a video processing worker receives a message from Pub/Sub and transcodes the video. Transcoding uses ffmpeg, which is a popular open source tool for video processing, widely used in industry (including at YouTube).

The nature of video processing can lead to inconsistent workloads, so a Cloud Run is used to scale up and down as needed. Processed videos is uploaded back to Cloud Storage.
<br><br>

## Video Metadata (Firestore)
After a video is processed, the metadata in stored Firestore. This allows us to display processed videos in the web client along with other relevant info (e.g. title, description, etc).
<br><br>

## Video API (Firebase Functions)
Firebase Functions are used to build a simple API that allows users to upload videos and retrieve video metadata. This can easily be extended to support additional Create, Read, Update, Delete (CRUD) operations.
<br><br>

## Web Client (Next.js / Cloud Run)
Next.js is used to build a simple web client that will allow users to sign in and upload videos. The web client is hosted on Cloud Run.
<br><br>

## Authentication (Firebase Auth)
Firebase Auth is used to handle user authentication. This allows easy integration with Google Sign In.
<br><br><br>


Author
======
Made with ❤ by Daniel White | [Portfolio](https://daniel-maxwell.github.io/Portfolio/) | [LinkedIn](https://www.linkedin.com/in/daniel-maxwell-white/)
