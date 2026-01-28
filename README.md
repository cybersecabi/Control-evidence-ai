# ControlEvidence AI

<div align="center">

![ControlEvidence AI](https://img.shields.io/badge/AI-Powered-blue?style=for-the-badge)
![Next.js 14](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Supabase](https://img.shields.io/badge/Supabase-Database-green?style=for-the-badge&logo=supabase)
![Gemini](https://img.shields.io/badge/Gemini-API-4285F4?style=for-the-badge&logo=google)
![Ollama](https://img.shields.io/badge/Ollama-Local-purple?style=for-the-badge)

**AI-assisted evidence intake, validation, and control mapping for compliance teams**

[Getting Started](#quick-start) • [Features](#features) • [Documentation](#documentation) • [Setup Guide](./SETUP.md)

</div>

---

## One-Sentence Pitch

ControlEvidence AI is a developer-friendly platform that ingests audit evidence (text, CSVs, screenshots) and automatically classifies, validates, and maps it to **SOC 2**, **ISO 27001**, **SOX ITGC**, and **NIST CSF** controls, producing strict, structured outputs that can be saved, reviewed, and reported—using **Gemini API** (cloud) or **Ollama** (local).

---

## The Problem

Compliance teams and auditors spend hours:

- 📥 **Collecting evidence** from many systems (access lists, policy PDFs, admin screenshots, logs)
- 🔄 **Normalizing formats** (CSV vs. image vs. raw text)
- 🎯 **Mapping each item** to the right framework control
- ✅ **Validating** for completeness and authenticity signs
- 📝 **Summarizing findings** into repeatable, consistent outputs

This work is **manual, error-prone, and slow**, especially near audits when volumes spike.

---

## The Solution

ControlEvidence AI automates evidence analysis with flexible AI providers:

### AI Provider Options

| Provider | Best For | Setup |
|----------|----------|-------|
| **Gemini API** ☁️ | Quick setup, no local hardware needed | Just add API key |
| **Ollama** 🖥️ | Privacy-first, no API costs, offline | Install locally |

The app **automatically selects** the provider based on your configuration:
- If `GEMINI_API_KEY` is set → Uses Gemini
- Otherwise → Falls back to Ollama

### Structured Output

Both providers produce **strict JSON** via schema-constrained outputs:

```json
{
  "evidence_type": "User Access List CSV",
  "mapped_control": {
    "framework": "SOC 2",
    "control_id": "CC6.1",
    "control_name": "Logical Access"
  },
  "completeness_score": 78,
  "extracted_data": {
    "total_users": 156,
    "admin_accounts": 12
  },
  "issues": [
    "3 stale admin accounts detected",
    "Missing last reviewed date column"
  ],
  "score_reasoning": "Evidence contains user data but lacks review timestamps..."
}
```

---

## Features

### ✨ Core Capabilities

| Feature | Description |
|---------|-------------|
| **📤 Evidence Intake** | Upload files via drag-and-drop to Supabase Storage |
| **🤖 AI Validation** | Analyze with Gemini API or Ollama (auto-selected) |
| **🎯 Control Mapping** | Auto-map to SOC 2, ISO 27001, SOX ITGC, NIST CSF |
| **📊 Completeness Scoring** | 0-100 scoring with reasoning |
| **🚩 Issue Detection** | Identify gaps, risks, and red flags |
| **💾 Structured Persistence** | Results saved to database for review |

### 🎨 User Interface

- **Dashboard** - Overview stats, AI provider status, recent evidence
- **Evidence Library** - Filter, search, and manage all evidence
- **Upload Page** - Drag-and-drop with supported format guidance
- **Detail View** - File preview, validation trigger, results display

---

## Quick Start

### Prerequisites

- **Node.js 18+** 
- **Supabase** project (or local instance)
- **One of:**
  - Gemini API key (get free at [aistudio.google.com](https://aistudio.google.com/apikey))
  - OR Ollama installed locally

### 1. Clone & Install

```bash
git clone <repository-url>
cd control-evidence-ai
npm install
```

### 2. Configure Environment

```bash
cp .env.local.example .env.local
```

Edit `.env.local`:

```env
# Option 1: Gemini API (Recommended - Quick setup)
GEMINI_API_KEY=your-gemini-api-key

# Option 2: Ollama (Leave GEMINI_API_KEY empty to use Ollama)
# OLLAMA_BASE_URL=http://localhost:11434

# Supabase (Required)
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 3. Set Up Database

Run the SQL migration in your Supabase SQL Editor:

```bash
# File: supabase/migrations/001_initial_schema.sql
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) 🚀

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        ControlEvidence AI                        │
├─────────────────────────────────────────────────────────────────┤
│  Frontend (Next.js 14 App Router)                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────────────────┐   │
│  │  Dashboard  │ │  Evidence   │ │  Evidence Detail +      │   │
│  │   Page      │ │   List      │ │  Validation Results     │   │
│  └─────────────┘ └─────────────┘ └─────────────────────────┘   │
├─────────────────────────────────────────────────────────────────┤
│  API Routes (Server-Side)                                       │
│  ┌──────────────────┐ ┌──────────────────────────────────────┐ │
│  │ /api/evidence    │ │ /api/evidence/validate               │ │
│  │ GET, POST        │ │ POST → Gemini or Ollama              │ │
│  └──────────────────┘ └──────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  External Services                                              │
│  ┌──────────────────┐ ┌──────────────────────────────────────┐ │
│  │ Supabase         │ │ AI Provider (auto-selected)          │ │
│  │ • Database       │ │ • Gemini API (if key set)            │ │
│  │ • Storage        │ │ • OR Ollama (local fallback)         │ │
│  └──────────────────┘ └──────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

---

## AI Provider Comparison

| Feature | Gemini API | Ollama |
|---------|------------|--------|
| **Setup** | Just API key | Install + pull models |
| **Cost** | Free tier available | Always free |
| **Privacy** | Data sent to Google | Fully local |
| **Speed** | Fast (cloud) | Depends on hardware |
| **Offline** | ❌ | ✅ |
| **Vision** | ✅ gemini-2.0-flash | ✅ llava:7b |
| **Text** | ✅ gemini-2.0-flash | ✅ qwen2.5:7b |

---

## API Reference

### Validate Evidence

```http
POST /api/evidence/validate
Content-Type: application/json

{
  "evidence_item_id": "uuid-here"
}
```

**Response:**

```json
{
  "success": true,
  "data": {
    "validation_id": "result-uuid",
    "result": {
      "evidence_type": "MFA Settings Screenshot",
      "mapped_control": { ... },
      "completeness_score": 85,
      "issues": []
    },
    "model": "gemini:gemini-2.0-flash",
    "processing_time_ms": 1240
  }
}
```

### Health Check

```http
GET /api/health
```

Response includes active provider:

```json
{
  "success": true,
  "activeProvider": "gemini",
  "services": {
    "ai": {
      "provider": "gemini",
      "available": true,
      "models": ["gemini-2.0-flash"]
    }
  }
}
```

---

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `GEMINI_API_KEY` | ❌* | - | Gemini API key (auto-enables Gemini) |
| `GEMINI_MODEL` | ❌ | `gemini-2.0-flash` | Gemini model for text |
| `GEMINI_VISION_MODEL` | ❌ | `gemini-2.0-flash` | Gemini model for images |
| `OLLAMA_BASE_URL` | ❌ | `http://localhost:11434` | Ollama endpoint |
| `OLLAMA_TEXT_MODEL` | ❌ | `qwen2.5:7b` | Ollama text model |
| `OLLAMA_VISION_MODEL` | ❌ | `llava:7b` | Ollama vision model |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | - | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | - | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | - | Supabase service key |

*Either `GEMINI_API_KEY` or a running Ollama instance is required.

---

## Supported Frameworks

| Framework | Coverage | Control Examples |
|-----------|----------|------------------|
| **SOC 2** | Trust Services Criteria | CC6.1 (Logical Access), CC7.2 (System Monitoring) |
| **ISO 27001** | Annex A Controls | A.9.4 (Access Control), A.12.4 (Logging) |
| **SOX ITGC** | IT General Controls | Access Controls, Change Management |
| **NIST CSF** | Core Functions | Protect, Detect, Respond |

---

## Project Structure

```
control-evidence-ai/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── evidence/
│   │   │   │   ├── route.js          # List & upload
│   │   │   │   ├── [id]/route.js     # Get & delete
│   │   │   │   └── validate/route.js # AI validation
│   │   │   └── health/route.js       # Health check
│   │   ├── evidence/
│   │   │   ├── page.jsx              # Evidence list
│   │   │   ├── upload/page.jsx       # Upload page
│   │   │   └── [id]/page.jsx         # Detail view
│   │   ├── globals.css               # Design system
│   │   ├── layout.jsx                # Root layout
│   │   └── page.jsx                  # Dashboard
│   ├── components/
│   │   ├── EvidenceCard.jsx
│   │   ├── EvidenceUpload.jsx
│   │   ├── Layout.jsx
│   │   └── ValidationResult.jsx
│   └── lib/
│       ├── ollama.js                 # Unified AI client (Gemini + Ollama)
│       └── supabase.js               # Database client
├── supabase/
│   └── migrations/
│       └── 001_initial_schema.sql
├── .env.local.example
├── README.md
├── SETUP.md
└── package.json
```

---

## Roadmap

- [ ] **Reviewer Workflows** - Approve/reject AI results with feedback
- [ ] **Control Catalogs** - Detailed control metadata integration
- [ ] **RAG Integration** - Use internal policies for context
- [ ] **Batch Validation** - Multi-select and validate many items
- [ ] **Reports & Exports** - PDF/Docx audit-ready reports

---

## License

MIT License - see LICENSE file for details.

---

<div align="center">

**Built with ❤️ for compliance teams everywhere**

[⬆️ Back to top](#controlevidence-ai)

</div>
