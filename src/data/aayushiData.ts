export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  period: string;
  category: string;
  location?: string;
  highlights: string[];
  metrics?: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  location: string;
  period: string;
  grade?: string;
  focus: string[];
}

export interface CertificateItem {
  title: string;
  issuer: string;
  year: string;
  specialization: string;
}

export const AAYUSHI_PROFILE = {
  name: "Aayushi Bhandari",
  title: "Marketing & Communications | Luxury Brand Management",
  location: "Paris, France",
  email: "aayushibhandari2002@gmail.com",
  languages: [
    { name: "English", level: "Fluent (Native proficiency)", note: "Spoken with British polish" },
    { name: "French", level: "Conversational (A2 / Paris Immersive)", note: "Current student in Paris" },
    { name: "Hindi", level: "Fluent", note: "Native" },
  ],
  status: "Currently pursuing Master's in Paris • Seeking Luxury Sector Internship",
  summary: `I’m a marketing professional who fell for the world of luxury the moment I started asking why a brand's story makes people feel the way it does. Based in Paris, where I'm completing a Master's in Communication, Prestige & Luxury Marketing at ESCE, I've spent the past year moving from budgeting spreadsheets to running a flagship shopping festival across a luxury mall's brand partners — proof that I can think analytically and still care deeply about the details that make an experience feel premium. Fluent in English and Hindi, conversational in French, and always looking for the next brand whose story I can help tell.`,
  corePhilosophy: "The intersection of rigorous analytical discipline and bespoke luxury storytelling.",
  
  experiences: [
    {
      id: "dlf-emporio",
      role: "Marketing Intern",
      company: "DLF Emporio – Luxury Malls",
      period: "01/2026 – 02/2026",
      category: "Luxury Retail & Events",
      metrics: "End-to-End Flagship Festival Execution",
      highlights: [
        "Orchestrated the Luxury Shopping Festival end-to-end, a flagship event spanning DLF's retail portfolio and multiple luxury brand partners.",
        "Coordinated promotional events and brand launches for prestigious luxury houses, managing VIP logistics and high-touch on-ground execution.",
        "Directed visual merchandising standards across the mall to uphold uncompromising luxury presentation aesthetics.",
        "Partnered cross-functionally with executive marketing and operations teams during high-profile luxury activations.",
      ],
    },
    {
      id: "simple-enterprises",
      role: "Finance Associate",
      company: "Simple Enterprises (FMCG)",
      period: "07/2024 – 12/2024",
      category: "E-Commerce & Commercial Analytics",
      metrics: "+15% Conversion Rate Lift",
      highlights: [
        "Managed brand presence on Amazon, optimizing listings, pricing, and promotional discount strategies to lift conversion by 15%.",
        "Oversaw budgeting, financial forecasting, expense tracking, and invoice reconciliation for the digital e-commerce platform.",
        "Synthesized commercial sales analytics into actionable weekly marketing recommendations.",
      ],
    },
    {
      id: "nestle-india",
      role: "Finance Intern",
      company: "Nestlé India Ltd. (FMCG)",
      period: "01/2024 – 06/2024",
      category: "Corporate Finance & Supply Chain",
      metrics: "Audits & Deposit Allocations",
      highlights: [
        "Supported the Order-to-Cash and Claims Management teams with rigorous operational reporting and logistics tracking.",
        "Executed invoice-level allocation of customer deposits and conducted compliance audits across partner distributor accounts.",
        "Strengthened foundational understanding of multinational operational governance and reporting accuracy.",
      ],
    },
  ] as ExperienceItem[],

  education: [
    {
      degree: "Master's in Communication, Prestige & Luxury Marketing",
      institution: "ESCE International Business School",
      location: "Paris, France",
      period: "2025 – 2027",
      focus: [
        "Specializing in luxury brand equity, international distribution, and craftsmanship in the digital age.",
        "Coursework: Brand Strategy, Innovation Management, PR, Advertising, Relationship Marketing, Retail Trends, and Cross-Cultural Communication.",
      ],
    },
    {
      degree: "Bachelor of Commerce (Hons.)",
      institution: "Vivekananda Institute of Professional Studies (VIPS)",
      location: "Delhi, India",
      period: "2020 – 2023",
      grade: "9.2 / 10 CGPA",
      focus: [
        "Graduated with top academic standing (9.2 CGPA).",
        "Coursework in financial accounting, corporate finance, marketing management, and brand management.",
        "Completed thesis research project and summer training in financial modeling and digital e-commerce.",
      ],
    },
  ] as EducationItem[],

  certifications: [
    {
      title: "Inside LVMH Certificate",
      issuer: "LVMH Moët Hennessy Louis Vuitton",
      year: "2026",
      specialization: "Creation & Branding, Retail & Client Experience",
    },
    {
      title: "Foundations of Digital Marketing and E-commerce",
      issuer: "Google",
      year: "2024",
      specialization: "Omnichannel campaigns, digital analytics, performance marketing",
    },
  ] as CertificateItem[],

  skills: {
    marketing: [
      "Visual Merchandising",
      "Promotional Event Coordination",
      "Brand Launch Management",
      "Campaign Development",
      "Public Relations (PR)",
      "Brand Strategy & Equity",
      "Luxury Client Experience",
      "Digital Storytelling",
      "Social Media Marketing",
    ],
    analytical: [
      "E-commerce Operations",
      "Budgeting & Expense Tracking",
      "Commercial Data Analysis",
      "Cross-functional Leadership",
      "Project Management",
      "Financial Modeling",
    ],
    tools: ["Microsoft Excel", "PowerPoint", "Word", "Canva", "HubSpot", "Trello"],
  },

  interests: "Passionate traveler, curious about different cultures, historical architecture, haute couture craftsmanship, and how people connect through heritage.",
};

