import { colors, toAccentLight, useTheme } from '@fieldflow360/org-ui';
import { Section } from '../ui-app/ui-app-components/Section';

type TokenEntry = { name: string; value: string };

const tokenGroups: Array<{ title: string; tokens: TokenEntry[] }> = [
  {
    title: 'Base Tokens',
    tokens: [
      { name: '--color-accent', value: colors.accent },
      { name: '--color-accent-light', value: toAccentLight(colors.accent) },
      { name: '--color-black', value: colors.black },
      { name: '--color-white', value: colors.white },
    ],
  },
  {
    title: 'Feedback Tokens',
    tokens: [
      { name: '--color-feedback-error', value: colors.feedback.error.base },
      { name: '--color-feedback-error-soft', value: colors.feedback.error.soft },
      { name: '--color-feedback-error-strong', value: colors.feedback.error.strong },
      { name: '--color-feedback-success', value: colors.feedback.success.base },
      { name: '--color-feedback-success-soft', value: colors.feedback.success.soft },
      { name: '--color-feedback-success-text', value: colors.feedback.success.text },
    ],
  },
  {
    title: 'Light Semantic Tokens',
    tokens: [
      { name: '--color-bg-app', value: colors.semantic.light.bgApp },
      { name: '--color-bg-main', value: colors.semantic.light.bgMain },
      { name: '--color-bg-surface', value: colors.semantic.light.bgSurface },
      { name: '--color-bg-surface-elevated', value: colors.semantic.light.bgSurfaceElevated },
      { name: '--color-bg-hover', value: colors.semantic.light.bgHover },
      { name: '--color-text-primary', value: colors.semantic.light.textPrimary },
      { name: '--color-text-secondary', value: colors.semantic.light.textSecondary },
      { name: '--color-text-muted', value: colors.semantic.light.textMuted },
      { name: '--color-text-inverse', value: colors.semantic.light.textInverse },
      { name: '--color-border', value: colors.border },
      { name: '--color-border-subtle', value: colors.semantic.light.borderSubtle },
      { name: '--color-border-strong', value: colors.semantic.light.borderStrong },
    ],
  },
  {
    title: 'Dark Semantic Tokens',
    tokens: [
      { name: '--color-bg-app', value: colors.semantic.dark.bgApp },
      { name: '--color-bg-main', value: colors.semantic.dark.bgMain },
      { name: '--color-bg-surface', value: colors.semantic.dark.bgSurface },
      { name: '--color-bg-surface-elevated', value: colors.semantic.dark.bgSurfaceElevated },
      { name: '--color-bg-hover', value: colors.semantic.dark.bgHover },
      { name: '--color-text-primary', value: colors.semantic.dark.textPrimary },
      { name: '--color-text-secondary', value: colors.semantic.dark.textSecondary },
      { name: '--color-text-muted', value: colors.semantic.dark.textMuted },
      { name: '--color-text-inverse', value: colors.semantic.dark.textInverse },
      { name: '--color-border', value: colors.semantic.dark.border },
      { name: '--color-border-subtle', value: colors.semantic.dark.borderSubtle },
      { name: '--color-border-strong', value: colors.semantic.dark.borderStrong },
    ],
  },
  {
    title: 'Night Semantic Tokens',
    tokens: [
      { name: '--color-bg-app', value: colors.semantic.night.bgApp },
      { name: '--color-bg-main', value: colors.semantic.night.bgMain },
      { name: '--color-bg-surface', value: colors.semantic.night.bgSurface },
      { name: '--color-bg-surface-elevated', value: colors.semantic.night.bgSurfaceElevated },
      { name: '--color-bg-hover', value: colors.semantic.night.bgHover },
      { name: '--color-text-primary', value: colors.semantic.night.textPrimary },
      { name: '--color-text-secondary', value: colors.semantic.night.textSecondary },
      { name: '--color-text-muted', value: colors.semantic.night.textMuted },
      { name: '--color-text-inverse', value: colors.semantic.night.textInverse },
      { name: '--color-border', value: colors.semantic.night.border },
      { name: '--color-border-subtle', value: colors.semantic.night.borderSubtle },
      { name: '--color-border-strong', value: colors.semantic.night.borderStrong },
    ],
  },
];

export const ThemeTokensRenderer = () => {
  const { accentColor } = useTheme();
  const liveAccent = accentColor || colors.accent;
  const liveAccentLight = toAccentLight(liveAccent);

  const resolvedGroups: Array<{ title: string; tokens: TokenEntry[] }> = tokenGroups.map((group) => ({
    ...group,
    tokens: group.tokens.map((token) => {
      if (token.name === '--color-accent') {
        return { ...token, value: liveAccent };
      }
      if (token.name === '--color-accent-light') {
        return { ...token, value: liveAccentLight };
      }
      return token;
    }),
  }));

  return (
    <Section>
      <h2 className="mb-2 text-2xl font-semibold text-black dark:text-white night:text-white">
        Theme Color Tokens
      </h2>
      <p className="mb-6 text-sm text-zinc-600 dark:text-zinc-300 night:text-slate-300">
        Tile Design-aligned tokens from `@fieldflow360/org-ui` theme for migration.
      </p>

      <div className="space-y-6">
        {resolvedGroups.map((group) => (
          <div key={group.title} className="rounded-xl border border-border-subtle bg-bg-surface-elevated p-4">
            <h3 className="mb-3 text-sm font-semibold text-text-primary">{group.title}</h3>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {group.tokens.map((token) => (
                <div
                  key={`${group.title}-${token.name}`}
                  className="flex items-center justify-between gap-3 rounded-lg border border-border-subtle/60 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-xs font-medium text-text-primary">{token.name}</p>
                    <p className="text-xs text-text-muted">{token.value}</p>
                  </div>
                  <span
                    className="h-6 w-6 shrink-0 rounded border border-border-subtle"
                    style={{ backgroundColor: token.value }}
                    aria-hidden="true"
                  />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Section>
  );
};

