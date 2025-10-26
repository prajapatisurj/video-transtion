import { useEffect, useState } from "react";

export default function TranscriptDisplay({
  fileId,
}: {
  fileId: string | null;
}) {
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState<
    "idle" | "processing" | "completed" | "error"
  >("idle");

  useEffect(() => {
    if (!fileId) return;

    setStatus("processing");
    setTranscript("");

    const poll = setInterval(async () => {
      try {
        const res = await fetch(`http://localhost:8000/api/transcribe?fileId=${fileId}`);
        if (!res.ok) throw new Error("Polling failed");

        const data = await res.json();

        if (data.status === "completed") {
          setTranscript(data.transcript || "No transcript available.");
          setStatus("completed");
          clearInterval(poll);
        } else if (data.status === "processing") {
          setStatus("processing");
        }
      } catch (err) {
        setStatus("error");
        clearInterval(poll);
      }
    }, 3000);

    return () => clearInterval(poll);
  }, [fileId]);

  if (!fileId) return null;

  return (
    <div className="mt-10 p-6 bg-white rounded-xl shadow-sm border border-gray-200">
      <h3 className="text-2xl font-bold text-gray-800 mb-3">Transcript</h3>

      {status === "processing" && (
        <div className="flex items-center gap-2 text-blue-600">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
          <span>Transcribing video... (this may take 1-2 minutes)</span>
        </div>
      )}

      {status === "completed" && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg text-gray-700 whitespace-pre-wrap font-mono text-sm leading-relaxed">
          {transcript}
        </div>
      )}

      {status === "error" && (
        <p className="text-red-600">Failed to transcribe. Please try again.</p>
      )}
    </div>
  );
}
