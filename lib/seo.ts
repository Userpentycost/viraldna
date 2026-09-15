import { YouTubeVideoData } from './youtube';

export interface SEOAuditResult {
  keywordDensity: { keyword: string; count: number; percentage: number }[];
  placementVisibility: {
    keywordInFirst200: boolean;
    flaggedKeywords: string[];
  };
  searchDiscoveryScore: number;
  scoreBreakdown: {
    titleLength: number;
    descriptionLength: number;
    tagCount: number;
    keywordPlacement: number;
    overallOptimization: number;
  };
}

export function calculateKeywordDensity(text: string, tags: string[]): SEOAuditResult['keywordDensity'] {
  if (!text || tags.length === 0) return [];
  const lowerText = text.toLowerCase();
  const wordCount = text.split(/\s+/).filter(Boolean).length || 1;

  return tags.map((tag) => {
    const escaped = tag.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(escaped, 'g');
    const matches = lowerText.match(regex);
    const count = matches ? matches.length : 0;
    const percentage = (count / wordCount) * 100;
    return { keyword: tag, count, percentage: Math.round(percentage * 100) / 100 };
  });
}

export function checkPlacementVisibility(text: string, tags: string[]): SEOAuditResult['placementVisibility'] {
  if (!text || tags.length === 0) {
    return { keywordInFirst200: false, flaggedKeywords: [] };
  }
  const first200 = text.substring(0, 200).toLowerCase();
  const flagged = tags.filter((tag) => !first200.includes(tag.toLowerCase()));
  return {
    keywordInFirst200: flagged.length === 0,
    flaggedKeywords: flagged,
  };
}

export function calculateSearchDiscoveryScore(data: YouTubeVideoData): number {
  let score = 0;
  const text = `${data.title} ${data.description}`;

  const titleLength = data.title.length;
  if (titleLength >= 40 && titleLength <= 70) score += 20;
  else if (titleLength >= 30 && titleLength <= 80) score += 12;
  else score += 5;

  const descLength = data.description.length;
  if (descLength >= 250) score += 20;
  else if (descLength >= 100) score += 12;
  else score += 5;

  const tagCount = data.tags.length;
  if (tagCount >= 10 && tagCount <= 20) score += 20;
  else if (tagCount >= 5) score += 12;
  else score += 5;

  const placement = checkPlacementVisibility(text, data.tags);
  if (placement.keywordInFirst200) score += 20;
  else if (placement.flaggedKeywords.length <= 2) score += 10;
  else score += 3;

  const density = calculateKeywordDensity(text, data.tags);
  const hasGoodDensity = density.some((d) => d.percentage > 0.5 && d.percentage < 3);
  if (hasGoodDensity) score += 20;
  else score += 8;

  return Math.min(100, score);
}

export function runSEOAudit(data: YouTubeVideoData): SEOAuditResult {
  const text = `${data.title} ${data.description}`;
  return {
    keywordDensity: calculateKeywordDensity(text, data.tags),
    placementVisibility: checkPlacementVisibility(text, data.tags),
    searchDiscoveryScore: calculateSearchDiscoveryScore(data),
    scoreBreakdown: {
      titleLength: data.title.length,
      descriptionLength: data.description.length,
      tagCount: data.tags.length,
      keywordPlacement: 0,
      overallOptimization: 0,
    },
  };
}
