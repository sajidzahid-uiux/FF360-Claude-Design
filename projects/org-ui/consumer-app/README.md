# Consumer App

This is a **consumer preview application** that demonstrates how to use `@fieldflow360/org-ui` library as a real consumer would.

## Overview

Unlike the `dev` folder which directly imports from source files, this preview app:

- Installs the library as a local NPM package (`file:..`)
- Imports components from the published package exports
- Uses Tailwind CSS v4 configuration as a consumer
- Demonstrates real-world integration patterns

## Running the Preview App

```bash
# First, build the library from the root
cd ..
npm run build

# Then install and run the preview app
cd consumer-app
npm install
npm run dev
```

The app will be available at `http://localhost:3002/`

## Tailwind CSS v4

This app uses Tailwind CSS v4 with:

- `@tailwindcss/vite` plugin for development
- CSS-based configuration using `@theme`
- Imported preset from the library

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

## Notes

After making changes to the library:

1. Rebuild the library: `cd .. && npm run build`
2. Reinstall in preview app: `npm install --force`
3. Restart the dev server
