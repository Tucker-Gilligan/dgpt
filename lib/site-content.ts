export type Service = { number: string; title: string; detail: string };

export type SiteContent = {
  phone: string;
  bookingUrl: string;
  paymentUrl: string;
  topbar: string;
  heroTitle: string;
  heroEmphasis: string;
  heroIntro: string;
  heroNote: string;
  trustStrip: string;
  services: Service[];
  tmjAnswer: string;
  tmjExpectTitle: string;
  tmjExpectBody: string;
  schrothAnswer: string;
  schrothBring: string;
  schrothWear: string;
  schrothExpect: string;
  firstVisitAnswer: string;
  aboutLead: string;
  aboutBody: string;
  visitIntro: string;
  addressLine1: string;
  addressLine2: string;
  hours: string;
  visitActionTitle: string;
  visitActionText: string;
  footerNote: string;
};

export const defaultContent: SiteContent = {
  phone: "973-396-7694",
  bookingUrl: "#booking-placeholder",
  paymentUrl: "#payment-placeholder",
  topbar: "Now accepting new patients in Denville",
  heroTitle: "Move better.",
  heroEmphasis: "Feel like yourself.",
  heroIntro: "Thoughtful, one-on-one physical therapy for the way you live, work, train, and recover.",
  heroNote: "In-network with Blue Cross Blue Shield",
  trustStrip: "Care that connects the dots — from today’s symptoms to the confidence to keep moving.",
  services: [
    { number: "01", title: "Orthopedic physical therapy", detail: "Pain, injury, post-surgical recovery, strength, and return to activity." },
    { number: "02", title: "TMJ therapy", detail: "A whole-person approach to jaw pain, headaches, clenching, and comfortable movement." },
    { number: "03", title: "Vestibular rehabilitation", detail: "Support for dizziness, balance concerns, vertigo, and confidence on your feet." },
    { number: "04", title: "Schroth & scoliosis care", detail: "Scoliosis-specific exercise and education tailored to your unique curve pattern." },
  ],
  tmjAnswer: "TMJ symptoms can be influenced by the jaw, neck, posture, breathing, and daily movement habits. Physical therapy can help assess these connected areas and build a personalized plan to improve mobility, reduce sensitivity, and support more comfortable function.",
  tmjExpectTitle: "What to expect for TMJ care",
  tmjExpectBody: "Your first visit includes a conversation about your symptoms, a gentle assessment of your jaw, neck, posture, and movement, and a personalized plan. Treatment may include education, hands-on techniques, mobility work, and practical exercises to support more comfortable daily function.",
  schrothAnswer: "The Schroth Method is a scoliosis-specific exercise approach that uses individualized posture, breathing, and strengthening strategies. Dalton holds PSSE–Schroth Level 1 certification and tailors care to each patient’s curve pattern and goals.",
  schrothBring: "Bring any relevant imaging reports, your referring provider’s notes if available, and a list of questions or goals you want to discuss.",
  schrothWear: "Wear comfortable, form-fitting athletic clothing that allows you to move easily. A fitted T-shirt and athletic shorts or leggings are ideal for observing posture and movement.",
  schrothExpect: "Expect an individualized assessment of posture, breathing, movement, and your curve pattern. You’ll learn personalized corrections and exercises, plus clear guidance for practicing them at home.",
  firstVisitAnswer: "We’ll start with a conversation about what matters to you, then complete a focused movement assessment. You’ll leave with clarity about your plan and practical next steps.",
  aboutLead: "Dalton Gilligan, DPT brings a whole-body perspective to every plan of care—helping people understand what’s happening, move with less fear, and build lasting confidence.",
  aboutBody: "With extensive training in TMJ and vestibular rehabilitation and PSSE–Schroth Level 1 certification, Dalton combines specialized knowledge with practical, patient-centered treatment.",
  visitIntro: "Conveniently located on Route 10 East in Denville.",
  addressLine1: "3175 Route 10 East",
  addressLine2: "Denville, NJ 07834",
  hours: "Hours: [coming soon]",
  visitActionTitle: "Ready when you are.",
  visitActionText: "Book online, give us a call, or make a secure payment.",
  footerNote: "Logo, email, hours & patient links coming soon.",
};

export function normalizeContent(input: unknown): SiteContent {
  if (!input || typeof input !== "object") return defaultContent;
  const candidate = input as Partial<SiteContent>;
  return { ...defaultContent, ...candidate, services: Array.isArray(candidate.services) ? candidate.services : defaultContent.services };
}
