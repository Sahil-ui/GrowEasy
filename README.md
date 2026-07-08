# GrowEasy AI-Powered CSV Importer

An intelligent, production-ready SaaS CSV lead importer. It parses lead exports from **any layout/source** (e.g. Facebook Ads, Google Ads, arbitrary spreadsheets) and leverages Google Gemini (LLM) to extract, validate, and normalize records into GrowEasy's standardized CRM schema.

---

## 🚀 Key Features

1. **AI Column & Value Extraction:** Processes files dynamically. No hardcoded mappings are needed; column semantic matching, date normalizations, dial code parsing, and value extraction are handled via AI.
2. **Adaptive Batch Manager:** Automatically adjusts batch sizing based on row counts (<100 rows → 10/batch; 100-1000 rows → 20/batch; >1000 rows → configurable).
3. **Controlled Concurrency Queue:** Batches are sent to the LLM concurrently via a controlled queue (`p-limit`) to maximize throughput without triggering rate-limit status codes.
4. **Resilient Failure Handling:** Built-in exponential backoff retry loop for LLM calls with customizable retry counts.
5. **Strict Schema & Validation Pipeline:**
   - **Post-AI Extraction Sanity:** Runs checks to filter out hallucinated phone numbers or email addresses not present in the original row.
   - **Enum Enforcement:** Semantically matches statuses and campaigns to valid enums or voids them.
   - **Skip Rules:** Automatically isolates incomplete rows containing neither an email nor phone number to a separate skipped tab.
6. **Premium UI/UX Design System:** Custom-built dark/light modern UI featuring smooth micro-animations, virtualized tables for performance with thousands of rows, interactive CSV preview, processing step tracking, and visual breakdown summaries.

---

## 🛠 Tech Stack

- **Backend:** Node.js, Express, TypeScript, PapaParse (stream parser), Winston (structured logger), Zod (schema validator), Vitest (unit/integration tests)
- **Frontend:** Next.js (App Router), TypeScript, Axios, PapaParse, Framer Motion, Lucide icons
- **Infrastructure:** Docker, Docker Compose

---

## 📂 Project Architecture

```
GrowEasy/
├── backend/
│   ├── src/
│   │   ├── config/          # Central configuration & enums
│   │   ├── controllers/     # Route controller endpoints
│   │   ├── logger/          # Structured logger configuration (Winston)
│   │   ├── middleware/      # Error handler, rate limiters, file uploads
│   │   ├── prompts/         # Versioned prompt system (v1)
│   │   ├── routes/          # REST route declarations
│   │   ├── services/        # Extraction orchestration & batch worker logic
│   │   ├── types/           # Shared TypeScript interfaces
│   │   ├── utils/           # Normalization utilities (dates, phones, json)
│   │   └── validators/      # Zod schema & row validators
│   └── tsconfig.json
│
├── frontend/
│   ├── src/
│   │   ├── app/             # Page bootstrap, layouts, global CSS
│   │   ├── components/      # UI components (Uploader, Table, Summary, Preview)
│   │   ├── hooks/           # State machines & dark mode hooks
│   │   ├── services/        # Axios API client connection
│   │   └── utils/           # File parser wrappers
```

---

## ⚙️ Configuration (.env)

Create a `.env` file in the `backend/` directory with the following values:

```bash
PORT=5000
NODE_ENV=development
ALLOWED_ORIGINS=http://localhost:3000

# LLM Config
LLM_PROVIDER=gemini
AI_API_KEY=your_gemini_api_key_here
AI_MODEL_NAME=gemini-2.5-flash
AI_TEMPERATURE=0

# Pipeline Settings
DEFAULT_BATCH_SIZE=10
MAX_CONCURRENT_BATCHES=3
MAX_RETRIES=3
RETRY_BASE_DELAY_MS=1000
```

---

## 🏃 Local Development

### 1. Backend Server Setup
```bash
cd backend
npm install
# Add your AI_API_KEY to .env
npm run dev
```
The server will boot on [http://localhost:5000](http://localhost:5000).

### 2. Frontend Web Setup
```bash
cd frontend
npm install
npm run dev
```
The application will boot on [http://localhost:3000](http://localhost:3000).

---

## 🐳 Docker Deployment (Recommended)

You can spin up both frontend and backend together in a production-optimized network using Docker:

```bash
# Set your AI_API_KEY in the docker-compose.yml file
docker-compose up --build
```
- Frontend: [http://localhost:3000](http://localhost:3000)
- Backend: [http://localhost:5000](http://localhost:5000)

---

## 🧪 Testing

The backend includes a comprehensive unit and integration test suite:

```bash
cd backend
npm run test
```
Tests cover:
- CSV layout structure & empty checks
- ISO-8601 Date UTC normalizations
- Dialing code extraction & phone formatting
- AI response parsing & schema compliance
- Hallucination detection filters
- Queue orchestration & skip-rule segregation
