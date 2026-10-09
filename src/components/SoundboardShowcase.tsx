import React, { useState } from 'react';
import { Volume2, Play, Square, Loader2, Sparkles } from 'lucide-react';

interface ShowcaseClip {
  id: string;
  title: string;
  lang: 'en' | 'fr';
  accent: string;
  description: string;
  prompt: string;
}

interface SoundboardShowcaseProps {
  onPlayPrompt: (prompt: string, lang: 'en' | 'fr') => void;
  isPlaying: boolean;
  activePrompt: string | null;
}

export const SoundboardShowcase: React.FC<SoundboardShowcaseProps> = ({
  onPlayPrompt,
  isPlaying,
  activePrompt,
}) => {
  const clips: ShowcaseClip[] = [
    {
      id: 'intro-en',
      title: 'The Ambassador Welcome',
      lang: 'en',
      accent: 'British Accent',
      description: 'Oro introduces himself and Aayushi Bhandari with soft, distinguished British cadence.',
      prompt: 'Hello Oro. Please introduce yourself and give me an overview of Aayushi Bhandari.',
    },
    {
      id: 'intro-fr',
      title: 'Présentation Parisienne',
      lang: 'fr',
      accent: 'Accent Parisien',
      description: "Oro s'exprime en français pour présenter le profil d'Aayushi et ses ambitions à Paris.",
      prompt: "Bonjour Oro, peux-tu me présenter Aayushi Bhandari et son parcours à Paris en français ?",
    },
    {
      id: 'dlf-emporio',
      title: 'The DLF Emporio Experience',
      lang: 'en',
      accent: 'British Accent',
      description: 'A deep dive into how Aayushi orchestrated the flagship Luxury Shopping Festival and visual merchandising.',
      prompt: "Tell me about Aayushi's luxury experience at DLF Emporio and how she managed the Luxury Shopping Festival.",
    },
    {
      id: 'analytical-creative',
      title: 'The Analytical & Creative Duality',
      lang: 'en',
      accent: 'British Accent',
      description: 'Why her transition from financial balance sheets to luxury brand storytelling creates an exceptional candidate.',
      prompt: 'What makes Aayushi unique compared to other luxury marketing candidates?',
    },
    {
      id: 'lvmh-internship',
      title: 'LVMH Credential & Paris Internship',
      lang: 'en',
      accent: 'British Accent',
      description: "Details regarding Aayushi's Inside LVMH certification and her availability for a luxury internship in Paris.",
      prompt: 'What did Aayushi learn from Inside LVMH and is she actively seeking a luxury internship in Paris?',
    },
    {
      id: 'recruter-fr',
      title: 'Pourquoi Choisir Aayushi ?',
      lang: 'fr',
      accent: 'Accent Parisien',
      description: "La réponse d'Oro pour convaincre les maisons de prestige parisiennes de recruter Aayushi.",
      prompt: "Pourquoi une maison de luxe à Paris devrait-elle recruter Aayushi Bhandari dès aujourd'hui ?",
    },
  ];

  return (
    <div className="space-y-6 max-w-4xl mx-auto py-4">
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-8 border border-[#EBE4D8] shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs uppercase tracking-widest text-[#9E7437] font-semibold">
            Audio Showcase
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#9E7437]" />
          <span className="text-xs text-[#716860]">Curated Listening Room</span>
        </div>
        <h3 className="font-serif text-2xl sm:text-3xl text-[#171412]">
          Experience Oro's Voice & Narrative
        </h3>
        <p className="text-sm text-[#716860] mt-1 font-serif italic max-w-2xl">
          Listen to Oro present key chapters of Aayushi's trajectory in his signature deep British voice, or switch to his refined French persona.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {clips.map((clip) => {
            const isThisPlaying = isPlaying && activePrompt === clip.prompt;

            return (
              <div
                key={clip.id}
                className={`p-5 rounded-xl border transition-all ${
                  isThisPlaying
                    ? 'bg-[#FAF4EB] border-[#CBA86E] shadow-sm'
                    : 'bg-[#FCFBF9] border-[#ECE4D8] hover:border-[#D5C4AF]'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-white border border-[#E8DFC9] text-[#865E26]">
                        {clip.lang === 'fr' ? '🇫🇷 ' : '🇬🇧 '}
                        {clip.accent}
                      </span>
                    </div>
                    <h4 className="font-serif text-lg font-medium text-[#171412] mt-1.5">
                      {clip.title}
                    </h4>
                  </div>

                  <button
                    onClick={() => onPlayPrompt(clip.prompt, clip.lang)}
                    className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
                      isThisPlaying
                        ? 'bg-[#26211D] text-[#DEC79B] animate-pulse'
                        : 'bg-[#F2ECE2] hover:bg-[#E8DFC9] text-[#3E3732]'
                    }`}
                    title={isThisPlaying ? 'Playing clip' : 'Listen to Oro'}
                  >
                    {isThisPlaying ? (
                      <Volume2 className="w-4 h-4 animate-bounce" />
                    ) : (
                      <Play className="w-4 h-4 ml-0.5" />
                    )}
                  </button>
                </div>

                <p className="text-xs text-[#61574E] leading-relaxed mt-2">
                  {clip.description}
                </p>

                <div className="mt-3 pt-3 border-t border-[#F2ECE2] flex items-center justify-between text-[11px] text-[#8C8075]">
                  <span className="italic truncate max-w-[240px]">"{clip.prompt}"</span>
                  <span className="text-[#9E7437] font-medium shrink-0 ml-2">Click to Hear</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
