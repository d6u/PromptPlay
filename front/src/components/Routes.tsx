import { useMemo } from 'react';
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';
import { FLOWS_PATH_PATTERN, ROOT_PATH } from '../utils/route-utils';
import RouteRoot from './RouteRoot';
import RouteDashboard from './route-dashboard';
import RouteFlow from './route-flow';
import flowLoader from './route-flow/route-loader';
import routeLoaderRoot from './route-loader-root';

export default function Routes() {
  const router = useMemo(() => {
    return createBrowserRouter([
      {
        path: ROOT_PATH,
        loader: routeLoaderRoot,
        element: <RouteRoot />,
        children: [
          {
            path: '/',
            element: <RouteDashboard />,
          },
          {
            path: FLOWS_PATH_PATTERN,
            loader: flowLoader,
            element: <RouteFlow />,
          },
        ],
      },
      {
        path: '*',
        element: <Navigate to="/" />,
      },
    ]);
  }, []);

  return <RouterProvider router={router} />;
}
