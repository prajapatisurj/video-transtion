import type { VercelRequest, VercelResponse } from "@vercel/node";
import { initializeApp, cert, App } from "firebase-admin/app";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";
import { v4 as uuidv4 } from "uuid";

// ✅ use require for JSON in CommonJS environments
const serviceAccount = require("../firebase/serviceAccountKey.json");

declare global {
  // eslint-disable-next-line no-var
  var firebaseApp: App | undefined;
}

const app =
  globalThis.firebaseApp ??
  initializeApp({
    credential: cert(serviceAccount as unknown as object),
    storageBucket: "your-project.appspot.com", // change to your actual bucket
  });

globalThis.firebaseApp = app;

const bucket = getStorage().bucket();
const db = getFirestore();

// rest of your handler code remains the same...

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
      expires: Date.now() + 15 * 60 * 1000, // 15 minutes
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
