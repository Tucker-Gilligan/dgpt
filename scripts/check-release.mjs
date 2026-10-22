import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

const git = (...args) => execFileSync("git", args, { encoding: "utf8" }).trim();
const fail = message => { console.error(`Release blocked: ${message}`); process.exit(1); };
const target = process.argv[2];
if (target !== "production" && target !== "qa") fail("specify production or qa.");
const environments = JSON.parse(readFileSync(new URL("../environments.json", import.meta.url)));
const manifest = JSON.parse(readFileSync(".openai/hosting.json", "utf8"));
if (!environments[target]?.projectId || manifest.project_id !== environments[target].projectId) {
  fail(`hosting project does not match ${target}.`);
}
if (git("status", "--porcelain")) fail("commit or remove working-tree changes first.");
const branch = git("branch", "--show-current");
if (!branch) fail("use a named branch.");
if (target === "production") {
  if (branch !== "main") fail("production releases must come from main.");
  if (git("rev-parse", "HEAD") !== git("rev-parse", "refs/remotes/origin/main")) {
    fail("main must match origin/main; fetch, reconcile, and push first.");
  }
}
console.log(`Release check passed: ${target}, ${branch}, ${git("rev-parse", "HEAD")}`);
