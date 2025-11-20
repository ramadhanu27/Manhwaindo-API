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
    <div className="min-h-screen bg-background">
      {/* Hero Section with Gradient */}
      <div className="relative bg-card border-b border-border">
        <div className="absolute inset-0 opacity-5">
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
                <p className="text-sm text-muted-foreground mb-4">
                  {series.synopsis}
                </p>
              )}

              {/* Social Share Buttons */}
              <div className="flex flex-wrap gap-2 mb-6">
                <a href={`https://www.facebook.com/sharer/sharer.php?u=${typeof window !== 'undefined' ? window.location.href : ''}`} target="_blank" rel="noopener noreferrer" className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </a>
                <a href={`https://twitter.com/intent/tweet?url=${typeof window !== 'undefined' ? window.location.href : ''}`} target="_blank" rel="noopener noreferrer" className="bg-blue-400 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M23.953 4.57a10 10 0 002.856-3.51 10 10 0 01-2.856.975 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                  Twitter
                </a>
                <a href={`https://wa.me/?text=${typeof window !== 'undefined' ? window.location.href : ''}`} target="_blank" rel="noopener noreferrer" className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.67-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.076 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421-7.403h-.004a9.87 9.87 0 00-9.746 9.798c0 2.734.732 5.41 2.124 7.757L2.505 22l8.227-2.158a9.87 9.87 0 004.746 1.207h.004c5.44 0 9.868-4.436 9.868-9.893 0-2.63-.675-5.159-1.970-7.366A9.844 9.844 0 0011.051 6.979"/>
                  </svg>
                  WhatsApp
                </a>
                <a href={`https://pinterest.com/pin/create/button/?url=${typeof window !== 'undefined' ? window.location.href : ''}`} target="_blank" rel="noopener noreferrer" className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M12 0C5.373 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12"/>
                  </svg>
                  Pinterest
                </a>
                <a href={`https://t.me/share/url?url=${typeof window !== 'undefined' ? window.location.href : ''}`} target="_blank" rel="noopener noreferrer" className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded text-sm font-semibold transition-colors flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295-.042 0-.084 0-.126-.01l.213-3.053 5.56-5.023c.242-.213-.054-.328-.373-.115l-6.869 4.332-2.96-.924c-.64-.203-.658-.64.135-.954l11.566-4.458c.54-.203 1.01.122.84 1.04z"/>
                  </svg>
                  Telegram
                </a>
              </div>

              {/* Chapter Navigation Buttons */}
              <div className="grid grid-cols-2 gap-3 mb-6">
                {firstChapter && (
                  <Link
                    href={`/series/${encodeURIComponent(cleanSlug(slug))}/${encodeURIComponent(cleanSlug(firstChapter.slug))}`}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-center py-4 px-6 rounded-lg font-semibold transition-colors"
                  >
                    <div className="text-xs text-indigo-200 mb-1">First Chapter</div>
                    <div className="text-lg font-bold">{firstChapter.title}</div>
                  </Link>
                )}
                {latestChapter && latestChapter !== firstChapter && (
                  <Link
                    href={`/series/${encodeURIComponent(cleanSlug(slug))}/${encodeURIComponent(cleanSlug(latestChapter.slug))}`}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-center py-4 px-6 rounded-lg font-semibold transition-colors"
                  >
                    <div className="text-xs text-indigo-200 mb-1">New Chapter</div>
                    <div className="text-lg font-bold">{latestChapter.title}</div>
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
            <div className="bg-card border border-border rounded-lg p-4 space-y-3 sticky top-4">
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
              <div className="mb-8 bg-card border border-border rounded-lg p-6">
                <h2 className="text-xl font-bold mb-3">Synopsis {series.title}</h2>
                <p className="text-muted-foreground leading-relaxed">{series.synopsis}</p>
              </div>
            )}

            {/* Chapter List */}
            <div className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-xl font-bold mb-4">Chapter {series.title}</h2>
              
              {/* Search Bar */}
              <div className="mb-6">
                <input
                  type="text"
                  placeholder="Search Chapter. Example: 25 or 178"
                  className="w-full px-4 py-2 bg-background border border-border rounded-lg text-foreground placeholder-muted-foreground focus:outline-none focus:border-primary"
                />
              </div>
              
              {series.chapters && series.chapters.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                  {series.chapters.map((chapter: any, idx: number) => (
                    <Link
                      key={idx}
                      href={`/series/${encodeURIComponent(cleanSlug(slug))}/${encodeURIComponent(cleanSlug(chapter.slug))}`}
                      className="block p-4 bg-background border border-border rounded-lg hover:border-primary/50 hover:bg-background/80 transition-all group"
                    >
                      <div className="font-medium text-sm mb-2 line-clamp-1 group-hover:text-primary transition-colors">{chapter.title}</div>
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
