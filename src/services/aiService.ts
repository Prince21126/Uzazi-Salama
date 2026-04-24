import { GoogleGenAI, Type } from "@google/genai";
import { CheckupLog } from "../types";

let genAI: GoogleGenAI | null = null;

function getGenAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined. Please add it to your secrets or .env file.");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

export async function analyzeSymptoms(log: { symptoms: string[], bloodPressure?: string, weight?: number }, language: 'FR' | 'SW' | 'MSH' = 'FR') {
  const langPrompts = {
    FR: "Répondez UNIQUEMENT en Français.",
    SW: "Répondez UNIQUEMENT en Kiswahili (Congo).",
    MSH: "Répondez UNIQUEMENT en Mashi."
  };

  const prompt = `Analyse intelligente de santé prénatale.
  Symptômes : ${log.symptoms.join(", ") || "Aucun symptôme signalé"}.
  Tension : ${log.bloodPressure || "Non renseignée"}.
  Poids : ${log.weight || "Non renseigné"} kg.
  
  Fournissez une analyse médicale détaillée basée sur les recherches mondiales en santé maternelle (OMS).
  Déterminez si le statut est : 'stable', 'warning', ou 'critical'.
  Expliquez POURQUOI en citant des faits scientifiques.
  
  ${langPrompts[language]}
  Répondez UNIQUEMENT en JSON avec les champs 'status' (string) et 'analysis' (string).`;

  try {
    const ai = getGenAI();
    const model = ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
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

    const response = await model;
    const result = JSON.parse(response.text || "{}");
    return result as { status: 'stable' | 'warning' | 'critical', analysis: string };
  } catch (error) {
    console.error("AI Analysis failed:", error);
    // Fallback to basic logic if AI fails
    return { 
      status: 'stable', 
      analysis: "L'analyse intelligente est temporairement indisponible. Veuillez consulter votre médecin pour un suivi approfondi." 
    };
  }
}
