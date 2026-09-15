'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CopyButtonProps {
  text: string;
  className?: string;
  label?: string;
  size?: 'sm' | 'default' | 'icon';
}

export function CopyButton({ text, className, label, size = 'sm' }: CopyButtonProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (size === 'icon') {
    return (
      <button
        onClick={handleCopy}
        className={cn(
          'inline-flex h-7 w-7 items-center justify-center rounded-md border border-border bg-secondary/50 transition-colors hover:bg-secondary hover:border-primary/30',
          className
        )}
      >
        {copied ? (
          <Check className="h-3.5 w-3.5 text-success" />
        ) : (
          <Copy className="h-3.5 w-3.5 text-muted-foreground" />
        )}
      </button>
    );
  }

  return (
    <button
      onClick={handleCopy}
      className={cn(
        'inline-flex items-center gap-1.5 rounded-md border border-border bg-secondary/50 px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:bg-secondary hover:border-primary/30 hover:text-foreground',
        className
      )}
    >
      {copied ? (
        <>
          <Check className="h-3 w-3 text-success" />
          {label || 'Copied!'}
        </>
      ) : (
        <>
          <Copy className="h-3 w-3" />
          {label || 'Copy'}
        </>
      )}
    </button>
  );
}
