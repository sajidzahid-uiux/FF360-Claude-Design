import { useState } from 'react';

interface CodePreviewProps {
  code: string;
  title?: string;
}

export const CodePreview = ({ code, title = 'Quick code' }: CodePreviewProps) => {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1200);
  };

  return (
    <div className="mb-4 rounded-lg border border-border/70 bg-zinc-50 p-3 dark:border-zinc-700 dark:bg-zinc-900 night:border-[#2d4a48] night:bg-[#142433]">
      <div className="mb-2 flex items-center justify-between gap-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 night:text-slate-400">
          {title}
        </p>
        <button
          type="button"
          onClick={copyCode}
          className="rounded-md border border-border bg-white px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-gray-200 dark:hover:bg-zinc-700 night:border-[#3d5c58] night:bg-[#1a3044] night:text-slate-200 night:hover:bg-[#22394f]"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
      </div>
      <pre className="overflow-x-auto rounded-md bg-white p-3 text-xs leading-relaxed text-zinc-800 dark:bg-zinc-950 dark:text-zinc-200 night:bg-[#0b1824] night:text-slate-200">
        <code>{code}</code>
      </pre>
    </div>
  );
};
