import { useDroppable } from "@dnd-kit/core";
import classNames from "classnames";

export default function Gutter({
  preItemId,
  isDisabled,
}: {
  preItemId: string;
  isDisabled: boolean;
}) {
  const { isOver, setNodeRef } = useDroppable({
    id: preItemId,
    disabled: isDisabled,
  });

  return (
    <div
      className={classNames("RouteSpaceV2_gutter", {
        RouteSpaceV2_gutter_over: isOver,
      })}
      ref={setNodeRef}
    ></div>
  );
}
