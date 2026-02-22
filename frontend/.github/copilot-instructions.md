# Marketu - Copilot Instructions

[cite_start]You are an expert React/TypeScript developer specialized in the Marketu project: a hyper-local marketplace for Angolan students (specifically IPIL/Makarenko)[cite: 2, 4].

## 1. Core Tech Stack & Patterns
- **Framework:** React with Vite (TypeScript is mandatory).
- **Styling:** Tailwind CSS (Mobile-first approach). [cite_start]Use `sm:`, `md:` only for scaling up[cite: 13].
- **UI Components:** Shadcn/ui + Radix UI + Lucide-React icons.
- **State Management:** Zustand (Store-based logic).
- **Backend:** Pocketbase (Use the official SDK).
- **Architecture:** - Business logic/SDK config: `src/lib/pocketbase.ts`.
  - Global state: `src/store/`.
  - Components: `src/components/ui/` (atomic) and `src/components/shared/`.

## 2. Coding Standards
- **Components:** Use **Arrow Functions** (`const MyComponent = () => { ... }`).
- **Typing:** Strict TypeScript. Define interfaces for all Pocketbase collections (Student, Product, Category).
- **Naming:** PascalCase for components, camelCase for functions/variables.
- **Forms:** Prefer uncontrolled components with `react-hook-form` and `zod` for validation where possible.

## 3. Business Rules (Context)
- [cite_start]**Target:** Exclusive for IPIL students[cite: 4, 31].
- [cite_start]**Auth:** Supports Student ID (Ex: 20240) or Phone (+244)[cite: 36, 37, 89].
- [cite_start]**Student Verification:** Registration requires Student ID and Full Name as registered at school[cite: 71, 74].
- **Product States:** Only allow: 'new', 'used_like_new', 'used_good', 'used_fair'.
- **Language:** UI must be in Portuguese (PT-AO). [cite_start]Use terms like "Telemóvel", "Palavra-passe", "Propina" (if applicable)[cite: 38, 46].

## 4. Design System (Tailwind)
- [cite_start]**Primary Color:** Purple (The brand identity)[cite: 1].
- [cite_start]**Buttons:** Large, rounded-md, high contrast for mobile[cite: 41, 77].
- [cite_start]**Safety:** Always include the "Os teus dados estão seguros..." footer in auth flows[cite: 52, 78].

## 5. Pocketbase Integration
- All data fetching must go through the instance exported from `@/lib/pocketbase`.
- Handle real-time subscriptions using Pocketbase's `.subscribe()` for chat or notifications.

## 6. Product Context & User Flow
[cite_start]You are building **Marketu**, a niche marketplace designed for the Angolan student community, starting exclusively with **IPIL/Makarenko**[cite: 3, 4].

### Core Value Proposition:
- **Trust & Safety:** Only verified students can trade. [cite_start]Registration requires matching the "ID de Estudante" (Nº de Processo) and "Nome Completo" exactly as registered in the school database[cite: 71, 74, 76].
- [cite_start]**Hyper-Local:** Transactions are fast and occur within the school environment[cite: 11].
- [cite_start]**Gamification:** Early adopters (first 1000) receive a "Membro Fundador" badge and VIP support.

### User Journey (to be reflected in code logic):
1. [cite_start]**Onboarding:** Landing page -> Login/Register selection[cite: 32, 33].
2. [cite_start]**Identity Verification:** Inputting Student ID and Name [cite: 71, 74] [cite_start]-> Displaying "Dados Académicos" (Course, Class, Shift) for user confirmation.
3. [cite_start]**Security:** SMS OTP verification (+244) followed by password creation[cite: 86, 94, 101].
4. [cite_start]**Dashboard:** Accessing categories like "Material", "Livros", etc[cite: 8].

### Key Entities & Attributes:
- [cite_start]**Student:** ID, Name, Course, Class, Turno (Morning/Afternoon/Night), Badge Status[cite: 83, 107].
- **Products:** Title, Price, Category, State (New/Used), Seller ID.
- [cite_start]**Location:** Locked to "Angola / Luanda / IPIL" for the MVP[cite: 2, 4].