import { FlowRouteTab, pathToFlowCanvasTab } from 'generic-util/route-utils';
import { useMemo } from 'react';
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
  redirect,
} from 'react-router-dom';
import RouteCanvas from 'route-canvas/RouteCanvas';
import RouteDashboard from 'route-dashboard/RouteDashboard';
import RouteFlow from 'route-flow/RouteFlow';
import flowLoader from 'route-flow/route-loader-flow';
import { Provider as GraphQLProvider } from 'urql';
import RouteBatchTest from '../components/route-batch-test/RouteBatchTest';
import { client } from '../state/urql';
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
            loader: flowLoader,
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
                handle: {
                  tabType: FlowRouteTab.Canvas,
                },
              },
              {
                path: `${FlowRouteTab.BatchTest}`,
                element: <RouteBatchTest />,
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
