// /* eslint-disable @typescript-eslint/no-explicit-any */
// import * as React from 'react';
// import { RouteObject } from 'react-router-dom';

// interface SidebarItem {
//   title: string;
//   items: {
//     title: string;
//     url: string;
//     component?: React.ComponentType<any>;
//   }[];
// }

// export function generateRoutes(sidebarItems: SidebarItem[]): RouteObject[] {
//   const routes: RouteObject[] = [];

//   sidebarItems.forEach((section) => {
//     section.items.forEach((item) => {
//       if (item.component && item.url) {
//         const Component = item.component;
//         // Extract the path after the role prefix (e.g., /admin/dashboard -> dashboard)
//         const pathSegments = item.url.split('/').filter(Boolean);
//         const path = pathSegments[pathSegments.length - 1];

//         const fallback = React.createElement(
//           'div',
//           { className: 'flex items-center justify-center min-h-screen' },
//           React.createElement('div', {
//             className: 'animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900',
//           })
//         );

//         routes.push({
//           path: path,
//           element: React.createElement(React.Suspense, { fallback }, React.createElement(Component)),
//         });
//       }
//     });
//   });

//   return routes;
// }

import * as React from "react";
import { RouteObject } from "react-router-dom";

interface SidebarItem {
  title: string;
  items: {
    title: string;
    url: string; // example: "/jobs/create"
    component?: React.ComponentType<any>;
  }[];
}

export function generateRoutes(sidebarItems: SidebarItem[]): RouteObject[] {
  const routes: RouteObject[] = [];

  sidebarItems.forEach((section) => {
    section.items.forEach((item) => {
      if (item.component && item.url) {
        const Component = item.component;

        // full absolute path
        const fullPath = item.url.startsWith("/") ? item.url : `/${item.url}`;

        const fallback = React.createElement(
          "div",
          { className: "flex items-center justify-center min-h-screen" },
          React.createElement("div", {
            className:
              "animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900",
          })
        );

        routes.push({
          path: fullPath,
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

