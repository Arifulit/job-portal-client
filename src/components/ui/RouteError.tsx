/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import { useRouteError, isRouteErrorResponse, Link } from "react-router-dom";

const RouteError: React.FC = () => {
  const error = useRouteError();

  let title = "Something went wrong";
  let message: string | null = null;

  if (isRouteErrorResponse(error)) {
    title = `${error.status} ${error.statusText || ""}`.trim() || title;
    // some loaders return text or object
    message =
      (typeof error.data === "string" ? error.data : (error.data as any)?.message) ||
      null;
  } else if (error instanceof Error) {
    message = error.message;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-lg w-full bg-white rounded-lg shadow-md p-8 text-center">
        <h1 className="text-2xl font-semibold mb-2">{title}</h1>
        {message && <p className="text-sm text-muted-foreground mb-6">{message}</p>}
        <div className="flex justify-center gap-3">
          <Link to="/" className="inline-block px-4 py-2 bg-primary text-white rounded-md">
            Go Home
          </Link>
          <button
            onClick={() => window.location.reload()}
            className="inline-block px-4 py-2 border rounded-md"
          >
            Reload
          </button>
        </div>
      </div>
    </div>
  );
};

export default RouteError;