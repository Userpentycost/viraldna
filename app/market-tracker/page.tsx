'use client';

import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  TrendingUp,
  Flame,
  Search,
  ArrowUpDown,
  Zap,
  Target,
  Eye,
  Layers,
} from 'lucide-react';
import {
  MOCK_VIRAL_CHANNELS,
  MOCK_NICHE_KEYWORDS,
  ViralChannel,
  NicheKeyword,
} from '@/lib/mock-data';
import { formatViewCount } from '@/lib/youtube';

export default function MarketTrackerPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'multiplier' | 'outlierViews' | 'avgViews'>('multiplier');
  const [nicheFilter, setNicheFilter] = useState<string>('all');

  const niches = useMemo(() => {
    const set = new Set(MOCK_NICHE_KEYWORDS.map((k) => k.niche));
    return ['all', ...Array.from(set)];
  }, []);

  const filteredChannels = useMemo(() => {
    let result = [...MOCK_VIRAL_CHANNELS];
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.channelName.toLowerCase().includes(q) ||
          c.outlierVideoTitle.toLowerCase().includes(q) ||
          c.niche.toLowerCase().includes(q)
      );
    }
    if (nicheFilter !== 'all') {
      result = result.filter((c) => c.niche === nicheFilter);
    }
    result.sort((a, b) => {
      if (sortBy === 'multiplier') return b.multiplier - a.multiplier;
      if (sortBy === 'outlierViews') return b.outlierViewCount - a.outlierViewCount;
      return b.averageViews - a.averageViews;
    });
    return result;
  }, [searchQuery, nicheFilter, sortBy]);

  const filteredKeywords = useMemo(() => {
    if (nicheFilter === 'all') return MOCK_NICHE_KEYWORDS;
    return MOCK_NICHE_KEYWORDS.filter((k) => k.niche === nicheFilter);
  }, [nicheFilter]);

  return (
    <div className="min-h-screen bg-grid">
      {/* Header */}
      <div className="border-b border-border bg-gradient-to-b from-card/40 to-background">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent glow-blue">
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Viral <span className="text-gradient-electric">Market Tracker</span>
              </h1>
              <p className="text-sm text-muted-foreground">Outlier detection & niche trend mapping</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {/* Stats overview */}
        <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={Flame}
            label="Viral Outliers"
            value={MOCK_VIRAL_CHANNELS.filter((c) => c.multiplier >= 300).length.toString()}
            sub="channels at 3x+ baseline"
            color="primary"
          />
          <StatCard
            icon={Zap}
            label="Breakout Keywords"
            value={MOCK_NICHE_KEYWORDS.filter((k) => k.status === 'Breakout').length.toString()}
            sub="rapid growth terms"
            color="accent"
          />
          <StatCard
            icon={TrendingUp}
            label="Rising Keywords"
            value={MOCK_NICHE_KEYWORDS.filter((k) => k.status === 'Rising').length.toString()}
            sub="upward trend terms"
            color="success"
          />
          <StatCard
            icon={Target}
            label="Tracked Niches"
            value={new Set(MOCK_NICHE_KEYWORDS.map((k) => k.niche)).size.toString()}
            sub="creator categories"
            color="warning"
          />
        </div>

        {/* Viral Outlier Data Table */}
        <Card className="mb-6 border-border bg-card/60">
          <CardHeader className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <CardTitle className="flex items-center gap-2 text-base">
              <Flame className="h-4 w-4 text-primary" />
              Viral Outlier Data Table
            </CardTitle>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search channels..."
                  className="h-9 w-full pl-9 text-sm sm:w-56"
                />
              </div>
              <select
                value={nicheFilter}
                onChange={(e) => setNicheFilter(e.target.value)}
                className="h-9 rounded-md border border-border bg-secondary/40 px-3 text-sm text-foreground focus:border-primary/30 focus:outline-none"
              >
                {niches.map((n) => (
                  <option key={n} value={n}>{n === 'all' ? 'All Niches' : n}</option>
                ))}
              </select>
            </div>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto scrollbar-thin">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-3 py-2.5 font-medium text-muted-foreground">
                      <button
                        onClick={() => setSortBy('avgViews')}
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        Channel <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-3 py-2.5 font-medium text-muted-foreground">Avg Views</th>
                    <th className="px-3 py-2.5 font-medium text-muted-foreground">Outlier Video</th>
                    <th className="px-3 py-2.5 font-medium text-muted-foreground">
                      <button
                        onClick={() => setSortBy('outlierViews')}
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        Outlier Views <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-3 py-2.5 font-medium text-muted-foreground">
                      <button
                        onClick={() => setSortBy('multiplier')}
                        className="flex items-center gap-1 hover:text-foreground"
                      >
                        Multiplier <ArrowUpDown className="h-3 w-3" />
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredChannels.map((channel) => (
                    <tr
                      key={channel.id}
                      className="border-b border-border/50 transition-colors hover:bg-secondary/20"
                    >
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold ${
                            channel.multiplier >= 1000
                              ? 'bg-primary/15 text-primary'
                              : 'bg-secondary/40 text-muted-foreground'
                          }`}>
                            {channel.channelAvatar}
                          </div>
                          <div>
                            <div className="font-medium text-foreground">{channel.channelName}</div>
                            <div className="text-xs text-muted-foreground">{channel.niche}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{formatViewCount(channel.averageViews)}</td>
                      <td className="px-3 py-3 max-w-xs">
                        <p className="truncate text-foreground/80" title={channel.outlierVideoTitle}>
                          {channel.outlierVideoTitle}
                        </p>
                      </td>
                      <td className="px-3 py-3 font-medium text-foreground">{formatViewCount(channel.outlierViewCount)}</td>
                      <td className="px-3 py-3">
                        <MultiplierBadge multiplier={channel.multiplier} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {filteredChannels.length === 0 && (
                <div className="py-12 text-center text-sm text-muted-foreground">
                  No channels match your search.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Opportunity Niche Matrix */}
        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Layers className="h-4 w-4 text-accent" />
              Opportunity Niche Matrix
              <Badge variant="secondary" className="bg-secondary/40 ml-auto">
                {filteredKeywords.length} keywords
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Legend */}
            <div className="mb-4 flex flex-wrap gap-3">
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-primary/60" />
                <span className="text-xs text-muted-foreground">Breakout</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-success/60" />
                <span className="text-xs text-muted-foreground">Rising</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-3 w-3 rounded bg-destructive/40" />
                <span className="text-xs text-muted-foreground">Saturated</span>
              </div>
            </div>

            {/* Heat map grid */}
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
              {filteredKeywords.map((kw, i) => (
                <NicheHeatCell key={i} keyword={kw} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, sub, color }: { icon: any; label: string; value: string; sub: string; color: string }) {
  const colorMap: Record<string, string> = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    accent: 'text-accent bg-accent/10 border-accent/20',
    success: 'text-success bg-success/10 border-success/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
  };
  return (
    <Card className="border-border bg-card/60">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-lg border ${colorMap[color]}`}>
            <Icon className="h-5 w-5" />
          </div>
          <div>
            <div className="text-xs text-muted-foreground">{label}</div>
            <div className="text-xl font-bold text-foreground">{value}</div>
            <div className="text-xs text-muted-foreground/70">{sub}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function MultiplierBadge({ multiplier }: { multiplier: number }) {
  const isViral = multiplier >= 300;
  const intensity = Math.min(1, multiplier / 2000);

  if (isViral) {
    return (
      <div className="inline-flex items-center gap-1.5">
        <div
          className="rounded-md border px-2 py-1 text-xs font-bold"
          style={{
            backgroundColor: `hsl(217 91% 60% / ${0.1 + intensity * 0.15})`,
            borderColor: `hsl(217 91% 60% / ${0.3 + intensity * 0.2})`,
            color: 'hsl(217 91% 65%)',
          }}
        >
          {multiplier}%
        </div>
        <Flame className="h-3.5 w-3.5 text-primary animate-pulse" />
      </div>
    );
  }
  return (
    <span className="text-xs text-muted-foreground">{multiplier}%</span>
  );
}

function NicheHeatCell({ keyword }: { keyword: NicheKeyword }) {
  const statusConfig = {
    Breakout: {
      bg: 'bg-primary/15 hover:bg-primary/20',
      border: 'border-primary/30',
      badge: 'bg-primary/20 text-primary',
      glow: 'glow-blue',
    },
    Rising: {
      bg: 'bg-success/10 hover:bg-success/15',
      border: 'border-success/20',
      badge: 'bg-success/15 text-success',
      glow: '',
    },
    Saturated: {
      bg: 'bg-destructive/5 hover:bg-destructive/10',
      border: 'border-destructive/15',
      badge: 'bg-destructive/10 text-destructive/80',
      glow: '',
    },
  };

  const config = statusConfig[keyword.status];
  const heatIntensity = Math.min(1, keyword.trendScore / 100);

  return (
    <div
      className={`group relative rounded-lg border ${config.border} ${config.bg} p-3 transition-all cursor-pointer hover:scale-[1.02] ${keyword.status === 'Breakout' ? config.glow : ''}`}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <Badge className={`${config.badge} text-xs border-0`}>{keyword.status}</Badge>
        <span className="text-xs font-medium text-muted-foreground">{keyword.growthRate > 0 ? '+' : ''}{keyword.growthRate}%</span>
      </div>
      <p className="text-sm font-medium text-foreground leading-tight">{keyword.keyword}</p>
      <p className="mt-1 text-xs text-muted-foreground">{keyword.niche}</p>
      <div className="mt-2 h-1 rounded-full bg-secondary/40 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            keyword.status === 'Breakout' ? 'bg-primary' :
            keyword.status === 'Rising' ? 'bg-success' :
            'bg-destructive/60'
          }`}
          style={{ width: `${heatIntensity * 100}%` }}
        />
      </div>
      <div className="mt-1 flex items-center justify-between text-xs">
        <span className="text-muted-foreground">Trend Score</span>
        <span className="font-medium text-foreground">{keyword.trendScore}</span>
      </div>
    </div>
  );
}
