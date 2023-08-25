import { UPDATE_SPACE_V2_MUTATION } from "./graphql";
import { Block, SpaceContent } from "./interfaces";
import { isObject } from "./utils";
import { useMutation } from "@apollo/client";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import { assoc, dissoc, pipe } from "ramda";
import { useCallback, useState } from "react";
import styled from "styled-components";
import u from "updeep";

const Container = styled.div`
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
`;

type Props = {
  spaceId: string;
  content: SpaceContent;
  scopeName: string;
  localName: string;
  block: Block;
  isOutput?: boolean;
};

export default function VariableMapRow(props: Props) {
  const [updateSpaceV2] = useMutation(UPDATE_SPACE_V2_MUTATION);

  const [localName, setLocalName] = useState(props.localName);
  const [scopeName, setScopeName] = useState(props.scopeName);

  const updateOutputLocalName = useCallback(() => {
    if (!isObject(props.block.output)) {
      return;
    }

    const newContent = u<any, SpaceContent>(
      {
        components: {
          [props.block.id]: {
            output: pipe(dissoc(props.localName), assoc(localName, scopeName)),
          },
        },
      },
      props.content
    ) as SpaceContent;

    updateSpaceV2({
      variables: {
        spaceId: props.spaceId,
        content: JSON.stringify(newContent),
      },
    });
  }, [
    localName,
    scopeName,
    props.block,
    props.content,
    props.localName,
    props.spaceId,
    updateSpaceV2,
  ]);

  const updateOutputScopeName = useCallback(() => {
    if (!isObject(props.block.output)) {
      return;
    }

    const newContent = u<any, SpaceContent>(
      {
        components: {
          [props.block.id]: {
            output: assoc(localName, scopeName),
          },
        },
      },
      props.content
    ) as SpaceContent;

    updateSpaceV2({
      variables: {
        spaceId: props.spaceId,
        content: JSON.stringify(newContent),
      },
    });
  }, [
    localName,
    scopeName,
    props.block,
    props.content,
    props.spaceId,
    updateSpaceV2,
  ]);

  const updateInputLocalName = useCallback(() => {
    if (!isObject(props.block.input)) {
      return;
    }

    const newContent = u<any, SpaceContent>(
      {
        components: {
          [props.block.id]: {
            input: assoc(scopeName, localName),
          },
        },
      },
      props.content
    ) as SpaceContent;

    updateSpaceV2({
      variables: {
        spaceId: props.spaceId,
        content: JSON.stringify(newContent),
      },
    });
  }, [
    localName,
    scopeName,
    props.block,
    props.content,
    props.spaceId,
    updateSpaceV2,
  ]);

  const updateInputScopeName = useCallback(() => {
    if (!isObject(props.block.input)) {
      return;
    }

    const newContent = u<any, SpaceContent>(
      {
        components: {
          [props.block.id]: {
            input: pipe(dissoc(props.scopeName), assoc(scopeName, localName)),
          },
        },
      },
      props.content
    ) as SpaceContent;

    updateSpaceV2({
      variables: {
        spaceId: props.spaceId,
        content: JSON.stringify(newContent),
      },
    });
  }, [
    localName,
    scopeName,
    props.scopeName,
    props.block,
    props.content,
    props.spaceId,
    updateSpaceV2,
  ]);

  if (props.isOutput) {
    return (
      <Container>
        <Input
          color="primary"
          size="sm"
          variant="soft"
          style={{ flexGrow: 1 }}
          value={localName}
          onChange={(e) => {
            setLocalName(e.target.value);
          }}
          onKeyUp={(e) => {
            if (e.key !== "Enter") {
              return;
            }
            updateOutputLocalName();
          }}
          onBlur={() => updateOutputLocalName()}
        />
        <Input
          color="neutral"
          size="sm"
          variant="soft"
          style={{ flexGrow: 1 }}
          value={scopeName}
          onChange={(e) => {
            setScopeName(e.target.value);
          }}
          onKeyUp={(e) => {
            if (e.key !== "Enter") {
              return;
            }
            updateOutputScopeName();
          }}
          onBlur={() => updateOutputScopeName()}
        />
        <Button
          color="danger"
          size="sm"
          variant="outlined"
          onClick={() => {
            if (!isObject(props.block.output)) {
              return;
            }

            const newContent = u<any, SpaceContent>(
              {
                components: {
                  [props.block.id]: {
                    output: dissoc(props.localName),
                  },
                },
              },
              props.content
            ) as SpaceContent;

            updateSpaceV2({
              variables: {
                spaceId: props.spaceId,
                content: JSON.stringify(newContent),
              },
            });
          }}
        >
          Remove
        </Button>
      </Container>
    );
  } else {
    return (
      <Container>
        <Input
          color="neutral"
          size="sm"
          variant="soft"
          style={{ flexGrow: 1 }}
          value={scopeName}
          onChange={(e) => {
            setScopeName(e.target.value);
          }}
          onKeyUp={(e) => {
            if (e.key !== "Enter") {
              return;
            }
            updateInputScopeName();
          }}
          onBlur={() => updateInputScopeName()}
        />
        <Input
          color="primary"
          size="sm"
          variant="soft"
          style={{ flexGrow: 1 }}
          value={localName}
          onChange={(e) => {
            setLocalName(e.target.value);
          }}
          onKeyUp={(e) => {
            if (e.key !== "Enter") {
              return;
            }
            updateInputLocalName();
          }}
          onBlur={() => updateInputLocalName()}
        />
        <Button
          color="danger"
          size="sm"
          variant="outlined"
          onClick={() => {
            if (!isObject(props.block.input)) {
              return;
            }

            const newContent = u<any, SpaceContent>(
              {
                components: {
                  [props.block.id]: {
                    input: dissoc(props.scopeName),
                  },
                },
              },
              props.content
            ) as SpaceContent;

            updateSpaceV2({
              variables: {
                spaceId: props.spaceId,
                content: JSON.stringify(newContent),
              },
            });
          }}
        >
          Remove
        </Button>
      </Container>
    );
  }
}
