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
  
  const data = await getChapterImages(chapter);
  
  console.log('Chapter data:', data);
  
  // API returns { success: true, data: { images: [...] } }
  const chapterData = data.data || data;
  const images = chapterData.images || [];
  
  if (!data.success || !images || images.length === 0) {
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

  return (
    <div className="min-h-screen bg-background">
      {/* Chapter Navigation */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <Link
              href={`/series/${encodeURIComponent(cleanSlug(slug))}`}
              className="text-sm text-muted-foreground hover:text-primary flex items-center gap-1"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
              </svg>
              Back to Series
            </Link>
            
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm transition-colors">
                Previous
              </button>
              <button className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg text-sm transition-colors">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Chapter Images */}
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-2">
          {images.map((imageUrl: string, idx: number) => (
            <div key={idx} className="relative w-full bg-muted rounded-lg overflow-hidden">
              <Image
                src={imageUrl}
                alt={`Page ${idx + 1}`}
                width={1200}
                height={1800}
                className="w-full h-auto"
                priority={idx < 3}
              />
            </div>
          ))}
        </div>

        {/* Bottom Navigation */}
        <div className="mt-8 flex items-center justify-center gap-4">
          <button className="px-6 py-3 bg-secondary hover:bg-secondary/80 rounded-lg font-semibold transition-colors">
            Previous Chapter
          </button>
          <Link
            href={`/series/${encodeURIComponent(cleanSlug(slug))}`}
            className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg font-semibold transition-colors"
          >
            Chapter List
          </Link>
          <button className="px-6 py-3 bg-secondary hover:bg-secondary/80 rounded-lg font-semibold transition-colors">
            Next Chapter
          </button>
        </div>
      </div>
    </div>
  );
}
