# Abdalla Eissa AI Ad Creator Pro v2

> **Designed by Abdalla Eissa**
> Multi-model AI ad-creation studio — built for Google AI Studio, runs anywhere with Vite.

## What's new in v2

| | v1 | v2 |
|---|---|---|
| **AI models** | Gemini only | Gemini + Claude Opus 4.7 / Sonnet 4.6 + GPT-5 + more (via OpenRouter) |
| **Architecture** | Monolithic 2,300-line `App.tsx` | Modular: 6 tools, 5 services, shared UI library |
| **Brand DNA** | — | New flagship tool — analyze a product photo, get 3-5 ad concepts with ready-to-use storyboard prompts |
| **User control** | None | Settings panel, monthly limits, password gate, custom API keys |
| **Defaults** | Hard-coded | Configurable for every option |
| **Light theme** | — | Full dark + light support |
| **Bilingual** | EN / AR | EN / AR / Egyptian Arabic / bilingual output |

## Tools

1. **Home** — landing page with feature cards.
2. **Brand DNA** *(new)* — Drop a product photo → analyze brand identity → generate multiple ad concepts → expand any concept into 2 ready-to-use storyboard prompts (Set 1 + Set 2).
3. **Storyboard** — The classic v1 tool, upgraded. 35+ cinematic styles, sequence count, color/gradient/image backgrounds, style references, AI auto-suggest, refinement, continuation.
4. **Ad Script** — Pure voiceover/dialogue/tagline output. No production notes, just spoken words.
5. **Sound FX** — AI sound design suggestions matched to a frame.
6. **Extractor** — Extract individual cells from any 2×2 or 3×3 grid using 4 different prompt strategies.

## Project layout

```
src/
├── App.tsx                  # main shell + state
├── main.tsx                 # React mount
├── index.css                # Tailwind v4 + theme variables
│
├── types/
│   └── index.ts             # all TypeScript types
│
├── config/
│   ├── models.ts            # AI model registry (Gemini + OpenRouter)
│   └── styles.ts            # cinematic styles, languages, durations, etc.
│
├── utils/
│   ├── i18n.ts              # bilingual t() helper
│   ├── files.ts             # image processing, paste/drop handlers
│   └── storage.ts           # localStorage settings + usage tracking
│
├── services/
│   ├── aiService.ts         # unified AI router (Gemini SDK + OpenRouter fetch)
│   ├── storyboardService.ts # storyboard prompts, image description
│   ├── brandDNAService.ts   # JSON brand analysis + idea expansion
│   ├── scriptService.ts     # ad script generation
│   └── soundService.ts      # sound FX + style suggestions
│
├── components/
│   ├── Sidebar.tsx
│   ├── ui/
│   │   ├── ModelSelector.tsx
│   │   ├── ImageUpload.tsx
│   │   ├── LabelTag.tsx
│   │   └── CopyButton.tsx
│   └── tools/
│       ├── Home.tsx
│       ├── BrandDNATool.tsx
│       ├── StoryboardTool.tsx
│       ├── AdScriptTool.tsx
│       ├── SoundEffectsTool.tsx
│       ├── ExtractorTool.tsx
│       └── SettingsModal.tsx
```

## API keys

Two keys, both optional but at least one is required:

- **`GEMINI_API_KEY`** — Free tier at https://aistudio.google.com/app/apikey. Unlocks Gemini 2.5 Flash, 2.5 Pro, 2.0 Flash.
- **`OPENROUTER_API_KEY`** — Paid (cheap), at https://openrouter.ai/keys. Unlocks Claude Opus 4.7 / Sonnet 4.6 / Haiku 4.5, GPT-5 / 4o, Llama 3.3 70B.

In Google AI Studio, set them as **Secrets**. Locally, copy `.env.example` → `.env`.

End-users can also paste their own keys in the in-app **Settings → API Keys** panel — those keys override the project-level keys and are stored only in their own browser.

## User control / multi-tenant

Because this app is shared with many users, v2 ships with these controls:

- **Monthly generation limit** in Settings (0 = unlimited). Per-user, tracked in their browser.
- **Admin password** in Settings. When set, accessing the app from that browser requires the password (cleared by clearing browser data).
- **Custom API keys** — users can add their own keys instead of using yours.
- **Usage stats** — total + monthly generation counts visible in Settings.

⚠️ All controls are client-side (localStorage). For real backend enforcement you'd need to add a server.

## Development

```bash
npm install
cp .env.example .env   # then fill in your API keys
npm run dev            # starts on :3000
npm run build          # production build
npm run lint           # tsc --noEmit
```

## Designer

**Abdalla Eissa** — AI Creative Director & Designer

- Instagram: [@abdallaessaa](https://www.instagram.com/abdallaessaa/)
- Facebook: [Abdalla Eissa Designs](https://www.facebook.com/AbdallaEissaDesigns/)
- WhatsApp: [+20 106 547 9474](https://wa.me/201065479474)
- Email: abdallaahmedessa@gmail.com

---

For the **non-coder setup walkthrough**, see `SETUP_GUIDE.md`.
