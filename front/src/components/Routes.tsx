import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import Header from "./header/Header";
import RootRoute from "./route_root/RootRoute";
import RouteSpaceV2 from "./route_space_v2/RouteSpaceV2";
import WorkspaceRoute from "./route_workspace/WorkspaceRoute";

const router = createBrowserRouter([
  {
    path: "/",
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
        path: "spaces/:spaceId",
        element: <RouteSpaceV2 />,
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
