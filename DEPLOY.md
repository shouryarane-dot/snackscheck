# How to deploy SnackCheck to snackscheck.com

## What you need
- The `snackscheck-app` folder (this folder)
- A free Supabase account
- A free GitHub account
- A free Vercel account

---

## Step 1 — Set up Supabase (your database)

1. Go to **supabase.com** → Sign up for free
2. Click **New project** → name it `snack-check`, pick a region, set a password (save it!)
3. Wait ~1 minute for the project to start
4. In the left sidebar, click **SQL Editor** → **New query**
5. Paste the entire contents of `database.sql` into the editor
6. Click **Run** — you should see "Success"
7. Go to **Project Settings** (gear icon) → **API**
8. Copy two values — you'll need them in Step 3:
   - **Project URL** (looks like `https://abcxyz.supabase.co`)
   - **anon / public** key (long string starting with `eyJ...`)

---

## Step 2 — Upload to GitHub

1. Go to **github.com** → Sign up / Log in
2. Click **+** (top right) → **New repository**
3. Name it `snackscheck`, set to **Public**, click **Create repository**
4. On the next page, click **uploading an existing file**
5. Upload ALL files from the `snackscheck-app` folder:
   - Drag the entire folder contents (package.json, vite.config.js, index.html, .env.example, src/ folder, database.sql)
6. Click **Commit changes**

---

## Step 3 — Deploy on Vercel

1. Go to **vercel.com** → Sign up with your GitHub account
2. Click **Add New Project** → select your `snackscheck` repository → click **Import**
3. Before clicking Deploy, click **Environment Variables** and add:
   - Name: `VITE_SUPABASE_URL` → Value: your Project URL from Step 1
   - Name: `VITE_SUPABASE_ANON_KEY` → Value: your anon key from Step 1
4. Click **Deploy** — wait ~1 minute
5. Vercel gives you a URL like `snackscheck.vercel.app` — your site is live!

---

## Step 4 — Connect snackscheck.com

1. In Vercel, go to your project → **Settings** → **Domains**
2. Type `snackscheck.com` and click **Add**
3. Vercel shows you two DNS records to add (A record and CNAME)
4. Go to **Squarespace** → **Domains** → click `snackscheck.com` → **DNS Settings**
5. Click **Add record** and add each record Vercel showed you
6. Wait 10–30 minutes for DNS to propagate
7. snackscheck.com is live! 🎉

---

## After launch

- Any rating anyone adds goes straight into your Supabase database
- You can view all ratings in Supabase → **Table Editor** → `ratings`
- To re-deploy after code changes: just push to GitHub — Vercel auto-deploys
