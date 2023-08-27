import { RouterProvider } from "react-router-dom";
import { createBrowserRouter, Outlet, Navigate } from "react-router-dom";
import Header from "./header/Header";
import { ROOT_PATH, SPACE_PATH_PATTERN } from "./routeConfig";
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
