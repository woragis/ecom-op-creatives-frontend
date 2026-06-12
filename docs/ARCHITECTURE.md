# Frontend — arquitetura

Dashboard Next.js para ecom-op-creatives.

---

## Visão geral

```text
Browser
   │
   ▼
Next.js (App Router)
   │
   ├─ Server Components — listagens, SSR
   ├─ Client Components — editors JSON, video player, provider picker
   │
   ▼
Go API /v1 (JWT)
```

---

## Rotas planejadas

| Rota | Descrição |
|------|-----------|
| `/` | Dashboard — runs recentes, stats |
| `/products` | Lista produtos |
| `/products/[id]` | Detalhe produto + campanhas |
| `/products/new` | Criar produto |
| `/campaigns/[id]` | Campanha + batch runs |
| `/runs/[id]` | Pipeline viewer — steps, status, artifacts |
| `/runs/[id]/edit/[step]` | Editor JSON do step |
| `/settings` | Defaults (video provider, voz ElevenLabs) |

---

## Pipeline viewer

Componente central: timeline vertical dos 12 steps.

Por step:

- Status badge (pending, running, done, failed)
- `output_json` preview (collapsible)
- Botão **Edit** → modal ou página de editor
- Botão **Reprocess from here**
- Links para artifacts (áudio, clips, final mp4)

---

## Video provider picker

Dropdown na criação de CreativeRun ou em `/runs/[id]`:

```text
Provedor de vídeo
├── Kling (default .env)
├── Runway Gen-4
├── Luma Dream Machine
└── Google Veo
```

Valor enviado à API: `videoProvider: "kling" | "runway" | "luma" | "veo"`

Prioridade resolvida no backend (ver ADR 0003).

---

## Editor de step

Client component com:

- JSON editor (Monaco ou CodeMirror)
- Validação contra schema (Zod gerado ou manual)
- Save → `PATCH /v1/pipeline/steps/{id}`
- API invalida downstream e re-enfileira

---

## Player de vídeo

- Preview 9:16 (aspect-ratio container)
- `<video>` com URL signed S3 ou proxy API
- Thumbnail antes do render completo

---

## Estrutura de pastas (Fase 0)

```text
frontend/
├── app/
│   ├── layout.tsx
│   ├── page.tsx
│   ├── products/
│   ├── campaigns/
│   └── runs/
├── components/
│   ├── pipeline/
│   ├── editor/
│   └── ui/
├── lib/
│   ├── api.ts          # fetch wrapper + auth
│   └── types.ts        # CreativeRun, PipelineStep, etc.
└── docs/
```

---

## Env

```env
NEXT_PUBLIC_API_URL=http://localhost:8080
```

---

## Auth

JWT Bearer do backend. Cookie httpOnly (fase 1b) ou localStorage MVP.

---

*Ver [../../docs/PIPELINE.md](../../docs/PIPELINE.md)*
