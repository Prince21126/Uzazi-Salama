import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenAI, Type } from "@google/genai";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = parseInt(process.env.PORT || '3000', 10);

  app.use(express.json());

  // AI Analysis Route (WHO Compliant)
  app.post("/api/analyze", async (req, res) => {
    try {
      const { prompt } = req.body;
      const apiKey = process.env.UZAZI_API_KEY || process.env.GEMINI_API_KEY;

      if (!apiKey) {
        return res.status(500).json({ 
          error: "Clé API 'UZAZI_API_KEY' ou 'GEMINI_API_KEY' manquante." 
        });
      }

      const ai = new GoogleGenAI({ apiKey });
      const systemContext = `Vous êtes un Expert en Santé Maternelle certifié, travaillant pour l'ONG 'UZAZI SALAMA' et suivant SCRUPULEUSEMENT les directives de l'OMS (Organisation Mondiale de la Santé) pour la RDC. 
      Votre diagnostic doit être RÉEL, MÉDICALEMENT PRÉCIS et ACTIONNABLE. Ne simulez rien. 
      Si la patiente présente des signes de danger (maux de tête intenses, saignements, gonflements), vous DEVEZ recommander une consultation immédiate.`;

      const response = await ai.models.generateContent({ 
        model: "gemini-3-flash-preview", 
        contents: [{ parts: [{ text: systemContext + "\n\n" + prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              status: { type: Type.STRING, enum: ['stable', 'warning', 'critical'] },
              analysis: { type: Type.STRING }
            },
            required: ['status', 'analysis']
          }
        }
      });

      res.json(JSON.parse(response.text));
    } catch (error) {
      console.error("AI Analysis Error:", error);
      res.status(500).json({ error: "Failed to analyze symptoms" });
    }
  });

  // AI Advice Generation Route (WHO Compliant)
  app.post("/api/generate-advice", async (req, res) => {
    try {
      const { trimester, language } = req.body;
      const apiKey = process.env.UZAZI_API_KEY || process.env.GEMINI_API_KEY;

      if (!apiKey) return res.status(500).json({ error: "Clé API manquante." });

      const langMap = { FR: "Français", SW: "Kiswahili (Congo)", MSH: "Mashi (Sud-Kivu)" };
      const langChoice = langMap[language as keyof typeof langMap] || "Français";

      const prompt = `Générez un conseil médical unique pour une femme enceinte au trimestre ${trimester}. 
      Directives : Basé sur les protocoles de l'OMS. Langue : ${langChoice}. 
      Le conseil doit être très spécifique à ce stade de la grossesse et culturellement approprié pour l'Est de la RDC.
      Répondez UNIQUEMENT en JSON avec 'title' and 'content'.`;

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({ 
        model: "gemini-3-flash-preview", 
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              content: { type: Type.STRING }
            },
            required: ["title", "content"]
          }
        }
      });

      res.json(JSON.parse(response.text));
    } catch (error) {
      console.error("Advice Gen Error:", error);
      res.status(500).json({ error: "Failed to generate advice" });
    }
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
