import { useMutation } from "@apollo/client";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { FragmentType, gql, useFragment } from "../../../__generated__";
import { ROOT_ROUTE_QUERY } from "../queries";
import DashboardTile, { DashboardTileType } from "./DashboardTile";

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

const Container = styled.div`
  width: 100%;
  height: 100%;
`;

const Content = styled.div`
  padding: 20px;
  display: grid;
  grid-template-columns: repeat(auto-fill, 200px);
  gap: 20px;

  @media only screen and (max-width: 500px) {
    padding: 15px;
    grid-template-columns: repeat(auto-fill, minmax(130px, 1fr));
    gap: 15px;
  }
`;

const TileTimestamp = styled.div`
  font-size: 12px;
  font-family: var(--mono-font-family);
  color: #5f5f5f;
  margin-top: 10px;
`;

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
    <Container>
      <Content>
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
              <TileTimestamp>
                {new Date(`${space.updatedAt}Z`).toLocaleString()}
              </TileTimestamp>
            </DashboardTile>
          );
        })}
      </Content>
    </Container>
  );
}
