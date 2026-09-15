'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import {
  Crosshair,
  PenLine,
  Film,
  TrendingUp,
  Dna,
  Menu,
  X,
  Zap,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

const navItems = [
  { href: '/', label: 'Competitor Analyzer', icon: Crosshair, description: 'Reverse-engineer & out-rank' },
  { href: '/script-studio', label: 'Script Studio', icon: PenLine, description: 'Retention AI & monetization audit' },
  { href: '/capcut-sync', label: 'CapCut Sync', icon: Film, description: 'Video automation & timeline sync' },
  { href: '/market-tracker', label: 'Market Tracker', icon: TrendingUp, description: 'Viral outliers & niche trends' },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <div className="fixed top-0 left-0 z-50 lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="m-3 h-10 w-10 border border-border bg-card/80 backdrop-blur"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-0 z-40 flex h-screen w-72 flex-col border-r border-border bg-card/95 backdrop-blur-xl transition-transform duration-300 lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 border-b border-border px-6 py-5">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent glow-blue">
            <Dna className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-foreground">
              ViralDNA
            </h1>
            <p className="text-xs text-muted-foreground">Legacy Suite</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4">
          <div className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">
            Modules
          </div>
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    'group flex items-start gap-3 rounded-lg px-3 py-2.5 transition-all',
                    isActive
                      ? 'bg-primary/10 border border-primary/20'
                      : 'hover:bg-secondary/60 border border-transparent'
                  )}
                >
                  <div
                    className={cn(
                      'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg transition-colors',
                      isActive
                        ? 'bg-primary/20 text-primary'
                        : 'bg-secondary text-muted-foreground group-hover:text-foreground'
                    )}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div
                      className={cn(
                        'text-sm font-medium',
                        isActive ? 'text-primary' : 'text-foreground'
                      )}
                    >
                      {item.label}
                    </div>
                    <div className="truncate text-xs text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                  {isActive && (
                    <div className="absolute right-3 mt-3 h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
                  )}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Footer */}
        <div className="border-t border-border px-4 py-4">
          <div className="flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-2.5">
            <Zap className="h-4 w-4 text-warning" />
            <span className="text-xs text-muted-foreground">
              Full-stack engine ready
            </span>
          </div>
        </div>
      </aside>
    </>
  );
}
