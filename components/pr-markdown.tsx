"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type { Components } from "react-markdown";

const mdComponents: Components = {
  h1: ({ children }) => (
    <h1 className="mb-4 mt-2 text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="mb-3 mt-8 border-b border-indigo-200/80 pb-2 text-xl font-bold text-slate-900 first:mt-0 dark:border-indigo-500/40 dark:text-white">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mb-2 mt-6 text-lg font-semibold text-slate-800 dark:text-indigo-100">
      {children}
    </h3>
  ),
  p: ({ children }) => (
    <p className="mb-3 leading-relaxed text-slate-700 dark:text-slate-200">{children}</p>
  ),
  strong: ({ children }) => (
    <strong className="font-semibold text-indigo-800 dark:text-indigo-200">{children}</strong>
  ),
  em: ({ children }) => (
    <em className="italic text-violet-700 dark:text-violet-300">{children}</em>
  ),
  ul: ({ children }) => (
    <ul className="mb-4 list-disc space-y-2 pl-6 text-slate-700 dark:text-slate-200">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="mb-4 list-decimal space-y-2 pl-6 text-slate-700 dark:text-slate-200">{children}</ol>
  ),
  li: ({ children }) => <li className="leading-relaxed marker:text-indigo-500">{children}</li>,
  hr: () => <hr className="my-6 border-indigo-200/80 dark:border-indigo-500/30" />,
  blockquote: ({ children }) => (
    <blockquote className="my-4 border-l-4 border-indigo-400/60 pl-4 italic text-slate-600 dark:text-slate-300">
      {children}
    </blockquote>
  ),
  code: ({ className, children, ...props }) => {
    const inline = !className;
    if (inline) {
      return (
        <code
          className="rounded-md bg-indigo-100/90 px-1.5 py-0.5 font-mono text-sm text-indigo-900 dark:bg-indigo-950/80 dark:text-indigo-100"
          {...props}
        >
          {children}
        </code>
      );
    }
    return (
      <code className={className} {...props}>
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre className="mb-4 overflow-x-auto rounded-xl bg-slate-900/90 p-4 text-sm text-slate-100 dark:bg-black/50">
      {children}
    </pre>
  ),
};

type Props = { content: string };

export function PrMarkdown({ content }: Props) {
  return (
    <div className="pr-markdown text-[15px] sm:text-base">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
