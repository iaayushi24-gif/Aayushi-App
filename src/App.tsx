import React, { useState, useEffect, useRef, useCallback } from 'react';
import { OroOrb } from './components/OroOrb';
import { CuratedDossier } from './components/CuratedDossier';
import { SoundboardShowcase } from './components/SoundboardShowcase';
import { ConversationStream, ChatMessage } from './components/ConversationStream';
import { AudioLiveController } from './utils/audioStreamer';
import { SpeechRecognitionService } from './utils/speechRecognition';
import { AAYUSHI_PROFILE } from './data/aayushiData';
import {
  Sparkles,
  Volume2,
  Mic,
  MicOff,
  Mail,
  MapPin,
  Clock,
  Compass,
  FileText,
  Headphones,
  Info,
  Check,
  Copy,
  AlertCircle,
  Square,
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<'concierge' | 'dossier' | 'soundboard' | 'contact'>('concierge');
  const [language, setLanguage] = useState<'en' | 'fr'>('en');
  const [status, setStatus] = useState<'idle' | 'connecting' | 'listening' | 'speaking' | 'muted'>('idle');
  const [audioEnergy, setAudioEnergy] = useState<number>(0);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [liveTranscription, setLiveTranscription] = useState<string>('');
  const [isThinking, setIsThinking] = useState<boolean>(false);
  const [activeSoundboardPrompt, setActiveSoundboardPrompt] = useState<string | null>(null);
  const [copiedEmail, setCopiedEmail] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  // Audio and Speech references
  const audioControllerRef = useRef<AudioLiveController | null>(null);
  const speechRecognizerRef = useRef<SpeechRecognitionService | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const isAutoListeningRef = useRef<boolean>(false);

  // Initialize Audio and Speech Recognition
  useEffect(() => {
    const controller = new AudioLiveController(
      undefined,
      (isSpeaking) => {
        if (!isSpeaking) {
          setStatus('idle');
        }
      }
    );
    audioControllerRef.current = controller;

    const speechRecognizer = new SpeechRecognitionService();
    speechRecognizerRef.current = speechRecognizer;

    // Visualizer loop for real-time audio energy
    const updateVisualizer = () => {
      if (audioControllerRef.current) {
        const energy = audioControllerRef.current.getVisualizerEnergy();
        setAudioEnergy(energy);
      }
      animFrameRef.current = requestAnimationFrame(updateVisualizer);
    };
    animFrameRef.current = requestAnimationFrame(updateVisualizer);

    // Initial warm welcoming message from Oro
    const initialWelcome: ChatMessage = {
      id: 'welcome-0',
      role: 'assistant',
      content:
        language === 'fr'
          ? "Bonjour et bienvenue. Je suis Oro, l'ambassadeur vocal d'Aayushi Bhandari. Je suis à votre disposition pour vous présenter son parcours dans le management du luxe, ses réalisations à Paris et son expertise alliant rigueur financière et création de prestige."
          : "Good day and welcome. I am Oro, personal voice ambassador representing Aayushi Bhandari. I am at your service to introduce her background in luxury brand management, her Paris credentials, and her distinctive balance of analytical acumen and prestige storytelling.",
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      language,
    };
    setMessages([initialWelcome]);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      controller.dispose();
      speechRecognizer.stop();
    };
  }, []);

  // Update initial welcome message when language changes if no conversation yet
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 1 && prev[0].id === 'welcome-0') {
        return [
          {
            ...prev[0],
            content:
              language === 'fr'
                ? "Bonjour et bienvenue. Je suis Oro, l'ambassadeur vocal d'Aayushi Bhandari. Je suis à votre disposition pour vous présenter son parcours dans le management du luxe, ses réalisations à Paris et son expertise alliant rigueur financière et création de prestige."
                : "Good day and welcome. I am Oro, personal voice ambassador representing Aayushi Bhandari. I am at your service to introduce her background in luxury brand management, her Paris credentials, and her distinctive balance of analytical acumen and prestige storytelling.",
            language,
          },
        ];
      }
      return prev;
    });
  }, [language]);

  // Send a message and have Oro respond with text + speech
  const handleSendMessage = useCallback(
    async (text: string, promptLang: 'en' | 'fr' = language) => {
      if (!text.trim()) return;

      const userMsg: ChatMessage = {
        id: Date.now().toString(),
        role: 'user',
        content: text.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        language: promptLang,
      };

      setMessages((prev) => [...prev, userMsg]);
      setLiveTranscription('');
      setIsThinking(true);
      setStatus('connecting');

      try {
        const controller = audioControllerRef.current;
        if (controller) {
          await controller.ensureContext();
        }

        const res = await fetch('/api/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: text.trim(),
            language: promptLang,
            includeAudio: true,
            history: messages.slice(-4).map((m) => ({ role: m.role, content: m.content })),
          }),
        });

        const data = await res.json();
        setIsThinking(false);

        if (data.reply) {
          const assistantMsg: ChatMessage = {
            id: (Date.now() + 1).toString(),
            role: 'assistant',
            content: data.reply,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            language: promptLang,
            audioBase64: data.audio || null,
          };
          setMessages((prev) => [...prev, assistantMsg]);

          // Play Oro's deep voice
          if (data.audio && controller) {
            setStatus('speaking');
            await controller.playWavBase64(data.audio);
            setStatus('idle');
          } else {
            setStatus('idle');
          }
        } else {
          setStatus('idle');
        }
      } catch (err: any) {
        console.error('Send message error:', err);
        setIsThinking(false);
        setStatus('idle');
        setNotice('Connection note: Responding with default luxury greeting.');

        const fallbackMsg: ChatMessage = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content:
            promptLang === 'fr'
              ? "Aayushi étudie actuellement à l'ESCE à Paris en Master Luxe et Prestige. Elle a notamment orchestré le Luxury Shopping Festival à DLF Emporio et détient le certificat Inside LVMH."
              : "Aayushi is currently pursuing her Master's in Prestige & Luxury Marketing at ESCE Paris. She recently orchestrated the flagship Luxury Shopping Festival at DLF Emporio and holds the Inside LVMH certification.",
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          language: promptLang,
        };
        setMessages((prev) => [...prev, fallbackMsg]);
      }
    },
    [language, messages]
  );

  // Stop Oro speaking or stop listening
  const handleStopAudio = () => {
    if (audioControllerRef.current) {
      audioControllerRef.current.interruptPlayback();
    }
    if (speechRecognizerRef.current) {
      speechRecognizerRef.current.stop();
    }
    setStatus('idle');
    setLiveTranscription('');
  };

  // Toggle Voice Interaction (Start Listening / Stop)
  const toggleVoiceInteraction = useCallback(async () => {
    const controller = audioControllerRef.current;
    const recognizer = speechRecognizerRef.current;

    if (status === 'speaking') {
      handleStopAudio();
      return;
    }

    if (status === 'listening') {
      // User tapped to finish speaking
      recognizer?.stop();
      controller?.stopMicrophone();
      setStatus('idle');
      return;
    }

    // Start listening
    try {
      if (controller) {
        await controller.ensureContext();
        await controller.startMicrophone();
      }

      setStatus('listening');
      setNotice(null);

      if (recognizer && recognizer.isSupported()) {
        recognizer.start({
          language,
          onInterim: (interimText) => {
            setLiveTranscription(interimText);
          },
          onFinal: (finalText) => {
            setLiveTranscription(finalText);
            controller?.stopMicrophone();
            recognizer.stop();
            handleSendMessage(finalText, language);
          },
          onError: (errMsg) => {
            console.warn('Speech error:', errMsg);
            controller?.stopMicrophone();
            setStatus('idle');
          },
          onEnd: () => {
            controller?.stopMicrophone();
            setStatus((current) => (current === 'listening' ? 'idle' : current));
          },
        });
      } else {
        // Fallback for browsers without speech recognition
        setNotice('Speech recognition not available in this browser. Please type or click the prompt chips below.');
        controller?.stopMicrophone();
        setStatus('idle');
      }
    } catch (err: any) {
      console.error('Failed to start microphone:', err);
      setStatus('idle');
      setNotice('Microphone permission required. Please allow microphone access or use text prompts.');
    }
  }, [status, language, handleSendMessage, liveTranscription]);

  // Replay audio for a message
  const handleReplayAudio = async (msg: ChatMessage) => {
    const controller = audioControllerRef.current;
    if (!controller) return;

    await controller.ensureContext();

    if (msg.audioBase64) {
      setStatus('speaking');
      await controller.playWavBase64(msg.audioBase64);
      setStatus('idle');
    } else {
      try {
        setStatus('speaking');
        const res = await fetch('/api/tts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: msg.content, language: msg.language || language }),
        });
        const data = await res.json();
        if (data.audio) {
          msg.audioBase64 = data.audio;
          await controller.playWavBase64(data.audio);
        }
        setStatus('idle');
      } catch (e) {
        console.error('TTS error:', e);
        setStatus('idle');
      }
    }
  };

  // Play clip from Soundboard
  const handlePlaySoundboardPrompt = async (prompt: string, lang: 'en' | 'fr') => {
    setActiveSoundboardPrompt(prompt);
    setActiveTab('concierge');
    setLanguage(lang);
    await handleSendMessage(prompt, lang);
    setActiveSoundboardPrompt(null);
  };

  const copyEmail = () => {
    navigator.clipboard.writeText(AAYUSHI_PROFILE.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#FAF8F5] text-[#171412] flex flex-col selection:bg-[#EBDDC8] selection:text-[#171412]">
      {/* Luxury Brand Top Bar */}
      <header className="border-b border-[#EFE8DD] bg-white/70 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 sm:h-20 flex items-center justify-between">
          {/* Logo & Identity */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#F5E6CE] to-[#C9A668] border border-[#B68E4F]/40 flex items-center justify-center shadow-xs">
              <span className="font-serif text-lg font-bold text-[#3E3732] tracking-wider">
                O
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-serif text-xl sm:text-2xl font-semibold tracking-tight text-[#171412]">
                  ORO
                </h1>
                <span className="text-[10px] uppercase font-sans tracking-widest text-[#9E7437] font-semibold px-2 py-0.5 rounded-full bg-[#FAF4EB] border border-[#E8DEC9]">
                  Voice Concierge
                </span>
              </div>
              <p className="text-xs text-[#716860] font-serif italic">
                Representing Aayushi Bhandari • Luxury Brand Management, Paris
              </p>
            </div>
          </div>

          {/* Right Actions: Paris Badge & Direct Mail */}
          <div className="flex items-center gap-3">
            <div className="hidden md:flex items-center gap-2 text-xs text-[#716860] px-3 py-1.5 rounded-full bg-[#FAF6F0] border border-[#E8DEC9]">
              <MapPin className="w-3.5 h-3.5 text-[#9E7437]" />
              <span>Paris, France</span>
              <span className="w-1 h-1 rounded-full bg-[#9E7437]" />
              <span className="text-[#865E26] font-medium">ESCE Prestige Marketing</span>
            </div>

            <button
              onClick={copyEmail}
              className="hidden sm:flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#D5C2A5] bg-[#FAF8F5] hover:bg-white text-xs font-medium text-[#26211D] transition-colors cursor-pointer"
            >
              {copiedEmail ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-[#9E7437]" />}
              <span>{copiedEmail ? 'Copied' : 'aayushibhandari2002@gmail.com'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Editorial Navigation Tabs */}
      <nav className="border-b border-[#F0E9DF] bg-[#FAF8F5] sticky top-18 sm:top-20 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex items-center justify-between overflow-x-auto no-scrollbar py-2">
          <div className="flex items-center space-x-1 sm:space-x-3">
            <button
              onClick={() => setActiveTab('concierge')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'concierge'
                  ? 'bg-[#26211D] text-[#FAF8F5] shadow-xs'
                  : 'text-[#61574E] hover:text-[#171412] hover:bg-[#F3EFE9]'
              }`}
            >
              <Headphones className="w-3.5 h-3.5 text-[#DEC79B]" />
              <span>Voice Salon (Oro)</span>
            </button>

            <button
              onClick={() => setActiveTab('dossier')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'dossier'
                  ? 'bg-[#26211D] text-[#FAF8F5] shadow-xs'
                  : 'text-[#61574E] hover:text-[#171412] hover:bg-[#F3EFE9]'
              }`}
            >
              <FileText className="w-3.5 h-3.5 text-[#DEC79B]" />
              <span>Curated Dossier</span>
            </button>

            <button
              onClick={() => setActiveTab('soundboard')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'soundboard'
                  ? 'bg-[#26211D] text-[#FAF8F5] shadow-xs'
                  : 'text-[#61574E] hover:text-[#171412] hover:bg-[#F3EFE9]'
              }`}
            >
              <Volume2 className="w-3.5 h-3.5 text-[#DEC79B]" />
              <span>Audio Showcase</span>
            </button>

            <button
              onClick={() => setActiveTab('contact')}
              className={`px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-all flex items-center gap-2 cursor-pointer ${
                activeTab === 'contact'
                  ? 'bg-[#26211D] text-[#FAF8F5] shadow-xs'
                  : 'text-[#61574E] hover:text-[#171412] hover:bg-[#F3EFE9]'
              }`}
            >
              <Mail className="w-3.5 h-3.5 text-[#DEC79B]" />
              <span>Connect & Hire</span>
            </button>
          </div>

          {/* Quick Voice Mode Indicator */}
          <div className="flex items-center gap-2 pl-4 shrink-0">
            {status === 'speaking' && (
              <button
                onClick={handleStopAudio}
                className="px-2.5 py-1 rounded-full bg-[#FAF0E4] border border-[#E4D1B8] text-xs text-[#865E26] hover:bg-[#F3E1C8] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Square className="w-3 h-3 fill-[#865E26]" />
                <span>Stop Speaking</span>
              </button>
            )}
            <span className="w-2 h-2 rounded-full bg-[#B68E4F]" />
            <span className="text-[11px] uppercase tracking-wider text-[#716860] font-semibold hidden lg:inline">
              Soft Deep Voice • Fenrir
            </span>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {notice && (
          <div className="mb-6 max-w-4xl mx-auto p-3.5 rounded-xl bg-[#FFF9F0] border border-[#EBDDC8] flex items-center justify-between text-xs text-[#865E26]">
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 text-[#9E7437] shrink-0" />
              <span>{notice}</span>
            </div>
            <button
              onClick={() => setNotice(null)}
              className="text-[#9E7437] hover:text-[#171412] font-semibold px-2 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {activeTab === 'concierge' && (
          <div className="space-y-8 animate-fade-in">
            {/* Editorial Intro Banner */}
            <div className="text-center max-w-2xl mx-auto space-y-2">
              <span className="text-xs uppercase tracking-widest text-[#9E7437] font-semibold">
                An Elegant Voice Experience
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl text-[#171412] tracking-tight">
                Meet Oro, Aayushi's Voice Ambassador
              </h2>
              <p className="text-sm sm:text-base text-[#61574E] font-serif italic leading-relaxed">
                "Speaking in a soft, deep British voice for English, and Parisian elegance for French. Explore her luxury festival management, LVMH credential, and passion for haute couture."
              </p>
            </div>

            {/* Interactive Oro Orb */}
            <OroOrb
              status={status}
              audioEnergy={audioEnergy}
              language={language}
              onToggleLive={toggleVoiceInteraction}
              onLanguageChange={(newLang) => setLanguage(newLang)}
            />

            {/* Live Conversation Stream & Text Interface */}
            <ConversationStream
              messages={messages}
              isThinking={isThinking}
              isLiveActive={status === 'listening' || status === 'speaking'}
              currentTranscription={liveTranscription}
              onSendMessage={(txt) => handleSendMessage(txt, language)}
              onReplayAudio={handleReplayAudio}
              language={language}
              onQuickPrompt={(prompt) => handleSendMessage(prompt, language)}
            />
          </div>
        )}

        {activeTab === 'dossier' && (
          <div className="animate-fade-in">
            <CuratedDossier />
          </div>
        )}

        {activeTab === 'soundboard' && (
          <div className="animate-fade-in">
            <SoundboardShowcase
              onPlayPrompt={handlePlaySoundboardPrompt}
              isPlaying={status === 'speaking'}
              activePrompt={activeSoundboardPrompt}
            />
          </div>
        )}

        {activeTab === 'contact' && (
          <div className="max-w-3xl mx-auto py-6 animate-fade-in space-y-8">
            <div className="bg-white/80 backdrop-blur-md rounded-2xl p-8 sm:p-12 border border-[#EBE4D8] shadow-xs text-center space-y-6">
              <div className="w-16 h-16 rounded-full bg-[#FAF5EC] border border-[#E8DFC9] flex items-center justify-center mx-auto text-[#9E7437]">
                <Mail className="w-8 h-8" />
              </div>

              <div>
                <span className="text-xs uppercase tracking-widest text-[#9E7437] font-semibold">
                  Luxury Inquiries & Opportunities
                </span>
                <h3 className="font-serif text-3xl sm:text-4xl text-[#171412] mt-1">
                  Connect with Aayushi Bhandari
                </h3>
                <p className="text-[#61574E] text-sm sm:text-base max-w-lg mx-auto mt-2 font-serif italic">
                  Currently seeking a luxury-sector internship in Paris or internationally in marketing, brand management, client experience, or PR.
                </p>
              </div>

              <div className="p-6 rounded-xl bg-[#FAF8F5] border border-[#EFE8DD] max-w-md mx-auto space-y-4">
                <div className="text-left space-y-1">
                  <span className="text-[11px] uppercase tracking-wider text-[#716860]">Primary Contact</span>
                  <p className="font-serif text-lg text-[#171412] font-semibold">
                    {AAYUSHI_PROFILE.email}
                  </p>
                  <p className="text-xs text-[#716860]">
                    Paris, France (ESCE Master's 2025–2027)
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                  <button
                    onClick={copyEmail}
                    className="flex-1 px-4 py-2.5 rounded-full border border-[#D5C2A5] bg-white hover:bg-[#F3EFE9] text-xs font-medium text-[#26211D] flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    {copiedEmail ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4 text-[#9E7437]" />}
                    <span>{copiedEmail ? 'Email Copied' : 'Copy Email Address'}</span>
                  </button>

                  <a
                    href={`mailto:${AAYUSHI_PROFILE.email}?subject=Luxury%20Internship%20Opportunity%20-%20Aayushi%20Bhandari`}
                    className="flex-1 px-5 py-2.5 rounded-full bg-[#26211D] hover:bg-[#171412] text-xs font-medium text-[#FAF8F5] flex items-center justify-center gap-2 transition-colors"
                  >
                    <Mail className="w-4 h-4 text-[#DEC79B]" />
                    <span>Send Direct Email</span>
                  </a>
                </div>
              </div>

              {/* Ask Oro to prepare an introduction */}
              <div className="pt-4 border-t border-[#F2ECE2]">
                <p className="text-xs text-[#716860] mb-3">
                  Want Oro to present a tailored recommendation for your luxury brand?
                </p>
                <button
                  onClick={() => {
                    setActiveTab('concierge');
                    handleSendMessage("Can you summarize why Aayushi is an ideal fit for our luxury brand maison?");
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#FAF4EB] border border-[#E6D9C5] hover:bg-[#F2E7D5] text-xs font-medium text-[#694F25] transition-all cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#9E7437]" />
                  <span>Ask Oro: "Why is Aayushi the ideal candidate?"</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Refined Minimalist Footer */}
      <footer className="border-t border-[#EFE8DD] bg-[#FAF8F5] py-8 text-center text-xs text-[#716860]">
        <div className="max-w-6xl mx-auto px-4 space-y-2">
          <p className="font-serif text-sm text-[#3E3732]">
            Oro — Voice Assistant representing Aayushi Bhandari
          </p>
          <p className="text-[11px] text-[#A89F93]">
            Powered by Gemini Voice & Speech • English (British Accent) & French (Accent Français)
          </p>
        </div>
      </footer>
    </div>
  );
}
