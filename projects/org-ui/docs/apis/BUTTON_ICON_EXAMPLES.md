# Button with Icons - Usage Examples

The Button component now supports icons on the left, right, or as icon-only buttons.

## Basic Usage

### Left Icon

```tsx
import { Button } from "@fieldflow360/org-ui";

// Example with SVG icon
export default function Example() {
  return (
    <Button
      title="Add Item"
      leftIcon={
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 4v16m8-8H4"
          />
        </svg>
      }
    />
  );
}
```

### Right Icon

```tsx
import { Button } from "@fieldflow360/org-ui";

export default function Example() {
  return (
    <Button
      title="Next"
      rightIcon={
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      }
    />
  );
}
```

### Both Icons

```tsx
import { Button } from "@fieldflow360/org-ui";

export default function Example() {
  return (
    <Button
      title="Open Folder"
      leftIcon={<span>📁</span>}
      rightIcon={
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      }
    />
  );
}
```

### Icon-Only Button

Do not pass `title` with `iconOnly` — `title` is reserved for visible button text. Use `aria-label` for the accessible name.

```tsx
import { Button } from "@fieldflow360/org-ui";

export default function Example() {
  return (
    <Button
      iconOnly
      leftIcon={
        <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      }
      aria-label="Close"
    />
  );
}
```

## Using with React Icons Library

### Installation

```bash
npm install react-icons
```

### Examples

```tsx
import { Button } from "@fieldflow360/org-ui";
import {
  FiDownload,
  FiUpload,
  FiTrash2,
  FiEdit,
  FiSave,
  FiPlus,
  FiCheck,
  FiX,
} from "react-icons/fi";

export default function Example() {
  return (
    <div className="space-y-4">
      {/* Download button */}
      <Button leftIcon={<FiDownload />} title="Download" />

      {/* Upload button */}
      <Button leftIcon={<FiUpload />} variant="secondary" title="Upload" />

      {/* Delete button */}
      <Button leftIcon={<FiTrash2 />} variant="danger" title="Delete" />

      {/* Edit button */}
      <Button leftIcon={<FiEdit />} variant="outline" title="Edit" />

      {/* Save button */}
      <Button rightIcon={<FiSave />} variant="primary" title="Save Changes" />

      {/* Icon-only buttons */}
      <div className="flex gap-2">
        <Button iconOnly leftIcon={<FiPlus />} aria-label="Add" />
        <Button
          iconOnly
          leftIcon={<FiEdit />}
          variant="secondary"
          aria-label="Edit"
        />
        <Button
          iconOnly
          leftIcon={<FiTrash2 />}
          variant="danger"
          aria-label="Delete"
        />
        <Button
          iconOnly
          leftIcon={<FiCheck />}
          variant="outline"
          aria-label="Confirm"
        />
        <Button
          iconOnly
          leftIcon={<FiX />}
          variant="ghost"
          aria-label="Cancel"
        />
      </div>
    </div>
  );
}
```

## Using with Heroicons

### Installation

```bash
npm install @heroicons/react
```

### Examples

```tsx
import { Button } from "@fieldflow360/org-ui";
import {
  PlusIcon,
  TrashIcon,
  PencilIcon,
  CheckIcon,
  XMarkIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

export default function Example() {
  return (
    <div className="space-y-4">
      {/* With Heroicons */}
      <Button leftIcon={<PlusIcon className="h-5 w-5" />} title="Add New" />

      <Button leftIcon={<PencilIcon className="h-5 w-5" />} variant="secondary" title="Edit" />

      <Button leftIcon={<TrashIcon className="h-5 w-5" />} variant="danger" title="Delete" />

      {/* Navigation buttons */}
      <div className="flex gap-2">
        <Button
          title="Previous"
          leftIcon={<ArrowLeftIcon className="h-5 w-5" />}
          variant="outline"
        />
        <Button
          title="Next"
          rightIcon={<ArrowRightIcon className="h-5 w-5" />}
          variant="outline"
        />
      </div>

      {/* Icon-only toolbar */}
      <div className="flex gap-2">
        <Button iconOnly leftIcon={<PlusIcon />} size="sm" aria-label="Add" />
        <Button
          iconOnly
          leftIcon={<PencilIcon />}
          size="sm"
          variant="ghost"
          aria-label="Edit"
        />
        <Button
          iconOnly
          leftIcon={<TrashIcon />}
          size="sm"
          variant="ghost"
          aria-label="Delete"
        />
        <Button
          iconOnly
          leftIcon={<CheckIcon />}
          size="sm"
          variant="ghost"
          aria-label="Confirm"
        />
        <Button
          iconOnly
          leftIcon={<XMarkIcon />}
          size="sm"
          variant="ghost"
          aria-label="Cancel"
        />
      </div>
    </div>
  );
}
```

## Using with Lucide React

### Installation

```bash
npm install lucide-react
```

### Examples

