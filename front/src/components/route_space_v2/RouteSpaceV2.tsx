import {
  spaceContentState,
  spaceV2SelectedBlockIdState,
} from "../../state/store";
import { Block, SpaceContent } from "../../static/spaceTypes";
import Designer from "./body/Designer";
import Editor from "./body/Editor";
import { SPACE_V2_QUERY } from "./graphql";
import SpaceV2SubHeader from "./sub_header/SpaceV2SubHeader";
import { useQuery } from "@apollo/client";
import { useEffect } from "react";
import { useRecoilValue, useSetRecoilState } from "recoil";
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
  const spaceV2SelectedBlockId = useRecoilValue(spaceV2SelectedBlockIdState);

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

  const spaceContent = query.data.spaceV2?.content
    ? (JSON.parse(query.data.spaceV2.content) as SpaceContent)
    : null;

  // TODO: Handle group as well
  const selectedBlock =
    spaceContent && spaceV2SelectedBlockId
      ? (spaceContent.components[spaceV2SelectedBlockId] as Block)
      : null;

  return (
    <>
      <SpaceV2SubHeader spaceId={props.spaceId} spaceContent={spaceContent} />
      <Content>
        {spaceContent && (
          <>
            <Designer spaceId={props.spaceId} spaceContent={spaceContent} />
            {selectedBlock && (
              <Editor
                selectedBlock={selectedBlock}
                spaceId={props.spaceId}
                spaceContent={spaceContent}
              />
            )}
          </>
        )}
      </Content>
    </>
  );
}
