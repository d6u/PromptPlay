import { RouterProvider } from "react-router-dom";
import { createBrowserRouter, Outlet, Navigate } from "react-router-dom";
import { ROOT_PATH, SPACE_PATH_PATTERN } from "../static/routeConfigs";
import Header from "./route_root/Header";
import RootRoute from "./route_root/RootRoute";
import RouteSpace from "./route_space/RouteSpace";
import WorkspaceRoute from "./route_workspace/WorkspaceRoute";

export const router = createBrowserRouter([
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
        path: "workspaces/:spaceId",
        element: <WorkspaceRoute />,
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
