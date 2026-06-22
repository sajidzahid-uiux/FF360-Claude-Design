# Button Component API

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `title` | `string` | - | Visible button text (not the HTML tooltip). Omit when `iconOnly` is true — use `aria-label` instead. |
| `variant` | `ButtonVariant` | `ButtonVariantEnum.DEFAULT` | Visual variant |
| `size` | `ComponentSize` | `ComponentSizeEnum.MD` | Size |
| `fullWidth` | `boolean` | `false` | Stretch to container width |
| `loading` | `boolean` | `false` | Shows spinner and disables button |
| `leftIcon` | `ReactNode` | - | Icon on the left |
| `rightIcon` | `ReactNode` | - | Icon on the right |
| `iconOnly` | `boolean` | `false` | Square icon-only control. Do not pass `title`; TypeScript forbids it and dev builds log an error if `title` is supplied. |
| `disabled` | `boolean` | `false` | Disabled state |
| `className` | `string` | - | Additional classes |
| ...props | `ButtonHTMLAttributes<HTMLButtonElement>` | - | Native button props |

## Variants

Use `ButtonVariantEnum` values:

- `DEFAULT`
- `COLORED` (uses CSS vars `--btn-colored-bg` and optional `--btn-colored-fg`)
- `ACCENT` (uses current theme accent color)
- `GHOST`
- `DELETE`
- `DANGER`

```tsx
import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from '@fieldflow360/org-ui';

<Button title="Default" variant={ButtonVariantEnum.DEFAULT} />
<Button title="Accent" variant={ButtonVariantEnum.ACCENT} />
<Button
  title="Custom"
  variant={ButtonVariantEnum.COLORED}
  style={{ ['--btn-colored-bg' as string]: '#7dd3fc', ['--btn-colored-fg' as string]: '#0b1623' }}
/>
<Button title="Danger" variant={ButtonVariantEnum.DANGER} size={ComponentSizeEnum.SM} />
```

## Sizes

Use `ComponentSizeEnum`:

- `SM`
- `MD`
- `LG`

## Accessibility

- Icon-only buttons must include `aria-label` (and must not use the `title` prop for a label — in org-ui, `title` is visible text only).
- Keyboard usage: `Tab` to focus, `Enter` / `Space` to trigger.

## Migration notes

- Old `white` variant was replaced by `colored`.
- Prefer enums over string literals for `variant` and `size`.
