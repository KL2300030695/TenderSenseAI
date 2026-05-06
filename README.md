# 🛡️ Tender Sense AI

**Tender Sense AI** is a government-grade, AI-powered tender evaluation platform. It leverages advanced Large Language Models (LLMs) and structured data extraction to transform unstructured tender documents and bidder proposals into auditable, explainable eligibility reports.

---

## 🚀 Key Features

-   **📄 Multi-Format Document Ingestion**: Securely process tenders and bids via PDF uploads, raw text pasting, or direct URL analysis.
-   **🤖 AI-Powered Criteria Extraction**: Automatically identify technical, financial, and compliance requirements from complex tender documents.
-   **📊 Structured Bidder Analysis**: Extract key performance indicators like annual turnover, certifications, and project experience directly from bidder submissions.
-   **⚖️ Automated Evaluation Engine**: Instant matching of bidder data against tender criteria with high-confidence status assignment (Eligible, Not Eligible, or Needs Review).
-   **🔍 Explainable Decision Reporting**: Every AI decision is accompanied by a human-readable explanation and direct evidence snippets from the source documents.
-   **📈 Live Analytics Dashboard**: Real-time visualization of procurement performance, success rates, and evaluation trends.
-   **🛡️ Audit-Ready Repository**: A centralized, secure Firestore-backed repository for tracking every evaluation and system activity.

---

## 🛠️ Technical Stack

-   **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
-   **Language**: [TypeScript](https://www.typescriptlang.org/)
-   **UI & Styling**: [Tailwind CSS](https://tailwindcss.com/), [Shadcn UI](https://ui.shadcn.com/), [Lucide Icons](https://lucide.dev/)
-   **Generative AI**: [Genkit](https://firebase.google.com/docs/genkit) with Google Gemini 2.5 Flash
-   **Backend & Auth**: [Firebase](https://firebase.google.com/) (Firestore, Authentication)
-   **Charts**: [Recharts](https://recharts.org/)

---

## 📂 Project Structure

```text
src/
├── ai/                # Genkit AI Flows & Prompts
│   ├── flows/         # Evaluation, Extraction, and Reporting logic
│   └── genkit.ts      # Genkit configuration
├── app/               # Next.js App Router (Pages & Layouts)
│   ├── analytics/     # Live performance metrics
│   ├── history/       # Audit logs
│   ├── search/        # Global data filter
│   ├── tenders/       # Repository & Evaluation process
│   └── layout.tsx     # Global providers & Auth wrapper
├── components/        # Reusable UI components (Shadcn)
├── firebase/          # Firestore hooks & Auth configuration
└── lib/               # Utility functions & Shared assets
```

---

## 🏁 Getting Started

### 1. Prerequisites
-   Node.js (Latest LTS)
-   Firebase Project
-   Google Gemini API Key (configured in Genkit)

### 2. Installation
```bash
npm install
```

### 3. Development
```bash
npm run dev
```

### 4. Build
```bash
npm run build
```

---

## 🔒 Security & Compliance

Tender Sense AI is designed with **Authorization Independence** and **Auditability** at its core.
-   **Data Segregation**: Multi-tenant Firestore structure ensures data privacy between bidders.
-   **Immutable Logs**: Every manual review action is logged as an immutable activity record.
-   **Secure Processing**: All document analysis is performed within a secure Genkit environment with configured safety filters.

---

## 🎨 Design Philosophy

The interface uses a **Deep Professional Blue (#28518A)** and **Light Blue-Grey (#F0F2F4)** palette to evoke trust and government-grade reliability. The **Inter** sans-serif typeface ensures maximum legibility for detailed technical reports.

---

Developed with ❤️ using **Firebase Studio**.