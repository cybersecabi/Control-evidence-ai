# ControlEvidence AI - Setup Guide

This guide provides detailed, step-by-step instructions for installing, configuring, and deploying ControlEvidence AI.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [AI Provider Setup](#ai-provider-setup)
   - [Option A: Gemini API (Recommended)](#option-a-gemini-api-recommended)
   - [Option B: Ollama (Local)](#option-b-ollama-local)
3. [Supabase Setup](#supabase-setup)
4. [Application Setup](#application-setup)
5. [Running the Application](#running-the-application)
6. [Production Deployment](#production-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Software

| Software | Version | Purpose |
|----------|---------|---------|
| **Node.js** | 18.17+ | Runtime for Next.js |
| **npm** | 9+ | Package manager |
| **Git** | Latest | Version control |

### AI Provider (Choose One)

| Provider | Requirements |
|----------|--------------|
| **Gemini API** | Free API key from Google |
| **Ollama** | Local installation + 8GB+ RAM |

---

## AI Provider Setup

The app automatically selects the AI provider:
- **If `GEMINI_API_KEY` is set** → Uses Gemini API
- **Otherwise** → Falls back to Ollama

### Option A: Gemini API (Recommended)

The fastest way to get started - no local setup required!

#### Step 1: Get API Key

1. Go to [Google AI Studio](https://aistudio.google.com/apikey)
2. Sign in with your Google account
3. Click **"Create API Key"**
4. Copy the generated key

#### Step 2: Configure Environment

Add to your `.env.local`:

```env
GEMINI_API_KEY=your-api-key-here
GEMINI_MODEL=gemini-2.0-flash
GEMINI_VISION_MODEL=gemini-2.0-flash
```

That's it! The app will automatically use Gemini for all AI operations.

#### Gemini API Limits (Free Tier)

| Limit | Value |
|-------|-------|
| Requests per minute | 60 |
| Requests per day | 1,500 |
| Tokens per minute | 1,000,000 |

> **Tip:** The free tier is more than enough for development and small teams.

---

### Option B: Ollama (Local)

For privacy-first deployments with no API costs.

#### Step 1: Install Ollama

**macOS:**
```bash
brew install ollama
# Or download from https://ollama.com/download
```

**Linux:**
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

**Windows:**
Download from [ollama.com/download](https://ollama.com/download)

#### Step 2: Start Ollama

```bash
ollama serve
```

#### Step 3: Pull Models

```bash
# Text model (~4.4GB)
ollama pull qwen2.5:7b

# Vision model (~4.7GB)
ollama pull llava:7b
```

#### Step 4: Verify

```bash
ollama list
```

Expected output:
```
NAME            SIZE
qwen2.5:7b      4.4 GB
llava:7b        4.7 GB
```

#### Step 5: Configure Environment

Ensure `GEMINI_API_KEY` is NOT set (or remove it):

```env
# Comment out or remove Gemini key to use Ollama
# GEMINI_API_KEY=

# Ollama config (optional, these are defaults)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_TEXT_MODEL=qwen2.5:7b
OLLAMA_VISION_MODEL=llava:7b
```

#### Hardware Requirements for Ollama

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **RAM** | 8GB | 16GB+ |
| **GPU** | None | 6GB+ VRAM |
| **Storage** | 10GB | 20GB+ |

---

## Supabase Setup

### Option A: Supabase Cloud (Recommended)

#### Step 1: Create Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up / Log in
3. Click **New Project**
4. Enter project details:
   - **Name:** control-evidence-ai
   - **Database Password:** (save this)
   - **Region:** Choose closest

#### Step 2: Get API Credentials

1. Go to **Settings** → **API**
2. Copy these values:

| Dashboard Value | Environment Variable |
|----------------|---------------------|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` |
| anon/public key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| service_role key | `SUPABASE_SERVICE_ROLE_KEY` |

> ⚠️ **Never expose `service_role` key in client code!**

#### Step 3: Run Database Migration

1. Go to **SQL Editor** in Supabase Dashboard
2. Copy contents of `supabase/migrations/001_initial_schema.sql`
3. Click **Run**

#### Step 4: Create Storage Bucket

1. Go to **Storage**
2. Click **New Bucket**
3. Name: `evidence`, Public: No
4. Click **Create bucket**

---

## Application Setup

### Step 1: Clone & Install

```bash
git clone <repository-url>
cd control-evidence-ai
npm install
```

### Step 2: Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# =============================================
# AI Provider (Choose one)
# =============================================

# Option 1: Gemini API (Recommended for quick start)
GEMINI_API_KEY=your-gemini-api-key

# Option 2: Ollama (comment out GEMINI_API_KEY to use)
# OLLAMA_BASE_URL=http://localhost:11434

# =============================================
# Supabase (Required)
# =============================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Running the Application

### Development Mode

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Verify Setup

1. **Check Dashboard** - Should show AI provider status (green if connected)
2. **Upload a file** - Test storage connection
3. **Click Validate** - Test AI integration

---

## Production Deployment

### Vercel (Recommended)

1. Import your GitHub repository at [vercel.com](https://vercel.com)
2. Add environment variables:
   - `GEMINI_API_KEY` (or Ollama URL if self-hosting)
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Deploy!

### Using Ollama in Production

For production with Ollama, you need an accessible Ollama server:

```bash
# On your GPU server
OLLAMA_HOST=0.0.0.0:11434 ollama serve
```

Then set `OLLAMA_BASE_URL=http://your-server-ip:11434` in your deployment.

---

## Troubleshooting

### "AI Not Available"

**Using Gemini:**
1. Check `GEMINI_API_KEY` is set correctly
2. Verify key at [aistudio.google.com](https://aistudio.google.com/apikey)
3. Check API quota hasn't been exceeded

**Using Ollama:**
1. Start Ollama: `ollama serve`
2. Check URL: `curl http://localhost:11434/api/tags`
3. Verify models: `ollama list`

### "Failed to upload file"

1. Create storage bucket named `evidence` in Supabase
2. Check Supabase credentials in `.env.local`

### "Validation failed"

1. Check AI provider health at `/api/health`
2. For Ollama: ensure sufficient RAM/VRAM
3. For Gemini: check API quota

### Health Check

```bash
curl http://localhost:3000/api/health | jq
```

Should return:
```json
{
  "success": true,
  "activeProvider": "gemini",
  "services": {
    "ai": {
      "available": true,
      "provider": "gemini"
    }
  }
}
```

---

## Quick Reference

### Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GEMINI_API_KEY` | ❌* | Enables Gemini API |
| `GEMINI_MODEL` | ❌ | Default: `gemini-2.0-flash` |
| `OLLAMA_BASE_URL` | ❌ | Default: `http://localhost:11434` |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | Supabase URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Supabase service key |

*Either Gemini API key or running Ollama required.

### Provider Selection Logic

```
if (GEMINI_API_KEY is set) → Use Gemini
else → Use Ollama
```

---

<div align="center">

**Happy Compliance! 🎉**

</div>
