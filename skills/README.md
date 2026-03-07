# Aura Skills Registry

Skills instaladas via `npx skills add` para potenciar el desarrollo con Claude Code.

## Skills instaladas (59 total)

### vercel/next.js (7 skills)
| Skill | Uso |
|-------|-----|
| `authoring-skills` | Crear nuevas skills para el proyecto |
| `dce-edge` | Dead Code Elimination en Edge Runtime |
| `flags` | Feature flags con Next.js |
| `pr-status-triage` | Triage de PRs y estado |
| `react-vendoring` | Vendoring de dependencias React |
| `runtime-debug` | Debug de runtime Next.js (SSR/RSC issues) |
| `update-docs` | Actualizar documentacion del proyecto |

### supabase/supabase (5 skills)
| Skill | Uso |
|-------|-----|
| `vitest` | Testing con Vitest |
| `e2e-studio-tests` | Tests E2E de Supabase Studio |
| `studio-testing` | Testing de Studio components |
| `telemetry-standards` | Standards de telemetria |
| `vercel-composition-patterns` | Patterns de composicion con Vercel |

### facebook/react (7 skills)
| Skill | Uso |
|-------|-----|
| `extract-errors` | Extraer y manejar errores de React |
| `feature-flags` | Feature flags en React |
| `fix` | Fixear bugs de React |
| `flags` | Flags de compilacion |
| `flow` | Flow type checking |
| `test` | Testing de componentes React |
| `verify` | Verificacion de builds |

### anthropics/claude-code (10 skills)
| Skill | Uso |
|-------|-----|
| `claude-opus-4-5-migration` | Migracion a Opus 4.5 |
| `frontend-design` | Diseno frontend con Claude |
| `writing-hookify-rules` | Crear reglas de hooks |
| `agent-development` | Desarrollo de agentes |
| `command-development` | Desarrollo de comandos custom |
| `hook-development` | Desarrollo de hooks |
| `mcp-integration` | Integracion MCP |
| `plugin-settings` | Configuracion de plugins |
| `plugin-structure` | Estructura de plugins |
| `skill-development` | Desarrollo de skills |

### anthropics/skills (18 skills)
| Skill | Uso |
|-------|-----|
| `claude-api` | Uso de Claude API (para Fase C IA) |
| `docx` | Generacion de documentos Word |
| `pdf` | Generacion/lectura de PDFs |
| `pptx` | Generacion de presentaciones |
| `xlsx` | Generacion de Excel |
| `brand-guidelines` | Guidelines de marca |
| `canvas-design` | Diseno en canvas |
| `doc-coauthoring` | Co-autoria de documentos |
| `frontend-design` | Diseno frontend |
| `internal-comms` | Comunicaciones internas |
| `mcp-builder` | Constructor de MCPs |
| `skill-creator` | Crear nuevas skills |
| `theme-factory` | Factory de temas (util para Warm Editorial) |
| `web-artifacts-builder` | Constructor de artifacts web |
| `webapp-testing` | Testing de webapps |
| `slack-gif-creator` | Crear GIFs para Slack |
| `algorithmic-art` | Arte algoritmico |
| `template-skill` | Template para crear skills |

### getsentry/sentry (12 skills)
| Skill | Uso |
|-------|-----|
| `design-system` | Design system de Sentry |
| `generate-frontend-forms` | Generar formularios frontend |
| `generate-migration` | Generar migraciones DB |
| `sentry-backend-bugs` | Debug de bugs backend |
| `sentry-javascript-bugs` | Debug de bugs JS |
| `sentry-security` | Auditorias de seguridad |
| `react-component-documentation` | Documentar componentes React |
| `setup-dev` | Setup de entorno dev |
| `hybrid-cloud-outboxes` | Patrones outbox |
| `hybrid-cloud-rpc` | Patrones RPC |
| `hybrid-cloud-test-gen` | Generar tests cloud |
| `migrate-frontend-forms` | Migrar formularios |

---

## Mapeo Skills <> Areas de Aura

| Area de Aura | Skills relevantes |
|--------------|-------------------|
| **Frontend/UI** | `frontend-design`, `design-system`, `theme-factory`, `react-component-documentation`, `fix`, `test`, `verify` |
| **Backend/API** | `sentry-backend-bugs`, `generate-migration`, `runtime-debug`, `extract-errors` |
| **Seguridad** | `sentry-security`, `sentry-javascript-bugs` |
| **Testing** | `webapp-testing`, `vitest`, `test`, `verify` |
| **IA (Fase C)** | `claude-api`, `agent-development` |
| **Documentos** | `docx`, `pdf`, `xlsx`, `pptx` |
| **DevOps** | `feature-flags`, `flags`, `dce-edge` |
| **Marca** | `brand-guidelines`, `internal-comms` |

## Comandos utiles

```bash
# Listar skills instaladas
npx skills list

# Agregar nueva skill
npx skills add <owner>/<repo> -a claude-code --yes

# Buscar skills
npx skills find
```
