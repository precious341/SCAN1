import React from 'react';

/**
 * Clean clinical markdown formatter for AI assistant responses.
 * Formats bold text, headers, lists, code snippets, and clinical disclaimers.
 */
export default function FormattedMessage({ text }) {
  if (!text) return null;

  // Split lines
  const lines = text.split('\n');
  const elements = [];
  let listItems = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul key={`list-${elements.length}`} className="my-2 space-y-1.5 pl-4 list-disc marker:text-[#6366F1]">
          {listItems.map((item, idx) => (
            <li key={idx} className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {formatInline(item)}
            </li>
          ))}
        </ul>
      );
      listItems = [];
    }
  };

  const formatInline = (str) => {
    // Replace **bold**
    const parts = [];
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    let lastIdx = 0;
    let match;

    while ((match = regex.exec(str)) !== null) {
      if (match.index > lastIdx) {
        parts.push(str.substring(lastIdx, match.index));
      }
      const token = match[0];
      if (token.startsWith('**') && token.endsWith('**')) {
        parts.push(
          <strong key={match.index} className="font-semibold text-[#0B192C]">
            {token.slice(2, -2)}
          </strong>
        );
      } else if (token.startsWith('*') && token.endsWith('*')) {
        parts.push(
          <em key={match.index} className="italic text-slate-600">
            {token.slice(1, -1)}
          </em>
        );
      } else if (token.startsWith('`') && token.endsWith('`')) {
        parts.push(
          <code key={match.index} className="px-1.5 py-0.5 rounded bg-slate-100 font-mono text-[11px] text-indigo-700">
            {token.slice(1, -1)}
          </code>
        );
      }
      lastIdx = regex.lastIndex;
    }

    if (lastIdx < str.length) {
      parts.push(str.substring(lastIdx));
    }

    return parts.length > 0 ? parts : str;
  };

  lines.forEach((line, idx) => {
    const trimmed = line.trim();

    if (trimmed.startsWith('* ') || trimmed.startsWith('- ')) {
      listItems.push(trimmed.substring(2));
      return;
    }

    flushList();

    if (!trimmed) {
      // Empty line spacer
      elements.push(<div key={`space-${idx}`} className="h-2" />);
      return;
    }

    if (trimmed.startsWith('### ')) {
      elements.push(
        <h4 key={`h3-${idx}`} className="text-sm font-bold text-[#0B192C] mt-3 mb-1 tracking-tight">
          {formatInline(trimmed.substring(4))}
        </h4>
      );
      return;
    }

    if (trimmed.startsWith('## ')) {
      elements.push(
        <h3 key={`h2-${idx}`} className="text-base font-bold text-[#0B192C] mt-4 mb-1.5 tracking-tight">
          {formatInline(trimmed.substring(3))}
        </h3>
      );
      return;
    }

    if (trimmed.startsWith('# ')) {
      elements.push(
        <h2 key={`h1-${idx}`} className="text-lg font-bold text-[#0B192C] mt-4 mb-2 tracking-tight">
          {formatInline(trimmed.substring(2))}
        </h2>
      );
      return;
    }

    if (trimmed.startsWith('---') || trimmed.startsWith('***')) {
      elements.push(<hr key={`hr-${idx}`} className="my-3 border-slate-200" />);
      return;
    }

    if (trimmed.startsWith('→') || trimmed.startsWith('Disclaimer:')) {
      elements.push(
        <div key={`disclaimer-${idx}`} className="my-2.5 p-3 rounded-xl bg-indigo-50/60 border border-indigo-100/80 text-[11px] text-indigo-950 flex items-start gap-2">
          <span className="text-indigo-600 font-bold shrink-0">✦</span>
          <span className="leading-relaxed">{formatInline(trimmed.replace(/^→\s*/, ''))}</span>
        </div>
      );
      return;
    }

    // Standard paragraph
    elements.push(
      <p key={`p-${idx}`} className="text-xs sm:text-sm text-slate-700 leading-relaxed">
        {formatInline(trimmed)}
      </p>
    );
  });

  flushList();

  return <div className="space-y-1">{elements}</div>;
}
