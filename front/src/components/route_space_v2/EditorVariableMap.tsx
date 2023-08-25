import { spaceV2SelectedBlockIdState } from "../../state/store";
import { UPDATE_SPACE_V2_MUTATION } from "./graphql";
import { SpaceContent } from "./interfaces";
import { isBlockGroupAnchor, isObject } from "./utils";
import { useMutation } from "@apollo/client";
import Button from "@mui/joy/Button";
import Input from "@mui/joy/Input";
import { dissoc } from "ramda";
import { ReactNode } from "react";
import { useRecoilValue } from "recoil";
import styled from "styled-components";
import u from "updeep";

const Container = styled.div`
  margin-bottom: 10px;
`;

const Header = styled.div`
  margin-bottom: 5px;
`;

const VariableMapRow = styled.div`
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
`;

type Props = {
  spaceId: string;
  content: SpaceContent;
  isOutput?: boolean;
};

export default function EditorVariableMap(props: Props) {
  const [updateSpaceV2] = useMutation(UPDATE_SPACE_V2_MUTATION);

  const spaceV2SelectedBlockId = useRecoilValue(spaceV2SelectedBlockIdState);

  const block = spaceV2SelectedBlockId
    ? props.content.components[spaceV2SelectedBlockId]
    : null;

  if (block == null || isBlockGroupAnchor(block)) {
    return null;
  }

  const map = props.isOutput ? block.output : block.input;
  const rows: ReactNode[] = [];

  if (props.isOutput) {
    if (isObject(map)) {
      for (const [localName, scopeName] of Object.entries(map)) {
        rows.push(
          <VariableMapRow key={`${scopeName}-${localName}`}>
            <Input
              color="primary"
              size="sm"
              variant="soft"
              style={{ flexGrow: 1 }}
              value={localName}
            />
            <Input
              color="neutral"
              size="sm"
              variant="soft"
              style={{ flexGrow: 1 }}
              value={scopeName}
            />
            <Button
              color="danger"
              size="sm"
              variant="outlined"
              onClick={() => {
                if (!isObject(block.output)) {
                  return;
                }

                const newContent = u<any, SpaceContent>(
                  {
                    components: {
                      [block.id]: {
                        output: dissoc(localName),
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
          </VariableMapRow>
        );
      }
    } else {
    }
  } else {
    if (isObject(map)) {
      for (const [scopeName, localName] of Object.entries(map)) {
        rows.push(
          <VariableMapRow key={`${scopeName}-${localName}`}>
            <Input
              color="neutral"
              size="sm"
              variant="soft"
              style={{ flexGrow: 1 }}
              value={scopeName}
            />
            <Input
              color="primary"
              size="sm"
              variant="soft"
              style={{ flexGrow: 1 }}
              value={localName}
            />
            <Button
              color="danger"
              size="sm"
              variant="outlined"
              onClick={() => {
                if (!isObject(block.input)) {
                  return;
                }

                const newContent = u<any, SpaceContent>(
                  {
                    components: {
                      [block.id]: {
                        input: dissoc(scopeName),
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
          </VariableMapRow>
        );
      }
    } else {
    }
  }

  return (
    <Container>
      <Header>{props.isOutput ? "Output" : "Input"}</Header>
      <div>{rows}</div>
      <Button
        color="success"
        size="sm"
        variant="outlined"
        onClick={() => {
          if (props.isOutput) {
            if (!isObject(block.output)) {
              return;
            }

            const count = Object.keys(block.output).length;
            const localName = `local_name_${count + 1}`;
            const scopeName = `scope_name_pretty_long_${count + 1}`;

            const newContent = u(
              {
                components: {
                  [block.id]: {
                    output: {
                      [localName]: scopeName,
                    },
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
          } else {
            if (!isObject(block.input)) {
              return;
            }

            const count = Object.keys(block.input).length;
            const scopeName = `scope_name_${count + 1}`;
            const argName = `arg_vary_vary_long_name_${count + 1}`;

            const newContent = u(
              {
                components: {
                  [block.id]: {
                    input: {
                      [scopeName]: argName,
                    },
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
          }
        }}
      >
        Add
      </Button>
    </Container>
  );
}