```tsx
import { Button } from "@fieldflow360/org-ui";
import {
  Download,
  Upload,
  Trash2,
  Edit,
  Save,
  Plus,
  Check,
  X,
  ChevronRight,
  ChevronLeft,
  Mail,
  Share2,
} from "lucide-react";

export default function Example() {
  return (
    <div className="space-y-4">
      {/* Action buttons */}
      <Button leftIcon={<Download size={20} />} title="Download" />

      <Button leftIcon={<Upload size={20} />} variant="secondary" title="Upload" />

      <Button leftIcon={<Mail size={20} />} variant="outline" title="Send Email" />

      <Button rightIcon={<Share2 size={20} />} variant="ghost" title="Share" />

      {/* Different sizes */}
      <div className="flex gap-2 items-center">
        <Button leftIcon={<Save size={16} />} size="sm" title="Save" />
        <Button leftIcon={<Save size={20} />} size="md" title="Save" />
        <Button leftIcon={<Save size={24} />} size="lg" title="Save" />
      </div>

      {/* Icon-only with different sizes */}
      <div className="flex gap-2 items-center">
        <Button
          iconOnly
          leftIcon={<Plus size={16} />}
          size="sm"
          aria-label="Add"
        />
        <Button
          iconOnly
          leftIcon={<Plus size={20} />}
          size="md"
          aria-label="Add"
        />
        <Button
          iconOnly
          leftIcon={<Plus size={24} />}
          size="lg"
          aria-label="Add"
        />
      </div>
    </div>
  );
}
```

## Loading State with Icons

When a button is in loading state, the loading spinner replaces any left icon:

```tsx
import { Button } from "@fieldflow360/org-ui";
import { Save } from "lucide-react";

export default function Example() {
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    await saveData();
    setLoading(false);
  };

  return (
    <Button
      title="Save Changes"
      leftIcon={<Save size={20} />}
      loading={loading}
      onClick={handleSave}
    />
  );
}
```

## Custom SVG Icons

```tsx
import { Button } from "@fieldflow360/org-ui";

// Custom icon component
const CustomIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M12 2L2 7l10 5 10-5-10-5z" />
    <path d="M2 17l10 5 10-5" />
    <path d="M2 12l10 5 10-5" />
  </svg>
);

export default function Example() {
  return <Button leftIcon={<CustomIcon />} title="Layers" />;
}
```

## Icon Sizes

The button automatically adjusts icon sizes based on the button size:

- **Small button (sm)**: Icons are sized at 16px (h-4 w-4)
- **Medium button (md)**: Icons are sized at 20px (h-5 w-5)
- **Large button (lg)**: Icons are sized at 24px (h-6 w-6)

```tsx
import { Button } from "@fieldflow360/org-ui";
import { Star } from "lucide-react";

export default function Example() {
  return (
    <div className="flex gap-4 items-center">
      <Button leftIcon={<Star />} size="sm" title="Small" />
      <Button leftIcon={<Star />} size="md" title="Medium" />
      <Button leftIcon={<Star />} size="lg" title="Large" />
    </div>
  );
}
```

## Accessibility

Always provide `aria-label` for icon-only buttons:

```tsx
import { Button } from '@fieldflow360/org-ui';
import { X } from 'lucide-react';

// ✅ Good - has aria-label
<Button iconOnly leftIcon={<X />} aria-label="Close dialog" />

// ❌ Bad - no accessible label
<Button iconOnly leftIcon={<X />} />

// ❌ Bad - `title` is visible text, not for icon-only labels (use aria-label)
<Button iconOnly title="Close" leftIcon={<X />} />
```

## Complete Example

```tsx
import { Button } from "@fieldflow360/org-ui";
import { Save, Trash2, Plus, Download, Upload, RefreshCw } from "lucide-react";

export default function ActionsToolbar() {
  return (
    <div className="flex flex-wrap gap-4">
      {/* Primary actions */}
      <div className="flex gap-2">
        <Button leftIcon={<Save />} variant="primary" title="Save" />
        <Button leftIcon={<Plus />} variant="secondary" title="Add New" />
      </div>

      {/* Secondary actions */}
      <div className="flex gap-2">
        <Button leftIcon={<Download />} variant="outline" title="Export" />
        <Button leftIcon={<Upload />} variant="outline" title="Import" />
      </div>

      {/* Icon-only actions */}
      <div className="flex gap-2">
        <Button
          iconOnly
          leftIcon={<RefreshCw />}
          variant="ghost"
          aria-label="Refresh"
        />
        <Button
          iconOnly
          leftIcon={<Trash2 />}
          variant="danger"
          aria-label="Delete"
        />
      </div>
    </div>
  );
}
```

## Best Practices

1. **Use consistent icon libraries** across your app
2. **Always provide aria-label** for icon-only buttons
3. **Use appropriate variants** - danger for destructive actions, primary for main actions
4. **Consider icon size** - the component auto-sizes icons, but you can override if needed
5. **Test with screen readers** to ensure accessibility
6. **Use semantic icons** that clearly represent the action
