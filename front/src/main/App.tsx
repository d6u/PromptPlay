import { useMemo } from 'react';
import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
  redirect,
} from 'react-router-dom';
import { Provider as GraphQLProvider } from 'urql';
import RouteBatchTest from '../components/route-batch-test/RouteBatchTest';
import RouteCanvas from '../components/route-canvas/RouteCanvas';
import RouteDashboard from '../components/route-dashboard/RouteDashboard';
import RouteFlow from '../components/route-flow/RouteFlow';
import flowLoader from '../components/route-flow/route-loader-flow';
import { client } from '../state/urql';
import { FlowRouteTab, pathToFlowCanvasTab } from '../utils/route-utils';
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
