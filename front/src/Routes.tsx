import { RouterProvider } from "react-router-dom";
import { createBrowserRouter, Outlet, Navigate } from "react-router-dom";
import Header from "./component-common/header/Header";
import RouteFlow from "./route-flow/RouteFlow";
import RootRoute from "./route-root/RootRoute";
import RouteSpace from "./route-space/RouteSpace";
import {
  ROOT_PATH,
  FLOWS_PATH_PATTERN,
  SPACE_PATH_PATTERN,
} from "./static/routeConfigs";

const router = createBrowserRouter([
  {
    path: ROOT_PATH,
    element: (
      <div className="App">
        <Header />
        <Outlet />
      </div>
    ),
    children: [
      {
        path: "/",
        element: <RootRoute />,
      },
      {
        path: FLOWS_PATH_PATTERN,
        element: <RouteFlow />,
      },
      {
        path: SPACE_PATH_PATTERN,
        element: <RouteSpace />,
      },
    ],
  },
  {
    path: "*",
    element: <Navigate to="/" />,
  },
]);

export default function Routes() {
  return <RouterProvider router={router} />;
}
