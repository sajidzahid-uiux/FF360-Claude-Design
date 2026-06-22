# Contributing to @fieldflow360/org-ui

**Repository:** [https://github.com/fieldflow360/org-ui](https://github.com/fieldflow360/org-ui)

## Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/fieldflow360/org-ui.git
   cd org-ui
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start development mode:
   ```bash
   npm run dev
   ```

## Adding New Components

### Step 1: Create Component Structure

Create a new directory under `src/components/`:

```
src/components/YourComponent/
├── YourComponent.tsx
├── index.ts
└── YourComponent.test.tsx (optional)
```

### Step 2: Component Template

Use this template for new components:

```tsx
// src/components/YourComponent/YourComponent.tsx
import React from 'react';
import { cn } from '../../utils/cn';

export interface YourComponentProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Describe your prop here
   */
  variant?: 'default' | 'alternative';
  
  children: React.ReactNode;
}

export const YourComponent = React.forwardRef<HTMLDivElement, YourComponentProps>(
  ({ variant = 'default', className, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          'base-classes-here',
          variant === 'default' && 'default-variant-classes',
          variant === 'alternative' && 'alternative-variant-classes',
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

YourComponent.displayName = 'YourComponent';
```

### Step 3: Create Index File

```tsx
// src/components/YourComponent/index.ts
export { YourComponent } from './YourComponent';
export type { YourComponentProps } from './YourComponent';
```

### Step 4: Export from Main Index

Add to `src/index.ts`:

```tsx
export { YourComponent } from './components/YourComponent';
export type { YourComponentProps } from './components/YourComponent';
```

### Step 5: Create renderer for ne wComponent

1. Create `${NewComponentRenderer} in `dev-app/src/renderers`
2. Add to `dev-app/src/renderers/index.ts`
3. Add new renderer to `dev-app/src/ui-app/index.tsx`
4. Run `npm run dev` in `dev-app` folder to view and fix styles

### Step 6: Build and Test

```bash
npm run build
npm run type-check
```

### Step 7: Check component styles and importing in Consumer App

1. cd `consumer-app`
2. 1npm install --force`
3. `npm run dev`

## Component Guidelines

### 1. Use TypeScript

All components must be written in TypeScript with proper type definitions.

### 2. Use Tailwind CSS

- Use Tailwind utility classes for styling
- Use the `cn` utility for conditional classes
- Keep styles composable and overridable

### 3. Forward Refs

All components should use `React.forwardRef` to allow ref forwarding.

### 4. Accessibility

- Use semantic HTML elements
- Include proper ARIA attributes
- Ensure keyboard navigation works
- Test with screen readers

### 5. Props Interface

- Extend appropriate HTML element props
- Document all custom props with JSDoc comments
- Provide sensible defaults

### 6. Variants

- Use string literal types for variants
- Keep variant names consistent across components
- Document all available variants

## Code Style

### TypeScript

- Use explicit types for props
- Avoid `any` type
- Use proper generics when needed

### React

- Use functional components
- Use hooks appropriately
- Keep components focused and single-purpose

### CSS/Tailwind

- Use Tailwind utilities first
- Group related utilities
- Use responsive prefixes consistently
- Leverage Tailwind's design tokens

## Testing in a Next.js App

1. Build the library:
   ```bash
   npm run build
   ```

2. In your Next.js app, install the local package:
   ```bash
   npm install /path/to/FF-org-UI
   ```

3. Test your component thoroughly

4. Make changes and rebuild as needed

## Building

```bash
# Build once
npm run build

# Build in watch mode (recommended during development)
npm run dev
```

## Version Management

We use semantic versioning:
- **Major**: Breaking changes
- **Minor**: New features (backwards compatible)
- **Patch**: Bug fixes

Update version using npm:

```bash
npm version patch  # 0.1.0 → 0.1.1
npm version minor  # 0.1.1 → 0.2.0
npm version major  # 0.2.0 → 1.0.0
```

## Pull Request Process

1. Fork the repository on GitHub
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR-USERNAME/org-ui.git
   ```
3. Create a new branch for your feature/fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
4. Make your changes
5. Ensure all type checks pass: `npm run type-check`
6. Ensure linting passes: `npm run lint`
7. Build successfully: `npm run build`
8. Update documentation if needed
9. Commit your changes:
   ```bash
   git add .
   git commit -m "Description of your changes"
   ```
10. Push to your fork:
    ```bash
    git push origin feature/your-feature-name
    ```
11. Submit a pull request to the main repository: [https://github.com/fieldflow360/org-ui/pulls](https://github.com/fieldflow360/org-ui/pulls)
12. Once merged, maintainers will handle versioning

## Reporting Issues

Found a bug or have a feature request? Please open an issue:
[https://github.com/fieldflow360/org-ui/issues](https://github.com/fieldflow360/org-ui/issues)

## Questions?

- **Issues/Bugs:** [https://github.com/fieldflow360/org-ui/issues](https://github.com/fieldflow360/org-ui/issues)
- **General Questions:** Contact the FF Organization development team

