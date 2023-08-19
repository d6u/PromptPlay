import BlockPointerIcon from "../../icons/BlockPointerIcon";
import classNames from "classnames";

export default function BlockSetPointer({
  isActive,
  onClick,
}: {
  isActive: boolean;
  onClick: () => void;
}) {
  return (
    <div
      className={classNames("BlockSet_pointer", {
        BlockSet_pointer_active: isActive,
      })}
      onClick={onClick}
    >
      <BlockPointerIcon />
    </div>
  );
}
