export const siteContent = {
  hero: {
    title: "Smart automation for SMBs that want to grow",
    subtitle: "We free up time and resources with AI agents that work 24/7 for your business",
    primaryCTA: "View Live Demo",
    secondaryCTA: "Schedule a Consultation",
  },

  problema: {
    title: "Is your SMB losing time on repetitive tasks?",
    cards: [
      {
        id: "leads",
        title: "Manual Lead Management",
        description:
          "Each new lead requires 10 manual steps: add to CRM, send email, schedule follow-up...",
        icon: "clipboard-list" as const,
      },
      {
        id: "respuestas",
        title: "Slow Customer Responses",
        description: "Your customers wait hours (or days) for answers to common questions",
        icon: "clock" as const,
      },
      {
        id: "contenido",
        title: "Content Creation",
        description: "You need a social media presence but don't have the time or team",
        icon: "file-text" as const,
      },
    ],
  },

  solucion: {
    title: "Smart automation with Claude AI",
    subtitle: "We transform manual processes into automated workflows in 3 steps",
    steps: [
      {
        id: "analizar",
        title: "We analyze your business",
        description: "We identify automatable processes",
        icon: "search" as const,
      },
      {
        id: "disenar",
        title: "We design your agent",
        description: "We create custom workflows with Claude Code",
        icon: "cpu" as const,
      },
      {
        id: "implementar",
        title: "We implement and optimize",
        description: "Your team focuses on what matters",
        icon: "rocket" as const,
      },
    ],
  },

  demo: {
    title: "See how it works in real time",
    subtitle: "Simulator: Lead management automation for SMBs",
  },

  casosDeUso: {
    title: "Automations that transform SMBs",
    subtitle: "No matter your industry, we can automate your key processes",
    cards: [
      {
        id: "ecommerce",
        title: "E-commerce",
        icon: "shopping-cart" as const,
        items: [
          "Automated responses to product inquiries",
          "Personalized post-purchase follow-up",
          "Inventory management and alerts",
        ],
      },
      {
        id: "consultoria",
        title: "Consulting/Agencies",
        icon: "briefcase" as const,
        items: [
          "Automated client onboarding",
          "Monthly report generation",
          "Personalized business proposals",
        ],
      },
      {
        id: "salud",
        title: "Clinics/Healthcare Services",
        icon: "heart-pulse" as const,
        items: [
          "Automated appointment confirmation",
          "FAQs and patient pre-qualification",
          "Reminders and follow-up",
        ],
      },
      {
        id: "hoteleria",
        title: "Restaurants/Hospitality",
        icon: "utensils" as const,
        items: [
          "Reservation management",
          "Review responses",
          "Marketing for special dates",
        ],
      },
      {
        id: "inmobiliaria",
        title: "Real Estate",
        icon: "home" as const,
        items: [
          "Automatic prospect qualification",
          "Virtual tours and scheduling",
          "Follow-up with interested clients",
        ],
      },
      {
        id: "retail",
        title: "Retail",
        icon: "store" as const,
        items: [
          "Social media management",
          "Customer responses on WhatsApp/IG",
          "Inventory analysis and restocking",
        ],
      },
    ],
  },

  porQueAura: {
    title: "The Aura difference",
    subtitle: "We're not just another tool. We're your automation partner.",
    pillars: [
      {
        id: "claude",
        title: "Powered by Claude AI",
        description:
          "The most advanced AI on the market (Anthropic). Complex reasoning, not just templates.",
        icon: "zap" as const,
      },
      {
        id: "pymes",
        title: "Built for SMBs",
        description: "Affordable pricing, no annual contracts. Implementation in days, not months.",
        icon: "target" as const,
      },
      {
        id: "beta",
        title: "In Beta - Constantly Improving",
        description:
          "We're constantly evolving, refining our processes and adding new features based on real feedback.",
        icon: "rocket" as const,
      },
    ],
  },

  ctaFinal: {
    title: "Ready to automate your SMB?",
    subtitle: "Explore our automation example and discover how we can help you",
    primaryCTA: "View Automation Example",
    secondaryCTA: "Download the Case Study",
  },

  footer: {
    links: {
      main: [
        { label: "Home", href: "#hero" },
        { label: "Use Cases", href: "#casos-de-uso" },
        { label: "Contact", href: "#contacto" },
      ],
      legal: [
        { label: "Terms and Conditions", href: "/terminos" },
        { label: "Privacy Policy", href: "/privacidad" },
      ],
    },
    contact: {
      email: "contacto@aura.com",
    },
    social: [
      { platform: "LinkedIn", href: "https://linkedin.com/company/aura" },
      { platform: "Twitter", href: "https://twitter.com/aura" },
    ],
    copyright: "© 2026 Aura. All rights reserved.",
  },
}
