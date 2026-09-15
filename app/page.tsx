'use client';

import { useState } from 'react';
import { CompetitorWorkspace } from '@/components/analyzer/competitor-workspace';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { YouTubeVideoData } from '@/lib/youtube';
import { SEOAuditResult } from '@/lib/seo';
import {
  Crosshair,
  Loader2,
  Link2,
  AlertCircle,
  Sparkles,
  TrendingUp,
  Shield,
  Zap,
} from 'lucide-react';

interface AnalyzeResponse {
  success: boolean;
  data?: { video: YouTubeVideoData; seoAudit: SEOAuditResult };
  error?: string;
  code?: string;
}

export default function Home() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [video, setVideo] = useState<YouTubeVideoData | null>(null);
  const [seoAudit, setSeoAudit] = useState<SEOAuditResult | null>(null);
  const { toast } = useToast();

  const handleAnalyze = async () => {
    if (!url.trim()) {
      setError('Please enter a YouTube URL.');
      return;
    }

    setLoading(true);
    setError(null);
    setVideo(null);
    setSeoAudit(null);

    try {
      const res = await fetch('/api/youtube', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const json: AnalyzeResponse = await res.json();

      if (!json.success) {
        setError(json.error || 'An error occurred while analyzing the video.');
        toast({
          title: 'Analysis Failed',
          description: json.error,
          variant: 'destructive',
        });
        return;
      }

      setVideo(json.data!.video);
      setSeoAudit(json.data!.seoAudit);
      toast({
        title: 'Analysis Complete',
        description: `Successfully scraped "${json.data!.video.title}"`,
      });
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAnalyze();
  };

  return (
    <div className="min-h-screen bg-grid">
      {/* Hero / Header */}
      <div className="relative overflow-hidden border-b border-border bg-gradient-to-b from-card/40 to-background">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-accent/5" />
        <div className="relative mx-auto max-w-7xl px-4 py-12 lg:px-8 lg:py-16">
          <div className="mb-6 flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent glow-blue">
              <Crosshair className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight lg:text-3xl">
                Competitor <span className="text-gradient-electric">Reverse-Engineering</span>
              </h1>
              <p className="text-sm text-muted-foreground">Out-Rank Analyzer</p>
            </div>
          </div>
          <p className="mb-8 max-w-2xl text-sm text-muted-foreground lg:text-base">
            Paste any YouTube URL to extract the complete blueprint — hidden tags, description structure, SEO metrics —
            and transform it into an upgraded script that out-ranks the original.
          </p>

          {/* Master Input Bar */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Link2 className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Paste any YouTube URL or short link..."
                className="h-12 border-border bg-card/60 pl-10 text-sm placeholder:text-muted-foreground/60"
              />
            </div>
            <Button
              onClick={handleAnalyze}
              disabled={loading}
              className="h-12 bg-gradient-to-r from-primary to-accent px-8 text-white hover:opacity-90"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Analyze Video
                </>
              )}
            </Button>
          </div>

          {error && (
            <div className="mt-4 flex items-start gap-2 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 animate-fade-in">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
              <div>
                <p className="text-sm font-medium text-destructive">{error}</p>
                <p className="text-xs text-destructive/70 mt-0.5">
                  Make sure the URL is a valid YouTube watch link, short link, or embed URL.
                </p>
              </div>
            </div>
          )}

          {/* Feature badges */}
          <div className="mt-8 flex flex-wrap gap-3">
            <FeatureBadge icon={TrendingUp} label="SEO Audit" color="primary" />
            <FeatureBadge icon={Zap} label="AI Rescript" color="accent" />
            <FeatureBadge icon={Shield} label="Brand-Safe" color="success" />
          </div>
        </div>
      </div>

      {/* Workspace */}
      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        {video && seoAudit ? (
          <div className="animate-fade-in">
            <CompetitorWorkspace video={video} seoAudit={seoAudit} />
          </div>
        ) : !loading && !error ? (
          <EmptyState />
        ) : null}
      </div>
    </div>
  );
}

function FeatureBadge({ icon: Icon, label, color }: { icon: any; label: string; color: string }) {
  const colorMap: Record<string, string> = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    accent: 'text-accent bg-accent/10 border-accent/20',
    success: 'text-success bg-success/10 border-success/20',
  };
  return (
    <div className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium ${colorMap[color]}`}>
      <Icon className="h-3 w-3" />
      {label}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="relative mb-6">
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative flex h-20 w-20 items-center justify-center rounded-2xl border border-border bg-card">
          <Crosshair className="h-10 w-10 text-primary" />
        </div>
      </div>
      <h3 className="mb-2 text-lg font-semibold">Ready to Out-Rank</h3>
      <p className="max-w-md text-sm text-muted-foreground">
        Paste a competitor's YouTube URL above to extract their complete content blueprint —
        hidden tags, description structure, SEO score, and thumbnail analysis.
      </p>
      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 max-w-2xl">
        {[
          { label: 'Scraped Blueprint', desc: 'Tags, description, category, views' },
          { label: 'SEO Audit', desc: 'Keyword density & discovery score' },
          { label: 'AI Rescript', desc: 'Transform into an upgraded script' },
        ].map((item, i) => (
          <Card key={i} className="border-border bg-card/40">
            <CardContent className="p-4">
              <div className="mb-1 text-sm font-medium text-foreground">{item.label}</div>
              <div className="text-xs text-muted-foreground">{item.desc}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
