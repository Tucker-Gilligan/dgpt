# Release workflow

Production is the existing public DGPT site. QA is a separate private Sites project, with its own database. A Git branch alone is not an environment.

1. Start a feature branch from current main (`codex/<feature>`).
2. Implement and test locally. Keep the production hosting manifest in the source repository.
3. Prepare an isolated QA checkout of the feature. Change only its hosting project identity to the registered QA ID, commit that target configuration in the QA checkout, and run the QA release check. Never merge that QA configuration commit into main.
4. Package and deploy to the QA project using the Sites workflow. Review layout, mobile behavior, links, and admin behavior there. QA starts with defaults; production content and credentials are not copied.
5. Merge the approved source changes into main and push to GitHub. Fetch origin and run `npm run release:check -- production` and `npm test`.
6. Snapshot production `/api/content`, compare source with the currently live version, and package from clean main using the Sites workflow. Publish the exact saved version, verify deployment success, and compare public content after release. Investigate differences without overwriting edits.
7. Record the published commit and version. To undo code changes, revert on main and repeat the release process. Database migrations require a separate forward repair plan.

The release check verifies branch, clean working tree, origin/main alignment, and project identity. Direct hosting tool calls can bypass it; it is not a server-side restriction. GitHub branch protection and automated deployment credentials would be additional infrastructure controls.

Admin content is separate from code. The existing editor still needs concurrent-edit protection, successful-load gating, and versioned content backups. Environment separation does not fix those limitations.
