export const demo = {
  lead: {
    name: "Sarah Johnson",
    email: "sarah@emaildemo.com",
    company: "Johnson Consulting",
    interest: "Marketing automation",
    source: "LinkedIn",
    score: 85,
  },

  automationSteps: [
    {
      id: "crm",
      title: "CRM - Pipedrive",
      icon: "database",
      details: [
        "Contact created",
        "Deal opened: 'Sarah - Automation'",
        "Score assigned: 85/100",
        "Stage: New Lead",
      ],
      duration: 800,
    },
    {
      id: "email",
      title: "Email - Gmail",
      icon: "mail",
      details: [
        "Welcome email sent",
        "AI-generated personalized content",
        "Template: SMB Onboarding",
        "Status: Delivered",
      ],
      duration: 800,
    },
    {
      id: "task",
      title: "Task - CRM",
      icon: "check-square",
      details: [
        "Task created for sales rep",
        "Type: Lead follow-up",
        "Date: In 2 days",
        "Priority: High",
      ],
      duration: 800,
    },
    {
      id: "slack",
      title: "Notification - Slack",
      icon: "message-square",
      details: [
        "Channel: #sales notified",
        "Message sent with full context",
        "Team alerted",
        "Lead available for follow-up",
      ],
      duration: 800,
    },
  ],

  impactMetrics: [
    {
      id: "velocidad",
      label: "Faster",
      value: 99.5,
      suffix: "%",
      icon: "⚡",
    },
    {
      id: "ahorro",
      label: "Monthly savings",
      value: 250,
      suffix: " hrs",
      icon: "💰",
    },
    {
      id: "precision",
      label: "Leads processed",
      value: 100,
      suffix: "%",
      icon: "📈",
    },
  ],

  code: `// Automation built with Claude Code
async function processNewLead(lead) {
  // 1. Add to CRM
  await crm.addContact({
    name: lead.name,
    email: lead.email,
    company: lead.company,
    score: calculateScore(lead)
  })

  // 2. Send personalized email
  const emailContent = await claude.generateEmail({
    type: 'welcome',
    context: lead.interest,
    tone: 'professional-friendly'
  })
  await email.send(lead.email, emailContent)

  // 3. Create follow-up tasks
  await crm.createTask({
    assignedTo: 'sales_team',
    date: Date.now() + 2*24*60*60*1000,
    type: 'lead_followup',
    priority: lead.score > 70 ? 'high' : 'medium'
  })

  // 4. Notify team
  await slack.notify('#sales',
    \`New lead: \${lead.name} - Score: \${lead.score}\`
  )
}

// Execute
await processNewLead(newLead)`,
}
