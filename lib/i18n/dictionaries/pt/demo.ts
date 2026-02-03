export const demo = {
  lead: {
    name: "Ana Silva",
    email: "ana@emaildemo.com",
    company: "Silva Consultoria",
    interest: "Automação de marketing",
    source: "LinkedIn",
    score: 85,
  },

  automationSteps: [
    {
      id: "crm",
      title: "CRM - Pipedrive",
      icon: "database",
      details: [
        "Contato criado",
        "Deal aberto: 'Ana - Automação'",
        "Score atribuído: 85/100",
        "Etapa: Novo Lead",
      ],
      duration: 800,
    },
    {
      id: "email",
      title: "Email - Gmail",
      icon: "mail",
      details: [
        "Email de boas-vindas enviado",
        "Conteúdo personalizado gerado com IA",
        "Template: Onboarding PMEs",
        "Status: Entregue",
      ],
      duration: 800,
    },
    {
      id: "task",
      title: "Tarefa - CRM",
      icon: "check-square",
      details: [
        "Tarefa criada para vendedor",
        "Tipo: Acompanhamento de lead",
        "Data: Em 2 dias",
        "Prioridade: Alta",
      ],
      duration: 800,
    },
    {
      id: "slack",
      title: "Notificação - Slack",
      icon: "message-square",
      details: [
        "Canal: #vendas notificado",
        "Mensagem enviada com contexto completo",
        "Equipe alertada",
        "Lead disponível para acompanhamento",
      ],
      duration: 800,
    },
  ],

  impactMetrics: [
    {
      id: "velocidad",
      label: "Mais rápido",
      value: 99.5,
      suffix: "%",
      icon: "⚡",
    },
    {
      id: "ahorro",
      label: "Economia mensal",
      value: 250,
      suffix: " hrs",
      icon: "💰",
    },
    {
      id: "precision",
      label: "Leads processados",
      value: 100,
      suffix: "%",
      icon: "📈",
    },
  ],

  code: `// Automação construída com Claude Code
async function processarNovoLead(lead) {
  // 1. Adicionar ao CRM
  await crm.adicionarContato({
    nome: lead.nome,
    email: lead.email,
    empresa: lead.empresa,
    score: calcularScore(lead)
  })

  // 2. Enviar email personalizado
  const emailContent = await claude.gerarEmail({
    tipo: 'boas-vindas',
    contexto: lead.interesse,
    tom: 'profissional-amigavel'
  })
  await email.enviar(lead.email, emailContent)

  // 3. Criar tarefas de acompanhamento
  await crm.criarTarefa({
    atribuidoPara: 'equipe_vendas',
    data: Date.now() + 2*24*60*60*1000,
    tipo: 'acompanhamento_lead',
    prioridade: lead.score > 70 ? 'alta' : 'media'
  })

  // 4. Notificar equipe
  await slack.notificar('#vendas',
    \`Novo lead: \${lead.nome} - Score: \${lead.score}\`
  )
}

// Executar
await processarNovoLead(novoLead)`,
}
