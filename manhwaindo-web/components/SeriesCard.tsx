import Link from 'next/link';

interface SeriesCardProps {
  title: string;
  slug: string;
  image: string;
  type?: string;
  rating?: string;
  latestChapter?: string;
  isHot?: boolean;
  isNew?: boolean;
}

// Helper function to clean slugs
const cleanSlug = (slug: string) => slug.replace(/\/+$/, '').trim();

export default function SeriesCard({
  title,
  slug,
  image,
  type = 'Manhwa',
  rating,
  latestChapter,
  isHot = false,
  isNew = false,
}: SeriesCardProps) {
  return (
    <Link href={`/series/${encodeURIComponent(cleanSlug(slug))}`} className="group block">
      <div className="relative overflow-hidden rounded-lg bg-card border border-border hover:border-primary/50 transition-all duration-300">
        {/* Image */}
        <div className="relative aspect-[2/3] overflow-hidden bg-muted">
          <img
            src={image || '/placeholder.jpg'}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
          
          {/* Type Badge - Top Left */}
          {type && (
            <div className="absolute top-2 left-2 bg-primary text-primary-foreground px-2 py-0.5 rounded text-xs font-semibold">
              {type}
            </div>
          )}
          
          {/* Color Badge - Top Right */}
          <div className="absolute top-2 right-2 bg-gradient-to-r from-pink-500 to-purple-500 text-white px-2 py-0.5 rounded text-xs font-semibold shadow-lg">
            Color
          </div>
          
          {/* Rating - Bottom */}
          {rating && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
              <div className="flex items-center justify-center gap-1 text-yellow-400">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                  <path fillRule="evenodd" d="M10.868 2.884c-.321-.772-1.415-.772-1.736 0l-1.83 4.401-4.753.381c-.833.067-1.171 1.107-.536 1.651l3.62 3.102-1.106 4.637c-.194.813.691 1.456 1.405 1.02L10 15.591l4.069 2.485c.713.436 1.598-.207 1.404-1.02l-1.106-4.637 3.62-3.102c.635-.544.297-1.584-.536-1.65l-4.752-.382-1.831-4.401z" clipRule="evenodd" />
                </svg>
                <span className="text-sm font-bold">{rating}</span>
              </div>
            </div>
          )}
        </div>

        {/* Info */}
        <div className="p-3">
          <h3 className="font-semibold text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {title}
          </h3>
          {latestChapter && (
            <p className="text-xs text-muted-foreground line-clamp-1">
              {latestChapter}
            </p>
          )}
        </div>
      </div>
    </Link>
  );
}
