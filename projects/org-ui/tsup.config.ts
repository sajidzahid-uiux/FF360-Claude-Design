import { defineConfig } from 'tsup';

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: [
    'react',
    'react-dom',
    'react-hook-form',
    '@hookform/resolvers',
    'zod',
    'lucide-react',
    'deck.gl',
    '@deck.gl/core',
    '@deck.gl/layers',
    'maplibre-gl',
    'react-map-gl',
    'recharts',
  ],
  treeshake: true,
  splitting: false,
  minify: false,
  esbuildOptions(options) {
    options.banner = {
      js: '"use client";',
    };
  },
});
