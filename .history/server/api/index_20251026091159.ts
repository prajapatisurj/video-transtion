import { createServer } from "http";
import uploadHandler from "./upload.js";
import transcribeHandler from "./transcribe.js";

const server = createServer(async (req:any, res:any) => {
  const url = req.url;
  const method = req.method;

  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (method === "OPTIONS") {
    res.writeHead(204);
    res.end();
    return;
  }

  if (url?.startsWith("/api/upload") && method === "POST") {
    await uploadHandler(req, res);
  } else if (url?.startsWith("/api/transcribe") && method === "GET") {
    await transcribeHandler(req, res);
  } else {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
  }
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Local API running at http://localhost:${PORT}`);
  console.log(`→ POST /api/upload`);
  console.log(`→ GET  /api/transcribe?fileId=...`);
});
