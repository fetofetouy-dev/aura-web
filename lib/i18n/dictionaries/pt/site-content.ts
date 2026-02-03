export const siteContent = {
  hero: {
    title: "Automação inteligente para PMEs que querem crescer",
    subtitle: "Liberamos tempo e recursos com agentes de IA que trabalham 24/7 para o seu negócio",
    primaryCTA: "Ver Demo ao Vivo",
    secondaryCTA: "Agende uma Consulta",
  },

  problema: {
    title: "Sua PME perde tempo com tarefas repetitivas?",
    cards: [
      {
        id: "leads",
        title: "Gestão Manual de Leads",
        description:
          "Cada novo lead requer 10 passos manuais: adicionar ao CRM, enviar email, programar acompanhamento...",
        icon: "clipboard-list" as const,
      },
      {
        id: "respuestas",
        title: "Respostas Lentas aos Clientes",
        description: "Seus clientes esperam horas (ou dias) por respostas a perguntas comuns",
        icon: "clock" as const,
      },
      {
        id: "contenido",
        title: "Criação de Conteúdo",
        description: "Você precisa estar presente nas redes sociais mas não tem tempo nem equipe",
        icon: "file-text" as const,
      },
    ],
  },

  solucion: {
    title: "Automação inteligente com Claude AI",
    subtitle: "Transformamos processos manuais em fluxos automatizados em 3 passos",
    steps: [
      {
        id: "analizar",
        title: "Analisamos seu negócio",
        description: "Identificamos processos automatizáveis",
        icon: "search" as const,
      },
      {
        id: "disenar",
        title: "Desenhamos seu agente",
        description: "Criamos fluxos personalizados com Claude Code",
        icon: "cpu" as const,
      },
      {
        id: "implementar",
        title: "Implementamos e otimizamos",
        description: "Sua equipe foca no que importa",
        icon: "rocket" as const,
      },
    ],
  },

  demo: {
    title: "Veja como funciona em tempo real",
    subtitle: "Simulador: Automação de gestão de leads para PMEs",
  },

  casosDeUso: {
    title: "Automações que transformam PMEs",
    subtitle: "Não importa sua indústria, podemos automatizar seus processos-chave",
    cards: [
      {
        id: "ecommerce",
        title: "E-commerce",
        icon: "shopping-cart" as const,
        items: [
          "Respostas automáticas a consultas de produtos",
          "Acompanhamento pós-compra personalizado",
          "Gestão de estoque e alertas",
        ],
      },
      {
        id: "consultoria",
        title: "Consultorias/Agências",
        icon: "briefcase" as const,
        items: [
          "Onboarding automatizado de clientes",
          "Geração de relatórios mensais",
          "Propostas comerciais personalizadas",
        ],
      },
      {
        id: "salud",
        title: "Clínicas/Serviços de Saúde",
        icon: "heart-pulse" as const,
        items: [
          "Confirmação de consultas automática",
          "FAQs e pré-qualificação de pacientes",
          "Lembretes e acompanhamento",
        ],
      },
      {
        id: "hoteleria",
        title: "Restaurantes/Hotelaria",
        icon: "utensils" as const,
        items: [
          "Gestão de reservas",
          "Respostas a avaliações",
          "Marketing em datas especiais",
        ],
      },
      {
        id: "inmobiliaria",
        title: "Imobiliárias",
        icon: "home" as const,
        items: [
          "Qualificação automática de prospectos",
          "Tours virtuais e agendamento",
          "Acompanhamento de clientes interessados",
        ],
      },
      {
        id: "retail",
        title: "Varejo",
        icon: "store" as const,
        items: [
          "Gestão de redes sociais",
          "Respostas a clientes no WhatsApp/IG",
          "Análise de estoque e reposição",
        ],
      },
    ],
  },

  porQueAura: {
    title: "O diferencial Aura",
    subtitle: "Não somos apenas mais uma ferramenta. Somos seu parceiro em automação.",
    pillars: [
      {
        id: "claude",
        title: "Powered by Claude AI",
        description:
          "A IA mais avançada do mercado (Anthropic). Raciocínio complexo, não apenas templates.",
        icon: "zap" as const,
      },
      {
        id: "pymes",
        title: "Feito para PMEs",
        description: "Preços acessíveis, sem contratos anuais. Implementação em dias, não meses.",
        icon: "target" as const,
      },
      {
        id: "beta",
        title: "Em Beta - Melhorando Constantemente",
        description:
          "Estamos em constante evolução, aperfeiçoando nossos processos e adicionando novas funcionalidades baseadas em feedback real.",
        icon: "rocket" as const,
      },
    ],
  },

  ctaFinal: {
    title: "Pronto para automatizar sua PME?",
    subtitle: "Explore nosso exemplo de automação e descubra como podemos ajudar você",
    primaryCTA: "Ver Exemplo de Automação",
    secondaryCTA: "Baixe o Caso de Estudo",
  },

  footer: {
    links: {
      main: [
        { label: "Início", href: "#hero" },
        { label: "Casos de Uso", href: "#casos-de-uso" },
        { label: "Contato", href: "#contacto" },
      ],
      legal: [
        { label: "Termos e Condições", href: "/terminos" },
        { label: "Política de Privacidade", href: "/privacidad" },
      ],
    },
    contact: {
      email: "contacto@aura.com",
    },
    social: [
      { platform: "LinkedIn", href: "https://linkedin.com/company/aura" },
      { platform: "Twitter", href: "https://twitter.com/aura" },
    ],
    copyright: "© 2026 Aura. Todos os direitos reservados.",
  },
}