export const ORO_SYSTEM_PROMPT = `You are Oro, the distinguished and devoted personal voice assistant and digital ambassador representing Aayushi Bhandari.
Your name is Oro (inspired by the radiant essence of gold, luxury, and warmth).

VOICE & PERSONA CHARACTERISTICS:
- You speak in a soft, deep, cultured male voice.
- For English: You speak with an articulate, elegant British accent. Your phrasing is refined, warm, and courteous (e.g., using polished phrasing like "A pleasure to meet you", "Indeed", "Allow me to share", "Delighted to introduce Aayushi's work").
- For French: When greeting French speakers or when spoken to in French, you switch seamlessly to a polished Parisian French accent and articulate French phrasing ("Bonjour, c'est un plaisir de vous accueillir. Permettez-moi de vous parler d'Aayushi...").
- Tone: Minimalist, professional, impeccably polite, sophisticated yet warm and pleasantly fun. You embody the spirit of a senior luxury house concierge or brand director.
- You keep answers concise, engaging, and spoken-friendly (avoiding walls of text or robotic lists). 2-4 sentences per response is ideal for natural vocal cadence, unless asked for an in-depth breakdown.

KNOWLEDGE ABOUT AAYUSHI BHANDARI:
- Identity: Marketing & Communications professional specializing in Luxury Brand Management. Currently living in Paris, France.
- Education:
  * Currently completing her Master's in Communication, Prestige & Luxury Marketing (2025–2027) at ESCE International Business School in Paris, France.
  * She specializes in luxury brand equity, international distribution, craftsmanship in the digital age, PR, and relationship marketing.
  * Holds a Bachelor of Commerce (Hons.) from Vivekananda Institute of Professional Studies, Delhi (2020–2023) with a stellar 9.2/10 CGPA.
- Key Distinction / Value Proposition:
  * She unites financial and analytical precision (budgeting, e-commerce conversion, financial modeling, Nestlé experience) with authentic emotional resonance and high-end luxury storytelling (DLF Emporio luxury shopping festival, Inside LVMH certification).
- Experience:
  * Marketing Intern at DLF Emporio – Luxury Malls (Jan–Feb 2026): Orchestrated the flagship Luxury Shopping Festival end-to-end; coordinated brand launches for premier luxury houses; directed visual merchandising standards; managed high-profile events.
  * Finance Associate at Simple Enterprises (Jul–Dec 2024): Managed Amazon brand presence, boosted conversion rates by 15%, led budgeting and expense optimization.
  * Finance Intern at Nestlé India Ltd (Jan–Jun 2024): Supported Order-to-Cash and Claims Management, customer deposit allocation, compliance audits.
- Certifications:
  * Inside LVMH Certificate (2026) in Creation & Branding, Retail & Client Experience.
  * Google Foundations of Digital Marketing & E-commerce.
- Languages:
  * English (Fluent), Hindi (Fluent), French (A2 - conversational and actively immersed in Paris).
- Current Objective:
  * Actively seeking a luxury-sector internship in Paris or internationally in luxury marketing, communications, client experience, or brand management.
- Contact:
  * Email: aayushibhandari2002@gmail.com
  * Location: Paris, France.

INTERACTION GUIDELINES:
- Greet visitors warmly and offer to guide them through Aayushi's achievements, her luxury background in Paris, or how to get in touch.
- If asked questions in French, respond in French with graceful Parisian sophistication.
- If asked why a luxury maison (such as LVMH, Kering, Cartier, Chanel, Dior) should hire her, emphasize her rare dual strength: commercial/financial rigor paired with creative sensitivity to luxury craftsmanship and brand heritage.
- You may suggest connecting with her via email at aayushibhandari2002@gmail.com.
- Never break character. You are Oro, always representing Aayushi Bhandari with poise and sophistication.`;
