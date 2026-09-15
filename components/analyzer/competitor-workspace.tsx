'use client';

import { useState } from 'react';
import { YouTubeVideoData } from '@/lib/youtube';
import { SEOAuditResult } from '@/lib/seo';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CopyButton } from '@/components/shared/copy-button';
import { ScoreRing } from '@/components/shared/score-ring';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tag,
  FileText,
  BarChart3,
  Image as ImageIcon,
  Eye,
  ThumbsUp,
  MessageCircle,
  Calendar,
  Zap,
  AlertTriangle,
  TrendingUp,
  Loader2,
  Sparkles,
  Wand2,
} from 'lucide-react';
import { AIRescriptResult } from '@/lib/types';
import { formatViewCount } from '@/lib/youtube';

interface CompetitorWorkspaceProps {
  video: YouTubeVideoData;
  seoAudit: SEOAuditResult;
}

export function CompetitorWorkspace({ video, seoAudit }: CompetitorWorkspaceProps) {
  const [rescript, setRescript] = useState<AIRescriptResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleProcess = async () => {
    setIsProcessing(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'rescript', video }),
      });
      const json = await res.json();
      if (json.success) {
        setRescript(json.data);
      }
    } catch {
      // graceful fallback
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
      {/* LEFT PANEL: Scraped Blueprint */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 border border-primary/20">
            <Eye className="h-4 w-4 text-primary" />
          </div>
          <h2 className="text-lg font-semibold">The Scraped Blueprint</h2>
        </div>

        <Tabs defaultValue="info" className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-secondary/40">
            <TabsTrigger value="info" className="text-xs">Info</TabsTrigger>
            <TabsTrigger value="tags" className="text-xs">Tags</TabsTrigger>
            <TabsTrigger value="description" className="text-xs">Description</TabsTrigger>
            <TabsTrigger value="thumbnail" className="text-xs">Thumbnail</TabsTrigger>
          </TabsList>

          {/* Info Tab */}
          <TabsContent value="info" className="mt-4">
            <Card className="border-border bg-card/60">
              <CardContent className="space-y-4 p-4">
                <div>
                  <div className="mb-1.5 flex items-center gap-2 text-xs text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" /> Title
                  </div>
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-sm font-medium text-foreground">{video.title}</p>
                    <CopyButton text={video.title} size="icon" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <StatBox icon={Eye} label="Views" value={formatViewCount(video.viewCount)} color="primary" />
                  <StatBox icon={TrendingUp} label="Channel Baseline" value={formatViewCount(video.channelViewBaseline)} color="accent" />
                  <StatBox icon={ThumbsUp} label="Likes" value={formatViewCount(video.likeCount)} color="success" />
                  <StatBox icon={MessageCircle} label="Comments" value={formatViewCount(video.commentCount)} color="warning" />
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <Badge variant="secondary" className="bg-secondary/60">{video.category}</Badge>
                  <Badge variant="outline" className="border-border text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    {new Date(video.publishedAt).toLocaleDateString()}
                  </Badge>
                  <Badge variant="outline" className="border-border text-muted-foreground">
                    {video.channelTitle}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tags Tab */}
          <TabsContent value="tags" className="mt-4">
            <Card className="border-border bg-card/60">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Tag className="h-4 w-4 text-primary" />
                  Hidden Keyword Tags
                </CardTitle>
                <CopyButton
                  text={video.tags.join(', ')}
                  label="Copy All Tags"
                />
              </CardHeader>
              <CardContent className="space-y-2">
                {video.tags.map((tag, i) => (
                  <div
                    key={i}
                    className="group flex items-center justify-between rounded-lg border border-border bg-secondary/30 px-3 py-2 transition-colors hover:border-primary/30 hover:bg-secondary/50"
                  >
                    <div className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center rounded bg-primary/10 text-xs font-medium text-primary">
                        {i + 1}
                      </span>
                      <span className="text-sm text-foreground">{tag}</span>
                    </div>
                    <CopyButton text={tag} size="icon" />
                  </div>
                ))}
                {video.tags.length === 0 && (
                  <p className="text-sm text-muted-foreground py-4 text-center">No tags found for this video.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Description Tab */}
          <TabsContent value="description" className="mt-4">
            <Card className="border-border bg-card/60">
              <CardHeader className="flex flex-row items-center justify-between pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FileText className="h-4 w-4 text-primary" />
                  Description Block
                </CardTitle>
                <CopyButton text={video.description} label="Copy Description" />
              </CardHeader>
              <CardContent>
                <div className="max-h-80 overflow-y-auto scrollbar-thin rounded-lg border border-border bg-secondary/20 p-3">
                  <pre className="whitespace-pre-wrap text-sm text-foreground/90 font-sans leading-relaxed">
                    {video.description}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Thumbnail Tab */}
          <TabsContent value="thumbnail" className="mt-4">
            <ThumbnailComparisonGrid video={video} />
          </TabsContent>
        </Tabs>

        {/* SEO Audit Widget */}
        <SEOAuditWidget seoAudit={seoAudit} tags={video.tags} text={`${video.title} ${video.description}`} />
      </div>

      {/* RIGHT PANEL: Out-Rank Strategy */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent/10 border border-accent/20">
            <Zap className="h-4 w-4 text-accent" />
          </div>
          <h2 className="text-lg font-semibold">The Out-Rank Strategy</h2>
        </div>

        <Card className="border-border bg-card/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Wand2 className="h-4 w-4 text-accent" />
              AI Rescript Editor
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Click "Process Video" to transform the competitor's raw structure into an upgraded script template.
            </p>
            <Button
              onClick={handleProcess}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="mr-2 h-4 w-4" />
                  Process Video
                </>
              )}
            </Button>

            {rescript && (
              <div className="space-y-4 animate-fade-in">
                <RescriptSection title="Optimized Title" content={rescript.optimizedTitle} />
                <RescriptSection title="Optimized Description" content={rescript.optimizedDescription} textarea />
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Optimized Tags</span>
                    <CopyButton text={rescript.optimizedTags.join(', ')} label="Copy Tags" />
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {rescript.optimizedTags.map((tag, i) => (
                      <Badge key={i} variant="secondary" className="bg-accent/10 text-accent border border-accent/20">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
                <RescriptSection title="Hook Script" content={rescript.hookScript} textarea />
                <div>
                  <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Structure Notes</span>
                  <ul className="space-y-1.5">
                    {rescript.structureNotes.map((note, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-accent" />
                        {note}
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <span className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">SEO Improvements</span>
                  <ul className="space-y-1.5">
                    {rescript.seoImprovements.map((imp, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                        <TrendingUp className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                        {imp}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function StatBox({ icon: Icon, label, value, color }: { icon: any; label: string; value: string; color: string }) {
  const colorMap: Record<string, string> = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    accent: 'text-accent bg-accent/10 border-accent/20',
    success: 'text-success bg-success/10 border-success/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
  };
  return (
    <div className={`flex items-center gap-2.5 rounded-lg border p-2.5 ${colorMap[color]}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <div>
        <div className="text-xs opacity-70">{label}</div>
        <div className="text-sm font-semibold">{value}</div>
      </div>
    </div>
  );
}

function RescriptSection({ title, content, textarea }: { title: string; content: string; textarea?: boolean }) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{title}</span>
        <CopyButton text={content} />
      </div>
      {textarea ? (
        <div className="max-h-40 overflow-y-auto scrollbar-thin rounded-lg border border-border bg-secondary/20 p-3">
          <pre className="whitespace-pre-wrap text-sm text-foreground/90 font-sans leading-relaxed">{content}</pre>
        </div>
      ) : (
        <p className="rounded-lg border border-border bg-secondary/20 p-3 text-sm text-foreground/90">{content}</p>
      )}
    </div>
  );
}

function SEOAuditWidget({ seoAudit, tags, text }: { seoAudit: SEOAuditResult; tags: string[]; text: string }) {
  return (
    <Card className="border-border bg-card/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <BarChart3 className="h-4 w-4 text-primary" />
          SEO Audit Widget
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-6">
          <ScoreRing score={seoAudit.searchDiscoveryScore} label="Discovery" size={100} />
          <div className="flex-1 space-y-3">
            <div>
              <div className="mb-1 flex items-center gap-2 text-xs text-muted-foreground">
                <AlertTriangle className="h-3.5 w-3.5" />
                Placement Visibility
              </div>
              {seoAudit.placementVisibility.keywordInFirst200 ? (
                <Badge className="bg-success/10 text-success border border-success/20">Keywords in first 200 chars</Badge>
              ) : (
                <div className="space-y-1">
                  <Badge className="bg-destructive/10 text-destructive border border-destructive/20">
                    Missing from first 200 chars
                  </Badge>
                  <div className="flex flex-wrap gap-1 pt-1">
                    {seoAudit.placementVisibility.flaggedKeywords.slice(0, 5).map((kw, i) => (
                      <span key={i} className="rounded bg-destructive/5 px-1.5 py-0.5 text-xs text-destructive/80">
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div>
          <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Keyword Density</div>
          <div className="space-y-1.5">
            {seoAudit.keywordDensity.slice(0, 8).map((kd, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="w-32 truncate text-xs text-foreground/70">{kd.keyword}</span>
                <div className="flex-1 h-2 rounded-full bg-secondary/40 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, kd.percentage * 20)}%`,
                      backgroundColor: kd.percentage > 3 ? 'hsl(0 72% 51%)' : kd.percentage > 0.5 ? 'hsl(142 71% 45%)' : 'hsl(43 96% 56%)',
                    }}
                  />
                </div>
                <span className="w-12 text-right text-xs text-muted-foreground">{kd.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ThumbnailComparisonGrid({ video }: { video: YouTubeVideoData }) {
  return (
    <Card className="border-border bg-card/60">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <ImageIcon className="h-4 w-4 text-primary" />
          Thumbnail Comparison Grid
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Competitor Thumbnail</div>
            <div className="aspect-video overflow-hidden rounded-lg border border-border bg-secondary/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={video.thumbnailMaxRes}
                alt="Competitor thumbnail"
                className="h-full w-full object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = video.thumbnailDefault;
                }}
              />
            </div>
          </div>
          <div>
            <div className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">Your Concept</div>
            <div className="flex aspect-video flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-secondary/10 p-4 text-center transition-colors hover:border-primary/30">
              <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
              <p className="text-xs text-muted-foreground">
                Upload your thumbnail or type a concept to compare visual clarity and curiosity gaps
              </p>
              <textarea
                placeholder="Type your thumbnail concept here..."
                className="mt-1 w-full resize-none rounded-md border border-border bg-secondary/30 px-2 py-1.5 text-xs text-foreground placeholder:text-muted-foreground/50 focus:border-primary/30 focus:outline-none"
                rows={2}
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
