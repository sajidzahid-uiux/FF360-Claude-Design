/* eslint-disable */
/**
 * Next.js 16.1 Turbopack Symlink Resolver for AWS Amplify
 *
 * Next.js 16.1's Turbopack creates hashed symlinks for externalized packages
 * (e.g., pino-3de069a0e16ae0ec -> ../../node_modules/pino)
 *
 * AWS Amplify's bundler cannot handle these symlinks properly, causing
 * "EEXIST: file already exists" errors during deployment.
 *
 * This script resolves symlinks to real directories and copies their dependencies.
 */

const fs = require("fs");
const path = require("path");

const nextModules = path.join(__dirname, "..", ".next", "node_modules");
const rootModules = path.join(__dirname, "..", "node_modules");

function resolveDependencyPath(depName, parentPkgPath) {
  // Handle scoped packages (e.g., @react-pdf/renderer)
  const isScoped = depName.startsWith("@");
  let directPath;

  if (isScoped) {
    const [scope, pkg] = depName.split("/");
    directPath = path.join(rootModules, scope, pkg);
  } else {
    directPath = path.join(rootModules, depName);
  }

  try {
    const stat = fs.lstatSync(directPath);
    if (stat.isSymbolicLink()) {
      return fs.realpathSync(directPath);
    }
    if (stat.isDirectory()) {
      return directPath;
    }
  } catch {
    // Not found at root level
  }

  // For pnpm's isolated mode, check the parent package's node_modules
  if (parentPkgPath) {
    const parentNodeModules = path.dirname(parentPkgPath);
    let pnpmDepPath;

    if (isScoped) {
      const [scope, pkg] = depName.split("/");
      pnpmDepPath = path.join(parentNodeModules, scope, pkg);
    } else {
      pnpmDepPath = path.join(parentNodeModules, depName);
    }

    try {
      const stat = fs.lstatSync(pnpmDepPath);
      if (stat.isSymbolicLink()) {
        return fs.realpathSync(pnpmDepPath);
      }
      if (stat.isDirectory()) {
        return pnpmDepPath;
      }
    } catch {
      // Not found in parent's node_modules
    }
  }

  return null;
}

function copyPackageWithDeps(pkgPath, destPath, copiedSet, originalPkgPath) {
  const relativePath = path.relative(nextModules, destPath);
  const pkgKey = relativePath.replace(/\\/g, "/"); // Normalize path separators

  if (copiedSet.has(pkgKey)) {
    return 0;
  }

  copiedSet.add(pkgKey);

  console.log(`  Copying: ${relativePath}`);

  try {
    fs.cpSync(pkgPath, destPath, {
      recursive: true,
      dereference: true,
      force: true,
    });
  } catch (e) {
    console.error(`  Error copying ${relativePath}:`, e.message);
    return 0;
  }

  let count = 1;

  const pkgJsonPath = path.join(destPath, "package.json");
  if (fs.existsSync(pkgJsonPath)) {
    try {
      const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, "utf8"));
      const deps = Object.keys(pkg.dependencies || {});

      for (const dep of deps) {
        // Handle scoped packages
        let depDest;
        if (dep.startsWith("@")) {
          const [scope, pkg] = dep.split("/");
          depDest = path.join(nextModules, scope, pkg);
        } else {
          depDest = path.join(nextModules, dep);
        }

        const depKey = path.relative(nextModules, depDest).replace(/\\/g, "/");

        if (!fs.existsSync(depDest) && !copiedSet.has(depKey)) {
          const depSrc = resolveDependencyPath(dep, originalPkgPath || pkgPath);
          if (depSrc) {
            count += copyPackageWithDeps(depSrc, depDest, copiedSet, depSrc);
          } else {
            console.log(`  Warning: Could not find dependency ${dep}`);
          }
        }
      }
    } catch (e) {
      console.error(
        `  Error reading package.json for ${relativePath}:`,
        e.message
      );
    }
  }

  return count;
}

function findSymlinks(dir, baseDir = dir) {
  const symlinks = [];

  if (!fs.existsSync(dir)) {
    return symlinks;
  }

  try {
    const entries = fs.readdirSync(dir);

    for (const name of entries) {
      const fullPath = path.join(dir, name);
      let stat;

      try {
        stat = fs.lstatSync(fullPath);
      } catch (e) {
        // Skip if we can't stat the file
        continue;
      }

      if (stat.isSymbolicLink()) {
        symlinks.push(fullPath);
      } else if (stat.isDirectory()) {
        // Recursively check subdirectories (for scoped packages like @react-pdf)
        symlinks.push(...findSymlinks(fullPath, baseDir));
      }
    }
  } catch (e) {
    // If we can't read the directory, skip it
  }

  return symlinks;
}

function main() {
  if (!fs.existsSync(nextModules)) {
    console.log("No .next/node_modules directory found, skipping.");
    return;
  }

  console.log("Scanning for symlinks in .next/node_modules...");
  const symlinks = findSymlinks(nextModules);

  if (symlinks.length === 0) {
    console.log("No symlinks found.");
    return;
  }

  console.log(`Found ${symlinks.length} symlink(s) to resolve.\n`);

  let resolved = 0;
  const copiedSet = new Set();

  for (const linkPath of symlinks) {
    try {
      const stat = fs.lstatSync(linkPath);

      if (stat.isSymbolicLink()) {
        const target = fs.realpathSync(linkPath);
        const relativePath = path.relative(nextModules, linkPath);
        console.log(`Resolving: ${relativePath} -> ${target}`);

        fs.rmSync(linkPath, { recursive: true, force: true });
        copyPackageWithDeps(target, linkPath, copiedSet, target);
        resolved++;
      }
    } catch (e) {
      console.error(`Error resolving ${linkPath}:`, e.message);
    }
  }

  console.log(
    `\nResolved ${resolved} symlinks, copied ${copiedSet.size} packages total.`
  );
}

main();
