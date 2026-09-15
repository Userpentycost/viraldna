export interface ViralChannel {
  id: string;
  channelName: string;
  channelAvatar: string;
  averageViews: number;
  outlierVideoTitle: string;
  outlierViewCount: number;
  multiplier: number;
  niche: string;
  thumbnailUrl: string;
}

export interface NicheKeyword {
  keyword: string;
  niche: string;
  status: 'Rising' | 'Breakout' | 'Saturated';
  trendScore: number;
  growthRate: number;
}

export const MOCK_VIRAL_CHANNELS: ViralChannel[] = [
  {
    id: '1',
    channelName: 'TechFlow Daily',
    channelAvatar: 'TF',
    averageViews: 45000,
    outlierVideoTitle: 'I Replaced My Entire Workflow with AI in 7 Days',
    outlierViewCount: 890000,
    multiplier: 1878,
    niche: 'Technology',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
  },
  {
    id: '2',
    channelName: 'Productivity Lab',
    channelAvatar: 'PL',
    averageViews: 28000,
    outlierVideoTitle: 'The 5 AM Routine That Broke My Brain (Then Fixed It)',
    outlierViewCount: 312000,
    multiplier: 1014,
    niche: 'Productivity',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
  },
  {
    id: '3',
    channelName: 'Gaming Apex',
    channelAvatar: 'GA',
    averageViews: 120000,
    outlierVideoTitle: 'This Game Was Hiding a Secret for 10 Years',
    outlierViewCount: 1850000,
    multiplier: 1442,
    niche: 'Gaming',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
  },
  {
    id: '4',
    channelName: 'Finance Simplified',
    channelAvatar: 'FS',
    averageViews: 35000,
    outlierVideoTitle: 'How I Saved $50K on a $40K Salary (Exact Steps)',
    outlierViewCount: 620000,
    multiplier: 1671,
    niche: 'Finance',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
  },
  {
    id: '5',
    channelName: 'Create with Maya',
    channelAvatar: 'CM',
    averageViews: 18000,
    outlierVideoTitle: 'I Made a Short Film Using Only AI Tools',
    outlierViewCount: 295000,
    multiplier: 1539,
    niche: 'Film & Animation',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
  },
  {
    id: '6',
    channelName: 'FitLife Jordan',
    channelAvatar: 'FJ',
    averageViews: 52000,
    outlierVideoTitle: '30 Days of Cold Plunging Changed Everything',
    outlierViewCount: 410000,
    multiplier: 688,
    niche: 'Health & Fitness',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
  },
  {
    id: '7',
    channelName: 'CodeCraft',
    channelAvatar: 'CC',
    averageViews: 22000,
    outlierVideoTitle: 'I Built a SaaS in 48 Hours (Full Process)',
    outlierViewCount: 380000,
    multiplier: 1627,
    niche: 'Programming',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
  },
  {
    id: '8',
    channelName: 'Mindset Mastery',
    channelAvatar: 'MM',
    averageViews: 40000,
    outlierVideoTitle: 'The Psychology of People Who Never Give Up',
    outlierViewCount: 540000,
    multiplier: 1250,
    niche: 'Self-Improvement',
    thumbnailUrl: 'https://i.ytimg.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
  },
];

