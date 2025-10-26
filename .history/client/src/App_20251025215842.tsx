import { useState } from "react";
import DropZone from "./components/DropZone";
import TranscriptDisplay from "./components/TranscriptDisplay";

function App() {
  const [fileId, setFileId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-6">
      <div className="max-w-4xl mx-auto">
        <header className="text-center mb-10">
          <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
            Video Transcription App
          </h1>
          <p className="mt-3 text-gray-600">
            Upload a video → Get instant AI transcript
          </p>
        </header>

        <DropZone onUploadStart={setFileId} />
        <TranscriptDisplay fileId={fileId} />
      </div>
    </div>
  );
}

export default App;
