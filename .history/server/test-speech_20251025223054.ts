// server/test-speech.ts
import { SpeechClient } from "@google-cloud/speech";
import * as fs from "fs";
import * as path from "path";

// -------------------------------------------------
// 1. CONFIG – change these values
// -------------------------------------------------
const SERVICE_ACCOUNT_PATH = path.resolve(
  __dirname,
  "firebase/serviceAccountKey.json"
);
const TEST_AUDIO_GCS_URI = "gs://cloud-samples-data/speech/brooklyn_bridge.mp3"; // public sample

// -------------------------------------------------
// 2. Verify key exists
// -------------------------------------------------
if (!fs.existsSync(SERVICE_ACCOUNT_PATH)) {
  console.error("Service account key not found at:", SERVICE_ACCOUNT_PATH);
  process.exit(1);
}

// -------------------------------------------------
// 3. Initialise Speech client
// -------------------------------------------------
const client = new SpeechClient({
  keyFilename: SERVICE_ACCOUNT_PATH,
});

async function runTest() {
  console.log("Testing Speech-to-Text...");

  const audio = { uri: TEST_AUDIO_GCS_URI };
  const config = {
    encoding: "MP3" as const,
    sampleRateHertz: 16000,
    languageCode: "en-US",
    enableAutomaticPunctuation: true,
  };

  try {
    const [operation] = await client.longRunningRecognize({ audio, config });
    const [response] = await operation.promise();

    const transcript =
      response.results
        ?.map((r: any) => r.alternatives?.[0]?.transcript)
        .join(" ") ?? "No transcript";

    console.log("\nTranscript:");
    console.log(transcript);
  } catch (err: any) {
    console.error("Speech-to-Text failed:", err.message);
    process.exit(1);
  }
}

runTest();
