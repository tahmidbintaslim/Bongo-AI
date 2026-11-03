## What and why

<!-- What this changes and the problem it solves. Link the issue: "Closes #123". -->

## How it was checked

- [ ] `yarn lint`
- [ ] Each changed workspace builds (`yarn workspace @bongo-ai/<name> build`, the loop in `.github/workflows/ci-cd.yml`)
- [ ] `yarn test`

## Checklist

- [ ] The README, `.env.example` and `docs/` still match the code (new env vars, routes or limits are documented).
- [ ] User-facing strings have bn-BD and en-US versions in `packages/i18n`.
- [ ] No secrets, keys or tokens in the diff.
