/** @type {import('next').NextConfig} */
/* eslint-disable @typescript-eslint/no-require-imports */
const path = require("node:path");

// Next config runs in Node before TypeScript aliases/transforms are available.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { buildAppRedirects } = require("./shared/config/routes");

/** Client ESM build — avoids react-hook-form's react-server export in SSR graphs. */
const reactHookFormEsm = "node_modules/react-hook-form/dist/index.esm.mjs";
const reactHookFormWebpack = path.join(__dirname, reactHookFormEsm);
/** Turbopack requires project-relative aliases (absolute paths break resolution). */
const reactHookFormTurbopack = `./${reactHookFormEsm}`;

/**
 * LOCAL PROTOTYPE: when NEXT_PUBLIC_USE_MOCK_DATA === "true", alias
 * @auth0/auth0-react to a local mock so the app is always authenticated and
 * never redirects to the (unconfigured) Auth0 tenant. See mocks/auth0-react.tsx.
 */
const USE_MOCK_DATA = process.env.NEXT_PUBLIC_USE_MOCK_DATA === "true";
const auth0MockWebpack = path.join(__dirname, "mocks/auth0-react.tsx");
const auth0MockTurbopack = "./mocks/auth0-react.tsx";

const parseCSPDomains = (envVar) => {
  if (!envVar) return [];
  return envVar
    .split(",")
    .map((d) => d.trim())
    .filter(Boolean);
};

const mergeDomains = (...lists) => {
  const seen = new Set();
  const merged = [];
  for (const list of lists) {
    for (const domain of list) {
      if (!domain || seen.has(domain)) continue;
      seen.add(domain);
      merged.push(domain);
    }
  }
  return merged;
};

const parseHostnameFromUrl = (rawUrl) => {
  if (!rawUrl?.trim()) return "";
  try {
    const url = rawUrl.includes("://") ? rawUrl : `https://${rawUrl}`;
    return new URL(url).hostname;
  } catch {
    return "";
  }
};

const parseOriginFromUrl = (rawUrl) => {
  if (!rawUrl?.trim()) return "";
  try {
    const url = rawUrl.includes("://") ? rawUrl : `https://${rawUrl}`;
    return new URL(url).origin;
  } catch {
    return "";
  }
};

const buildCSP = () => {
  const cspEnabled = process.env.CSP_ENABLED !== "false";

  if (!cspEnabled) {
    console.warn("⚠️  CSP is disabled via CSP_ENABLED env var");
    return null;
  }

  const apiDomain =
    process.env.CSP_API_DOMAIN?.trim() ||
    parseHostnameFromUrl(process.env.NEXT_PUBLIC_API_URL || "");
  const scriptSources = mergeDomains(
    ["cdn.jsdelivr.net"],
    parseCSPDomains(process.env.CSP_SCRIPT_SOURCES || "")
  );
  const analyticsDomains = parseCSPDomains(
    process.env.CSP_ANALYTICS_DOMAINS || ""
  );
  const imgSources = parseCSPDomains(process.env.CSP_IMG_SOURCES || "");
  const styleSources = parseCSPDomains(process.env.CSP_STYLE_SOURCES || "");
  const fontSources = parseCSPDomains(process.env.CSP_FONT_SOURCES || "");
  const connectSources = parseCSPDomains(process.env.CSP_CONNECT_SOURCES || "");
  const frameSources = parseCSPDomains(process.env.CSP_FRAME_SOURCES || "");
  const manifestDomains = parseCSPDomains(
    process.env.CSP_MANIFEST_DOMAIN || ""
  );

  const isDev = process.env.NODE_ENV === "development";
  const scriptSrc = [
    "'self'",
    "'unsafe-inline'",
    "'wasm-unsafe-eval'",
    ...(isDev ? ["'unsafe-eval'"] : []),
    ...scriptSources.map((d) => `https://${d}`),
  ].join(" ");

  const connectSrcParts = [
    "'self'",
    "data:",
    ...(apiDomain ? [`https://${apiDomain}`, `wss://${apiDomain}`] : []),
    ...analyticsDomains.map((d) => `https://${d}`),
    ...connectSources.map((d) => `https://${d}`),
  ];

  if (isDev) {
    const apiOrigin = parseOriginFromUrl(process.env.NEXT_PUBLIC_API_URL || "");
    const wsOrigin = parseOriginFromUrl(process.env.NEXT_PUBLIC_WS_URL || "");
    for (const origin of [apiOrigin, wsOrigin]) {
      if (origin && !connectSrcParts.includes(origin)) {
        connectSrcParts.push(origin);
      }
    }
  }

  const directives = [
    "default-src 'self'",
    `script-src ${scriptSrc}`,
    `style-src 'self' 'unsafe-inline' ${styleSources.map((d) => `https://${d}`).join(" ")}`,
    `img-src 'self' data: blob: https: ${imgSources.map((d) => `https://${d}`).join(" ")}`,
    `font-src 'self' data: ${fontSources.map((d) => `https://${d}`).join(" ")}`,
    `connect-src ${connectSrcParts.join(" ")}`,
    `frame-src 'self' ${frameSources.map((d) => `https://${d}`).join(" ")}`,
    `manifest-src 'self' ${manifestDomains.map((d) => `https://${d}`).join(" ")}`,
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ];

  const cspValue = directives.filter(Boolean).join("; ");
  return cspValue;
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  outputFileTracingRoot: __dirname,
  reactStrictMode: true,
  // LOCAL PROTOTYPE: don't fail the production (Netlify) build on pre-existing
  // type errors in the large CMS codebase. Only relaxed in mock mode.
  // (Next 16 removed the `eslint` config key; lint no longer runs during build.)
  typescript: { ignoreBuildErrors: USE_MOCK_DATA },
  // transpilePackages: ["@fieldflow360/org-ui"],
  turbopack: {
    root: __dirname,
    resolveAlias: {
      "react-hook-form": reactHookFormTurbopack,
      ...(USE_MOCK_DATA
        ? { "@auth0/auth0-react": auth0MockTurbopack }
        : {}),
    },
  },
  webpack: (config) => {
    // org-ui uses useForm; avoid react-hook-form's react-server export in SSR graphs.
    config.resolve ??= {};
    config.resolve.alias = {
      ...config.resolve.alias,
      "react-hook-form": reactHookFormWebpack,
      ...(USE_MOCK_DATA ? { "@auth0/auth0-react": auth0MockWebpack } : {}),
    };
    return config;
  },

  async redirects() {
    const base = buildAppRedirects();
    // LOCAL PROTOTYPE: land on the prototyping hub by default instead of the
    // CMS auth/dashboard flow. Only active in mock mode.
    if (USE_MOCK_DATA) {
      return [{ source: "/", destination: "/hub", permanent: false }, ...base];
    }
    return base;
  },

  async headers() {
    const csp = buildCSP();

    const headers = [
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(self)",
      },
    ];

    if (csp) {
      headers.unshift({
        key: "Content-Security-Policy",
        value: csp,
      });
    }

    return [
      {
        source: "/:path*",
        headers,
      },
    ];
  },
};

module.exports = nextConfig;
