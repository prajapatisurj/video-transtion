import { useEffect, useState } from "react";
import { Clipboard, CheckCircle, AlertCircle, Loader2 } from "lucide-react";

export default function TranscriptDisplay({
  fileId,
}: {
  fileId: string | null;
}) {
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState<
    "idle" | "processing" | "completed" | "error"
  >("idle");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!fileId) return;

    setStatus("processing");
    setTranscript("");

    const poll = setInterval(async () => {
      try {
        const res = await fetch(
          `http://localhost:8000/api/transcribe?fileId=${fileId}`
        );
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

  const handleCopy = () => {
    navigator.clipboard.writeText(transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <div className="mt-10 max-w-3xl mx-auto p-6 bg-white rounded-2xl shadow-lg border border-gray-200 transition-all">
      <h3 className="text-2xl font-semibold text-gray-800 flex items-center gap-2 mb-4">
        📝 Transcript
      </h3>

      {/* Status: Processing */}
      {status === "processing" && (
        <div className="flex items-center gap-3 text-blue-600 animate-fadeIn">
          <Loader2 className="animate-spin h-6 w-6" />
          <div>
            <p className="font-medium">Transcribing video...</p>
            <p className="text-sm text-gray-500">
              This may take up to 1–2 minutes. Please wait.
            </p>
          </div>
        </div>
      )}

      {/* Status: Completed */}
      {status === "completed" && (
        <div className="animate-fadeIn">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2 text-green-600">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Transcription completed</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-3 py-1.5 rounded-md border border-gray-300 hover:bg-gray-100 text-gray-700 text-sm transition"
            >
              <Clipboard className="w-4 h-4" />
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <div className="p-4 bg-gray-50 rounded-lg text-gray-800 whitespace-pre-wrap font-mono text-sm leading-relaxed max-h-[400px] overflow-y-auto border border-gray-200">
            {transcript}
          </div>
        </div>
      )}

      {/* Status: Error */}
      {status === "error" && (
        <div className="flex items-center gap-2 text-red-600 animate-fadeIn">
          <AlertCircle className="h-5 w-5" />
          <p>Failed to transcribe. Please try again later.</p>
        </div>
      )}
    </div>
  );
}
