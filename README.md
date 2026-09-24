# Pairwise

A minimal interview practice dashboard for MAANG + Atlassian. Next.js, React, TypeScript, Supabase. No company filter.

## Local preview

Requires Node 20.9+.

```sh
npm install
npm run dev
```

Open http://localhost:3000. On PowerShell systems that block npm.ps1, use `npm.cmd` instead of `npm`.

Without environment variables, the dashboard runs as a clearly labelled local preview. Solved problems and the current pair persist in this browser. Storage failures are surfaced; unsaved changes are not presented as saved. Preview progress is separate from account progress.

## Enable Google login and cross-device progress

1. Create a Supabase project and run `supabase/schema.sql` in its SQL editor once. Row-level security restricts progress to its owner.
2. In Google Cloud, configure an OAuth consent screen and a Web application OAuth client. Use the callback URL shown in Supabase Authentication → Providers → Google as the authorized redirect URI. Configure test users if the consent screen is in testing mode.
3. Enable Google in Supabase Authentication → Providers and enter the Google client ID and secret there. Never put the Google secret or a Supabase service-role key in this app.
4. In Supabase Authentication → URL Configuration, add `http://localhost:3000` to allowed redirect URLs. Set your production Site URL and allow the production origin when deploying.
5. Copy `.env.example` to `.env.local`. Set the project URL and public anon key from Supabase project settings. Restart the server.

The app uses the Supabase browser client with PKCE. OAuth returns to the app origin, where the client processes the callback and loads account progress. With Supabase configured, signed-out visitors see the login prompt and can explicitly choose local preview. Sign-out returns to the signed-out state. Progress updates are saved before appearing as complete.

Official setup reference: https://supabase.com/docs/guides/auth/social-login/auth-google

## Practice behavior

- 32 starter problems, arranged into 16 topic-oriented pairs.
- Next/previous skip fully solved pairs. Unfinished pairs remain available through the collection.
- Mark done is reversible. Solving the whole bank shows a completion screen and a revision option.
- Collection entries allow returning to a specific pair, including solved pairs for revision.
- Sources are linked in the collection. Most problems are general interview foundations based on the LeetCode Top Interview 150 study plan; the last two link to reported Atlassian interview experiences. The starter bank is not a verified MAANG-wide company-frequency dataset and makes no per-company frequency claims. GFG links open explanatory problem articles, which may include solutions.
- Only original short prompts, titles and links are included; problem statements are not copied.

## Feedback

The footer includes a Feedback form with a category, message (up to 1,500 characters), and the current practice pair. The selected destination for this project is GitHub Issues. After connecting the repository, set `NEXT_PUBLIC_FEEDBACK_GITHUB_REPO=owner/repository` in the deployment environment and rebuild. Keep `NEXT_PUBLIC_FEEDBACK_EMAIL` empty to use GitHub.

The button opens a prefilled GitHub issue draft; the visitor reviews and submits it on GitHub. They need a GitHub account and access to the repository's Issues. For public visitors, use a public repository with Issues enabled (a separate public feedback repository can be used if the app source remains private). The form warns that submitted issues may be public. It never posts automatically or claims delivery before submission. Until the repository is configured, a clearly labelled copy option is available. The message stays in component memory while opening and closing the form, and clears on page reload.

## Verification commands

```sh
npm test
npm run typecheck
npm run build
```

Real Google OAuth and database isolation require a configured Supabase project and must be verified with actual accounts before production. Google Fonts enhance typography; system fonts work when unavailable.
