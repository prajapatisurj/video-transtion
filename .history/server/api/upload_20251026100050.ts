import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";
import { v4 as uuidv4 } from "uuid";
import serviceAccount from "../firebase/firebase-config";

// ✅ Use require() for JSON in CommonJS
// const serviceAccount: Record<
//   string,
//   any
// > = require("../firebase/firebase-config");

// Initialize Firebase only once
if (!getApps().length) {
  initializeApp({
    credential: cert(serviceAccount),
    storageBucket: "video-transcription-a640e.appspot.com",
  });
}

const bucket = getStorage().bucket();
const db = getFirestore();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { fileName, fileType, fileSize } = req.body;

  if (!fileName || !fileType || fileSize > 250 * 1024 * 1024) {
    return res.status(400).json({ error: "Invalid file or size > 250 MB" });
  }

  const fileId = uuidv4();
  const ext = fileName.split(".").pop();
  const filePath = `videos/${fileId}.${ext}`;
  const file = bucket.file(filePath);

  try {
    const [url] = await file.getSignedUrl({
      action: "write",
      expires: Date.now() + 15 * 60 * 1000,
      contentType: fileType,
    });

    await db.collection("transcriptions").doc(fileId).set({
      fileId,
      fileName,
      status: "uploaded",
      uploadedAt: new Date().toISOString(),
    });

    res.json({ uploadUrl: url, fileId });
  } catch (error: any) {
    console.error("Upload init error:", error);
    res.status(500).json({ error: "Failed to generate upload URL" });
  }
}
