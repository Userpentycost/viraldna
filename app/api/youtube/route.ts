import { NextRequest, NextResponse } from 'next/server';
import { parseYouTubeUrl, generateMockVideoData, YouTubeVideoData } from '@/lib/youtube';
import { runSEOAudit } from '@/lib/seo';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const url: string = body?.url;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: 'Missing or invalid URL field.', code: 'MISSING_URL' },
        { status: 400 }
      );
    }

    const videoId = parseYouTubeUrl(url);

    if (!videoId) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Invalid YouTube URL. Please provide a standard watch URL, short link, or embed URL.',
          code: 'INVALID_URL',
        },
        { status: 400 }
      );
    }

    const apiKey = process.env.YOUTUBE_API_KEY;

    let videoData: YouTubeVideoData;

    if (apiKey) {
      try {
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails&id=${videoId}&key=${apiKey}`;
        const res = await fetch(apiUrl);

        if (!res.ok) {
          throw new Error(`YouTube API returned ${res.status}`);
        }

        const json = await res.json();

        if (!json.items || json.items.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Video not found or is private.', code: 'VIDEO_NOT_FOUND' },
            { status: 404 }
          );
        }

        const item = json.items[0];
        const snippet = item.snippet;
        const stats = item.statistics;
        const contentDetails = item.contentDetails;

        const channelRes = await fetch(
          `https://www.googleapis.com/youtube/v3/channels?part=statistics&id=${snippet.channelId}&key=${apiKey}`
        );
        const channelJson = await channelRes.json();
        const channelStats = channelJson.items?.[0]?.statistics?.viewCount || 0;

        videoData = {
          videoId,
          title: snippet.title || '',
          description: snippet.description || '',
          tags: snippet.tags || [],
          category: snippet.categoryId || 'Unknown',
          viewCount: parseInt(stats.viewCount || '0', 10),
          channelTitle: snippet.channelTitle || '',
          channelId: snippet.channelId || '',
          channelViewBaseline: parseInt(String(channelStats), 10),
          thumbnailMaxRes:
            snippet.thumbnails?.maxres?.url ||
            snippet.thumbnails?.high?.url ||
            `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`,
          thumbnailDefault:
            snippet.thumbnails?.medium?.url ||
            `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`,
          publishedAt: snippet.publishedAt || '',
          duration: contentDetails?.duration || '',
          likeCount: parseInt(stats.likeCount || '0', 10),
          commentCount: parseInt(stats.commentCount || '0', 10),
        };
      } catch {
        videoData = generateMockVideoData(videoId);
      }
    } else {
      videoData = generateMockVideoData(videoId);
    }

    const seoAudit = runSEOAudit(videoData);

    return NextResponse.json({
      success: true,
      data: { video: videoData, seoAudit },
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown server error';
    return NextResponse.json(
      { success: false, error: message, code: 'SERVER_ERROR' },
      { status: 500 }
    );
  }
}
