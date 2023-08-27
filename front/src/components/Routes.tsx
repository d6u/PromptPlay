import {
  createBrowserRouter,
  RouterProvider,
  Outlet,
  Navigate,
} from "react-router-dom";
import Header from "./header/Header";
import RootRoute from "./route_root/RootRoute";
import WorkspaceRoute from "./route_space/WorkspaceRoute";
import RouteSpaceV2 from "./route_space_v2/RouteSpaceV2";

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
        element: <WorkspaceRoute />,
      },
      {
        path: "spaces_v2/:spaceId",
        element: <RouteSpaceV2 />,
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
