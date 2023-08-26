import { UPDATE_SPACE_V2_MUTATION } from "../../../../state/spaceGraphQl";
import { Block, SpaceContent } from "../../../../static/spaceTypes";
import EditorSingleScopeVariable from "./EditorSingleScopeVariable";
import VariableMapRow from "./VariableMapRow";
import { useMutation } from "@apollo/client";
import Button from "@mui/joy/Button";
import { customAlphabet } from "nanoid";
import { append, equals, reject, update } from "ramda";
import { ReactNode } from "react";
import styled from "styled-components";
import u from "updeep";

const nanoid = customAlphabet("1234567890abcdef", 6);

const Container = styled.div`
  margin-bottom: 10px;
`;

const Header = styled.div`
  margin-bottom: 5px;
`;

type Props = {
  block: Block;
  isInput: boolean;
  spaceId: string;
  spaceContent: SpaceContent;
} & (
  | {
      singleVariable: string;
    }
  | {
      variableMap: Array<[string, string]>;
    }
);

export default function EditorBlockInputOutput(props: Props) {
  const [updateSpaceV2] = useMutation(UPDATE_SPACE_V2_MUTATION);

  let rows: ReactNode[] | ReactNode;

  if ("singleVariable" in props) {
    rows = (
      <EditorSingleScopeVariable
        key={`${props.block.id}-single-variable`}
        variableName={props.singleVariable}
        isInput={props.isInput}
        onSave={(newName) => {
          const newContent = u({
            components: {
              [props.block.id]: {
                [props.isInput ? "singleInput" : "singleOuput"]: newName,
              },
            },
          })(props.spaceContent) as SpaceContent;

          updateSpaceV2({
            variables: {
              spaceId: props.spaceId,
              content: JSON.stringify(newContent),
            },
          });
        }}
      />
    );
  } else {
    rows = [];

    for (const [index, [left, right]] of props.variableMap.entries()) {
      // They key must contain block.id, so that when selecting a different
      // block, this field will be updated.
      (rows as ReactNode[]).push(
        <VariableMapRow
          key={`${props.block.id}-variable-map-row-${index}`}
          localName={props.isInput ? right : left}
          scopeName={props.isInput ? left : right}
          isInput={props.isInput}
          onSaveLocalName={(newValue) => {
            const newContent = u({
              components: {
                [props.block.id]: {
                  [props.isInput ? "inputMap" : "outputMap"]: update(
                    index,
                    props.isInput ? [left, newValue] : [newValue, right]
                  ),
                },
              },
            })(props.spaceContent) as SpaceContent;

            updateSpaceV2({
              variables: {
                spaceId: props.spaceId,
                content: JSON.stringify(newContent),
              },
            });
          }}
          onSaveScopeName={(newValue) => {
            const newContent = u({
              components: {
                [props.block.id]: {
                  [props.isInput ? "inputMap" : "outputMap"]: update(
                    index,
                    props.isInput ? [newValue, right] : [left, newValue]
                  ),
                },
              },
            })(props.spaceContent) as SpaceContent;

            updateSpaceV2({
              variables: {
                spaceId: props.spaceId,
                content: JSON.stringify(newContent),
              },
            });
          }}
          onRemove={() => {
            const newContent = u({
              components: {
                [props.block.id]: {
                  [props.isInput ? "inputMap" : "outputMap"]: reject(
                    equals([left, right])
                  ),
                },
              },
            })(props.spaceContent) as SpaceContent;

            updateSpaceV2({
              variables: {
                spaceId: props.spaceId,
                content: JSON.stringify(newContent),
              },
            });
          }}
        />
      );
    }
  }

  let addButton: ReactNode | null = null;

  if ("variableMap" in props) {
    addButton = (
      <Button
        color="success"
        size="sm"
        variant="outlined"
        onClick={() => {
          const id = nanoid();
          const localName = `local_${id}`;
          const scopeName = `scope_${id}`;

          const newContent = u({
            components: {
              [props.block.id]: {
                [props.isInput ? "inputMap" : "outputMap"]: append(
                  props.isInput
                    ? [scopeName, localName]
                    : [localName, scopeName]
                ),
              },
            },
          })(props.spaceContent) as SpaceContent;

          updateSpaceV2({
            variables: {
              spaceId: props.spaceId,
              content: JSON.stringify(newContent),
            },
          });
        }}
      >
        Add
      </Button>
    );
  }

  return (
    <Container>
      <Header>{props.isInput ? "Input" : "Output"}</Header>
      <div>{rows}</div>
      {addButton}
    </Container>
  );
}
