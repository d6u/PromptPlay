import { useMutation } from "@apollo/client";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import styled from "@emotion/styled";
import { useCallback } from "react";
import { UPDATE_SPACE_CONTENT_MUTATION } from "../../../state/spaceGraphQl";
import { SpaceContent } from "../../../static/spaceTypes";
import { updateContent } from "../../../static/spaceUtils";
import { useDefaultSensors } from "../../../util/useDefaultSensors";
import BlockGroupComponent from "./designer/BlockGroupComponent";

const Container = styled.div`
  overflow-y: auto;
  flex-grow: 1;
`;

const Content = styled.div`
  padding: 13px 20px 13px 0;
`;

type Props = {
  isReadOnly: boolean;
  spaceId: string;
  spaceName: string;
  spaceContent: SpaceContent;
  currentExecutingBlockId: string | null;
};

export default function Designer(props: Props) {
  const [updateSpaceV2] = useMutation(UPDATE_SPACE_CONTENT_MUTATION);

  const onDragEnd = useCallback(
    async (event: DragEndEvent) => {
      const newSpaceContent = updateContent(
        event.over!.id as string,
        event.active.id as string,
        props.spaceContent
      );

      const contentJson = JSON.stringify(newSpaceContent);

      updateSpaceV2({
        variables: {
          spaceId: props.spaceId,
          content: contentJson,
        },
        optimisticResponse: {
          updateSpace: {
            id: props.spaceId,
            __typename: "Space",
            // TODO: Use proper name
            name: props.spaceName,
            content: contentJson,
          },
        },
      });
    },
    [props.spaceId, props.spaceName, props.spaceContent, updateSpaceV2]
  );

  const sensors = useDefaultSensors();

  return (
    <Container>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        <Content>
          <BlockGroupComponent
            isReadOnly={props.isReadOnly}
            anchor={props.spaceContent.root}
            spaceContent={props.spaceContent}
            isRoot
            currentExecutingBlockId={props.currentExecutingBlockId}
          />
        </Content>
      </DndContext>
    </Container>
  );
}
