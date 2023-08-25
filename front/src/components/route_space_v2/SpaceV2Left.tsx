import BlockGroupComponent from "./BlockGroupComponent";
import { UPDATE_SPACE_V2_MUTATION } from "./graphql";
import { updateContent, useDefaultSensors } from "./utils";
import { BlockGroup } from "./utils";
import { useMutation } from "@apollo/client";
import { DndContext, closestCenter } from "@dnd-kit/core";
import styled from "@emotion/styled";

const Container = styled.div`
  overflow-y: auto;
  flex-grow: 1;
`;

const Content = styled.div`
  padding: 13px 20px 13px 0;
`;

export default function SpaceV2Left({
  spaceId,
  content,
}: {
  spaceId: string;
  content: BlockGroup | null;
}) {
  const [updateSpaceV2] = useMutation(UPDATE_SPACE_V2_MUTATION);

  const sensors = useDefaultSensors();

  return (
    <Container>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={(event) => {}}
        onDragEnd={(event) => {
          updateSpaceV2({
            variables: {
              spaceId,
              content: JSON.stringify(
                updateContent(
                  event.over?.id as string,
                  event.active.id as string,
                  content!
                )
              ),
            },
          });
        }}
      >
        <Content>
          {content && <BlockGroupComponent blockGroup={content} isRoot />}
        </Content>
      </DndContext>
    </Container>
  );
}
