import React, { useState, useRef, useEffect } from 'react';
import { Send, Volume2, Mic, MicOff, Sparkles, CornerDownLeft, Loader2 } from 'lucide-react';

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  language?: 'en' | 'fr';
  audioBase64?: string | null;
}

interface ConversationStreamProps {
  messages: ChatMessage[];
  isThinking: boolean;
  isLiveActive: boolean;
  currentTranscription: string;
  onSendMessage: (text: string) => void;
  onReplayAudio: (message: ChatMessage) => void;
  language: 'en' | 'fr';
  onQuickPrompt: (prompt: string) => void;
}

export const ConversationStream: React.FC<ConversationStreamProps> = ({
  messages,
  isThinking,
  isLiveActive,
  currentTranscription,
  onSendMessage,
  onReplayAudio,
  language,
  onQuickPrompt,
}) => {
  const [inputText, setInputText] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentTranscription, isThinking]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const quickPromptsEn = [
    "Tell me about Aayushi's DLF Emporio experience",
    "What makes her combination of finance & luxury unique?",
    "What are her key takeaways from Inside LVMH?",
    "Is she available for a luxury internship in Paris?",
  ];

  const quickPromptsFr = [
    "Présente-moi Aayushi en français",
    "Quel est son cursus à l'ESCE Paris ?",
    "Pourquoi recruter Aayushi pour notre maison de luxe ?",
    "Parle-moi de son expérience événementielle de luxe",
  ];

  const activePrompts = language === 'fr' ? quickPromptsFr : quickPromptsEn;

  return (
    <div className="flex flex-col h-[520px] max-w-4xl mx-auto bg-white/80 backdrop-blur-md rounded-2xl border border-[#EBE4D8] shadow-xs overflow-hidden">
      {/* Stream Header */}
      <div className="px-6 py-4 border-b border-[#F0E9DF] flex items-center justify-between bg-[#FAF8F5]/80">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#B68E4F]" />
          <h3 className="font-serif text-lg font-medium text-[#171412]">
            Conversation with Oro
          </h3>
          <span className="text-xs text-[#716860] hidden sm:inline">
            • Representing Aayushi Bhandari
          </span>
        </div>
        <div className="text-xs text-[#716860] flex items-center gap-1.5 font-sans">
          <span className="px-2 py-0.5 rounded-full bg-[#F3EDE2] text-[#694F25] font-medium border border-[#E8DEC9]">
            {language === 'fr' ? '🇫🇷 Voix Française' : '🇬🇧 British Baritone'}
          </span>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
        {messages.length === 0 && !currentTranscription && (
          <div className="h-full flex flex-col items-center justify-center text-center p-6 text-[#716860]">
            <div className="w-12 h-12 rounded-full bg-[#FAF5EC] border border-[#EBE1D2] flex items-center justify-center text-[#9E7437] mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="font-serif text-xl text-[#171412]">
              {language === 'fr' ? 'Bienvenue au Salon Vocal' : 'Welcome to the Voice Salon'}
            </h4>
            <p className="text-xs sm:text-sm text-[#716860] max-w-md mt-1 leading-relaxed">
              {language === 'fr'
                ? "Je suis Oro, le représentant personnel d'Aayushi Bhandari. Parlez-moi ou choisissez une question ci-dessous pour explorer son parcours dans le luxe."
                : "I am Oro, Aayushi Bhandari's personal ambassador. Speak to me or select a prompt below to explore her luxury background, Paris credentials, and portfolio."}
            </p>

            {/* Quick Starter Prompts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-6 w-full max-w-lg">
              {activePrompts.map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => onQuickPrompt(prompt)}
                  className="p-3 text-left rounded-xl bg-[#FAF8F5] hover:bg-[#F3EFE9] border border-[#EFE8DD] text-xs text-[#26211D] font-medium transition-all hover:border-[#D9C8B2] cursor-pointer"
                >
                  "{prompt}"
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex flex-col ${
              msg.role === 'user' ? 'items-end' : 'items-start'
            }`}
          >
            <div className="flex items-center gap-1.5 mb-1 px-1">
              <span className="text-[11px] font-medium text-[#716860]">
                {msg.role === 'user' ? 'You' : 'Oro (Ambassador)'}
              </span>
              <span className="text-[10px] text-[#A89F93]">{msg.timestamp}</span>
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#26211D] text-[#FAF8F5] rounded-tr-xs'
                  : 'bg-[#FAF8F5] text-[#171412] border border-[#EAE3D6] rounded-tl-xs shadow-2xs'
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>

              {msg.role === 'assistant' && msg.audioBase64 && (
                <div className="mt-2 pt-2 border-t border-[#EDE4D6] flex items-center justify-between">
                  <button
                    onClick={() => onReplayAudio(msg)}
                    className="text-xs text-[#865E26] hover:text-[#171412] flex items-center gap-1 font-medium transition-colors cursor-pointer"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    <span>Replay Audio</span>
                  </button>
                  <span className="text-[10px] text-[#A89F93] font-serif italic">
                    Soft deep voice
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Live Streaming Transcription Banner */}
        {currentTranscription && (
          <div className="flex flex-col items-start animate-fade-in">
            <span className="text-[11px] font-medium text-[#9E7437] mb-1 px-1 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#9E7437] animate-ping" />
              Oro Speaking (Live)...
            </span>
            <div className="max-w-[85%] rounded-2xl rounded-tl-xs px-4 py-3 bg-[#FAF8F5] text-[#171412] border border-[#DFCBB0] shadow-2xs italic">
              <p>{currentTranscription}</p>
            </div>
          </div>
        )}

        {/* Thinking Indicator */}
        {isThinking && (
          <div className="flex items-center gap-2 text-xs text-[#716860] italic py-2">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9E7437]" />
            <span>{language === 'fr' ? 'Oro prépare sa réponse...' : 'Oro is composing his response...'}</span>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* Suggested chips above input */}
      <div className="px-4 py-2 bg-[#FAF8F5]/60 border-t border-[#F0E9DF] flex items-center gap-2 overflow-x-auto no-scrollbar">
        <span className="text-[10px] uppercase tracking-wider text-[#A89F93] font-medium whitespace-nowrap">
          Quick Inquiries:
        </span>
        {activePrompts.map((prompt, i) => (
          <button
            key={i}
            onClick={() => onQuickPrompt(prompt)}
            className="text-[11px] whitespace-nowrap px-2.5 py-1 rounded-full bg-white border border-[#E8DEC9] text-[#524942] hover:bg-[#F3EFE9] hover:text-[#171412] transition-colors cursor-pointer shrink-0"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <form
        onSubmit={handleSubmit}
        className="p-3 sm:p-4 bg-white border-t border-[#F0E9DF] flex items-center gap-2"
      >
        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder={
            isLiveActive
              ? language === 'fr'
                ? "Microphone en direct actif — vous pouvez aussi taper..."
                : "Live microphone active — or type here..."
              : language === 'fr'
              ? "Posez une question à Oro au sujet d'Aayushi..."
              : "Ask Oro anything about Aayushi's luxury background..."
          }
          className="flex-1 bg-[#FAF8F5] text-sm text-[#171412] placeholder-[#A89F93] rounded-full px-4 py-2.5 border border-[#EBE4D8] focus:outline-none focus:border-[#CBA86E] focus:bg-white transition-all"
        />

        <button
          type="submit"
          disabled={!inputText.trim()}
          className="w-10 h-10 rounded-full bg-[#26211D] disabled:opacity-40 text-[#DEC79B] hover:bg-[#171412] flex items-center justify-center transition-all cursor-pointer shrink-0"
          title="Send message"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>
    </div>
  );
};
