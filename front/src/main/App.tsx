import { FlowRouteTab, pathToFlowCanvasTab } from 'generic-util/route';
import { client } from 'graphql-util/client';
import { useMemo } from 'react';
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
  redirect,
} from 'react-router-dom';
import RouteBatchTest from 'route-batch-test/RouteBatchTest';
import RouteCanvas from 'route-canvas/RouteCanvas';
import RouteDashboard from 'route-dashboard/RouteDashboard';
import { Provider as GraphQLProvider } from 'urql';
import RouteFlow from '../route-flow/RouteFlow';
import flowRouteLoader from '../route-flow/flowRouteLoader';
import RouteRoot from './RootView';
import rootRouteLoader from './rootRouteLoader';

export default function App() {
  const router = useMemo(() => {
    return createBrowserRouter([
      {
        path: '/',
        loader: rootRouteLoader,
        element: <RouteRoot />,
        children: [
          {
            path: '',
            element: <RouteDashboard />,
          },
          {
            path: 'flows/:spaceId',
            loader: flowRouteLoader,
            element: <RouteFlow />,
            children: [
              {
                path: '',
                loader: ({ params }) => {
                  return redirect(
                    pathToFlowCanvasTab(params.spaceId as string),
                  );
                },
              },
              {
                path: `${FlowRouteTab.Canvas}`,
                element: <RouteCanvas />,
                // NOTE: Keep this in sync with FlowRouteSubRouteHandle type
                handle: {
                  tabType: FlowRouteTab.Canvas,
                },
              },
              {
                path: `${FlowRouteTab.BatchTest}`,
                element: <RouteBatchTest />,
                // NOTE: Keep this in sync with FlowRouteSubRouteHandle type
                handle: {
                  tabType: FlowRouteTab.BatchTest,
                },
              },
            ],
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
    <GraphQLProvider value={client}>
      <RouterProvider router={router} />
    </GraphQLProvider>
  );
}