export const MOCK_NICHE_KEYWORDS: NicheKeyword[] = [
  { keyword: 'AI workflow automation', niche: 'Technology', status: 'Breakout', trendScore: 94, growthRate: 312 },
  { keyword: 'ChatGPT productivity', niche: 'Technology', status: 'Rising', trendScore: 78, growthRate: 145 },
  { keyword: 'AI video editing', niche: 'Technology', status: 'Breakout', trendScore: 89, growthRate: 267 },
  { keyword: 'smartphone review', niche: 'Technology', status: 'Saturated', trendScore: 35, growthRate: -12 },
  { keyword: '5 AM routine', niche: 'Productivity', status: 'Rising', trendScore: 72, growthRate: 89 },
  { keyword: 'deep work method', niche: 'Productivity', status: 'Breakout', trendScore: 85, growthRate: 198 },
  { keyword: 'notion templates', niche: 'Productivity', status: 'Saturated', trendScore: 42, growthRate: -5 },
  { keyword: 'time blocking', niche: 'Productivity', status: 'Rising', trendScore: 68, growthRate: 112 },
  { keyword: 'hardcore minecraft', niche: 'Gaming', status: 'Saturated', trendScore: 38, growthRate: -8 },
  { keyword: 'indie game secrets', niche: 'Gaming', status: 'Breakout', trendScore: 91, growthRate: 245 },
  { keyword: 'speedrun strategy', niche: 'Gaming', status: 'Rising', trendScore: 65, growthRate: 78 },
  { keyword: 'hidden game mechanics', niche: 'Gaming', status: 'Breakout', trendScore: 87, growthRate: 201 },
  { keyword: 'passive income 2025', niche: 'Finance', status: 'Breakout', trendScore: 93, growthRate: 289 },
  { keyword: 'budgeting apps', niche: 'Finance', status: 'Rising', trendScore: 71, growthRate: 134 },
  { keyword: 'stock market basics', niche: 'Finance', status: 'Saturated', trendScore: 40, growthRate: -3 },
  { keyword: 'side hustle ideas', niche: 'Finance', status: 'Rising', trendScore: 76, growthRate: 156 },
  { keyword: 'AI filmmaking', niche: 'Film & Animation', status: 'Breakout', trendScore: 95, growthRate: 340 },
  { keyword: 'short film tutorial', niche: 'Film & Animation', status: 'Rising', trendScore: 64, growthRate: 98 },
  { keyword: 'color grading', niche: 'Film & Animation', status: 'Saturated', trendScore: 45, growthRate: 2 },
  { keyword: 'cold plunge benefits', niche: 'Health & Fitness', status: 'Breakout', trendScore: 88, growthRate: 215 },
  { keyword: 'home workout plan', niche: 'Health & Fitness', status: 'Saturated', trendScore: 36, growthRate: -10 },
  { keyword: 'mobility routine', niche: 'Health & Fitness', status: 'Rising', trendScore: 70, growthRate: 121 },
  { keyword: 'build SaaS fast', niche: 'Programming', status: 'Breakout', trendScore: 90, growthRate: 234 },
  { keyword: 'Next.js tutorial', niche: 'Programming', status: 'Rising', trendScore: 73, growthRate: 102 },
  { keyword: 'React hooks', niche: 'Programming', status: 'Saturated', trendScore: 44, growthRate: -1 },
  { keyword: 'resilience mindset', niche: 'Self-Improvement', status: 'Breakout', trendScore: 86, growthRate: 187 },
  { keyword: 'dopamine detox', niche: 'Self-Improvement', status: 'Rising', trendScore: 75, growthRate: 143 },
  { keyword: 'morning habits', niche: 'Self-Improvement', status: 'Saturated', trendScore: 41, growthRate: -7 },
];

export interface PipelineTask {
  id: string;
  prompt: string;
  status: 'queued' | 'generating' | 'complete' | 'failed';
  progress: number;
  type: 'image' | 'video' | 'audio';
}

export const MOCK_PIPELINE_TASKS: PipelineTask[] = [
  { id: 'task-1', prompt: 'Cinematic intro shot of creator at desk with neon lighting', status: 'complete', progress: 100, type: 'image' },
  { id: 'task-2', prompt: 'B-roll: hands typing on mechanical keyboard, close-up', status: 'generating', progress: 67, type: 'video' },
  { id: 'task-3', prompt: 'Text overlay: "The Secret Nobody Tells You"', status: 'complete', progress: 100, type: 'image' },
  { id: 'task-4', prompt: 'Transition: glitch effect between scenes', status: 'generating', progress: 34, type: 'video' },
  { id: 'task-5', prompt: 'Background ambient track: lo-fi beat, 120 BPM', status: 'queued', progress: 0, type: 'audio' },
  { id: 'task-6', prompt: 'Outro card: subscribe button animation with particle effect', status: 'queued', progress: 0, type: 'image' },
];
