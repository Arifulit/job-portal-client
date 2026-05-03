// এই ফাইলটি project wide helper, route utility অথবা shared function প্রদান করে।
 /* eslint-disable @typescript-eslint/no-explicit-any */

import * as React from 'react';
import { RouteObject } from 'react-router-dom';

interface SidebarItem {
  title: string;
  items: {
    title: string;
    url: string;
    component?: React.ComponentType<any>;
  }[];
}

export function generateRoutes(sidebarItems: SidebarItem[]): RouteObject[] {
  const routes: RouteObject[] = [];

  sidebarItems.forEach((section) => {
    section.items.forEach((item) => {
      if (item.component && item.url) {
        const Component = item.component;

        const normalized = item.url.startsWith('/') ? item.url : `/${item.url}`;
        const segments = normalized.split('/').filter(Boolean);
        const relativePath = segments.slice(1).join('/');

        if (!relativePath) {
          return;
        }

        const fallback = React.createElement(
          'div',
          { className: "flex items-center justify-center min-h-screen" },
          React.createElement('div', {
            className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900',
          })
        );

        routes.push({
          path: relativePath,
          element: React.createElement(
            React.Suspense,
            { fallback },
            React.createElement(Component)
          ),
        });
      }
    });
  });

  return routes;
}

