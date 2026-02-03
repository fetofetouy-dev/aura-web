import Image from "next/image"
import { Container } from "@/components/ui/Container"
import { SITE_CONTENT } from "@/lib/constants"

export function Footer() {
  const { footer } = SITE_CONTENT

  return (
    <footer className="bg-background-elevated border-t border-border py-12">
      <Container>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Logo & Description */}
          <div>
            <Image
              src="/aura-logo.png"
              alt="Aura Logo"
              width={150}
              height={45}
              className="mb-4"
            />
            <p className="text-text-body text-sm">
              Automatización inteligente para Pymes que quieren crecer.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Enlaces</h4>
            <ul className="space-y-2">
              {footer.links.main.map((link) => (
                <li key={link.label}>
                  <a
                    href={link.href}
                    className="text-text-body hover:text-accent-blue transition-colors text-sm"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-text-primary mb-4">Contacto</h4>
            <p className="text-text-body text-sm mb-4">
              <a
                href={`mailto:${footer.contact.email}`}
                className="hover:text-accent-blue transition-colors"
              >
                {footer.contact.email}
              </a>
            </p>
            <div className="flex gap-4">
              {footer.social.map((social) => (
                <a
                  key={social.platform}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-text-body hover:text-accent-blue transition-colors text-sm"
                >
                  {social.platform}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-text-muted text-sm">{footer.copyright}</p>
            <div className="flex gap-6">
              {footer.links.legal.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-text-muted hover:text-accent-blue transition-colors text-sm"
                >
                  {link.label}
                </a>
              ))}
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
