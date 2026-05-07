# 📘 Setup Guide — For people who have never coded before

Hi 👋 — this guide walks you through getting **Abdalla Eissa AI Ad Creator Pro v2** running on Google AI Studio. No coding experience needed. Take your time, follow the steps in order, and you'll have a working app in about 15-20 minutes.

If you get stuck on any step, message Abdalla on WhatsApp: **[+20 106 547 9474](https://wa.me/201065479474)**.

---

## What you'll end up with

A web app you (and anyone you share the link with) can use in a browser to:

- Analyze any product photo and instantly get ad-campaign ideas
- Generate cinematic 3×3 storyboard prompts for image AIs (Nano Banana Pro, GPT-Image, Imagen)
- Write voiceover scripts in English or Arabic
- Get sound-design suggestions for any scene
- Extract individual frames from grid images

You'll be able to share it with one link. Each person who opens it uses it in their own browser.

---

## Step 1 — Get a Google account

If you already have a Gmail/Google account, **skip this step**. ✅

Otherwise: go to **https://accounts.google.com/signup** and make a free account. Use any name. Use it for everything else in this guide.

---

## Step 2 — Get your Gemini API key (required, free)

This key lets the app talk to Google's Gemini AI. It's free for normal use.

1. Open **https://aistudio.google.com/app/apikey** in a new tab.
2. Sign in with your Google account if asked.
3. Click the blue **"+ Create API key"** button.
4. If it asks "Which project?" just pick the default one and click **Create**.
5. A long string starting with **`AIza...`** appears. **Click the copy icon** next to it.
6. **Paste it somewhere safe** — a Notes app, a sticky note file, anywhere you can find it again. You'll need it in Step 5.

🔒 **Don't share this key publicly.** Anyone who has it can use your free quota.

---

## Step 3 — *(Optional)* Get your OpenRouter API key — unlocks Claude & GPT

The Gemini key alone is enough to run the whole app. But if you want to use **Claude Opus 4.7**, **Claude Sonnet 4.6**, **GPT-5**, or other models, you need an OpenRouter key. OpenRouter is a paid service but very cheap (you load $5–$10 and it lasts a long time for normal use).

1. Open **https://openrouter.ai/** and click **Sign In** (top right). You can sign in with Google.
2. Once signed in, click your avatar → **Credits** → add some credit ($5 is plenty to start).
3. Click your avatar → **Keys** (or go directly to **https://openrouter.ai/keys**).
4. Click **+ Create Key**. Give it a name like "AI Ad Creator". Click **Create**.
5. Copy the key — it starts with **`sk-or-v1-...`** — and paste it next to your Gemini key in your safe note.

If you skip this step, the app still works perfectly with Gemini only. You can always come back and add it later.

---

## Step 4 — Open Google AI Studio and create the app

1. Open **https://aistudio.google.com/** and sign in.
2. On the left sidebar, click **"Apps"** (or visit **https://aistudio.google.com/apps**).
3. Click the big **"+ New app"** button (or "Create app").
4. When it asks how to start, choose **"Build from scratch"** / **"Blank project"** / **"Empty"** — whatever the empty option is called.
5. Give it a name when asked. Suggestion: **`Abdalla Eissa AI Ad Creator`**.

You should now be staring at a code editor on the left and a preview on the right. Don't be intimidated — you won't be writing any code, just replacing files.

---

## Step 5 — Add your API keys as Secrets

This is how the app gets your keys without you putting them in the code (which would be unsafe).

1. In Google AI Studio, look for a **🔒 Secrets** or **"Variables"** or **"Environment"** button. It's usually in the left sidebar or under a settings ⚙️ icon. (The exact location moves around as Google updates AI Studio.)
2. Click **"+ Add secret"** (or **"+ Add variable"**).
3. **Name:** `GEMINI_API_KEY` *(exact spelling, all caps, with the underscore)*
   **Value:** paste your Gemini key from Step 2.
   Click **Save**.
4. *(If you did Step 3)* Click **"+ Add secret"** again.
   **Name:** `OPENROUTER_API_KEY`
   **Value:** paste your OpenRouter key.
   Click **Save**.

You should now see both keys listed in the Secrets panel.

---

## Step 6 — Upload the v2 files

This is the part most people worry about. Don't worry — it's just dragging and dropping.

1. **Unzip** the `abdalla-eissa-ai-ad-creator-v2.zip` file you got from Abdalla. You'll see a folder with files inside (`package.json`, `vite.config.ts`, `index.html`, `metadata.json`, a `src` folder, etc.).
2. Back in Google AI Studio, look at the file tree on the left. You'll see the empty starter files Google created (probably `index.html`, `App.tsx`, `index.tsx`).
3. **Delete all of Google's starter files.** Right-click each one → Delete. (Don't delete the secrets!)
4. Now drag the contents of the unzipped v2 folder **into the file tree**:
   - `package.json`
   - `tsconfig.json`
   - `vite.config.ts`
   - `index.html`
   - `metadata.json`
   - `.env.example`
   - The whole `src` folder
   - `README.md` and `SETUP_GUIDE.md` (optional, just for reference)

   Drop them at the **root level** — same level Google's starter files were at.
5. ⚠️ **Important:** make sure the `src` folder stays as `src` and doesn't get nested inside another folder. The structure should look like:

   ```
   📁 (root)
     📄 package.json
     📄 tsconfig.json
     📄 vite.config.ts
     📄 index.html
     📄 metadata.json
     📁 src
       📄 App.tsx
       📄 main.tsx
       📄 index.css
       📁 components
       📁 services
       📁 ...
   ```

If the AI Studio file uploader complains or behaves oddly, you can **upload one folder at a time** instead of everything at once.

---

## Step 7 — Click Run

1. At the top of AI Studio, click the green **▶ Run** button (or **"Preview"**).
2. The first time, it will install all the npm packages — this takes **2-3 minutes**. You'll see logs scrolling. Wait for it.
3. Once done, the right side of your screen will show a live preview of the app. You should see:
   - "Abdalla Eissa" title in big italic letters
   - A sidebar with Brand DNA, Storyboard, Ad Script, Sound FX, Extractor
   - 5 feature cards in the middle

🎉 If you see this, **the app is running!**

---

## Step 8 — Test that it actually works

Don't trust silent success. Try one quick generation:

1. Click **"Brand DNA"** in the sidebar.
2. Drop or upload any product photo (a snack bag, a bottle, anything).
3. Type a quick brief like "*30-second luxury ad for Instagram*".
4. Click **"Analyze Brand DNA"**.
5. Wait 5-15 seconds.
6. You should see brand info filled in plus 3 ad ideas appear on the right.

If it works → 🎉 you're done.

If you see an error → see "Troubleshooting" at the bottom of this guide.

---

## Step 9 — Share the app with people

Google AI Studio gives every app a public URL.

1. Look near the top of AI Studio for a **"Share"** or **"Publish"** button (or sometimes a globe 🌐 icon).
2. Click it. AI Studio will give you a public URL — usually something like `https://aistudio.google.com/apps/abc123...`
3. Copy that link. Anyone with the link can use the app in their own browser.

⚠️ **About sharing:** Every person who opens the link uses **your** API keys (the ones you set up in Step 5). That means **their generations count against your quota**. If you don't want that:

- Have them use the **Settings → API Keys** panel inside the app to paste their *own* keys (their keys override yours and stay only in their browser).
- Or set a **monthly limit** in Settings (described in Step 10) so no single user can blow through your credits.

---

## Step 10 — Use the built-in user controls

Because the app is shared, v2 has user controls. Click the ⚙️ Settings icon at the bottom of the sidebar:

### Monthly Generation Limit

Set a number (e.g. `30`) and the app will stop a user after that many generations in a month. Set to `0` for unlimited. The limit is per browser — each user has their own counter.

### Admin Password

If you set a password, anyone opening the app from that browser will need to type it before they can use anything. Useful if it's a shared computer at your office.

⚠️ **Warning:** if a user forgets their password, they have to clear their browser data to reset. There's no recovery — by design, no server is involved.

### Custom API Keys

If a user pastes their own Gemini or OpenRouter key here, it overrides yours. Useful for power users who want to use their own quota.

### Usage Stats

Shows how many generations have been used total and this month.

### Danger Zone

- **Reset All Settings** → puts everything back to defaults.
- **Clear All Data** → deletes settings, usage counters, and any cached history.

---

## Updating the app later

When Abdalla sends you a new version of the ZIP:

1. In AI Studio, delete the old `src` folder.
2. Drag in the new `src` folder.
3. *(Usually `package.json` doesn't change. If Abdalla says it does, replace it too.)*
4. Click **▶ Run** again. AI Studio re-installs and reloads automatically.

Your secrets and any user data in browsers stay intact — only the code changes.

---

## Troubleshooting

### "No API keys detected" yellow banner at the top

→ Step 5 didn't save correctly. Go back to Secrets, double-check that:
- The name is **exactly** `GEMINI_API_KEY` (not `GEMINI_KEY`, not `gemini_api_key`)
- The value is the full key starting with `AIza`
- You clicked **Save** after pasting

Then click **▶ Run** again.

### "Rate limit reached" / "RESOURCE_EXHAUSTED" / "429" error

→ You hit Google's free quota. Either:
- Wait a few minutes and try again
- Upgrade your Gemini key to paid tier
- Use Claude/GPT instead via your OpenRouter key

### "Invalid API key" / "401" error

→ Your key was copied wrong, or it was deleted/regenerated. Go back to Step 2 (or Step 3) and copy a fresh one.

### Claude / GPT models look greyed out

→ You don't have an OpenRouter key set. Either skip them (Gemini works fine) or do Step 3 + add the secret.

### App preview shows a blank white screen

→ Something failed during the build. In AI Studio, look for the **Console** or **Logs** panel. Send the red error text to Abdalla on WhatsApp.

### "Cannot find module 'react'" in the logs during install

→ This usually fixes itself if you click **▶ Run** again. If not, delete `node_modules` (if you can see it) and re-run.

### Storyboards generate but the text is blank or weird

→ Try a different model from the dropdown at the top of the tool. Some models occasionally hiccup. Gemini 2.5 Pro and Claude Opus 4.7 are the most reliable.

### Arabic text shows but layout is broken

→ Click the 🌐 Languages icon at the bottom of the sidebar to switch direction to RTL.

---

## Quick reference card

| What | Where |
|---|---|
| Get Gemini key | https://aistudio.google.com/app/apikey |
| Get OpenRouter key | https://openrouter.ai/keys |
| AI Studio dashboard | https://aistudio.google.com/apps |
| Set Secrets | AI Studio → 🔒 Secrets panel |
| Run / Preview | Top toolbar ▶ button |
| Share link | Top toolbar Share / globe 🌐 button |
| User controls | App sidebar → ⚙️ Settings |

---

## Need help?

**Abdalla Eissa**
📱 WhatsApp: [+20 106 547 9474](https://wa.me/201065479474)
📧 Email: abdallaahmedessa@gmail.com
📷 Instagram: [@abdallaessaa](https://www.instagram.com/abdallaessaa/)

When asking for help, screenshots help a lot — especially of any error messages and the AI Studio logs panel. Good luck! 🚀
