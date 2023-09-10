import styled from "@emotion/styled";
import Input from "@mui/joy/Input";
import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { useMutation, useQuery } from "urql";
import { graphql } from "../../gql";
import { UPDATE_SPACE_NAME_MUTATION } from "../../state/spaceGraphQl";

const SpaceNameInput = styled(Input)`
  width: 250px;
`;

const Name = styled.div`
  font-size: 14px;
  padding-left: 9px;
`;

const HEADER_SPACE_NAME_QUERY = graphql(`
  query HeaderSpaceNameQuery($spaceId: UUID!) {
    result: space(id: $spaceId) {
      isReadOnly
      space {
        name
      }
    }
  }
`);

export default function SpaceName() {
  // TODO: Properly handle spaceId not being present
  const { spaceId = "" } = useParams<{ spaceId: string }>();

  const [queryResult] = useQuery({
    query: HEADER_SPACE_NAME_QUERY,
    requestPolicy: "network-only",
    pause: !spaceId,
    variables: { spaceId },
  });

  const [name, setName] = useState<string>("");

  useEffect(() => {
    setName(queryResult.data?.result?.space.name ?? "");
  }, [queryResult.data?.result?.space.name]);

  const currentNameRef = useRef<string>(name);
  const [isEditingName, setIsEditingName] = useState<boolean>(false);
  const [, updateSpaceName] = useMutation(UPDATE_SPACE_NAME_MUTATION);
  const [isComposing, setIsComposing] = useState<boolean>(false);

  if (!spaceId) {
    return null;
  }

  if (queryResult.fetching) {
    return null;
  }

  if (queryResult.error || !queryResult.data?.result) {
    return null;
  }

  return isEditingName && !queryResult.data.result.isReadOnly ? (
    <SpaceNameInput
      ref={(element) => {
        element?.querySelector("input")?.focus();
      }}
      type="text"
      size="sm"
      placeholder="Enter a name for this space"
      value={name}
      onChange={(e) => setName(e.target.value)}
      // This for handling IME (Input Method Editors) input,
      // e.g. Pinyin input. Using this technique to avoid triggering
      // the Enter key when user is still interacting with IME.
      onCompositionStart={() => setIsComposing(true)}
      onCompositionEnd={() => setIsComposing(false)}
      onKeyDown={(e) => {
        if (isComposing) {
          return;
        }

        if (e.key === "Enter") {
          setIsEditingName(false);
          updateSpaceName({ spaceId, name });
        } else if (e.key === "Escape") {
          setIsEditingName(false);
          setName(currentNameRef.current);
        }
      }}
    />
  ) : (
    <Name
      onClick={() => {
        currentNameRef.current = name;
        setIsEditingName(true);
      }}
    >
      {name || "[EMPTY]"}
    </Name>
  );
}
