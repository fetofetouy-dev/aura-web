export const siteContent = {
  hero: {
    title: "Automatización inteligente para Pymes que quieren crecer",
    subtitle: "Liberamos tiempo y recursos con agentes de IA que trabajan 24/7 para tu negocio",
    primaryCTA: "Ver Demo en Vivo",
    secondaryCTA: "Agenda una Consulta",
  },

  problema: {
    title: "¿Tu Pyme pierde tiempo en tareas repetitivas?",
    cards: [
      {
        id: "leads",
        title: "Gestión Manual de Leads",
        description:
          "Cada lead nuevo requiere 10 pasos manuales: agregar al CRM, enviar email, programar seguimiento...",
        icon: "clipboard-list" as const,
      },
      {
        id: "respuestas",
        title: "Respuestas Lentas a Clientes",
        description: "Tus clientes esperan horas (o días) por respuestas a preguntas comunes",
        icon: "clock" as const,
      },
      {
        id: "contenido",
        title: "Creación de Contenido",
        description: "Necesitas estar presente en redes sociales pero no tienes tiempo ni equipo",
        icon: "file-text" as const,
      },
    ],
  },

  solucion: {
    title: "Automatización inteligente con Claude AI",
    subtitle: "Transformamos procesos manuales en flujos automatizados en 3 pasos",
    steps: [
      {
        id: "analizar",
        title: "Analizamos tu negocio",
        description: "Identificamos procesos automatizables",
        icon: "search" as const,
      },
      {
        id: "disenar",
        title: "Diseñamos tu agente",
        description: "Creamos flujos personalizados con Claude Code",
        icon: "cpu" as const,
      },
      {
        id: "implementar",
        title: "Implementamos y optimizamos",
        description: "Tu equipo se enfoca en lo importante",
        icon: "rocket" as const,
      },
    ],
  },

  demo: {
    title: "Mira cómo funciona en tiempo real",
    subtitle: "Simulador: Automatización de gestión de leads para Pymes",
  },

  casosDeUso: {
    title: "Automatizaciones que transforman Pymes",
    subtitle: "No importa tu industria, podemos automatizar tus procesos clave",
    cards: [
      {
        id: "ecommerce",
        title: "E-commerce",
        icon: "shopping-cart" as const,
        items: [
          "Respuestas automáticas a consultas de productos",
          "Seguimiento post-compra personalizado",
          "Gestión de inventario y alertas",
        ],
      },
      {
        id: "consultoria",
        title: "Consultorías/Agencias",
        icon: "briefcase" as const,
        items: [
          "Onboarding automatizado de clientes",
          "Generación de reportes mensuales",
          "Propuestas comerciales personalizadas",
        ],
      },
      {
        id: "salud",
        title: "Clínicas/Servicios de Salud",
        icon: "heart-pulse" as const,
        items: [
          "Confirmación de citas automática",
          "FAQs y pre-calificación de pacientes",
          "Recordatorios y seguimiento",
        ],
      },
      {
        id: "hoteleria",
        title: "Restaurantes/Hotelería",
        icon: "utensils" as const,
        items: [
          "Gestión de reservas",
          "Respuestas a reseñas",
          "Marketing en fechas especiales",
        ],
      },
      {
        id: "inmobiliaria",
        title: "Inmobiliarias",
        icon: "home" as const,
        items: [
          "Calificación automática de prospectos",
          "Tours virtuales y scheduling",
          "Seguimiento de clientes interesados",
        ],
      },
      {
        id: "retail",
        title: "Retail",
        icon: "store" as const,
        items: [
          "Gestión de redes sociales",
          "Respuestas a clientes en WhatsApp/IG",
          "Análisis de inventario y restock",
        ],
      },
    ],
  },

  porQueAura: {
    title: "La diferencia Aura",
    subtitle: "No somos otra herramienta más. Somos tu socio en automatización.",
    pillars: [
      {
        id: "claude",
        title: "Powered by Claude AI",
        description:
          "La IA más avanzada del mercado (Anthropic). Razonamiento complejo, no solo templates.",
        icon: "zap" as const,
      },
      {
        id: "pymes",
        title: "Hecho para Pymes",
        description: "Precios accesibles, sin contratos anuales. Implementación en días, no meses.",
        icon: "target" as const,
      },
      {
        id: "beta",
        title: "En Beta - Mejoramos Constantemente",
        description:
          "Estamos en constante evolución, perfeccionando nuestros procesos y agregando nuevas funcionalidades basadas en feedback real.",
        icon: "rocket" as const,
      },
    ],
  },

  ctaFinal: {
    title: "¿Listo para automatizar tu Pyme?",
    subtitle: "Explora nuestro ejemplo de automatización y descubre cómo podemos ayudarte",
    primaryCTA: "Ver Ejemplo de Automatización",
    secondaryCTA: "Descarga el Caso de Estudio",
  },

  footer: {
    links: {
      main: [
        { label: "Inicio", href: "#hero" },
        { label: "Casos de Uso", href: "#casos-de-uso" },
        { label: "Contacto", href: "#contacto" },
      ],
      legal: [
        { label: "Términos y Condiciones", href: "/terminos" },
        { label: "Política de Privacidad", href: "/privacidad" },
      ],
    },
    contact: {
      email: "contacto@aura.com",
    },
    social: [
      { platform: "LinkedIn", href: "https://linkedin.com/company/aura" },
      { platform: "Twitter", href: "https://twitter.com/aura" },
    ],
    copyright: "© 2026 Aura. Todos los derechos reservados.",
  },
}
