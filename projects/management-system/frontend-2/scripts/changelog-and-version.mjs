import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDir = path.resolve(__dirname, "..");
const pkgPath = path.join(frontendDir, "package.json");

function run(cmd, opts = {}) {
  execSync(cmd, { stdio: "inherit", cwd: frontendDir, ...opts });
}

function hasFrontendTag() {
  try {
    const out = execSync("git tag -l 'frontend-v*'", {
      encoding: "utf8",
      cwd: path.resolve(frontendDir, ".."),
    });
    return out.trim().length > 0;
  } catch {
    return false;
  }
}

if (hasFrontendTag()) {
  run("npm run changelog:generate");
} else {
  run("npm run changelog:generate:first");
}

run("npm version patch --no-git-tag-version");

const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf8"));
console.log("New version:", pkg.version);
