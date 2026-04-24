import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- MOCK STORAGE/DATABASE ---
  let processedData: any[] = [];

  // --- API ROUTES ---
  
  // 1. Source (Mock Ingestion)
  app.get("/api/source", (req, res) => {
    const mockData = Array.from({ length: 15 }, (_, i) => ({
      id: i + 1,
      user_id: Math.floor(Math.random() * 100),
      amount: (Math.random() * 500).toFixed(2),
      timestamp: new Date(Date.now() - Math.random() * 86400000).toISOString(),
      category: ["Electronics", "Clothing", "Food", "Books"][Math.floor(Math.random() * 4)],
      raw_meta: { browser: "Chrome", ip: "192.168.1.1" }
    }));
    res.json(mockData);
  });

  // 2. Storage / Serving Endpoint
  app.post("/api/store", (req, res) => {
    processedData = req.body;
    res.json({ status: "success", count: processedData.length });
  });

  app.get("/api/serving", (req, res) => {
    res.json(processedData);
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
