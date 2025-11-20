import { searchSeries } from '@/lib/api';
import SeriesCard from '@/components/SeriesCard';

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || '';
  const data = query ? await searchSeries(query) : { success: false, data: [] };
  const results = data.success ? data.data : [];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          {query ? `Search Results for "${query}"` : 'Search'}
        </h1>
        <p className="text-muted-foreground">
          {results.length > 0
            ? `Found ${results.length} results`
            : query
            ? 'No results found'
            : 'Enter a search query to find manhwa'}
        </p>
      </div>

      {results.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {results.map((series: any) => (
            <SeriesCard
              key={series.slug}
              title={series.title}
              slug={series.slug}
              image={series.image}
              type={series.type}
              rating={series.rating}
            />
          ))}
        </div>
      ) : query ? (
        <div className="text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-muted-foreground mb-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
          </svg>
          <p className="text-xl text-muted-foreground">No manhwa found matching your search</p>
        </div>
      ) : null}
    </div>
  );
}
