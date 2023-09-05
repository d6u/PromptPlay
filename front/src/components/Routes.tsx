import { RouterProvider } from "react-router-dom";
import { createBrowserRouter, Outlet, Navigate } from "react-router-dom";
import {
  ROOT_PATH,
  SPACES_FLOW_PATH_PATTERN,
  SPACE_PATH_PATTERN,
} from "../static/routeConfigs";
import RouteFlow from "./route_flow/RouteFlow";
import Header from "./route_root/Header";
import RootRoute from "./route_root/RootRoute";
import RouteSpace from "./route_space/RouteSpace";

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
        path: SPACE_PATH_PATTERN,
        element: <RouteSpace />,
      },
      {
        path: SPACES_FLOW_PATH_PATTERN,
        element: <RouteFlow />,
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
