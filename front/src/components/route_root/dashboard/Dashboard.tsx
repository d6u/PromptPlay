import { FragmentType, gql, useFragment } from "../../../__generated__";
import "./Dashboard.css";
import DashboardTile, { DashboardTileType } from "./DashboardTile";
import { useMutation } from "@apollo/client";
import { useLocation } from "wouter";

const DASHBOARD_FRAGMENT = gql(`
  fragment Dashboard on User {
    workspaces {
      id
      name
      updatedAt
    }
  }
`);

const CREATE_SPACE_MUTATION = gql(`
  mutation CreateSpaceMutation {
    createSpace {
      id
    }
  }
`);

export default function Dashboard({
  dashboardFragment,
}: {
  dashboardFragment: FragmentType<typeof DASHBOARD_FRAGMENT>;
}) {
  const [, setLocation] = useLocation();
  const dashboard = useFragment(DASHBOARD_FRAGMENT, dashboardFragment);
  const [createSpace] = useMutation(CREATE_SPACE_MUTATION, {
    refetchQueries: ["RootRouteQuery"],
  });

  return (
    <div className="Dashboard">
      <div className="Dashboard_inner">
        <DashboardTile
          key="dashboard-tile-add"
          type={DashboardTileType.ADD}
          onClick={() => {
            createSpace().then(({ errors, data }) => {
              if (errors || data?.createSpace?.id == null) {
                console.error(errors);
                return;
              }
              setLocation(`/spaces/${data.createSpace.id}`);
            });
          }}
        >
          Add
        </DashboardTile>
        {dashboard.workspaces.map((workspace) => {
          const workspaceId = workspace.id;
          const workspaceName = workspace.name;
          const url = `/spaces/${workspaceId}`;

          return (
            <DashboardTile
              key={workspaceId}
              type={DashboardTileType.SPACE}
              href={url}
            >
              <div>{workspaceName}</div>
              <div className="Dashbord_tile_timestamp">
                {new Date(`${workspace.updatedAt}Z`).toLocaleString()}
              </div>
            </DashboardTile>
          );
        })}
      </div>
    </div>
  );
}
