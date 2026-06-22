import fs from "fs";
import path from "path";

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (["node_modules", ".next", "dist"].includes(entry.name)) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.tsx$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

const root = process.cwd();
const files = walk(root).map((f) => path.relative(root, f));
const corpus = files
  .filter((f) => !f.includes("__tests__") && !/\.(test|spec)\.tsx$/.test(f))
  .map((f) => ({ f, c: fs.readFileSync(path.join(root, f), "utf8") }));

function isRouteEntry(f) {
  return /\/(page|layout|loading|error|not-found|template|default)\.tsx$/.test(f);
}

function isUsed(target) {
  const noExt = target.replace(/\.tsx$/, "");
  const base = path.basename(noExt);
  const alias = `@/${noExt.replace(/\\/g, "/")}`;

  for (const { f, c } of corpus) {
    if (f === target) continue;
    if (c.includes(`"${alias}"`) || c.includes(`'${alias}'`)) return true;
    if (c.includes(`/${noExt.replace(/\\/g, "/")}"`)) return true;
    if (/^[A-Z]/.test(base)) {
      if (new RegExp(`<${base}[\\s/>]`).test(c)) return true;
      if (new RegExp(`\\b${base}\\s*[,}]`).test(c) && c.includes("import")) return true;
    }
  }
  return false;
}

const unused = corpus.map(({ f }) => f).filter((f) => !isRouteEntry(f) && !isUsed(f));
unused.sort();
for (const f of unused) console.log(f);
console.log(`\nTotal potentially unused: ${unused.length}`);
