import { spaceContentState } from "../../state/store";
import SpaceV2Left from "./SpaceV2Left";
import SpaceV2Right from "./SpaceV2Right";
import SpaceV2SubHeader from "./SpaceV2SubHeader";
import { SPACE_V2_QUERY } from "./graphql";
import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import { useSetRecoilState } from "recoil";
import styled from "styled-components";

const Content = styled.div`
  flex-grow: 1;
  display: flex;
  padding: 0 0 0 20px;
  min-height: 0;
`;

type Props = {
  spaceId: string;
};

export default function RouteSpaceV2(props: Props) {
  const setSpaceContent = useSetRecoilState(spaceContentState);

  const query = useQuery(SPACE_V2_QUERY, {
    variables: {
      spaceId: props.spaceId,
    },
  });

  useEffect(() => {
    if (query.data?.spaceV2?.content) {
      setSpaceContent(JSON.parse(query.data.spaceV2.content));
    } else {
      setSpaceContent(null);
    }
  }, [query.data?.spaceV2?.content, setSpaceContent]);

  if (query.loading) {
    return <div>Loading...</div>;
  }

  if (query.error) {
    return <div>Error! {query.error.message}</div>;
  }

  if (query.data == null) {
    return <div>Could not find any data.</div>;
  }

  return (
    <>
      <SpaceV2SubHeader spaceId={props.spaceId} />
      <Content>
        <SpaceV2Left spaceId={props.spaceId} />
        <SpaceV2Right spaceId={props.spaceId} />
      </Content>
    </>
  );
}
