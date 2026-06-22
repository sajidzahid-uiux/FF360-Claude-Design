# Installing `org-ui` package

This guide explains how to generate a `NODE_AUTH_TOKEN` and configure npm to install **`org-ui` package** inside the organization.

---

## 1. Create a Personal Access Token (Classic)

GitHub Packages (npm) **requires a Classic PAT**. Fine-grained tokens will not work.

### Steps

1. Open **GitHub → Settings**
2. Go to **Developer settings**
3. Open **Personal access tokens → Tokens (classic)**
4. Click **Generate new token (classic)**

### Token configuration

- **Note**: `npm-github-packages`
- **Expiration**: choose any (90 days recommended)

#### Select scopes

- ✅ **repo** – required for private packages
- ✅ **read:packages** – required to download packages

Do **not** select `write:packages` unless you publish packages.

Click **Generate token** and **copy it immediately**.

---

## 2. Set the Token as `NODE_AUTH_TOKEN`

### Linux / macOS (bash, zsh)

```bash
export NODE_AUTH_TOKEN="ghp_YOUR_TOKEN_HERE"
```

### Windows

```bash
$env:NODE_AUTH_TOKEN="ghp_YOUR_TOKEN_HERE"
```

---

## 3. Configure npm to use GitHub Packages

Create a .npmrc file next to the package.json of the app that installs the package.

```bash
@fieldflow360:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${NODE_AUTH_TOKEN}
always-auth=true
```

Do NOT commit tokens into .npmrc.

---

## 4. Verify Authentication

```bash
npm whoami --registry=https://npm.pkg.github.com
```
---

## 5. Install the Private Package

```bash
npm install @fieldflow360/org-ui
```
---

## 6. Troubleshooting

```bash
npm config get @fieldflow360:registry
```
expected output:
```bash
https://npm.pkg.github.com
```
If undefined, .npmrc is not being read.