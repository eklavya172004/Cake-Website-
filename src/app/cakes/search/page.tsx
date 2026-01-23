import { Suspense } from 'react';
import { CakeSearchContent } from './search-content';

function SearchLoadingFallback() {
  return (
    <div className="pt-40 px-4 container mx-auto max-w-6xl">
      <div className="mb-12">
        <div className="h-12 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg w-1/3 mb-4 animate-pulse"></div>
        <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
        <div className="md:col-span-2 h-12 bg-gray-200 rounded-lg animate-pulse"></div>
        <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 8 }).map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-2xl shadow-sm overflow-hidden border border-gray-200"
          >
            <div className="h-48 bg-gray-200 animate-pulse"></div>
            <div className="p-5">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3 animate-pulse"></div>
              <div className="h-6 bg-gray-200 rounded w-4/5 mb-3 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4 animate-pulse"></div>
              <div className="h-10 bg-gray-200 rounded w-full animate-pulse"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function CakeSearchPage() {
  return (
    <Suspense fallback={<SearchLoadingFallback />}>
      <CakeSearchContent />
    </Suspense>
  );
}
