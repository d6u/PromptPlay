import { gql } from "../../__generated__";
import SpaceV2Left from "./SpaceV2Left";
import SpaceV2Right from "./SpaceV2Right";
import SpaceV2SubHeader from "./SpaceV2SubHeader";
import { BlockGroup } from "./utils";
import { useQuery } from "@apollo/client";
import { useEffect, useState } from "react";
import styled from "styled-components";

const SPACE_V2_QUERY = gql(`
  query SpaceV2Query($spaceId: UUID!) {
    spaceV2(id: $spaceId) {
      id
      name
      content
    }
  }
`);

const Content = styled.div`
  flex-grow: 1;
  display: flex;
  padding: 0 0 0 20px;
  min-height: 0;
`;

export default function RouteSpaceV2({ spaceId }: { spaceId: string }) {
  // --- Local State ---

  const [content, setContent] = useState<BlockGroup | null>(null);

  // --- GraphQL ---

  const query = useQuery(SPACE_V2_QUERY, {
    variables: {
      spaceId,
    },
  });

  useEffect(() => {
    if (query.data?.spaceV2?.content) {
      setContent(JSON.parse(query.data.spaceV2.content));
    }
  }, [query.data?.spaceV2?.content]);

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
      <SpaceV2SubHeader spaceId={spaceId} content={content} />
      <Content>
        <SpaceV2Left spaceId={spaceId} content={content} />
        <SpaceV2Right spaceId={spaceId} content={content} />
      </Content>
    </>
  );
}
