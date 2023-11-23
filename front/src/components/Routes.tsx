import styled from "@emotion/styled";
import { useMemo } from "react";
import {
  RouterProvider,
  createBrowserRouter,
  Outlet,
  Navigate,
} from "react-router-dom";
import { ROOT_PATH, FLOWS_PATH_PATTERN } from "../utils/route-utils";
import Header from "./common/header/Header";
import RouteFlow from "./route-flow";
import flowLoader from "./route-flow/route-loader";
import RootRoute from "./route-root";

export default function Routes() {
  const router = useMemo(() => {
    return createBrowserRouter([
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
            loader: flowLoader,
            element: <RouteFlow />,
          },
        ],
      },
      {
        path: "*",
        element: <Navigate to="/" />,
      },
    ]);
  }, []);

  return <RouterProvider router={router} />;
}

const RootContainer = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;
