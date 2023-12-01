'use client';

import { useSearchParams } from "next/navigation";
import styles from "./watch.module.css";
import Link from "next/link";

export default function Watch() {
  const videoPrefix = "https://storage.googleapis.com/daniels-yt-processed-videos/"
  const videoSrc = useSearchParams().get("v");
    return (
          <main className={styles.watchPage}>
            <h1 className={styles.header}>Watch Page</h1>
            <div className={styles.container}>
                <video controls src={videoPrefix + videoSrc} className={styles.video}/>
            </div>
            <Link href="/" className={styles.backButton}>
            Back
            </Link>
          </main>
    );
}