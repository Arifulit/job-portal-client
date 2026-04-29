import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useCareerResource } from '@/services/resourceService';
import { Button } from '@/components/ui/button';

const ResourceDetails: React.FC = () => {
  const { id } = useParams();
  const { data: resource, isLoading, error } = useCareerResource(id);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="w-full max-w-3xl">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-6 bg-gray-200 rounded w-full" />
            <div className="h-6 bg-gray-200 rounded w-full" />
            <div className="h-6 bg-gray-200 rounded w-3/4" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-xl font-bold text-red-600 mb-3">Failed to load resource</h1>
          <pre className="text-sm text-gray-700">{error instanceof Error ? error.message : String(error)}</pre>
          <div className="mt-4">
            <Link to="/">
              <Button variant="outline">Go back home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!resource) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-xl font-bold mb-3">Resource not found</h1>
          <p className="text-sm text-gray-600">The requested resource could not be found.</p>
          <div className="mt-4">
            <Link to="/">
              <Button variant="outline">Back to home</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <p className="text-sm uppercase text-slate-500">{resource.tag || 'Career'}</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900">{resource.title}</h1>
          <p className="mt-1 text-sm text-slate-600">{resource.createdAt ? new Date(resource.createdAt).toLocaleDateString() : ''}</p>
        </div>
      </div>

      <article className="prose max-w-none dark:prose-invert">
        {resource.description ? (
          <div>{resource.description}</div>
        ) : (
          <p>No description available.</p>
        )}
      </article>
    </div>
  );
};

export default ResourceDetails;
