# Cloaked

Cloaked is a privacy-first payroll runner built for hackathon speed and real operator workflows.

It lets an admin create encrypted payroll vaults in-browser, import or manually add employees, generate payout payloads, and track execution status in a transaction history dashboard.

## Demo

[![Watch the demo](https://img.youtube.com/vi/KeZcKMTUW8E/maxresdefault.jpg)](https://youtu.be/KeZcKMTUW8E)

## What it does

- Creates an encrypted browser vault gated by passphrase
- Supports two data-entry modes:
  - Import CSV
  - Add employee manually
- Validates payroll rows before generation
- Supports payout rails:
  - ZEC batch URI generation
  - USDC NEAR intent generation
- Generates payouts in two execution styles:
  - One-at-a-time URIs with QR per recipient
  - Single batch URI
- Stores encrypted batch metadata on server
- Tracks payout executions with status, txid, and paid timestamp
- Includes a transaction history page with filters and summary metrics

## Core flow

1. Click `Create Payroll Batch`
2. Unlock existing vault or create a new one
3. Add employees manually or import CSV
4. Review, validate, and generate batch
5. Use QR/URI for execution (single or batch mode)
6. Mark paid with txid and track progress in history

## CSV format

Required headers:

- `name`
- `wallet`
- `amount`
- `currency`

Optional headers:

- `payout_rail` (`ZEC` or `USDC_NEAR_INTENT`)
- `test_tx_required` (`true` / `false`, defaults to `true`)

Example:

```csv
name,wallet,amount,currency,payout_rail,test_tx_required
Alice,zs1...,100,USD,ZEC,true
Bob,u1...,0.5,ZEC,ZEC,true
Nina,nina.near,250,USDC,USDC_NEAR_INTENT,false
```

## Tech stack

- Next.js (App Router) + React + TypeScript
- Tailwind CSS
- Prisma + PostgreSQL
- Client-side crypto with Web Crypto API (PBKDF2 + AES-GCM)

## Security model

- Vault passphrase is entered and used in-browser
- Vault marker data is encrypted in localStorage
- Payroll payloads are encrypted client-side before API storage
- Server stores ciphertext + IV + salt + minimal metadata

## Project structure

- `app/page.tsx`: main payroll flow
- `app/history/page.tsx`: transaction history dashboard
- `app/api/batches/route.ts`: encrypted batch persistence
- `app/api/executions/route.ts`: payout execution listing/creation
- `app/api/executions/[id]/route.ts`: row status/txid updates
- `hooks/usePayroll.ts`: orchestration and UI flow state
- `utils/payroll.ts`: validation and URI generation helpers
- `utils/crypto.ts`: encryption/decryption helpers

## Local setup

```bash
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

Open: `http://localhost:3000`

## Environment variables

Use either:

- `DATABASE_URL`
- `DB_URL`

Example:

```env
DATABASE_URL=postgresql://...
```

## Useful commands

```bash
npm run prisma:generate
npm run prisma:migrate
npx tsc --noEmit
```
