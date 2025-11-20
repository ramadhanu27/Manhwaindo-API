'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

interface Series {
  title: string;
  slug: string;
  image: string;
  type?: string;
  synopsis?: string;
  genres?: string[];
  chapters?: Array<{ title: string }>;
}

interface HeroCarouselProps {
  series: Series[];
}

export default function HeroCarousel({ series }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || series.length === 0) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % series.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [series.length]);

  if (!series || series.length === 0) {
    return null;
  }

  const currentSeries = series[currentIndex];

  return (
    <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden bg-card border border-border">
      {/* Background Image */}
      <div className="absolute inset-0">
        <Image
          src={currentSeries.image || '/placeholder.jpg'}
          alt={currentSeries.title}
          fill
          className="object-cover blur-sm"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-card via-card/95 to-card/50" />
      </div>

      {/* Content */}
      <div className="relative h-full flex items-center">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            {/* Left Content */}
            <div className="max-w-xl">
              {currentSeries.chapters && currentSeries.chapters.length > 0 && (
                <p className="text-sm text-muted-foreground mb-2">
                  {currentSeries.chapters[0]?.title}
                </p>
              )}
              <h1 className="text-3xl md:text-5xl font-bold mb-4 line-clamp-2">
                {currentSeries.title}
              </h1>
              
              {currentSeries.synopsis && (
                <p className="text-sm md:text-base text-muted-foreground mb-4 line-clamp-3">
                  {currentSeries.synopsis}
                </p>
              )}

              {/* Genres */}
              {currentSeries.genres && currentSeries.genres.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {currentSeries.genres.slice(0, 5).map((genre, idx) => (
                    <span
                      key={idx}
                      className="inline-block bg-primary/20 text-primary border border-primary/30 px-3 py-1 rounded-full text-xs font-medium"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              <Link
                href={`/series/${currentSeries.slug}`}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-primary-foreground px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Reading
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </Link>
            </div>

            {/* Right Cover Image */}
            <div className="hidden md:flex justify-end">
              <div className="relative w-48 h-64 rounded-lg overflow-hidden shadow-2xl">
                <Image
                  src={currentSeries.image || '/placeholder.jpg'}
                  alt={currentSeries.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicators */}
      {mounted && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
        {series.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-2 h-2 rounded-full transition-all ${
              index === currentIndex
                ? 'bg-primary w-8'
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
      )}

      {/* Navigation Arrows */}
      {mounted && (
        <>
      <button
        onClick={() => setCurrentIndex((prev) => (prev - 1 + series.length) % series.length)}
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-colors"
        aria-label="Previous slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
        </svg>
      </button>
      <button
        onClick={() => setCurrentIndex((prev) => (prev + 1) % series.length)}
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition-colors"
        aria-label="Next slide"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
          <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
        </svg>
      </button>
      </>
      )}
    </div>
  );
}
