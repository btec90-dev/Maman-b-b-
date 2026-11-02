import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

interface ChatHistoryItem {
  role: 'user' | 'model';
  content: string;
}

interface AssistantContext {
  stage?: 'pregnancy' | 'baby';
  currentWeek?: number;
  babyAge?: string;
  babyMode?: 'single' | 'twin';
  motherName?: string;
  babyName?: string;
  babyNameTwin?: string;
  language?: string;
}

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Maman Assistant Gemini Chat Route
  app.post('/api/assistant/chat', async (req, res) => {
    try {
      const {
        userMessage,
        history = [],
        context = {},
      }: {
        userMessage: string;
        history: ChatHistoryItem[];
        context: AssistantContext;
      } = req.body;

      if (!userMessage || typeof userMessage !== 'string') {
        res.status(400).json({ error: 'userMessage is required and must be a string.' });
        return;
      }

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === 'MY_GEMINI_API_KEY') {
        res.status(503).json({
          error: 'GEMINI_API_KEY is not configured. Please set your Gemini API key in Settings > Secrets.',
          fallback:
            "I'm here to support you! Note: To activate live AI intelligence for Maman Assistant, please configure your GEMINI_API_KEY in the AI Studio Settings > Secrets panel.",
        });
        return;
      }

      // Build context summary for system prompt
      const stage = context.stage === 'baby' ? 'Postpartum & Newborn Care' : 'Pregnancy';
      const weekInfo =
        context.stage === 'pregnancy'
          ? `Current Gestational Week: Week ${context.currentWeek || 24}`
          : `Baby Stage / Age: ${context.babyAge || '0-3 months newborn'}`;
      const babyDetails =
        context.babyMode === 'twin'
          ? `Twins: ${context.babyName || 'Margot'} & ${context.babyNameTwin || 'Léa'}`
          : `Baby: ${context.babyName || 'Margot'}`;
      const mother = context.motherName || 'Mama';
      const userLang = context.language || 'en';

      const languageNames: Record<string, string> = {
        en: 'English',
        fr: 'French (Français)',
        es: 'Spanish (Español)',
        de: 'German (Deutsch)',
        pt: 'Portuguese (Português)',
        ar: 'Arabic (العربية)',
        it: 'Italian (Italiano)',
        ja: 'Japanese (日本語)',
      };
      const targetLanguage = languageNames[userLang] || 'English';

      const systemInstruction = `You are "Maman Assistant", an empathetic, supportive, and knowledgeable parenting companion for "Maman & bébé Pregnancy Tracker".
You speak directly with ${mother}, who is currently in the following stage:
- Current Journey Stage: ${stage}
- Timeline Context: ${weekInfo}
- Children: ${babyDetails}
- Target Output Language: ${targetLanguage}

CRITICAL NON-MEDICAL BOUNDARY:
- "Maman & bébé" is a supportive non-medical utility. You provide gentle, evidence-based developmental facts, emotional encouragement, soothing techniques, routine suggestions, sleep hygiene, nutritional generalities, and partner teamwork tips.
- YOU ARE NOT A DOCTOR, OB-GYN, OR PEDIATRICIAN. NEVER provide definitive medical diagnoses, medication dosages, or replace professional healthcare provider visits.
- Whenever red-flag symptoms are mentioned (such as vaginal bleeding, sudden severe abdominal pain, high fever, sudden vision changes, severe persistent headache, decreased/absent fetal movements, infant breathing distress, or severe postpartum depression), IMMEDIATELY advise the mother with gentle urgency to contact her OB-GYN, midwife, pediatrician, or emergency services.
- Always maintain a warm, calming, reassuring tone — like an experienced doula and supportive parenting friend.
- Respond completely and naturally in ${targetLanguage}. If the language is Arabic, use natural, modern Arabic.
- Keep responses readable, beautifully structured with clear headings or concise bullet points when appropriate.`;

      // Construct previous conversation contents
      const formattedContents = history.map((h) => ({
        role: h.role === 'model' ? ('model' as const) : ('user' as const),
        parts: [{ text: h.content }],
      }));

      // Add current user prompt
      formattedContents.push({
        role: 'user',
        parts: [{ text: userMessage }],
      });

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: formattedContents,
        config: {
          systemInstruction,
        },
      });

      const reply = response.text || "I'm here for you, mama. How can I support you today?";
      res.json({ reply });
    } catch (err: unknown) {
      console.error('Error in /api/assistant/chat:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error calling Gemini';
      res.status(500).json({
        error: errorMessage,
        fallback:
          "I am taking a quiet breath right now. For any immediate medical questions, please always consult your healthcare provider or pediatrician.",
      });
    }
  });

  // Environment routing: Dev vs Production
  if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  } else {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Maman & bébé full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
