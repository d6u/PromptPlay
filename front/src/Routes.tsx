import styled from "@emotion/styled";
import {
  RouterProvider,
  createBrowserRouter,
  Outlet,
  Navigate,
} from "react-router-dom";
import Header from "./component-common/header/Header";
import RouteFlow from "./route-flow/RouteFlow";
import flowLoader from "./route-flow/flowLoader";
import RootRoute from "./route-root/RootRoute";
import RouteSpace from "./route-space/RouteSpace";
import spaceLoader from "./route-space/spaceLoader";
import {
  ROOT_PATH,
  FLOWS_PATH_PATTERN,
  SPACE_PATH_PATTERN,
} from "./static/routeConfigs";
import createLoader from "./util/createLoader";

const RootContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const router = createBrowserRouter([
  {
    path: ROOT_PATH,
    element: (
      <RootContainer>
        <Header />
        <Outlet />
      </RootContainer>
    ),
    children: [
      {
        path: "/",
        element: <RootRoute />,
      },
      {
        path: FLOWS_PATH_PATTERN,
        loader: createLoader(flowLoader),
        element: <RouteFlow />,
      },
      {
        path: SPACE_PATH_PATTERN,
        loader: createLoader(spaceLoader),
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
