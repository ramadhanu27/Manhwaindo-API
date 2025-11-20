import { getLatest } from '@/lib/api';
import SeriesCard from '@/components/SeriesCard';
import Link from 'next/link';

export default async function SeriesPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; order?: string }>;
}) {
  const { page: pageParam } = await searchParams;
  const page = parseInt(pageParam || '1');
  const data = await getLatest(page);
  const series = data.success ? data.data : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Browse Manhwa</h1>
        <p className="text-muted-foreground">
          Discover thousands of manhwa series updated daily
        </p>
      </div>

      {/* Series Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 mb-8">
        {series.map((item: any) => (
          <SeriesCard
            key={item.slug}
            title={item.title}
            slug={item.slug}
            image={item.image}
            type={item.type}
            rating={item.rating}
            latestChapter={item.chapters?.[0]?.title}
          />
        ))}
      </div>

      {/* Pagination */}
      <div className="flex justify-center gap-2">
        {page > 1 && (
          <Link
            href={`/series?page=${page - 1}`}
            className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
          >
            Previous
          </Link>
        )}
        <span className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">
          Page {page}
        </span>
        <Link
          href={`/series?page=${page + 1}`}
          className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-lg transition-colors"
        >
          Next
        </Link>
      </div>
    </div>
  );
}
