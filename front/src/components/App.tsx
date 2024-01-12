import { useMemo } from 'react';
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from 'react-router-dom';
import { Provider as GraphQLProvider } from 'urql';
import { client } from '../state/urql';
import { FLOWS_PATH_PATTERN, ROOT_PATH } from '../utils/route-utils';
import UITheme from './UITheme';
import RouteDashboard from './route-dashboard';
import RouteFlow from './route-flow';
import flowLoader from './route-flow/route-loader';
import RouteRoot from './route-root/RouteRoot';
import routeLoaderRoot from './route-root/route-loader-root';

export default function App() {
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

  return (
    <UITheme>
      <GraphQLProvider value={client}>
        <RouterProvider router={router} />
      </GraphQLProvider>
    </UITheme>
  );
}
