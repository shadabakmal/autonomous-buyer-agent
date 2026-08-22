# Autonomous Buyer Agent & Agentic Commerce Platform

## Architecture & Conventions

- **Framework**: Next.js 14+ (App Router), React 18, TypeScript, Tailwind CSS.
- **Persistence**: Prisma ORM with SQLite database (`prisma/schema.prisma`).
- **Security & Integrity**:
  - Financial guardrails are strictly evaluated server-side (`lib/policyEngine.ts`) against authenticated user settings.
  - Payment signatures are verified strictly using HMAC-SHA256 in `lib/razorpay.ts`.
  - Money actions require session authentication (`lib/auth.ts`) and idempotency validation (`lib/idempotency.ts`).
- **Testing**: Vitest unit test suite located in `__tests__/`.
