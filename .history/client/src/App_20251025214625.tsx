import { useState } from "react";
import DropZone from "./components/DropZone";
import TranscriptDisplay from "./components/TranscriptDisplay";

function App() {
  const [fileId, setFileId] = useState<string | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-8 text-indigo-800">
          Video Transcription App
        </h1>
        <DropZone onUploadStart={setFileId} />
        <TranscriptDisplay fileId={fileId} />
      </div>
    </div>
  );
}

export default App;
