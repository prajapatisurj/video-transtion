// server/api/transcribe.ts
import { VercelRequest, VercelResponse } from "@vercel/node";
import { getStorage } from "firebase-admin/storage";
import { getFirestore } from "firebase-admin/firestore";
import { SpeechClient } from "@google-cloud/speech";

const bucket = getStorage().bucket();
const db = getFirestore();
const client = new SpeechClient();

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { fileId } = req.query;
  if (!fileId) return res.status(400).json({ error: "fileId required" });

  const doc = await db
    .collection("transcriptions")
    .doc(fileId as string)
    .get();
  if (!doc.exists) return res.status(404).end();

  const data = doc.data()!;
  if (data.status === "completed") {
    return res.json({ transcript: data.transcript, status: "completed" });
  }

  if (data.status === "processing") {
    return res.json({ status: "processing" });
  }

  // Start transcription
  await db
    .collection("transcriptions")
    .doc(fileId as string)
    .update({ status: "processing" });

  const gcsUri = `gs://${bucket.name}/videos/${fileId}.mp4`; // adjust extension

  const audio = { uri: gcsUri };
  const config = {
    encoding: "MP3" as const,
    sampleRateHertz: 16000,
    languageCode: "en-US",
    enableAutomaticPunctuation: true,
  };
  const request = { audio, config };

  const [operation] = await client.longRunningRecognize(request);

  // Poll operation
  const [response] = await operation.promise();
  const transcript = response.results
    ?.map((result) => result.alternatives?.[0].transcript)
    .join(" ");

  await db
    .collection("transcriptions")
    .doc(fileId as string)
    .update({
      transcript,
      status: "completed",
    });

  res.json({ transcript, status: "completed" });
}
