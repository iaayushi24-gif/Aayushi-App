import React, { useEffect, useState } from 'react';
import { Mic, MicOff, Volume2, Sparkles, Loader2, Play, Square } from 'lucide-react';

interface OroOrbProps {
  status: 'idle' | 'connecting' | 'listening' | 'speaking' | 'muted';
  audioEnergy: number;
  language: 'en' | 'fr';
  onToggleLive: () => void;
  onPlayGreeting: () => void;
  onStopSpeaking: () => void;
  onLanguageChange: (lang: 'en' | 'fr') => void;
}

export const OroOrb: React.FC<OroOrbProps> = ({
  status,
  audioEnergy,
  language,
  onToggleLive,
  onPlayGreeting,
  onStopSpeaking,
  onLanguageChange,
}) => {
  // Scale multiplier based on real-time audio energy
  const [dynamicScale, setDynamicScale] = useState(1);

  useEffect(() => {
    if (status === 'speaking' || status === 'listening') {
      const target = 1 + audioEnergy * 0.45;
      setDynamicScale(target);
    } else {
      setDynamicScale(1);
    }
  }, [audioEnergy, status]);

  const getStatusLabel = () => {
    switch (status) {
      case 'connecting':
        return language === 'fr' ? 'Connexion à Oro...' : 'Connecting to Oro...';
      case 'listening':
        return language === 'fr' ? 'Oro vous écoute...' : 'Oro is listening...';
      case 'speaking':
        return language === 'fr' ? 'Oro parle (Voix Française)' : 'Oro is speaking (British Voice)';
      case 'muted':
        return language === 'fr' ? 'Microphone désactivé' : 'Microphone muted';
      default:
        return language === 'fr' ? 'Prêt à converser' : 'Ready to converse';
    }
  };

  return (
    <div className="relative flex flex-col items-center justify-center py-4 sm:py-6">
      {/* Background radial atmosphere */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className="w-72 h-72 sm:w-88 sm:h-88 rounded-full bg-gradient-to-tr from-[#EADDC9]/40 via-[#F5EEE3]/30 to-transparent blur-3xl transition-transform duration-700"
          style={{ transform: `scale(${dynamicScale * 1.1})` }}
        />
      </div>

      {/* Main Interactive Orb */}
      <button
        onClick={status === 'speaking' ? onStopSpeaking : onPlayGreeting}
        aria-label="Interact with Oro"
        className="group relative flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-[#B68E4F]/40 rounded-full transition-transform active:scale-95 cursor-pointer"
        title={
          status === 'speaking'
            ? 'Click to stop speaking'
            : language === 'fr'
            ? "Cliquez pour écouter Oro s'exprimer"
            : 'Click to hear Oro speak'
        }
      >
        {/* Outer ambient wave rings */}
        <div
          className={`absolute rounded-full border border-[#D5C2A5]/50 transition-all duration-300 pointer-events-none ${
            status === 'speaking' || status === 'listening'
              ? 'w-48 h-48 sm:w-56 sm:h-56 animate-ping opacity-25'
              : 'w-44 h-44 sm:w-52 sm:h-52 opacity-20'
          }`}
        />

        <div
          className={`absolute rounded-full border border-[#B68E4F]/30 transition-transform duration-300 pointer-events-none ${
            status === 'speaking' ? 'w-40 h-40 sm:w-48 sm:h-48' : 'w-36 h-36 sm:w-44 sm:h-44'
          }`}
          style={{
            transform: `scale(${dynamicScale})`,
            boxShadow:
              status === 'speaking'
                ? '0 0 40px rgba(182, 142, 79, 0.4), inset 0 0 20px rgba(182, 142, 79, 0.2)'
                : status === 'listening'
                ? '0 0 30px rgba(182, 142, 79, 0.25)'
                : '0 0 20px rgba(220, 200, 175, 0.2)',
          }}
        />

        {/* Core sphere with silk-smooth golden cream gradient */}
        <div
          className={`relative w-28 h-28 sm:w-36 sm:h-36 rounded-full flex flex-col items-center justify-center shadow-xl transition-all duration-500 overflow-hidden ${
            status === 'speaking'
              ? 'bg-gradient-to-br from-[#F5E6CE] via-[#D8B986] to-[#A87F3D] text-[#171412]'
              : status === 'listening'
              ? 'bg-gradient-to-br from-[#FFF9F0] via-[#EEDBBF] to-[#C9A668] text-[#171412]'
              : 'bg-gradient-to-br from-[#FAF5EC] via-[#EFE5D4] to-[#D5C2A5] text-[#26211D] group-hover:from-[#F8EFE0] group-hover:to-[#CCA973]'
          }`}
          style={{ transform: `scale(${dynamicScale * 0.98})` }}
        >
          {/* Subtle inner luster highlight */}
          <div className="absolute top-1 left-2 right-2 h-10 rounded-full bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />

          {/* Central icon / state */}
          <div className="relative z-10 flex flex-col items-center justify-center">
            {status === 'connecting' ? (
              <Loader2 className="w-8 h-8 text-[#9E7437] animate-spin" />
            ) : status === 'speaking' ? (
              <Volume2 className="w-8 h-8 sm:w-10 sm:h-10 text-[#543D1B] animate-pulse" />
            ) : status === 'listening' ? (
              <Mic className="w-8 h-8 sm:w-10 sm:h-10 text-[#543D1B] animate-bounce" />
            ) : (
              <div className="flex flex-col items-center">
                <span className="font-serif text-2xl sm:text-3xl font-medium tracking-wide text-[#3E3732]">
                  Oro
                </span>
                <span className="text-[10px] tracking-widest uppercase font-sans text-[#716860] mt-0.5 flex items-center gap-1">
                  <Play className="w-2.5 h-2.5 fill-[#716860]" /> Speak
                </span>
              </div>
            )}
          </div>

          {/* Sound wave bars when speaking */}
          {status === 'speaking' && (
            <div className="absolute bottom-3 flex items-end justify-center space-x-1 h-4">
              {[0.4, 0.9, 0.6, 1, 0.7, 0.5].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-[#4A3719] rounded-full transition-all duration-150"
                  style={{
                    height: `${Math.max(4, h * 16 * (0.6 + audioEnergy))}%`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </button>

      {/* Primary Voice Action Buttons */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2.5">
        {/* Play / Speak Oro Button */}
        <button
          onClick={status === 'speaking' ? onStopSpeaking : onPlayGreeting}
          className={`px-4 py-2 rounded-full text-xs font-semibold flex items-center gap-2 shadow-xs transition-all cursor-pointer ${
            status === 'speaking'
              ? 'bg-[#26211D] text-[#DEC79B] ring-2 ring-[#B68E4F]/40'
              : 'bg-[#26211D] hover:bg-[#171412] text-[#FAF8F5]'
          }`}
        >
          {status === 'speaking' ? (
            <>
              <Square className="w-3.5 h-3.5 fill-[#DEC79B]" />
              <span>{language === 'fr' ? 'Arrêter la voix' : 'Stop Speaking'}</span>
            </>
          ) : (
            <>
              <Volume2 className="w-3.5 h-3.5 text-[#DEC79B]" />
              <span>
                {language === 'fr'
                  ? "Écouter Oro (Voix Française)"
                  : 'Hear Oro Speak (British Voice)'}
              </span>
            </>
          )}
        </button>

        {/* Microphone Voice Input Button */}
        <button
          onClick={onToggleLive}
          className={`px-4 py-2 rounded-full text-xs font-medium flex items-center gap-2 border transition-all cursor-pointer ${
            status === 'listening'
              ? 'bg-[#FAF0E4] border-[#B68E4F] text-[#865E26] animate-pulse'
              : 'bg-white hover:bg-[#FAF8F5] border-[#D5C2A5] text-[#26211D]'
          }`}
          title="Speak to Oro via microphone"
        >
          <Mic className={`w-3.5 h-3.5 ${status === 'listening' ? 'text-[#865E26]' : 'text-[#9E7437]'}`} />
          <span>
            {status === 'listening'
              ? language === 'fr'
                ? 'Écoute en cours...'
                : 'Listening to you...'
              : language === 'fr'
              ? 'Parler au micro'
              : 'Speak via Mic'}
          </span>
        </button>
      </div>

      {/* Status indicator bar */}
      <div className="mt-3 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/70 border border-[#E5DACD] shadow-xs backdrop-blur-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              status === 'speaking'
                ? 'bg-[#B68E4F] animate-ping'
                : status === 'listening'
                ? 'bg-[#4CAF50] animate-pulse'
                : status === 'connecting'
                ? 'bg-[#F59E0B] animate-pulse'
                : 'bg-[#B0A699]'
            }`}
          />
          <span className="text-xs font-medium tracking-wide text-[#3E3732]">
            {getStatusLabel()}
          </span>
        </div>

        <p className="text-[11px] text-[#716860] mt-1.5 max-w-sm">
          {language === 'fr'
            ? 'Touchez l\'orbe ou un sujet ci-dessous pour entendre Oro s\'exprimer en français.'
            : 'Tap the sphere or select any inquiry below to hear Oro speak with British elegance.'}
        </p>
      </div>

      {/* Language Accent Switcher */}
      <div className="mt-3 flex items-center bg-[#F3ECE2] p-1 rounded-full border border-[#DFD3C3] text-xs">
        <button
          onClick={() => onLanguageChange('en')}
          className={`px-3 py-1 rounded-full transition-all font-medium flex items-center gap-1.5 cursor-pointer ${
            language === 'en'
              ? 'bg-white text-[#171412] shadow-xs'
              : 'text-[#716860] hover:text-[#171412]'
          }`}
        >
          <span>🇬🇧</span>
          <span>British English</span>
        </button>
        <button
          onClick={() => onLanguageChange('fr')}
          className={`px-3 py-1 rounded-full transition-all font-medium flex items-center gap-1.5 cursor-pointer ${
            language === 'fr'
              ? 'bg-white text-[#171412] shadow-xs'
              : 'text-[#716860] hover:text-[#171412]'
          }`}
        >
          <span>🇫🇷</span>
          <span>Accent Français</span>
        </button>
      </div>
    </div>
  );
};
