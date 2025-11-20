import { getSeriesDetail } from '@/lib/api';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';

// Helper function to clean slugs
const cleanSlug = (slug: string) => slug.replace(/\/+$/, '').trim();

export default async function SeriesDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const data = await getSeriesDetail(slug);
  
  if (!data.success || !data.data) {
    notFound();
  }

  const series = data.data;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cover Image */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <div className="relative aspect-[2/3] rounded-lg overflow-hidden bg-muted">
              <Image
                src={series.image || '/placeholder.jpg'}
                alt={series.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            
            {/* Action Buttons */}
            <div className="mt-4 space-y-2">
              {series.chapters && series.chapters.length > 0 && (
                <Link
                  href={`/series/${encodeURIComponent(cleanSlug(slug))}/${encodeURIComponent(cleanSlug(series.chapters[0].slug))}`}
                  className="block w-full bg-primary hover:bg-primary/90 text-primary-foreground text-center py-3 rounded-lg font-semibold transition-colors"
                >
                  Start Reading
                </Link>
              )}
              <button className="w-full bg-secondary hover:bg-secondary/80 text-foreground py-3 rounded-lg font-semibold transition-colors">
                Add to Bookmark
              </button>
            </div>
          </div>
        </div>

        {/* Info */}
        <div className="lg:col-span-2">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">{series.title}</h1>
          
          {/* Metadata */}
          <div className="grid grid-cols-2 gap-4 mb-6 p-4 bg-card border border-border rounded-lg">
            {series.status && (
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                <p className="font-semibold">{series.status}</p>
              </div>
            )}
            {series.type && (
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-semibold">{series.type}</p>
              </div>
            )}
            {series.author && (
              <div>
                <p className="text-sm text-muted-foreground">Author</p>
                <p className="font-semibold">{series.author}</p>
              </div>
            )}
            {series.artist && (
              <div>
                <p className="text-sm text-muted-foreground">Artist</p>
                <p className="font-semibold">{series.artist}</p>
              </div>
            )}
            {series.views && (
              <div>
                <p className="text-sm text-muted-foreground">Views</p>
                <p className="font-semibold">{series.views}</p>
              </div>
            )}
            {series.rating && (
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="font-semibold flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4 text-yellow-400">
                    <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                  </svg>
                  {series.rating}
                </p>
              </div>
            )}
          </div>

          {/* Genres */}
          {series.genres && series.genres.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-2">Genres</h3>
              <div className="flex flex-wrap gap-2">
                {series.genres.map((genre: string, idx: number) => (
                  <span
                    key={idx}
                    className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded-full text-sm"
                  >
                    {genre}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Synopsis */}
          {series.synopsis && (
            <div className="mb-8">
              <h3 className="text-xl font-semibold mb-3">Synopsis</h3>
              <p className="text-muted-foreground leading-relaxed">{series.synopsis}</p>
            </div>
          )}

          {/* Chapter List */}
          <div>
            <h3 className="text-xl font-semibold mb-4">Chapters</h3>
            <div className="space-y-2">
              {series.chapters && series.chapters.length > 0 ? (
                series.chapters.map((chapter: any, idx: number) => (
                  <Link
                    key={idx}
                    href={`/series/${encodeURIComponent(cleanSlug(slug))}/${encodeURIComponent(cleanSlug(chapter.slug))}`}
                    className="block p-4 bg-card border border-border rounded-lg hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{chapter.title}</span>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5 text-muted-foreground">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                      </svg>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-muted-foreground">No chapters available</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
