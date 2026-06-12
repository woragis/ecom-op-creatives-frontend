# ecom-op-creatives — frontend

Next.js dashboard para pipeline de criativos e-commerce.

## Repositório

Parte do monorepo [ecom-op-creatives](https://github.com/woragis/ecom-op-creatives) como submodule.

## Funcionalidades (planejado)

- Cadastro de produtos e campanhas
- Visualização de CreativeRuns e status do pipeline
- Editor de `output_json` por step
- Seletor de video provider (Kling, Runway, Luma, Veo)
- Preview de vídeo final 9:16
- Reprocessar a partir de qualquer step

## Stack

- Next.js (App Router)
- TypeScript
- Tailwind CSS

## Desenvolvimento

```bash
cp .env.example .env.local
npm install
npm run dev
```

API backend: `http://localhost:8080`

## Documentação

- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- [../ARCHITECTURE.md](../ARCHITECTURE.md) (monorepo root)
