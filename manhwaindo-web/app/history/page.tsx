'use client';

export default function HistoryPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Reading History</h1>
        <p className="text-muted-foreground">
          Your recently read chapters
        </p>
      </div>

      <div className="text-center py-16">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-16 h-16 mx-auto text-muted-foreground mb-4">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
        </svg>
        <p className="text-xl text-muted-foreground mb-2">No reading history</p>
        <p className="text-sm text-muted-foreground">
          History feature will be implemented using localStorage
        </p>
      </div>
    </div>
  );
}
