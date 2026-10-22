import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, mkdirSync, copyFileSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import test from "node:test";

test("release guard rejects feature branches, dirty source, and wrong targets", () => {
  const cwd = mkdtempSync(join(tmpdir(), "dgpt-release-"));
  const git = (...args) => execFileSync("git", args, { cwd, stdio: "pipe" });
  const check = target => spawnSync(process.execPath, ["scripts/check-release.mjs", target], { cwd, encoding: "utf8" });
  try {
    mkdirSync(join(cwd, "scripts")); mkdirSync(join(cwd, ".openai"));
    copyFileSync(new URL("../scripts/check-release.mjs", import.meta.url), join(cwd, "scripts/check-release.mjs"));
    writeFileSync(join(cwd, "environments.json"), JSON.stringify({ production: { projectId: "prod" }, qa: { projectId: "qa" } }));
    writeFileSync(join(cwd, ".openai/hosting.json"), JSON.stringify({ project_id: "prod" }));
    git("init", "-b", "main"); git("config", "user.name", "Test"); git("config", "user.email", "test@example.invalid");
    git("add", "."); git("commit", "-m", "fixture"); git("update-ref", "refs/remotes/origin/main", "HEAD");
    assert.equal(check("production").status, 0);
    assert.notEqual(check("qa").status, 0);
    git("switch", "-c", "codex/feature");
    assert.match(check("production").stderr, /must come from main/);
    git("switch", "main"); writeFileSync(join(cwd, "change.txt"), "change");
    assert.match(check("production").stderr, /working-tree changes/);
    git("add", "."); git("commit", "-m", "unpublished");
    assert.match(check("production").stderr, /must match origin/);
    writeFileSync(join(cwd, ".openai/hosting.json"), JSON.stringify({ project_id: "qa" }));
    git("add", "."); git("commit", "-m", "QA target");
    assert.equal(check("qa").status, 0);
    assert.match(check("production").stderr, /hosting project/);
  } finally { rmSync(cwd, { recursive: true, force: true }); }
});
