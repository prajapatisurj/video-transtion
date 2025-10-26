import { useEffect, useState } from "react";

export default function TranscriptDisplay({
  fileId,
}: {
  fileId: string | null;
}) {
  const [transcript, setTranscript] = useState("");
  const [status, setStatus] = useState<"idle" | "processing" | "completed">(
    "idle"
  );

  useEffect(() => {
    if (!fileId) return;

    const poll = setInterval(async () => {
      const res = await fetch(`/api/transcribe?fileId=${fileId}`);
      const data = await res.json();

      setStatus(data.status);
      if (data.transcript) {
        setTranscript(data.transcript);
        clearInterval(poll);
      }
    }, 3000);

    return () => clearInterval(poll);
  }, [fileId]);

  if (!fileId) return null;

  return (
    <div className="mt-8 p-6 bg-gray-50 rounded-lg">
      <h3 className="text-xl font-bold mb-2">Transcript</h3>
      {status === "processing" && (
        <p className="text-blue-600">
          Transcribing... (this may take a minute)
        </p>
      )}
      {status === "completed" && (
        <p className="whitespace-pre-wrap">{transcript}</p>
      )}
    </div>
  );
}
