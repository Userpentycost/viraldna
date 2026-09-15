export interface YouTubeVideoData {
  videoId: string;
  title: string;
  description: string;
  tags: string[];
  category: string;
  viewCount: number;
  channelTitle: string;
  channelId: string;
  channelViewBaseline: number;
  thumbnailMaxRes: string;
  thumbnailDefault: string;
  publishedAt: string;
  duration: string;
  likeCount: number;
  commentCount: number;
}

export function parseYouTubeUrl(url: string): string | null {
  if (!url || typeof url !== 'string') return null;
  const trimmed = url.trim();

  const patterns: RegExp[] = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/shorts\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  ];

  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) return match[1];
  }

  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) return trimmed;

  return null;
}

export function isValidYouTubeUrl(url: string): boolean {
  return parseYouTubeUrl(url) !== null;
}

const VIDEO_CATEGORIES: Record<string, string> = {
  '1': 'Film & Animation',
  '2': 'Cars & Vehicles',
  '10': 'Music',
  '15': 'Pets & Animals',
  '17': 'Sports',
  '19': 'Travel & Events',
  '20': 'Gaming',
  '22': 'People & Blogs',
  '23': 'Comedy',
  '24': 'Entertainment',
  '25': 'News & Politics',
  '26': 'Howto & Style',
  '27': 'Education',
  '28': 'Science & Tech',
  '29': 'Nonprofits & Activism',
};

export function getCategoryName(categoryId: string): string {
  return VIDEO_CATEGORIES[categoryId] || 'Unknown';
}

export function formatViewCount(count: number): string {
  if (count >= 1_000_000_000) return `${(count / 1_000_000_000).toFixed(1)}B`;
  if (count >= 1_000_000) return `${(count / 1_000_000).toFixed(1)}M`;
  if (count >= 1_000) return `${(count / 1_000).toFixed(1)}K`;
  return count.toString();
}

export function generateMockVideoData(videoId: string): YouTubeVideoData {
  const mockTitles = [
    'I Built a $10,000 Gaming Setup in 24 Hours',
    'The Truth About Productivity Apps Nobody Tells You',
    'Why This Tiny Channel Went Viral Overnight',
    'Surviving 100 Days in Hardcore Minecraft',
    'How I Edit Videos 10x Faster (Secret Workflow)',
    'The AI Revolution Is Happening Right Now',
    'I Tried Every Productivity Method For 30 Days',
    'This Simple Trick Changed My Life Forever',
  ];

  const mockDescriptions = [
    'In this video, I break down exactly how I achieved this incredible result. If you found this helpful, smash that like button and subscribe for more content every week!\n\nTimestamps:\n0:00 Intro\n1:23 The Setup\n5:45 The Process\n10:30 Results\n\nFollow me on social media for behind-the-scenes content and daily updates.\n\n#productivity #motivation #success #contentcreation #youtube',
    'Everything you need to know about this topic in one comprehensive guide. I spent months researching this so you dont have to.\n\nTools I use:\n- Camera setup\n- Editing software\n- My favorite gear\n\nSubscribe for weekly deep dives into topics that actually matter.\n\n#deepdive #tutorial #guide #howto #beginners',
  ];

  const mockTagsSets = [
    ['productivity', 'motivation', 'success', 'content creation', 'youtube growth', 'viral', 'algorithm', 'how to grow on youtube', 'video editing', 'creator economy'],
    ['minecraft', 'hardcore', 'survival', 'gaming', '100 days', 'challenge', 'minecraft hardcore', 'survival series', 'gaming channel', 'lets play'],
    ['ai', 'artificial intelligence', 'technology', 'future', 'tech news', 'machine learning', 'chatgpt', 'ai tools', 'automation', 'digital transformation'],
  ];

  const titleIdx = videoId.charCodeAt(0) % mockTitles.length;
  const descIdx = videoId.charCodeAt(1) % mockDescriptions.length;
  const tagsIdx = videoId.charCodeAt(2) % mockTagsSets.length;
  const categoryIds = ['22', '24', '28', '26', '20', '10'];
  const catIdx = videoId.charCodeAt(3) % categoryIds.length;

  const viewCount = 50000 + (videoId.charCodeAt(4) * 10000) % 5000000;
  const channelViewBaseline = 100000 + (videoId.charCodeAt(5) * 50000) % 800000;

  return {
    videoId,
    title: mockTitles[titleIdx],
    description: mockDescriptions[descIdx],
    tags: mockTagsSets[tagsIdx],
    category: getCategoryName(categoryIds[catIdx]),
    viewCount,
    channelTitle: 'CreatorChannel',
    channelId: 'UC' + videoId.padEnd(22, 'x'),
    channelViewBaseline,
    thumbnailMaxRes: `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
    thumbnailDefault: `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
    publishedAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    duration: 'PT12M30S',
    likeCount: Math.floor(viewCount * 0.05),
    commentCount: Math.floor(viewCount * 0.01),
  };
}
