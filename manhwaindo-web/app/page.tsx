import { getLatest, getPopular } from '@/lib/api';
import SeriesCard from '@/components/SeriesCard';
import HeroCarousel from '@/components/HeroCarousel';
import Link from 'next/link';

// Helper function to clean slugs
const cleanSlug = (slug: string) => slug.replace(/\/+$/, '').trim();

export default async function Home() {
  // Fetch data
  const [latestData, popularData] = await Promise.all([
    getLatest(1),
    getPopular(),
  ]);

  const latestSeries = latestData.success ? latestData.data : [];
  const popularSeries = popularData.success ? popularData.data : [];

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Carousel */}
      <section className="mb-12">
        <HeroCarousel series={popularSeries.slice(0, 4)} />
      </section>

      {/* Popular Today */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Popular Today</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
          {popularSeries.slice(0, 7).map((series: any) => (
            <SeriesCard
              key={series.slug}
              title={series.title}
              slug={series.slug}
              image={series.image}
              type={series.type}
              rating={series.rating}
              isHot={true}
            />
          ))}
        </div>
      </section>

      {/* Latest Update */}
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Latest Update</h2>
          <Link 
            href="/series?order=update" 
            className="bg-primary hover:bg-primary/90 text-primary-foreground px-4 py-1.5 rounded text-sm font-semibold transition-colors"
          >
            View All
          </Link>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {latestSeries.slice(0, 12).map((series: any) => (
            <div key={series.slug} className="bg-card border border-border rounded-lg overflow-hidden hover:border-primary/50 transition-colors">
              <div className="flex gap-3 p-3">
                {/* Thumbnail */}
                <Link href={`/series/${encodeURIComponent(cleanSlug(series.slug))}`} className="flex-shrink-0">
                  <div className="relative w-16 h-20 rounded overflow-hidden bg-muted">
                    {series.type && (
                      <span className="absolute top-0.5 left-0.5 bg-red-600 text-white px-1 py-0.5 text-[9px] font-bold rounded">
                        {series.type.charAt(0)}
                      </span>
                    )}
                    <img
                      src={series.image || '/placeholder.jpg'}
                      alt={series.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </Link>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`/series/${encodeURIComponent(cleanSlug(series.slug))}`}>
                    <h3 className="font-semibold text-sm line-clamp-1 mb-2 hover:text-primary transition-colors">
                      {series.title}
                    </h3>
                  </Link>
                  
                  {/* Chapters */}
                  <div className="space-y-1">
                    {series.chapters && series.chapters.slice(0, 3).map((chapter: any, idx: number) => (
                      <Link
                        key={idx}
                        href={`/series/${encodeURIComponent(cleanSlug(series.slug))}/${encodeURIComponent(cleanSlug(chapter.slug))}`}
                        className="flex items-center justify-between text-xs hover:text-primary transition-colors group"
                      >
                        <span className="text-muted-foreground group-hover:text-primary truncate">
                          {chapter.title}
                        </span>
                        <span className="text-muted-foreground/60 text-[10px] ml-2 flex-shrink-0">
                          {chapter.time || 'baru'}
                        </span>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Recommendation */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Recommendation</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {popularSeries.slice(7, 13).map((series: any) => (
            <SeriesCard
              key={series.slug}
              title={series.title}
              slug={series.slug}
              image={series.image}
              type={series.type}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
