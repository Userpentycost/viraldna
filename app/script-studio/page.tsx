'use client';

import { useState, useMemo, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { CopyButton } from '@/components/shared/copy-button';
import { useToast } from '@/hooks/use-toast';
import {
  analyzeHook,
  analyzePacing,
  auditMonetization,
  generateCommunityPosts,
  constructMasterPrompt,
  HookAnalysis,
  PacingResult,
  MonetizationFlag,
} from '@/lib/script-analysis';
import {
  PenLine,
  Zap,
  Gauge,
  Shield,
  MessageSquare,
  Terminal,
  AlertTriangle,
  Clock,
  Type,
  Sparkles,
  Loader2,
  TrendingUp,
  Heart,
  Brain,
} from 'lucide-react';

const DEFAULT_SCRIPT = `Wait — before you scroll past this, let me tell you something that took me years to figure out.

Everyone talks about productivity, but almost nobody mentions the one thing that actually matters. And once you understand it, everything changes.

In this video, I'm going to break down exactly what that is, how it works, and how you can use it starting today. The truth about productivity is that it's not about doing more — it's about doing less, better.

Most people try to hack their way to success with apps and routines, but the real secret is much simpler. Let me show you...`;

export default function ScriptStudioPage() {
  const [script, setScript] = useState(DEFAULT_SCRIPT);
  const [wpm, setWpm] = useState(150);
  const [duration, setDuration] = useState('10-15 minutes');
  const [niche, setNiche] = useState('Productivity');
  const [enhancedHook, setEnhancedHook] = useState<string | null>(null);
  const [enhancing, setEnhancing] = useState(false);
  const { toast } = useToast();

  const hookAnalysis: HookAnalysis = useMemo(() => analyzeHook(script), [script]);
  const pacingResult: PacingResult = useMemo(() => analyzePacing(script, wpm), [script, wpm]);
  const monetizationFlags: MonetizationFlag[] = useMemo(() => auditMonetization(script), [script]);
  const communityPosts: string[] = useMemo(() => generateCommunityPosts(script), [script]);
  const masterPrompt: string = useMemo(
    () => constructMasterPrompt(script, duration, niche),
    [script, duration, niche]
  );

  const handleEnhanceHook = useCallback(async () => {
    setEnhancing(true);
    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'enhance-hook', script }),
      });
      const json = await res.json();
      if (json.success) {
        setEnhancedHook(json.data.enhancedHook);
        toast({ title: 'Hook Enhanced', description: 'AI-optimized hook generated successfully.' });
      }
    } catch {
      toast({ title: 'Enhancement Failed', description: 'Could not reach AI endpoint.', variant: 'destructive' });
    } finally {
      setEnhancing(false);
    }
  }, [script, toast]);

  return (
    <div className="min-h-screen bg-grid">
      {/* Header */}
      <div className="border-b border-border bg-gradient-to-b from-card/40 to-background">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent glow-blue">
              <PenLine className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                Script <span className="text-gradient-electric">Studio</span>
              </h1>
              <p className="text-sm text-muted-foreground">Retention AI & Monetization Audit Module</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Editor Canvas */}
          <div className="lg:col-span-2">
            <Card className="border-border bg-card/60">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Type className="h-4 w-4 text-primary" />
                  Script Canvas
                </CardTitle>
                <div className="flex items-center gap-3">
                  <Badge variant="secondary" className="bg-secondary/40">
                    {pacingResult.totalWords} words
                  </Badge>
                  <Badge variant="secondary" className="bg-secondary/40">
                    <Clock className="mr-1 h-3 w-3" />
                    {Math.floor(pacingResult.estimatedDuration / 60)}m {Math.round(pacingResult.estimatedDuration % 60)}s
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                  className="min-h-[400px] resize-y border-border bg-secondary/20 font-mono text-sm leading-relaxed scrollbar-thin"
                  placeholder="Paste or write your script here..."
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar Controls */}
          <div className="space-y-4">
            {/* WPM Slider */}
            <Card className="border-border bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Gauge className="h-4 w-4 text-primary" />
                  Pacing Target (WPM)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-2xl font-bold text-primary">{wpm}</span>
                  <span className="text-xs text-muted-foreground">words/min</span>
                </div>
                <Slider
                  value={[wpm]}
                  onValueChange={(v) => setWpm(v[0])}
                  min={80}
                  max={250}
                  step={5}
                  className="w-full"
                />
                <div className="mt-2 flex justify-between text-xs text-muted-foreground">
                  <span>Slow</span>
                  <span>Fast</span>
                </div>
              </CardContent>
            </Card>

            {/* Master Prompt Inputs */}
            <Card className="border-border bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-sm">
                  <Terminal className="h-4 w-4 text-accent" />
                  Master Prompt Config
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Video Duration</label>
                  <input
                    type="text"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full rounded-md border border-border bg-secondary/30 px-3 py-1.5 text-sm text-foreground focus:border-primary/30 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted-foreground">Target Niche</label>
                  <input
                    type="text"
                    value={niche}
                    onChange={(e) => setNiche(e.target.value)}
                    className="w-full rounded-md border border-border bg-secondary/30 px-3 py-1.5 text-sm text-foreground focus:border-primary/30 focus:outline-none"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Analysis Tabs */}
        <div className="mt-6">
          <Tabs defaultValue="hook" className="w-full">
            <TabsList className="grid w-full grid-cols-2 gap-1 bg-secondary/40 lg:grid-cols-5">
              <TabsTrigger value="hook" className="text-xs">
                <Zap className="mr-1.5 h-3.5 w-3.5" /> Hook Matrix
              </TabsTrigger>
              <TabsTrigger value="pacing" className="text-xs">
                <Gauge className="mr-1.5 h-3.5 w-3.5" /> Pacing
              </TabsTrigger>
              <TabsTrigger value="monetization" className="text-xs">
                <Shield className="mr-1.5 h-3.5 w-3.5" /> Monetization
              </TabsTrigger>
              <TabsTrigger value="community" className="text-xs">
                <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Community
              </TabsTrigger>
              <TabsTrigger value="prompt" className="text-xs">
                <Terminal className="mr-1.5 h-3.5 w-3.5" /> Master Prompt
              </TabsTrigger>
            </TabsList>

            {/* Hook Strategy Matrix */}
            <TabsContent value="hook" className="mt-4">
              <Card className="border-border bg-card/60">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Zap className="h-4 w-4 text-primary" />
                    Hook Strategy Matrix
                  </CardTitle>
                  <Button
                    onClick={handleEnhanceHook}
                    disabled={enhancing}
                    size="sm"
                    className="bg-gradient-to-r from-primary to-accent text-white"
                  >
                    {enhancing ? (
                      <>
                        <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        Enhancing...
                      </>
                    ) : (
                      <>
                        <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                        AI Enhance Hook
                      </>
                    )}
                  </Button>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <MetricCard
                      icon={Brain}
                      label="Curiosity Gaps"
                      value={hookAnalysis.curiosityGaps.length}
                      score={hookAnalysis.curiosityGaps.reduce((a, b) => a + b.score, 0) / Math.max(1, hookAnalysis.curiosityGaps.length)}
                      color="primary"
                    />
                    <MetricCard
                      icon={Heart}
                      label="Emotional Impact"
                      value={hookAnalysis.emotionalImpact.length}
                      score={hookAnalysis.emotionalImpact.reduce((a, b) => a + b.score, 0) / Math.max(1, hookAnalysis.emotionalImpact.length)}
                      color="accent"
                    />
                    <MetricCard
                      icon={TrendingUp}
                      label="Pattern Interrupts"
                      value={hookAnalysis.patternInterrupts.length}
                      score={hookAnalysis.patternInterrupts.reduce((a, b) => a + b.score, 0) / Math.max(1, hookAnalysis.patternInterrupts.length)}
                      color="warning"
                    />
                  </div>

                  <div className="rounded-lg border border-border bg-secondary/20 p-4">
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Overall Hook Score</span>
                      <span className={`text-2xl font-bold ${hookAnalysis.overallHookScore >= 70 ? 'text-success' : hookAnalysis.overallHookScore >= 40 ? 'text-warning' : 'text-destructive'}`}>
                        {hookAnalysis.overallHookScore}/100
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-secondary/40 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-700"
                        style={{ width: `${hookAnalysis.overallHookScore}%` }}
                      />
                    </div>
                  </div>

                  {enhancedHook && (
                    <div className="rounded-lg border border-accent/20 bg-accent/5 p-4 animate-fade-in">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-xs font-medium uppercase tracking-wider text-accent">AI-Enhanced Hook</span>
                        <CopyButton text={enhancedHook} label="Copy" />
                      </div>
                      <pre className="whitespace-pre-wrap text-sm text-foreground/90 font-sans leading-relaxed">{enhancedHook}</pre>
                    </div>
                  )}

                  <div className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Detected Patterns</span>
                    {[
                      ...hookAnalysis.curiosityGaps.map((c) => ({ ...c, type: 'Curiosity Gap' })),
                      ...hookAnalysis.emotionalImpact.map((e) => ({ ...e, type: 'Emotional' })),
                      ...hookAnalysis.patternInterrupts.map((p) => ({ ...p, type: 'Pattern Interrupt' })),
                    ].slice(0, 6).map((item, i) => (
                      <div key={i} className="flex items-start gap-2 rounded-lg border border-border bg-secondary/20 px-3 py-2">
                        <Badge variant="outline" className="border-primary/20 text-primary text-xs">{item.type}</Badge>
                        <p className="flex-1 text-xs text-foreground/80">{item.text}</p>
                        <span className="text-xs font-medium text-muted-foreground">{item.score}</span>
                      </div>
                    ))}
                    {hookAnalysis.curiosityGaps.length === 0 && hookAnalysis.emotionalImpact.length === 0 && hookAnalysis.patternInterrupts.length === 0 && (
                      <p className="text-sm text-muted-foreground py-2">No hook patterns detected. Try adding curiosity phrases like "nobody tells you" or "the secret is..."</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Pacing & Retention Monitor */}
            <TabsContent value="pacing" className="mt-4">
              <Card className="border-border bg-card/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Gauge className="h-4 w-4 text-primary" />
                    Pacing & Retention Monitor
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="rounded-lg border border-border bg-secondary/20 p-3 text-center">
                      <div className="text-xs text-muted-foreground">Total Words</div>
                      <div className="text-xl font-bold text-foreground">{pacingResult.totalWords}</div>
                    </div>
                    <div className="rounded-lg border border-border bg-secondary/20 p-3 text-center">
                      <div className="text-xs text-muted-foreground">Est. Duration</div>
                      <div className="text-xl font-bold text-primary">
                        {Math.floor(pacingResult.estimatedDuration / 60)}m {Math.round(pacingResult.estimatedDuration % 60)}s
                      </div>
                    </div>
                    <div className="rounded-lg border border-border bg-secondary/20 p-3 text-center">
                      <div className="text-xs text-muted-foreground">Target WPM</div>
                      <div className="text-xl font-bold text-accent">{wpm}</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Segment Analysis</span>
                    {pacingResult.segments.map((seg, i) => (
                      <div key={i} className="flex items-center gap-3">
                        <Badge
                          variant="outline"
                          className={
                            seg.density === 'dense'
                              ? 'border-destructive/30 text-destructive w-16 justify-center'
                              : seg.density === 'sparse'
                              ? 'border-warning/30 text-warning w-16 justify-center'
                              : 'border-success/30 text-success w-16 justify-center'
                          }
                        >
                          {seg.density}
                        </Badge>
                        <div className="flex-1">
                          <div className="h-2 rounded-full bg-secondary/40 overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                seg.density === 'dense'
                                  ? 'bg-destructive'
                                  : seg.density === 'sparse'
                                  ? 'bg-warning'
                                  : 'bg-success'
                              }`}
                              style={{ width: `${Math.min(100, seg.wordsPerSecond * 25)}%` }}
                            />
                          </div>
                        </div>
                        <span className="w-20 text-right text-xs text-muted-foreground">
                          {seg.wordsPerSecond} w/s
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="rounded-lg border border-border bg-secondary/20 p-3 text-xs text-muted-foreground">
                    <span className="font-medium text-foreground">Tip:</span> Dense segments (red) risk losing viewers who can't keep up.
                    Sparse segments (yellow) may feel slow. Aim for balanced (green) pacing throughout.
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Monetization & Policy Audit */}
            <TabsContent value="monetization" className="mt-4">
              <Card className="border-border bg-card/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Shield className="h-4 w-4 text-success" />
                    YouTube Monetization & Policy Audit
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className={`flex items-center gap-3 rounded-lg border p-4 ${monetizationFlags.length === 0 ? 'border-success/20 bg-success/5' : 'border-warning/20 bg-warning/5'}`}>
                    {monetizationFlags.length === 0 ? (
                      <>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-success/10">
                          <Shield className="h-5 w-5 text-success" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-success">100% Brand-Safe</p>
                          <p className="text-xs text-muted-foreground">No sensitive phrases detected in your script.</p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-warning/10">
                          <AlertTriangle className="h-5 w-5 text-warning" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-warning">{monetizationFlags.length} Flagged Term{monetizationFlags.length > 1 ? 's' : ''}</p>
                          <p className="text-xs text-muted-foreground">Review and replace flagged terms to ensure brand safety.</p>
                        </div>
                      </>
                    )}
                  </div>

                  {monetizationFlags.length > 0 && (
                    <div className="space-y-2">
                      {monetizationFlags.map((flag, i) => (
                        <div key={i} className="rounded-lg border border-warning/20 bg-warning/5 p-3 animate-fade-in">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={
                                flag.severity === 'high'
                                  ? 'bg-destructive/10 text-destructive border border-destructive/20'
                                  : flag.severity === 'medium'
                                  ? 'bg-warning/10 text-warning border border-warning/20'
                                  : 'bg-secondary text-muted-foreground border border-border'
                              }
                            >
                              {flag.severity}
                            </Badge>
                            <span className="text-sm font-medium text-warning">{flag.term}</span>
                          </div>
                          <p className="mt-1.5 text-xs text-muted-foreground">
                            <span className="text-foreground/70">Context:</span> "...{flag.context}..."
                          </p>
                          <p className="mt-1 text-xs text-success">
                            <span className="font-medium">Fix:</span> {flag.suggestion}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Community Post Architect */}
            <TabsContent value="community" className="mt-4">
              <Card className="border-border bg-card/60">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="h-4 w-4 text-accent" />
                    Community Post Architect
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    Auto-generated promotional blurbs configured for the YouTube Community Tab.
                  </p>
                  {communityPosts.map((post, i) => (
                    <div key={i} className="rounded-lg border border-border bg-secondary/20 p-4">
                      <div className="mb-2 flex items-center justify-between">
                        <Badge variant="secondary" className="bg-accent/10 text-accent">Post {i + 1}</Badge>
                        <CopyButton text={post} label="Copy Post" />
                      </div>
                      <p className="text-sm text-foreground/90">{post}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Master Prompt Constructor */}
            <TabsContent value="prompt" className="mt-4">
              <Card className="border-border bg-card/60">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Terminal className="h-4 w-4 text-primary" />
                    Master Prompt Constructor
                  </CardTitle>
                  <CopyButton text={masterPrompt} label="Copy Prompt" />
                </CardHeader>
                <CardContent>
                  <div className="max-h-96 overflow-y-auto scrollbar-thin rounded-lg border border-border bg-secondary/20 p-4">
                    <pre className="whitespace-pre-wrap text-sm text-foreground/90 font-mono leading-relaxed">{masterPrompt}</pre>
                  </div>
                  <p className="mt-3 text-xs text-muted-foreground">
                    Copy this prompt and paste it into any external LLM (ChatGPT, Claude, Gemini) to get a fully optimized script.
                  </p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value, score, color }: { icon: any; label: string; value: number; score: number; color: string }) {
  const colorMap: Record<string, string> = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    accent: 'text-accent bg-accent/10 border-accent/20',
    warning: 'text-warning bg-warning/10 border-warning/20',
  };
  return (
    <div className={`rounded-lg border p-3 ${colorMap[color]}`}>
      <div className="flex items-center gap-1.5 mb-1">
        <Icon className="h-3.5 w-3.5" />
        <span className="text-xs opacity-80">{label}</span>
      </div>
      <div className="flex items-baseline gap-2">
        <span className="text-xl font-bold">{value}</span>
        <span className="text-xs opacity-60">found</span>
      </div>
      {value > 0 && (
        <div className="mt-1 text-xs opacity-70">avg score: {Math.round(score)}</div>
      )}
    </div>
  );
}
