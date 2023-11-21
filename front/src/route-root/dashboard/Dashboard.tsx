import styled from "@emotion/styled";
import { useNavigate } from "react-router-dom";
import { useMutation } from "urql";
import { FragmentType, graphql, useFragment } from "../../gql";
import { ContentVersion } from "../../gql/graphql";
import { pathToFlow } from "../../static/routeConfigs";
import DashboardTile from "./DashboardTile";
import { DashboardTileType } from "./dashboardTypes";

const DASHBOARD_FRAGMENT = graphql(`
  fragment Dashboard on User {
    spaces {
      id
      name
      updatedAt
      contentVersion
    }
  }
`);

const CREATE_SPACE_MUTATION = graphql(`
  mutation CreateSpaceMutation {
    result: createSpace {
      id
      name
      updatedAt
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
  const [, createSpace] = useMutation(CREATE_SPACE_MUTATION);

  return (
    <Container>
      <Content>
        <DashboardTile
          key="dashboard-tile-add"
          type={DashboardTileType.ADD}
          onClick={() => {
            createSpace({}).then(({ error, data }) => {
              if (error || data?.result?.id == null) {
                console.error(error);
                return;
              }

              navigate(pathToFlow(data.result.id));
            });
          }}
        >
          Add
        </DashboardTile>
        {dashboard.spaces.map((space) => {
          const id = space.id;
          const name = space.name;
          let url;

          switch (space.contentVersion) {
            case ContentVersion.V1:
              url = "";
              break;
            case ContentVersion.V2:
              url = pathToFlow(id);
              break;
          }

          return (
            <DashboardTile key={id} type={DashboardTileType.SPACE} href={url}>
              <div>{name}</div>
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
  font-family: var(--font-family-mono);
  color: #5f5f5f;
  margin-top: 10px;
`;
