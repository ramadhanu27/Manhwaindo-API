import { getChapterImages } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Helper function to clean slugs
const cleanSlug = (slug: string) => slug.replace(/\/+$/, '').trim();

export default async function ChapterPage({
  params,
}: {
  params: Promise<{ slug: string; chapter: string }>;
}) {
  const { slug, chapter } = await params;
  
  console.log('Chapter page params:', { slug, chapter });
  
  // Validate chapter slug
  if (!chapter || chapter.trim() === '') {
    console.error('Invalid chapter slug');
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Invalid Chapter</h1>
          <p className="text-muted-foreground mb-4">Chapter slug is empty or invalid.</p>
          <Link
            href={`/series/${encodeURIComponent(cleanSlug(slug))}`}
            className="inline-block px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors"
          >
            Back to Series
          </Link>
        </div>
      </div>
    );
  }
  
  const data = await getChapterImages(chapter);
  
  console.log('Chapter data:', data);
  
  // API returns { success: true, data: { images: [...], title: "...", prevChapter: "...", nextChapter: "..." } }
  const chapterData = data?.data || data || {};
  const images = chapterData?.images || [];
  
  if (!data?.success || !images || images.length === 0) {
    console.error('Chapter not found or no images:', { slug, chapter, data });
    
    // Return error page instead of 404
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Chapter Not Found</h1>
          <p className="text-muted-foreground mb-4">
            Unable to load chapter images. The API may not have returned any data.
          </p>
          <div className="bg-card border border-border rounded-lg p-4 mb-6 max-w-2xl mx-auto">
            <p className="text-sm text-muted-foreground mb-2">Debug Info:</p>
            <p className="text-xs font-mono text-left">Series: {slug}</p>
            <p className="text-xs font-mono text-left">Chapter: {chapter}</p>
            <p className="text-xs font-mono text-left">API Response: {JSON.stringify(data)}</p>
          </div>
          <Link
            href={`/series/${encodeURIComponent(cleanSlug(slug))}`}
            className="inline-block px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors"
          >
            Back to Series
          </Link>
        </div>
      </div>
    );
  }

  const chapterTitle = chapterData.title || chapter.replace(/-/g, ' ');
  // API returns prev/next in reverse order, so we swap them
  const prevChapter = chapterData.nextChapter;
  const nextChapter = chapterData.prevChapter;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card py-6 border-b border-border">
        <div className="container mx-auto px-4">
          {/* Chapter Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-4">
            {chapterTitle}
          </h1>

          {/* Social Share Buttons */}
          <div className="flex justify-center gap-2 mb-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
              </svg>
              Facebook
            </button>
            <button className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
              </svg>
              Twitter
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
              </svg>
              WhatsApp
            </button>
            <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
              </svg>
              Pinterest
            </button>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
              </svg>
              Telegram
            </button>
          </div>

          {/* Chapter Navigation */}
          <div className="flex items-center justify-center gap-3 flex-wrap">
            {prevChapter ? (
              <Link
                href={`/series/${encodeURIComponent(cleanSlug(slug))}/${encodeURIComponent(cleanSlug(prevChapter))}`}
                className="bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded font-semibold transition-colors"
              >
                ← Previous
              </Link>
            ) : (
              <button disabled className="bg-muted text-muted-foreground px-4 py-2 rounded font-semibold cursor-not-allowed">
                ← Previous
              </button>
            )}
            <div className="text-sm font-semibold text-foreground bg-background px-4 py-2 rounded border border-border">
              {chapterTitle}
            </div>
            {nextChapter ? (
              <Link
                href={`/series/${encodeURIComponent(cleanSlug(slug))}/${encodeURIComponent(cleanSlug(nextChapter))}`}
                className="bg-secondary hover:bg-secondary/80 text-foreground px-4 py-2 rounded font-semibold transition-colors"
              >
                Next →
              </Link>
            ) : (
              <button disabled className="bg-muted text-muted-foreground px-4 py-2 rounded font-semibold cursor-not-allowed">
                Next →
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Chapter Images */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-0 bg-card border border-border rounded-lg overflow-hidden">
          {images.map((imageUrl: string, idx: number) => (
            <div key={idx} className="relative w-full bg-background">
              <img
                src={imageUrl}
                alt={`Page ${idx + 1}`}
                className="w-full h-auto"
                loading={idx < 3 ? 'eager' : 'lazy'}
              />
            </div>
          ))}
        </div>

        {/* Bottom Navigation */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          {prevChapter ? (
            <Link
              href={`/series/${encodeURIComponent(cleanSlug(slug))}/${encodeURIComponent(cleanSlug(prevChapter))}`}
              className="w-full sm:w-auto px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg font-semibold transition-colors text-center"
            >
              ← Previous Chapter
            </Link>
          ) : (
            <button disabled className="w-full sm:w-auto px-6 py-3 bg-muted text-muted-foreground rounded-lg font-semibold cursor-not-allowed">
              ← Previous Chapter
            </button>
          )}
          <Link
            href={`/series/${encodeURIComponent(cleanSlug(slug))}`}
            className="w-full sm:w-auto px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground text-center rounded-lg font-semibold transition-colors"
          >
            Chapter List
          </Link>
          {nextChapter ? (
            <Link
              href={`/series/${encodeURIComponent(cleanSlug(slug))}/${encodeURIComponent(cleanSlug(nextChapter))}`}
              className="w-full sm:w-auto px-6 py-3 bg-secondary hover:bg-secondary/80 text-foreground rounded-lg font-semibold transition-colors text-center"
            >
              Next Chapter →
            </Link>
          ) : (
            <button disabled className="w-full sm:w-auto px-6 py-3 bg-muted text-muted-foreground rounded-lg font-semibold cursor-not-allowed">
              Next Chapter →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
