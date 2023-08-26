import { spaceContentState } from "../../../state/store";
import { updateContent } from "../../../static/spaceUtils";
import { useDefaultSensors } from "../../../util/useDefaultSensors";
import BlockGroupComponent from "../BlockGroupComponent";
import { UPDATE_SPACE_V2_MUTATION } from "../graphql";
import { useMutation } from "@apollo/client";
import { DndContext, DragEndEvent, closestCenter } from "@dnd-kit/core";
import styled from "@emotion/styled";
import { useRecoilCallback, useRecoilValue } from "recoil";

const Container = styled.div`
  overflow-y: auto;
  flex-grow: 1;
`;

const Content = styled.div`
  padding: 13px 20px 13px 0;
`;

type Props = {
  spaceId: string;
};

export default function SpaceV2Left(props: Props) {
  const [updateSpaceV2] = useMutation(UPDATE_SPACE_V2_MUTATION);

  const currentSpaceContent = useRecoilValue(spaceContentState);

  const onDragEnd = useRecoilCallback(
    ({ snapshot }) =>
      async (event: DragEndEvent) => {
        const spaceContent = await snapshot.getPromise(spaceContentState);

        if (spaceContent == null) {
          console.error("spaceContent should not be null");
          return;
        }

        updateSpaceV2({
          variables: {
            spaceId: props.spaceId,
            content: JSON.stringify(
              updateContent(
                event.over?.id as string,
                event.active.id as string,
                spaceContent
              )
            ),
          },
        });
      },
    [props.spaceId, updateSpaceV2]
  );

  const sensors = useDefaultSensors();

  return (
    <Container>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
      >
        {currentSpaceContent && (
          <Content>
            <BlockGroupComponent
              spaceContent={currentSpaceContent}
              anchor={currentSpaceContent.root}
              isRoot
            />
          </Content>
        )}
      </DndContext>
    </Container>
  );
}
