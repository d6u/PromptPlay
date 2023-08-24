import BlockGroupComponent from "./BlockGroupComponent";
import "./SpaceV2Left.css";
import { UPDATE_SPACE_V2_MUTATION } from "./graphql";
import { updateContent, useDefaultSensors } from "./utils";
import { BlockGroup } from "./utils";
import { useMutation } from "@apollo/client";
import { DndContext, closestCenter } from "@dnd-kit/core";

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
    <div className="SpaceV2Left">
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
        <div className="SpaceV2Left_content">
          {content && <BlockGroupComponent blockGroup={content} isRoot />}
        </div>
      </DndContext>
    </div>
  );
}
