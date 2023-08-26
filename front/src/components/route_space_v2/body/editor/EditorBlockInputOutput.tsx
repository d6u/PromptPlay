import { Block, SpaceContent } from "../../../../static/spaceTypes";
import { UPDATE_SPACE_V2_MUTATION } from "../../graphql";
import EditorSingleScopeVariable from "./EditorSingleScopeVariable";
import VariableMapRow from "./VariableMapRow";
import { useMutation } from "@apollo/client";
import Button from "@mui/joy/Button";
import { assoc, dissoc, pipe } from "ramda";
import { ReactNode } from "react";
import styled from "styled-components";
import u from "updeep";

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
      variableMap: { [key: string]: string };
    }
);

export default function EditorBlockInputOutput(props: Props) {
  const [updateSpaceV2] = useMutation(UPDATE_SPACE_V2_MUTATION);

  const rows: ReactNode[] = [];

  if ("singleVariable" in props) {
    rows.push(
      <EditorSingleScopeVariable
        key={`${props.block.id}-single-variable`}
        variableName={props.singleVariable}
        isInput={props.isInput}
        onSave={(newName) => {
          const spaceContent = u<any, SpaceContent>(
            {
              components: {
                [props.block.id]: {
                  [props.isInput ? "singleInput" : "singleOuput"]: newName,
                },
              },
            },
            props.spaceContent
          );

          updateSpaceV2({
            variables: {
              spaceId: props.spaceId,
              content: JSON.stringify(spaceContent),
            },
          });
        }}
      />
    );
  } else {
    for (const [key, value] of Object.entries(props.variableMap)) {
      rows.push(
        <VariableMapRow
          key={`${key}-${value}`}
          localName={props.isInput ? value : key}
          scopeName={props.isInput ? key : value}
          isInput={props.isInput}
          onSaveLocalName={(newValue) => {
            const newContent = u<any, SpaceContent>(
              {
                components: {
                  [props.block.id]: {
                    [props.isInput ? "inputMap" : "outputMap"]: props.isInput
                      ? assoc(key, newValue)
                      : pipe(dissoc(key), assoc(newValue, value)),
                  },
                },
              },
              props.spaceContent
            ) as SpaceContent;

            updateSpaceV2({
              variables: {
                spaceId: props.spaceId,
                content: JSON.stringify(newContent),
              },
            });
          }}
          onSaveScopeName={(newValue) => {
            const newContent = u<any, SpaceContent>(
              {
                components: {
                  [props.block.id]: {
                    [props.isInput ? "inputMap" : "outputMap"]: props.isInput
                      ? pipe(dissoc(key), assoc(newValue, value))
                      : assoc(key, newValue),
                  },
                },
              },
              props.spaceContent
            ) as SpaceContent;

            updateSpaceV2({
              variables: {
                spaceId: props.spaceId,
                content: JSON.stringify(newContent),
              },
            });
          }}
          onRemove={() => {
            const spaceContent = u<any, SpaceContent>(
              {
                components: {
                  [props.block.id]: {
                    [props.isInput ? "inputMap" : "outputMap"]: dissoc(key),
                  },
                },
              },
              props.spaceContent
            );

            updateSpaceV2({
              variables: {
                spaceId: props.spaceId,
                content: JSON.stringify(spaceContent),
              },
            });
          }}
        />
      );
    }
  }

  return (
    <Container>
      <Header>{props.isInput ? "Input" : "Output"}</Header>
      <div>{rows}</div>
      {"variableMap" in props && (
        <Button
          color="success"
          size="sm"
          variant="outlined"
          onClick={() => {
            const count = Object.keys(props.variableMap).length;
            const localName = `local_name_${count + 1}`;
            const scopeName = `scope_name_${count + 1}`;

            const newContent = u<any, SpaceContent>(
              {
                components: {
                  [props.block.id]: {
                    [props.isInput ? "inputMap" : "outputMap"]: props.isInput
                      ? assoc(scopeName, localName)
                      : assoc(localName, scopeName),
                  },
                },
              },
              props.spaceContent
            ) as SpaceContent;

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
      )}
    </Container>
  );
}
