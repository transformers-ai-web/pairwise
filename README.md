# Pairwise

A minimal interview practice dashboard for MAANG + Atlassian. Next.js, React, TypeScript. No company filter.

## Local preview

Requires Node 20.9+.

```sh
npm install
npm run dev
```

Open http://localhost:3000. On PowerShell systems that block npm.ps1, use `npm.cmd` instead of `npm`.

Without Google OAuth configuration, the dashboard runs as a local preview. Signed-out progress stays in this browser. After sign-in, interview and GenAI progress are saved to the local PostgreSQL database for that Google account.

## Local Google sign-in and progress storage

1. Create a Google OAuth client in Google Cloud Console and add `http://localhost:3000` as an authorized JavaScript origin.
2. Add `http://localhost:3000/api/auth/callback/google` as an authorized redirect URI.
3. Set `AUTH_SECRET`, `AUTH_GOOGLE_ID`, and `AUTH_GOOGLE_SECRET` in `.env.local` using the values from Auth.js and Google Cloud.
4. Set `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD` to a running local PostgreSQL database.
5. On the first signed-in progress request, the app creates a `user_progress` table automatically. Rows are scoped by Google account ID and module (`interview` or `genai`). Existing browser progress is copied to the account the first time it signs in, if that account has no saved progress yet.

The app uses Auth.js JWT sessions, so it does not store OAuth sessions in PostgreSQL. PostgreSQL stores only per-user practice progress. Local PostgreSQL is for development; a deployed Vercel app will need a database reachable from Vercel.

## Practice behavior

- 32 starter problems, arranged into 16 topic-oriented pairs.
- Problems are numbered continuously across pairs. Next unlocks after both current problems are saved as solved; previous returns to the adjacent pair with its saved checkmarks. Navigation stops at the first and last pairs. Completed problems have a soft green background. All pairs remain available through the collection.
- Mark done is reversible. Solving the whole bank shows a completion screen and a revision option.
- Collection entries allow returning to a specific pair, including solved pairs for revision.
- Sources are linked in the collection. Most problems are general interview foundations based on the LeetCode Top Interview 150 study plan; the last two link to reported Atlassian interview experiences. The starter bank is not a verified MAANG-wide company-frequency dataset and makes no per-company frequency claims. GFG links open explanatory problem articles, which may include solutions.
- Only original short prompts, titles and links are included; problem statements are not copied.

## GenAI roadmap

The `/genai` route is a card-based interview roadmap covering foundations, transformers, embeddings, prompting, RAG, retrieval, fine-tuning, evaluation, agents, safety, inference, scaling, multimodal systems, MLOps, system design, and AI product thinking. Each card can be marked complete. Signed-in GenAI progress is stored separately from interview practice in PostgreSQL; signed-out progress stays in the browser.

## Feedback

The footer includes a Feedback form with a category, message (up to 1,500 characters), and the current practice pair. The form sends submissions through the server to the configured inbox. Set `RESEND_API_KEY`, `FEEDBACK_TO_EMAIL`, and `FEEDBACK_FROM_EMAIL` in the deployment environment.

The form posts to `/api/feedback`, which calls Resend from the server. The API key is never exposed to the browser. Configure and verify the sender address with Resend before deploying. If sending fails, the form falls back to copying the message. The message stays in component memory while opening and closing the form, and clears on page reload.

## Verification commands

```sh
npm test
npm run typecheck
npm run build
```

Google Fonts enhance typography; system fonts work when unavailable.
