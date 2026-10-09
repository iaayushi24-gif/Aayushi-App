import express from 'express';
import http from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import { GoogleGenAI, LiveServerMessage, Modality } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { AAYUSHI_PROFILE, ORO_SYSTEM_PROMPT } from './src/data/aayushiData.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json({ limit: '10mb' }));

const server = http.createServer(app);
const port = Number(process.env.PORT) || 3000;

// Initialize GoogleGenAI SDK with environment key
const apiKey = process.env.GEMINI_API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

// Profile endpoint
app.get('/api/profile', (_req, res) => {
  res.json({ success: true, profile: AAYUSHI_PROFILE });
});

// Chat endpoint with optional speech generation
app.post('/api/chat', async (req, res) => {
  try {
    const { message, history = [], language = 'en', includeAudio = true } = req.body;
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const contents = [
      ...history.map((h: { role: string; content: string }) => ({
        role: h.role === 'assistant' ? 'model' : 'user',
        parts: [{ text: h.content }],
      })),
      {
        role: 'user',
        parts: [{ text: message }],
      },
    ];

    let replyText = '';
    // Use gemini-flash-latest first for fast, reliable responses, falling back to gemini-3.8-flash and gemini-3.1-flash-lite
    const modelsToTry = ['gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3.1-flash-lite'];

    for (const model of modelsToTry) {
      try {
        const modelResponse = await ai.models.generateContent({
          model,
          contents,
          config: {
            systemInstruction: `${ORO_SYSTEM_PROMPT}\n\nCurrent user interface language preference: ${language === 'fr' ? 'French' : 'English'}. Keep your vocal reply elegant, natural, and concise (2-4 sentences max).`,
          },
        });
        if (modelResponse.text) {
          replyText = modelResponse.text;
          break;
        }
      } catch (err: any) {
        console.warn(`[Chat] Model ${model} failed, trying fallback:`, err?.message || err);
      }
    }

    if (!replyText) {
      replyText = language === 'fr'
        ? "Bonjour ! Je suis Oro, l'ambassadeur vocal d'Aayushi Bhandari. Aayushi est actuellement à Paris, où elle prépare un Master en Marketing du Luxe et Prestige à l'ESCE. Elle est activement à la recherche d'un stage dans le secteur du luxe."
        : "Good day. I am Oro, personal voice ambassador representing Aayushi Bhandari. Aayushi is currently based in Paris completing her Master's in Prestige & Luxury Marketing at ESCE, and is actively seeking a luxury-sector internship.";
    }

    let audioBase64: string | null = null;
    if (includeAudio) {
      try {
        const speechResponse = await ai.models.generateContent({
          model: 'gemini-3.8-flash-lite-tts',
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: replyText,
                  speechMetadata: {
                    style: language === 'fr'
                      ? 'Refined, cultured, warm male voice with charming Parisian French accent'
                      : 'Distinguished, warm, soft deep male voice with elegant British accent',
                  },
                },
              ],
            },
          ],
          config: {
            responseModalities: [Modality.AUDIO],
            speechConfig: {
              voiceConfig: {
                prebuiltVoiceConfig: { voiceName: 'Fenrir' },
              },
            },
          },
        });

        const part = speechResponse.candidates?.[0]?.content?.parts?.[0];
        if (part?.inlineData?.data) {
          audioBase64 = part.inlineData.data;
        }
      } catch (audioErr) {
        console.warn('TTS generation warning (falling back to text reply):', audioErr);
      }
    }

    res.json({
      reply: replyText,
      audio: audioBase64,
    });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({
      error: 'Failed to generate response',
      details: error?.message || String(error),
    });
  }
});

// Standalone Text-to-Speech endpoint
app.post('/api/tts', async (req, res) => {
  try {
    const { text, language = 'en' } = req.body;
    if (!text) {
      return res.status(400).json({ error: 'Text is required' });
    }

    const speechResponse = await ai.models.generateContent({
      model: 'gemini-3.8-flash-lite-tts',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text,
              speechMetadata: {
                style: language === 'fr'
                  ? 'Warm, deep, cultured Parisian male voice'
                  : 'Soft, deep, sophisticated male voice with polished British accent',
              },
            },
          ],
        },
      ],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName: 'Fenrir' },
          },
        },
      },
    });

    const audioBase64 = speechResponse.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    if (!audioBase64) {
      return res.status(500).json({ error: 'Failed to generate audio' });
    }

    res.json({ audio: audioBase64 });
  } catch (err: any) {
    console.error('TTS endpoint error:', err);
    res.status(500).json({ error: err?.message || 'TTS generation failed' });
  }
});

