# Ethereum Wallet Connect Example wallet app

This is a sample wallet with all other networks except ethereum deleted because the existing wallet connect wallet sample is very heavy.

## Getting started

Example is built atop of [NextJS](https://nextjs.org/)

1. Install dependencies `yarn install` or `npm install`

2. Setup your environment variables

```bash
cp .env.local.example .env.local
```

Your `.env.local` now contains the following environment variables:

- `NEXT_PUBLIC_PROJECT_ID` (placeholder) - You can generate your own ProjectId at https://cloud.walletconnect.com
- `NEXT_PUBLIC_RELAY_URL` (already set)

3. Run `yarn dev` or `npm run dev` to start local development