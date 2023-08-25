import { spaceV2SelectedBlockIdState } from "../../state/store";
import VariableMapRow from "./VariableMapRow";
import { UPDATE_SPACE_V2_MUTATION } from "./graphql";
import { SpaceContent } from "./interfaces";
import { isBlockGroupAnchor, isObject } from "./utils";
import { useMutation } from "@apollo/client";
import Button from "@mui/joy/Button";
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

  if (isObject(map)) {
    for (const [key, value] of Object.entries(map)) {
      rows.push(
        <VariableMapRow
          key={`${value}-${key}`}
          spaceId={props.spaceId}
          content={props.content}
          localName={props.isOutput ? key : value}
          scopeName={props.isOutput ? value : key}
          block={block}
          isOutput={props.isOutput}
        />
      );
    }
  } else {
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
