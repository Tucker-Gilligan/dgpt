# DGPT release rules

- Production may be published only from `main`, with a clean checkout matching freshly fetched `origin/main`. Never publish a feature branch to the production Sites project.
- Feature work belongs on `codex/<feature>` branches. Publish previews only to the separate QA project listed in `environments.json`. Every Sites URL is a deployment; the production project is never a preview target.
- Before production: fetch origin, run `npm run release:check -- production`, run `npm test`, compare the diff against the currently live source, and verify the reviewed QA change is the one being released. Use the Sites skill for packaging and publication. Run the release check again if source or target changes.
- Before QA: use an isolated checkout with the QA project ID in `.openai/hosting.json`; run `npm run release:check -- qa` and `npm test`. Never change the production checkout's manifest to target QA.
- Keep production and QA databases, credentials, and admin content separate. Do not copy QA content or credentials into production. Code release/rollback is not content restoration.
- Read and save a snapshot of public `/api/content` before a production release and compare afterward. Never write snapshots back automatically; concurrent administrator edits may be legitimate.
- Preserve admin-driven fields in the page. Do not replace them with hardcoded text. Do not modify normalization/migration rules or seed production content as part of unrelated layout work.
- Once a feature is reviewed in QA, merge into main, push main to GitHub, then release that exact source to production. Production rollback also goes through main: revert the change, test, and publish. An urgent saved-version rollback requires an explicit user instruction and subsequent main reconciliation.
- These are repository/process guards, not hosting-side access controls. Do not claim branch protection is enforced by Sites.

- Run `npm run content:snapshot -- production outputs/pre-release.json` before production and `npm run content:verify -- production outputs/pre-release.json` afterward. Resolve differences without overwriting administrator edits. Keep the PATCH revision check and history triggers in every release and rollback. QA is currently public by explicit user request.
