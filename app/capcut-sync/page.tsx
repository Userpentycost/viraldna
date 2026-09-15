'use client';

import { useState, useCallback, useRef } from 'react';
import JSZip from 'jszip';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { CopyButton } from '@/components/shared/copy-button';
import { MOCK_PIPELINE_TASKS, PipelineTask } from '@/lib/mock-data';
import {
  Film,
  Upload,
  Download,
  FolderOpen,
  Clock,
  Loader2,
  CheckCircle2,
  Circle,
  AlertCircle,
  Play,
  Layers,
  Scissors,
  Zap,
  FileJson,
  Terminal,
  Image as ImageIcon,
  Video,
  Music,
  Cpu,
} from 'lucide-react';

interface TimestampEntry {
  id: string;
  startTime: number;
  endTime: number;
  label: string;
  type: 'cut' | 'scene' | 'transition';
}

export default function CapCutSyncPage() {
  const [rawTimestamps, setRawTimestamps] = useState('');
  const [folderPath, setFolderPath] = useState('');
  const [timestamps, setTimestamps] = useState<TimestampEntry[]>([]);
  const [isPackaging, setIsPackaging] = useState(false);
  const [pipelineTasks, setPipelineTasks] = useState<PipelineTask[]>(MOCK_PIPELINE_TASKS);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const parseTimestamps = useCallback((raw: string): TimestampEntry[] => {
    const lines = raw.trim().split('\n').filter((l) => l.trim());
    const entries: TimestampEntry[] = [];

    // Try JSON first
    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((item: any, i: number) => ({
          id: `ts-${i}`,
          startTime: parseFloat(item.startTime || item.start || 0),
          endTime: parseFloat(item.endTime || item.end || 0),
          label: item.label || item.text || `Segment ${i + 1}`,
          type: item.type || 'cut',
        }));
      }
    } catch {
      // Not JSON, try SRT or CSV
    }

    // Try SRT format
    if (lines.some((l) => l.match(/^\d{2}:\d{2}[:.,]\d{2}/))) {
      for (let i = 0; i < lines.length; i += 4) {
        const timeLine = lines[i + 1];
        if (!timeLine) continue;
        const match = timeLine.match(/(\d{2}:\d{2}:\d{2}[.,]\d{3})\s*-->\s*(\d{2}:\d{2}:\d{2}[.,]\d{3})/);
        if (match) {
          const start = srtToSeconds(match[1]);
          const end = srtToSeconds(match[2]);
          const label = lines[i + 2] || `Segment ${entries.length + 1}`;
          entries.push({
            id: `ts-${entries.length}`,
            startTime: start,
            endTime: end,
            label: label.trim(),
            type: 'scene',
          });
        }
      }
      return entries;
    }

    // Try CSV format: startTime,endTime,label
    for (const line of lines) {
      const parts = line.split(',').map((p) => p.trim());
      if (parts.length >= 2) {
        const start = parseFloat(parts[0]);
        const end = parseFloat(parts[1]);
        if (!isNaN(start) && !isNaN(end)) {
          entries.push({
            id: `ts-${entries.length}`,
            startTime: start,
            endTime: end,
            label: parts[2] || `Segment ${entries.length + 1}`,
            type: (parts[3] as any) || 'cut',
          });
        }
      }
    }

    return entries;
  }, []);

  const handleParseTimestamps = () => {
    const parsed = parseTimestamps(rawTimestamps);
    if (parsed.length === 0) {
      toast({
        title: 'Parse Failed',
        description: 'Could not parse timestamps. Please use SRT, JSON, or CSV format.',
        variant: 'destructive',
      });
      return;
    }
    setTimestamps(parsed);
    toast({
      title: 'Timestamps Parsed',
      description: `${parsed.length} segments extracted successfully.`,
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setRawTimestamps(text);
          const parsed = parseTimestamps(text);
          setTimestamps(parsed);
          toast({
            title: 'File Loaded',
            description: `${parsed.length} segments parsed from ${file.name}`,
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const text = event.target?.result as string;
        if (text) {
          setRawTimestamps(text);
          const parsed = parseTimestamps(text);
          setTimestamps(parsed);
          toast({
            title: 'File Dropped',
            description: `${parsed.length} segments parsed from ${file.name}`,
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const handlePackage = async () => {
    if (timestamps.length === 0) {
      toast({
        title: 'No Timestamps',
        description: 'Please load timestamp data before packaging.',
        variant: 'destructive',
      });
      return;
    }

    setIsPackaging(true);
    try {
      const zip = new JSZip();

      // CapCut project structure
      const projectFolder = zip.folder('CapCut_Project');
      if (!projectFolder) throw new Error('Failed to create project folder');

      // draft_content.json - main CapCut project file
      const draftContent = {
        version: '1.0.0',
        platform: 'ViralDNA Legacy Suite',
        create_time: Date.now(),
        materials: timestamps.map((ts, i) => ({
          id: `material_${i}`,
          type: 'video',
          source_folder_path: folderPath || './assets',
          source_file: `scene_${i + 1}.mp4`,
          duration: ts.endTime - ts.startTime,
          start_time: ts.startTime,
          end_time: ts.endTime,
          label: ts.label,
          type_tag: ts.type,
        })),
        tracks: [
          {
            id: 'main_track',
            type: 'video',
            segments: timestamps.map((ts, i) => ({
              id: `segment_${i}`,
              material_id: `material_${i}`,
              target_timerange: {
                start: timestamps.slice(0, i).reduce((sum, t) => sum + (t.endTime - t.startTime), 0),
                duration: ts.endTime - ts.startTime,
              },
              source_timerange: {
                start: ts.startTime,
                duration: ts.endTime - ts.startTime,
              },
              clip: {
                reference_clip_id: `clip_${i}`,
                transform: { x: 0, y: 0 },
                scale: { x: 1, y: 1 },
              },
            })),
          },
          {
            id: 'audio_track',
            type: 'audio',
            segments: timestamps.map((ts, i) => ({
              id: `audio_segment_${i}`,
              material_id: `material_${i}`,
              target_timerange: {
                start: timestamps.slice(0, i).reduce((sum, t) => sum + (t.endTime - t.startTime), 0),
                duration: ts.endTime - ts.startTime,
              },
            })),
          },
        ],
        auto_flow_pipeline: pipelineTasks.map((task) => ({
          id: task.id,
          prompt: task.prompt,
          status: task.status,
          type: task.type,
          progress: task.progress,
        })),
      };

      projectFolder.file('draft_content.json', JSON.stringify(draftContent, null, 2));

      // meta info
      projectFolder.file('meta_info.json', JSON.stringify({
        app_id: 'com.viraldna.capcutsync',
        app_version: '1.0.0',
        project_name: 'ViralDNA_AutoSync_Project',
        created_at: new Date().toISOString(),
        source: 'ViralDNA Legacy Suite',
        total_segments: timestamps.length,
        total_duration: timestamps.reduce((sum, t) => sum + (t.endTime - t.startTime), 0),
      }, null, 2));

      // timeline config
      projectFolder.file('timeline_config.json', JSON.stringify({
        fps: 30,
        resolution: { width: 1920, height: 1080 },
        timeline: timestamps.map((ts, i) => ({
          index: i,
          start: ts.startTime,
          end: ts.endTime,
          label: ts.label,
          type: ts.type,
          anchor: 'timeline',
        })),
      }, null, 2));

      // README
      projectFolder.file('README.txt', `ViralDNA Legacy Suite - CapCut Auto-Sync Project
Generated: ${new Date().toISOString()}

Total Segments: ${timestamps.length}
Source Folder: ${folderPath || './assets'}

Instructions:
1. Open CapCut
2. Import this project folder
3. Assets will be auto-anchored to the timeline matching audio timestamps
4. Review and adjust as needed

Segments:
${timestamps.map((ts, i) => `${i + 1}. [${ts.startTime}s - ${ts.endTime}s] ${ts.label} (${ts.type})`).join('\n')}
`);

      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ViralDNA_CapCut_Project.zip';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: 'Project Packaged',
        description: 'CapCut project ZIP downloaded successfully.',
      });
    } catch (err) {
      toast({
        title: 'Packaging Failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    } finally {
      setIsPackaging(false);
    }
  };

  const simulatePipeline = () => {
    setPipelineTasks((prev) =>
      prev.map((task) => {
        if (task.status === 'queued') return { ...task, status: 'generating', progress: 10 };
        if (task.status === 'generating') {
          const newProgress = Math.min(100, task.progress + 20);
          return newProgress >= 100
            ? { ...task, status: 'complete', progress: 100 }
            : { ...task, progress: newProgress };
        }
        return task;
      })
    );
  };

  return (
    <div className="min-h-screen bg-grid">
      {/* Header */}
      <div className="border-b border-border bg-gradient-to-b from-card/40 to-background">
        <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-accent glow-blue">
              <Film className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                CapCut <span className="text-gradient-electric">Sync</span>
              </h1>
              <p className="text-sm text-muted-foreground">Local Video Automation & Timeline Sync Engine</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Left: Input Workspace */}
          <div className="space-y-4">
            {/* Timestamp Input */}
            <Card className="border-border bg-card/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Clock className="h-4 w-4 text-primary" />
                  Timestamp Input
                  <Badge variant="secondary" className="bg-secondary/40 ml-auto">SRT / JSON / CSV</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div
                  onDrop={handleDrop}
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  className={`rounded-lg border-2 border-dashed p-4 transition-colors ${
                    dragOver ? 'border-primary bg-primary/5' : 'border-border bg-secondary/20'
                  }`}
                >
                  <div className="flex flex-col items-center justify-center gap-2 py-4 text-center">
                    <Upload className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm text-muted-foreground">
                      Drag & drop a timestamp file here, or
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      className="border-border"
                    >
                      <FolderOpen className="mr-1.5 h-3.5 w-3.5" />
                      Browse Files
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".srt,.json,.csv,.txt"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                </div>

                <Textarea
                  value={rawTimestamps}
                  onChange={(e) => setRawTimestamps(e.target.value)}
                  placeholder={`Paste SRT, JSON, or CSV timestamps here...

Example CSV:
0,5.5,Intro,scene
5.5,12.3,Main Content,cut
12.3,18.0,Outro,transition`}
                  className="min-h-[140px] resize-y border-border bg-secondary/20 font-mono text-xs scrollbar-thin"
                />

                <Button
                  onClick={handleParseTimestamps}
                  variant="outline"
                  className="w-full border-border"
                >
                  <FileJson className="mr-1.5 h-3.5 w-3.5" />
                  Parse Timestamps
                </Button>
              </CardContent>
            </Card>

            {/* Folder Path */}
            <Card className="border-border bg-card/60">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <FolderOpen className="h-4 w-4 text-accent" />
                  Asset Folder Reference
                </CardTitle>
              </CardHeader>
              <CardContent>
                <input
                  type="text"
                  value={folderPath}
                  onChange={(e) => setFolderPath(e.target.value)}
                  placeholder="/Users/creator/Videos/assets or C:\Videos\assets"
                  className="w-full rounded-md border border-border bg-secondary/20 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/30 focus:outline-none"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  Local folder path where visual assets are stored. Will be referenced in the project config.
                </p>
              </CardContent>
            </Card>

            {/* Parsed Timestamps Display */}
            {timestamps.length > 0 && (
              <Card className="border-border bg-card/60 animate-fade-in">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Scissors className="h-4 w-4 text-primary" />
                    Parsed Segments
                    <Badge variant="secondary" className="bg-primary/10 text-primary ml-auto">
                      {timestamps.length} segments
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="max-h-48 space-y-1.5 overflow-y-auto scrollbar-thin">
                    {timestamps.map((ts, i) => (
                      <div key={ts.id} className="flex items-center gap-3 rounded-lg border border-border bg-secondary/20 px-3 py-2">
                        <span className="flex h-6 w-6 items-center justify-center rounded bg-primary/10 text-xs font-medium text-primary">
                          {i + 1}
                        </span>
                        <div className="flex-1 min-w-0">
                          <p className="truncate text-sm text-foreground">{ts.label}</p>
                          <p className="text-xs text-muted-foreground">
                            {ts.startTime}s → {ts.endTime}s ({(ts.endTime - ts.startTime).toFixed(1)}s)
                          </p>
                        </div>
                        <Badge variant="outline" className="border-border text-xs text-muted-foreground">{ts.type}</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Package Button */}
            <Button
              onClick={handlePackage}
              disabled={isPackaging || timestamps.length === 0}
              className="w-full h-12 bg-gradient-to-r from-primary to-accent text-white hover:opacity-90"
            >
              {isPackaging ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Packaging Project...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Generate CapCut Project ZIP
                </>
              )}
            </Button>
          </div>

          {/* Right: Auto-Flow Pipeline Simulator */}
          <div className="space-y-4">
            <Card className="border-border bg-card/60">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Cpu className="h-4 w-4 text-accent" />
                  Auto-Flow Pipeline Simulator
                </CardTitle>
                <Button
                  onClick={simulatePipeline}
                  size="sm"
                  variant="outline"
                  className="border-border"
                >
                  <Play className="mr-1.5 h-3.5 w-3.5" />
                  Run Cycle
                </Button>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-muted-foreground">
                  Simulates a background browser extension generating batch visual prompt assets for direct project integration.
                </p>

                {/* Pipeline stats */}
                <div className="grid grid-cols-4 gap-2">
                  <PipelineStat label="Queued" count={pipelineTasks.filter(t => t.status === 'queued').length} color="text-muted-foreground" icon={Circle} />
                  <PipelineStat label="Active" count={pipelineTasks.filter(t => t.status === 'generating').length} color="text-primary" icon={Loader2} />
                  <PipelineStat label="Complete" count={pipelineTasks.filter(t => t.status === 'complete').length} color="text-success" icon={CheckCircle2} />
                  <PipelineStat label="Failed" count={pipelineTasks.filter(t => t.status === 'failed').length} color="text-destructive" icon={AlertCircle} />
                </div>

                {/* Task list */}
                <div className="space-y-2">
                  {pipelineTasks.map((task) => (
                    <PipelineTaskCard key={task.id} task={task} />
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Pipeline Info */}
            <Card className="border-border bg-card/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Layers className="h-4 w-4 text-primary" />
                  How It Works
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { icon: FileJson, title: '1. Load Timestamps', desc: 'Drop SRT, JSON, or CSV files containing audio cut timestamps' },
                    { icon: FolderOpen, title: '2. Reference Assets', desc: 'Point to your local folder of visual assets' },
                    { icon: Zap, title: '3. Auto-Flow Pipeline', desc: 'Simulated extension generates batch visual prompts' },
                    { icon: Download, title: '4. Package & Import', desc: 'Download a ZIP formatted for direct CapCut folder-import' },
                  ].map((step, i) => (
                    <div key={i} className="flex items-start gap-3">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-secondary/40 border border-border">
                        <step.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{step.title}</p>
                        <p className="text-xs text-muted-foreground">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

function srtToSeconds(srt: string): number {
  const match = srt.match(/(\d{2}):(\d{2}):(\d{2})[.,](\d{3})/);
  if (!match) return 0;
  const [, h, m, s, ms] = match;
  return parseInt(h) * 3600 + parseInt(m) * 60 + parseInt(s) + parseInt(ms) / 1000;
}

function PipelineStat({ label, count, color, icon: Icon }: { label: string; count: number; color: string; icon: any }) {
  return (
    <div className="rounded-lg border border-border bg-secondary/20 p-2 text-center">
      <Icon className={`mx-auto mb-1 h-3.5 w-3.5 ${color} ${count > 0 && label === 'Active' ? 'animate-spin' : ''}`} />
      <div className={`text-lg font-bold ${color}`}>{count}</div>
      <div className="text-xs text-muted-foreground">{label}</div>
    </div>
  );
}

function PipelineTaskCard({ task }: { task: PipelineTask }) {
  const typeIcon = task.type === 'image' ? ImageIcon : task.type === 'video' ? Video : Music;
  const Icon = typeIcon;

  return (
    <div className="rounded-lg border border-border bg-secondary/20 p-3">
      <div className="flex items-center gap-2">
        <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${
          task.status === 'complete' ? 'bg-success/10' :
          task.status === 'generating' ? 'bg-primary/10' :
          task.status === 'failed' ? 'bg-destructive/10' :
          'bg-secondary/40'
        }`}>
          <Icon className={`h-3.5 w-3.5 ${
            task.status === 'complete' ? 'text-success' :
            task.status === 'generating' ? 'text-primary' :
            task.status === 'failed' ? 'text-destructive' :
            'text-muted-foreground'
          }`} />
        </div>
        <p className="flex-1 truncate text-xs text-foreground/80">{task.prompt}</p>
        {task.status === 'complete' && <CheckCircle2 className="h-4 w-4 text-success shrink-0" />}
        {task.status === 'generating' && <Loader2 className="h-4 w-4 text-primary animate-spin shrink-0" />}
        {task.status === 'queued' && <Circle className="h-4 w-4 text-muted-foreground shrink-0" />}
      </div>
      {task.status === 'generating' && (
        <div className="mt-2 h-1.5 rounded-full bg-secondary/40 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
            style={{ width: `${task.progress}%` }}
          />
        </div>
      )}
      {task.status === 'complete' && (
        <div className="mt-1.5 flex items-center justify-between">
          <Badge variant="secondary" className="bg-success/10 text-success text-xs">Ready</Badge>
          <span className="text-xs text-muted-foreground">{task.type} asset generated</span>
        </div>
      )}
    </div>
  );
}
