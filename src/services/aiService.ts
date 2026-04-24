import { CheckupLog } from "../types";

export async function analyzeSymptoms(log: { symptoms: string[], bloodPressure?: string, weight?: number }, language: 'FR' | 'SW' | 'MSH' = 'FR') {
  const langPrompts = {
    FR: "Répondez UNIQUEMENT en Français. Utilisez un langage TRÈS SIMPLE, comme si vous parliez à une maman dans un village. Pas de jargon médical compliqué.",
    SW: "Répondez UNIQUEMENT en Kiswahili (Congo). Tumia lugha rahisi sana, kama unazungumza na mama kijijini. Usitumie maneno magumu ya kidaktari.",
    MSH: "Répondez UNIQUEMENT en Mashi. Obe n'oyandika budere budere lyo omubyere ayumva bwinji."
  };

  const prompt = `Vous agissez en tant que consultant médical expert. Effectuez une analyse de santé prénatale RÉELLE et PRÉCISE basée sur les protocoles de l'OMS. 
  Symptômes actuels : ${log.symptoms.join(", ") || "Aucun symptôme signalé"}.
  Mesures : Tension ${log.bloodPressure || "Non renseignée"}, Poids ${log.weight || "Non renseigné"} kg.
  
  Directives Lourdes :
  - Identifiez rigoureusement le statut : 'stable', 'warning' (attention nécessaire), ou 'critical' (URGENCE VITALE).
  - Fournissez une analyse médicale CLAIRE et des étapes concrètes à suivre immédiatement.
  - Ne simulez pas de conseils génériques ; si les symptômes indiquent une pré-éclampsie ou une hémorragie, soyez extrêmement direct sur la nécessité d'une aide médicale.
  - Utilisez un ton rassurant mais sérieux.
  
  ${langPrompts[language]}
  Répondez UNIQUEMENT en JSON avec les champs 'status' (string) et 'analysis' (string).`;

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt, language })
    });

    if (!response.ok) {
      throw new Error(`Proxy error: ${response.status}`);
    }

    const result = await response.json();
    const status = (['stable', 'warning', 'critical'].includes(result.status) ? result.status : 'stable') as 'stable' | 'warning' | 'critical';
    return { status, analysis: result.analysis || "Analyse indisponible." };
  } catch (error) {
    console.error("AI Analysis failed via proxy.", error);
    return { 
      status: 'critical', 
      analysis: "L'analyse intelligente est temporairement indisponible. Veuillez consulter votre médecin immédiatement pour tout signe inquiétant. (Erreur technique: vérifiez la configuration de votre clé API dans les Secrets)" 
    };
  }
}
