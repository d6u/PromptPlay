import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import { FragmentType, gql, useFragment } from "../../../__generated__";
import { ROOT_ROUTE_QUERY } from "../queries";
import DashboardTile, { DashboardTileType } from "./DashboardTile";
import "./Dashboard.css";

const DASHBOARD_FRAGMENT = gql(`
  fragment Dashboard on User {
    spaces {
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
  const navigate = useNavigate();
  const dashboard = useFragment(DASHBOARD_FRAGMENT, dashboardFragment);
  const [createSpace] = useMutation(CREATE_SPACE_MUTATION, {
    refetchQueries: [ROOT_ROUTE_QUERY],
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

              navigate(`/spaces/${data.createSpace.id}`);
            });
          }}
        >
          Add
        </DashboardTile>
        {dashboard.spaces.map((space) => {
          const workspaceId = space.id;
          const workspaceName = space.name;
          const url = `/spaces_v2/${workspaceId}`;

          return (
            <DashboardTile
              key={workspaceId}
              type={DashboardTileType.SPACE}
              href={url}
            >
              <div>{workspaceName}</div>
              <div className="Dashbord_tile_timestamp">
                {new Date(`${space.updatedAt}Z`).toLocaleString()}
              </div>
            </DashboardTile>
          );
        })}
      </div>
    </div>
  );
}
