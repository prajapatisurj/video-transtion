// server/api/upload.ts
import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initializeApp, cert } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";
import { SpeechClient } from "@google-cloud/speech";
import { v4 as uuidv4 } from "uuid";

const serviceAccount = require("../../firebase/serviceAccountKey.json");

initializeApp({
  credential: cert(serviceAccount),
  storageBucket: "your-project.appspot.com",
});

const bucket = getStorage().bucket();
const db = getFirestore();
const speechClient = new SpeechClient({
  keyFilename: "../../firebase/serviceAccountKey.json",
});

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== "POST") return res.status(405).end();

  const { fileName, fileType, fileSize } = req.body;

  if (fileSize > 250 * 1024 * 1024) {
    return res.status(400).json({ error: "File must be ≤ 250 MB" });
  }

  const fileId = uuidv4();
  const filePath = `videos/${fileId}.${fileName.split(".").pop()}`;
  const file = bucket.file(filePath);

  // Generate signed URL
  const [url] = await file.getSignedUrl({
    action: "write",
    expires: Date.now() + 15 * 60 * 1000,
    contentType: fileType,
  });

  // Save metadata
  await db.collection("transcriptions").doc(fileId).set({
    fileId,
    fileName,
    status: "uploaded",
    uploadedAt: new Date(),
    transcript: "",
  });

  res.json({ uploadUrl: url, fileId });
}
