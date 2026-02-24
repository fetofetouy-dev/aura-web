export interface EmailContent {
  to: string
  subject: string
  body: string
}

export function welcomeEmail(leadName: string, leadEmail: string): EmailContent {
  return {
    to: leadEmail,
    subject: `¡Hola ${leadName}! Gracias por tu interés`,
    body: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 8px;">
        <h2 style="color: #3B82F6;">¡Hola ${leadName}! 👋</h2>
        <p>Gracias por ponerte en contacto con nosotros.</p>
        <p>Hemos recibido tu consulta y un miembro de nuestro equipo se pondrá en contacto contigo en las próximas horas.</p>
        <p>Mientras tanto, podés explorar más sobre nuestros servicios en nuestra web.</p>
        <br/>
        <p style="color: #6B7280; font-size: 13px;">
          Este email fue generado automáticamente por Aura Automations.
        </p>
      </div>
    `,
  }
}

export function birthdayEmail(name: string, email: string): EmailContent {
  return {
    to: email,
    subject: `¡Feliz cumpleaños, ${name}! 🎂`,
    body: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px; background: #f9f9f9; border-radius: 8px;">
        <h2 style="color: #3B82F6;">¡Feliz cumpleaños, ${name}! 🎂</h2>
        <p>Hoy es un día especial y queríamos ser los primeros en felicitarte.</p>
        <p>Esperamos que tengas un día increíble rodeado de las personas que más querés.</p>
        <p>¡Muchas felicidades!</p>
        <br/>
        <p style="color: #6B7280; font-size: 13px;">
          Este email fue generado automáticamente por Aura Automations.
        </p>
      </div>
    `,
  }
}

export function testEmail(toEmail: string): EmailContent {
  return {
    to: toEmail,
    subject: "✅ Test de Gmail — Aura funciona!",
    body: `
      <div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 24px;">
        <h2 style="color: #3B82F6;">¡La integración de Gmail funciona! 🎉</h2>
        <p>Este email fue enviado automáticamente por <strong>Aura</strong> usando tu cuenta de Gmail.</p>
        <p style="color: #6B7280; font-size: 14px; margin-top: 24px;">Aura Automations · Enviado desde tu backoffice</p>
      </div>
    `,
  }
}