// WebSocket Server for Live Real-Time Voice Conversations
const wss = new WebSocketServer({ server, path: '/live' });

wss.on('connection', async (clientWs: WebSocket) => {
  console.log('[Live] Client connected to Oro voice channel');
  let session: any = null;

  try {
    session = await ai.live.connect({
      model: 'gemini-3.8-live',
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            // 'Fenrir' provides a deep, warm, elegant baritone voice
            prebuiltVoiceConfig: { voiceName: 'Fenrir' },
          },
        },
        systemInstruction: `${ORO_SYSTEM_PROMPT}\n\nDeliver your speech in a soft, deep male voice. Speak with a polished British accent when conversing in English, and a refined Parisian French accent when conversing in French.`,
        outputAudioTranscription: {},
        inputAudioTranscription: {},
      },
      callbacks: {
        onmessage: (message: LiveServerMessage) => {
          if (clientWs.readyState !== WebSocket.OPEN) return;

          // Audio chunk output
          const audio = message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
          if (audio) {
            clientWs.send(JSON.stringify({ type: 'audio', audio }));
          }

          // User interruption signal
          if (message.serverContent?.interrupted) {
            clientWs.send(JSON.stringify({ type: 'interrupted', interrupted: true }));
          }

          // Output transcription text
          const parts = message.serverContent?.modelTurn?.parts;
          if (parts) {
            for (const part of parts) {
              if (part.text) {
                clientWs.send(JSON.stringify({ type: 'text', text: part.text }));
              }
            }
          }

          // Turn complete
          if (message.serverContent?.turnComplete) {
            clientWs.send(JSON.stringify({ type: 'turnComplete' }));
          }
        },
        onclose: () => {
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'sessionClosed' }));
          }
        },
        onerror: (err) => {
          console.error('[Live] Session error:', err);
          if (clientWs.readyState === WebSocket.OPEN) {
            clientWs.send(JSON.stringify({ type: 'error', error: String(err) }));
          }
        },
      },
    });

    clientWs.send(JSON.stringify({ type: 'ready', message: 'Connected to Oro live session' }));
  } catch (err: any) {
    console.error('[Live] Failed to initialize session:', err);
    if (clientWs.readyState === WebSocket.OPEN) {
      clientWs.send(JSON.stringify({ type: 'error', error: 'Live API connection error: ' + (err?.message || String(err)) }));
    }
  }

  clientWs.on('message', (data: any) => {
    try {
      const parsed = JSON.parse(data.toString());

      if (parsed.audio && session) {
        // Send PCM 16kHz audio chunk to Gemini Live
        session.sendRealtimeInput({
          audio: {
            data: parsed.audio,
            mimeType: 'audio/pcm;rate=16000',
          },
        });
      } else if (parsed.text && session) {
        session.sendRealtimeInput({
          text: parsed.text,
        });
      }
    } catch (err) {
      console.error('[Live] Client message handling error:', err);
    }
  });

  clientWs.on('close', () => {
    console.log('[Live] Client disconnected');
    try {
      session?.close?.();
    } catch (e) {
      // ignore
    }
  });
});

// Mount Vite or static build
const isDev = process.env.NODE_ENV !== 'production';

if (isDev) {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: {
      middlewareMode: true,
      port,
      host: '0.0.0.0',
    },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  const distPath = path.resolve(__dirname, 'dist');
  app.use(express.static(distPath));
  app.get('*', (_req, res) => {
    res.sendFile(path.resolve(distPath, 'index.html'));
  });
}

server.listen(port, '0.0.0.0', () => {
  console.log(`[Oro Server] Running on http://0.0.0.0:${port} (${isDev ? 'Development' : 'Production'})`);
});
