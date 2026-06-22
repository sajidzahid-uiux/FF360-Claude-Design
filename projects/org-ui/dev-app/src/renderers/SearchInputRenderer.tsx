import { SearchInput } from '@fieldflow360/org-ui';
import { useState } from 'react';
import { CodePreview } from '../ui-app/ui-app-components';
import { Section } from '../ui-app/ui-app-components/Section';

export const SearchInputRenderer = () => {
  const [value, setValue] = useState('');

  return (
    <Section>
      <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
        SearchInput
      </h2>
      <CodePreview
        title="SearchInput usage"
        code={`const [value, setValue] = useState('');

<SearchInput
  value={value}
  onChange={(e) => setValue(e.target.value)}
  onClear={() => setValue('')}
  placeholder="Search..."
/>`}
      />
      <div className="max-w-md">
        <SearchInput
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onClear={() => setValue('')}
          placeholder="Search..."
        />
      </div>
    </Section>
  );
};
