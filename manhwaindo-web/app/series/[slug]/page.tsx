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
  const firstChapter = series.chapters?.[0];
  const latestChapter = series.chapters?.[series.chapters.length - 1];

  return (
    <div className="min-h-screen">
      {/* Hero Section with Gradient */}
      <div className="relative bg-gradient-to-b from-primary/20 via-background to-background">
        <div className="absolute inset-0 opacity-10">
          <Image
            src={series.image || '/placeholder.jpg'}
            alt={series.title}
            fill
            className="object-cover blur-3xl"
          />
        </div>
        
        <div className="relative container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Cover Image */}
            <div className="flex-shrink-0">
              <div className="relative w-48 h-72 rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={series.image || '/placeholder.jpg'}
                  alt={series.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>

            {/* Info */}
            <div className="flex-1">
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{series.title}</h1>
              {series.alternativeTitle && (
                <p className="text-muted-foreground mb-4">{series.alternativeTitle}</p>
              )}
              
              {/* Genre Tags */}
              {series.genres && series.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {series.genres.slice(0, 5).map((genre: string, idx: number) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-primary/20 text-primary border border-primary/30 rounded text-sm font-medium"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {/* Synopsis Preview */}
              {series.synopsis && (
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">
                  {series.synopsis}
                </p>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mb-4">
                {firstChapter && (
                  <Link
                    href={`/series/${encodeURIComponent(cleanSlug(slug))}/${encodeURIComponent(cleanSlug(firstChapter.slug))}`}
                    className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground text-center py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    First Chapter
                  </Link>
                )}
                {latestChapter && latestChapter !== firstChapter && (
                  <Link
                    href={`/series/${encodeURIComponent(cleanSlug(slug))}/${encodeURIComponent(cleanSlug(latestChapter.slug))}`}
                    className="flex-1 bg-secondary hover:bg-secondary/80 text-foreground text-center py-3 px-6 rounded-lg font-semibold transition-colors"
                  >
                    New Chapter
                  </Link>
                )}
              </div>

              {/* Bookmark Button */}
              <button className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2.5 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                </svg>
                Bookmark
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Sidebar - Metadata */}
          <div className="lg:col-span-1">
            <div className="bg-card border border-border rounded-lg p-4 space-y-3">
              {/* Rating */}
              {series.rating && (
                <div className="flex items-center justify-between pb-3 border-b border-border">
                  <span className="text-sm text-muted-foreground">Rating</span>
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                        className={`w-4 h-4 ${i < Math.floor(parseFloat(series.rating) / 2) ? 'text-yellow-400' : 'text-gray-600'}`}
                      >
                        <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                      </svg>
                    ))}
                    <span className="ml-1 text-sm font-semibold">{series.rating}</span>
                  </div>
                </div>
              )}

              {/* Status */}
              {series.status && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <span className="text-sm font-semibold">{series.status}</span>
                </div>
              )}

              {/* Type */}
              {series.type && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Type</span>
                  <span className="text-sm font-semibold">{series.type}</span>
                </div>
              )}

              {/* Released */}
              {series.released && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Released</span>
                  <span className="text-sm font-semibold">{series.released}</span>
                </div>
              )}

              {/* Author */}
              {series.author && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Author</span>
                  <span className="text-sm font-semibold">{series.author}</span>
                </div>
              )}

              {/* Artist */}
              {series.artist && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Artist</span>
                  <span className="text-sm font-semibold">{series.artist}</span>
                </div>
              )}

              {/* Views */}
              {series.views && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Views</span>
                  <span className="text-sm font-semibold">{series.views}</span>
                </div>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Synopsis */}
            {series.synopsis && (
              <div className="mb-8">
                <h2 className="text-xl font-bold mb-3">Synopsis {series.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{series.synopsis}</p>
              </div>
            )}

            {/* Chapter List */}
            <div>
              <h2 className="text-xl font-bold mb-4">Chapter {series.title}</h2>
              
              {series.chapters && series.chapters.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {series.chapters.map((chapter: any, idx: number) => (
                    <Link
                      key={idx}
                      href={`/series/${encodeURIComponent(cleanSlug(slug))}/${encodeURIComponent(cleanSlug(chapter.slug))}`}
                      className="block p-3 bg-card border border-border rounded-lg hover:border-primary/50 hover:bg-card/80 transition-all"
                    >
                      <div className="font-medium text-sm mb-1 line-clamp-1">{chapter.title}</div>
                      {chapter.time && (
                        <div className="text-xs text-muted-foreground">{chapter.time}</div>
                      )}
                    </Link>
                  ))}
                </div>
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
