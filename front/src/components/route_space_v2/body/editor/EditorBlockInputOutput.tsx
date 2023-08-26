import {
  spaceContentState,
  spaceV2SelectedBlockSelector,
} from "../../../../state/store";
import { BlockConfig } from "../../../../static/blockConfigs";
import { SpaceContent } from "../../../../static/spaceTypes";
import { isObject } from "../../../../static/spaceUtils";
import { UPDATE_SPACE_V2_MUTATION } from "../../graphql";
import EditorSingleScopeVariable from "./EditorSingleScopeVariable";
import VariableMapRow from "./VariableMapRow";
import { useMutation } from "@apollo/client";
import Button from "@mui/joy/Button";
import { ReactNode } from "react";
import { useRecoilCallback, useRecoilValue } from "recoil";
import styled from "styled-components";
import u from "updeep";

const Container = styled.div`
  margin-bottom: 10px;
`;

const Header = styled.div`
  margin-bottom: 5px;
`;

type Props = {
  spaceId: string;
  blockId: string;
  inputOutput: string | { [key: string]: string };
  blockConfig: BlockConfig;
  isOutput?: boolean;
};

export default function EditorBlockInputOutput(props: Props) {
  const [updateSpaceV2] = useMutation(UPDATE_SPACE_V2_MUTATION);

  const block = useRecoilValue(spaceV2SelectedBlockSelector)!;

  const appendNewVariablePair = useRecoilCallback(
    ({ snapshot }) =>
      async () => {
        let spaceContent = await snapshot.getPromise(spaceContentState);

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
            spaceContent
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
            spaceContent
          ) as SpaceContent;

          updateSpaceV2({
            variables: {
              spaceId: props.spaceId,
              content: JSON.stringify(newContent),
            },
          });
        }
      }
  );

  const rows: ReactNode[] = [];

  if (props.blockConfig.singleInput) {
    rows.push(
      <EditorSingleScopeVariable
        key={`${props.blockId}-single-input`}
        spaceId={props.spaceId}
        isOutput={props.isOutput}
      />
    );
  } else {
    for (const [key, value] of Object.entries(block.input as object)) {
      rows.push(
        <VariableMapRow
          key={`${value}-${key}`}
          spaceId={props.spaceId}
          localName={props.isOutput ? key : value}
          scopeName={props.isOutput ? value : key}
          isOutput={props.isOutput}
        />
      );
    }
  }

  return (
    <Container>
      <Header>{props.isOutput ? "Output" : "Input"}</Header>
      <div>{rows}</div>
      {!props.blockConfig.singleInput && (
        <Button
          color="success"
          size="sm"
          variant="outlined"
          onClick={appendNewVariablePair}
        >
          Add
        </Button>
      )}
    </Container>
  );
}
