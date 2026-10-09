import React, { useState, useEffect } from 'react';
import { AAYUSHI_PROFILE } from '../data/aayushiData';
import {
  Sparkles,
  MapPin,
  Mail,
  GraduationCap,
  Award,
  Briefcase,
  Copy,
  Check,
  Globe2,
  ExternalLink,
  Clock,
  Compass,
} from 'lucide-react';

export const CuratedDossier: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [parisTime, setParisTime] = useState('');

  useEffect(() => {
    const updateTime = () => {
      try {
        const timeStr = new Intl.DateTimeFormat('en-GB', {
          timeZone: 'Europe/Paris',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false,
        }).format(new Date());
        setParisTime(timeStr);
      } catch (e) {
        setParisTime('Paris, FR');
      }
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const copyEmail = () => {
    navigator.clipboard.writeText(AAYUSHI_PROFILE.email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-12 max-w-4xl mx-auto py-4">
      {/* Editorial Header Banner */}
      <div className="bg-white/80 backdrop-blur-md rounded-2xl p-6 sm:p-10 border border-[#EBE4D8] shadow-xs relative overflow-hidden">
        {/* Subtle decorative watermark */}
        <div className="absolute right-4 -bottom-10 select-none pointer-events-none opacity-5 font-serif text-9xl">
          AB
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[#F0E9DF] pb-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs uppercase tracking-widest text-[#9E7437] font-semibold">
                Curated Dossier
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#9E7437]" />
              <span className="text-xs text-[#716860] flex items-center gap-1">
                <Clock className="w-3 h-3 text-[#9E7437]" /> Paris Time: {parisTime} CEST
              </span>
            </div>
            <h2 className="font-serif text-3xl sm:text-4xl text-[#171412] tracking-tight">
              {AAYUSHI_PROFILE.name}
            </h2>
            <p className="text-[#716860] text-sm sm:text-base mt-1 font-serif italic">
              {AAYUSHI_PROFILE.title}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={copyEmail}
              className="px-4 py-2 rounded-full border border-[#D8C7B3] bg-[#FCFBF9] hover:bg-[#F3EFEA] text-xs sm:text-sm font-medium text-[#26211D] flex items-center gap-2 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-green-600" /> : <Copy className="w-3.5 h-3.5 text-[#9E7437]" />}
              <span>{copied ? 'Email Copied' : 'Copy Email'}</span>
            </button>
            <a
              href={`mailto:${AAYUSHI_PROFILE.email}?subject=Inquiry%20regarding%20Luxury%20Marketing%20Opportunities`}
              className="px-5 py-2 rounded-full bg-[#26211D] hover:bg-[#171412] text-xs sm:text-sm font-medium text-[#F7F4EE] flex items-center gap-2 transition-colors"
            >
              <Mail className="w-3.5 h-3.5 text-[#DEC79B]" />
              <span>Contact Directly</span>
            </a>
          </div>
        </div>

        {/* Narrative Profile Statement */}
        <div className="relative pl-4 border-l-2 border-[#DEC79B] my-6">
          <p className="font-serif text-lg sm:text-xl text-[#26211D] leading-relaxed italic">
            "{AAYUSHI_PROFILE.summary}"
          </p>
          <div className="mt-3 flex items-center gap-2 text-xs text-[#716860] font-sans">
            <MapPin className="w-3.5 h-3.5 text-[#9E7437]" />
            <span>Currently based in {AAYUSHI_PROFILE.location} • Actively seeking luxury-sector internship</span>
          </div>
        </div>

        {/* Key Highlights Ribbon */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-[#F0E9DF]">
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EFE8DD]">
            <span className="text-[11px] uppercase tracking-wider text-[#716860]">Flagship Event</span>
            <p className="font-serif text-base font-medium text-[#171412] mt-0.5">DLF Emporio Luxury Festival</p>
            <p className="text-xs text-[#716860] mt-1">End-to-end luxury retail & VIP coordination</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EFE8DD]">
            <span className="text-[11px] uppercase tracking-wider text-[#716860]">LVMH Credential</span>
            <p className="font-serif text-base font-medium text-[#171412] mt-0.5">Inside LVMH Certified</p>
            <p className="text-xs text-[#716860] mt-1">Creation & Branding, Retail & Client Experience</p>
          </div>
          <div className="p-3.5 rounded-xl bg-[#FAF8F5] border border-[#EFE8DD]">
            <span className="text-[11px] uppercase tracking-wider text-[#716860]">Academic Pedigree</span>
            <p className="font-serif text-base font-medium text-[#171412] mt-0.5">ESCE Paris & 9.2 CGPA</p>
            <p className="text-xs text-[#716860] mt-1">Prestige Marketing Master's & B.Com Hons</p>
          </div>
        </div>
      </div>

      {/* Professional Experience Timeline */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Briefcase className="w-5 h-5 text-[#9E7437]" />
          <h3 className="font-serif text-2xl text-[#171412]">Experience & Luxury Milestones</h3>
        </div>

        <div className="space-y-4">
          {AAYUSHI_PROFILE.experiences.map((exp) => (
            <div
              key={exp.id}
              className="bg-white/80 rounded-xl p-6 border border-[#EBE4D8] shadow-2xs hover:border-[#DEC79B] transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-3">
                <div>
                  <h4 className="font-serif text-xl font-medium text-[#171412]">
                    {exp.role} <span className="text-[#9E7437] font-sans text-sm font-normal">• {exp.company}</span>
                  </h4>
                  <span className="text-xs text-[#716860] font-medium tracking-wide">
                    {exp.category}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {exp.metrics && (
                    <span className="text-[11px] px-2.5 py-1 rounded-full bg-[#F5EFE6] text-[#694F25] font-medium border border-[#E6D9C8]">
                      {exp.metrics}
                    </span>
                  )}
                  <span className="text-xs text-[#716860] whitespace-nowrap">{exp.period}</span>
                </div>
              </div>

              <ul className="space-y-2 mt-3">
                {exp.highlights.map((item, idx) => (
                  <li key={idx} className="text-sm text-[#3E3732] flex items-start gap-2.5 leading-relaxed">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#CBA86E] mt-2 shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Education & Academic Rigor */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-5 h-5 text-[#9E7437]" />
          <h3 className="font-serif text-2xl text-[#171412]">Education</h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AAYUSHI_PROFILE.education.map((edu, idx) => (
            <div
              key={idx}
              className="bg-white/80 rounded-xl p-6 border border-[#EBE4D8] shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <h4 className="font-serif text-lg font-medium text-[#171412]">
                    {edu.degree}
                  </h4>
                  <span className="text-xs text-[#716860] font-sans shrink-0">{edu.period}</span>
                </div>
                <p className="text-sm font-medium text-[#694F25]">
                  {edu.institution} — <span className="text-[#716860] font-normal">{edu.location}</span>
                </p>
                {edu.grade && (
                  <div className="mt-2 inline-block text-xs font-semibold px-2 py-0.5 rounded-md bg-[#FAF4EB] text-[#865E26] border border-[#EAD8BF]">
                    CGPA: {edu.grade}
                  </div>
                )}
                <ul className="mt-4 space-y-1.5">
                  {edu.focus.map((f, i) => (
                    <li key={i} className="text-xs text-[#524942] flex items-start gap-2 leading-relaxed">
                      <span className="w-1 h-1 rounded-full bg-[#B68E4F] mt-1.5 shrink-0" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Certifications & Recognitions */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Award className="w-5 h-5 text-[#9E7437]" />
          <h3 className="font-serif text-2xl text-[#171412]">Certifications & Accreditations</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {AAYUSHI_PROFILE.certifications.map((cert, idx) => (
            <div
              key={idx}
              className="bg-white/80 rounded-xl p-5 border border-[#EBE4D8] shadow-2xs flex items-start gap-4"
            >
              <div className="w-10 h-10 rounded-full bg-[#FAF4EB] border border-[#EADCC9] flex items-center justify-center shrink-0 text-[#865E26]">
                <Award className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="font-serif text-base font-semibold text-[#171412]">{cert.title}</h4>
                  <span className="text-[11px] text-[#716860] font-sans">({cert.year})</span>
                </div>
                <p className="text-xs font-medium text-[#9E7437] mt-0.5">{cert.issuer}</p>
                <p className="text-xs text-[#524942] mt-1 leading-relaxed">{cert.specialization}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Strategic Skills Matrix */}
      <div className="bg-white/80 rounded-2xl p-6 sm:p-8 border border-[#EBE4D8]">
        <div className="flex items-center gap-3 mb-6">
          <Sparkles className="w-5 h-5 text-[#9E7437]" />
          <h3 className="font-serif text-2xl text-[#171412]">Strategic Competencies</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <h4 className="text-xs uppercase tracking-wider text-[#865E26] font-semibold mb-3">
              Luxury Marketing & PR
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {AAYUSHI_PROFILE.skills.marketing.map((skill, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md bg-[#FAF6F0] text-xs text-[#3E3732] border border-[#EBE2D5]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-[#865E26] font-semibold mb-3">
              Commercial & Analytics
            </h4>
            <div className="flex flex-wrap gap-1.5">
              {AAYUSHI_PROFILE.skills.analytical.map((skill, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-md bg-[#FAF6F0] text-xs text-[#3E3732] border border-[#EBE2D5]"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-xs uppercase tracking-wider text-[#865E26] font-semibold mb-3">
              Languages & Tools
            </h4>
            <div className="space-y-2 mb-3">
              {AAYUSHI_PROFILE.languages.map((lang, i) => (
                <div key={i} className="text-xs">
                  <span className="font-medium text-[#171412]">{lang.name}:</span>{' '}
                  <span className="text-[#524942]">{lang.level}</span>
                </div>
              ))}
            </div>
            <div className="flex flex-wrap gap-1.5 pt-2 border-t border-[#F2ECE2]">
              {AAYUSHI_PROFILE.skills.tools.map((tool, i) => (
                <span
                  key={i}
                  className="px-2 py-0.5 rounded-md bg-[#FAF6F0] text-[11px] text-[#524942] border border-[#EBE2D5]"
                >
                  {tool}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
