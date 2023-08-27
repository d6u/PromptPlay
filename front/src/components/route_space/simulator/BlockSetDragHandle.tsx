// import DragArrowIcon from "../../icons/DragArrowIcon";
import { Ref } from "react";
import DragHandleIcon from "../../icons/DragHandleIcon";

export default function BlockSetDragHandle({
  handleListeners,
  handleRef,
}: {
  handleListeners: any;
  handleRef: Ref<HTMLDivElement>;
}) {
  return (
    <div className="BlockSet_drag_handle">
      {/* <DragArrowIcon className="BlockSet_move_up_btn" onClick={() => {}} /> */}
      <DragHandleIcon
        className="BlockSet_drag_handle_btn"
        ref={handleRef}
        {...handleListeners}
      />
      {/* <DragArrowIcon className="BlockSet_move_down_btn" onClick={() => {}} /> */}
    </div>
  );
}
