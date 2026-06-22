import { useState } from 'react';
import {
  Button,
  ButtonVariantEnum,
  ComponentSizeEnum,
} from '../../../src';
import { CodePreview } from '../ui-app/ui-app-components';
import { Section } from '../ui-app/ui-app-components/Section';

export const ButtonRenderer = () => {
  const [loading, setLoading] = useState(false);
  const [count, setCount] = useState(0);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      setCount(count + 1);
      setLoading(false);
    }, 1000);
  };

  return (
    <>
      <Section>
        <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
          Button Variants
        </h2>
        <CodePreview
          title="Button variants"
          code={`<Button title="Default" />
<Button title="Ghost" variant={ButtonVariantEnum.GHOST} />
<Button title="Danger" variant={ButtonVariantEnum.DANGER} />
<Button title="Accent" variant={ButtonVariantEnum.ACCENT} />`}
        />
        <div className="flex flex-wrap gap-4">
          <Button title="Default" variant={ButtonVariantEnum.DEFAULT} />
          <Button
            title="Surface"
            variant={ButtonVariantEnum.COLORED}
            backgroundColor="white"
            darkBackgroundColor="zinc-800"
          />
          <Button title="Hex fill" variant={ButtonVariantEnum.COLORED} backgroundColor="#93c5fd" />
          <Button title="Ghost" variant={ButtonVariantEnum.GHOST} />
          <Button title="Delete" variant={ButtonVariantEnum.DELETE} />
          <Button title="Danger" variant={ButtonVariantEnum.DANGER} />
          <Button title="Accent" variant={ButtonVariantEnum.ACCENT} />
        </div>
      </Section>

      <Section>
        <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
          Button Sizes
        </h2>
        <CodePreview
          title="Button sizes"
          code={`<Button title="Small" size={ComponentSizeEnum.SM} />
<Button title="Medium" />
<Button title="Large" size={ComponentSizeEnum.LG} />`}
        />
        <div className="flex flex-wrap items-center gap-4">
          <Button title="Small" variant={ButtonVariantEnum.DEFAULT} size={ComponentSizeEnum.SM} />
          <Button title="Medium" variant={ButtonVariantEnum.DEFAULT} size={ComponentSizeEnum.MD} />
          <Button title="Large" variant={ButtonVariantEnum.DEFAULT} size={ComponentSizeEnum.LG} />
        </div>
      </Section>

      <Section>
        <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
          Buttons with Icons
        </h2>
        <CodePreview
          title="Button with icons"
          code={`<Button title="Left Icon" leftIcon={<PlusIcon />} />
<Button title="Right Icon" rightIcon={<ArrowRightIcon />} />
<Button iconOnly aria-label="Search" variant={ButtonVariantEnum.GHOST} leftIcon={<SearchIcon />} />`}
        />
        <div className="flex flex-wrap gap-4">
          <Button
            title="Left Icon"
            variant={ButtonVariantEnum.DEFAULT}
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
              </svg>
            }
          />
          <Button
            title="Right Icon"
            variant={ButtonVariantEnum.COLORED}
            backgroundColor="white"
            darkBackgroundColor="zinc-800"
            rightIcon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
              </svg>
            }
          />
          <Button
            variant={ButtonVariantEnum.GHOST}
            iconOnly
            aria-label="Search"
            leftIcon={
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
            }
          />
        </div>
      </Section>

      <Section>
        <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
          Button States
        </h2>
        <CodePreview
          title="Button states"
          code={`<Button title="Loading" loading />
<Button title="Disabled" disabled />
<Button title="Full Width" fullWidth />`}
        />
        <div className="flex flex-wrap gap-4">
          <Button title="Loading" variant={ButtonVariantEnum.DEFAULT} loading />
          <Button title="Disabled" variant={ButtonVariantEnum.DEFAULT} disabled />
          <Button title="Full Width" variant={ButtonVariantEnum.DEFAULT} fullWidth />
        </div>
      </Section>

      <Section>
        <h2 className="mb-6 text-2xl font-semibold text-black dark:text-white night:text-white">
          Interactive Counter
        </h2>
        <CodePreview
          title="Interactive button"
          code={`<Button
  title="Increment Counter"
  loading={loading}
  onClick={handleClick}
/>`}
        />
        <div className="flex flex-col items-center gap-4">
          <div className="text-6xl font-bold text-black dark:text-white night:text-white">
            {count}
          </div>
          <Button
            title="Increment Counter"
            variant={ButtonVariantEnum.DEFAULT}
            size={ComponentSizeEnum.LG}
            loading={loading}
            onClick={handleClick}
          />
        </div>
      </Section>

    </>
  );
};
