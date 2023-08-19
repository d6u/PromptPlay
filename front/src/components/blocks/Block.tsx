import { PromptType } from "../../__generated__/graphql";
import { selectedBlockState } from "../../state/store";
import CrossIcon from "../icons/CrossIcon";
import "./Block.css";
import classNames from "classnames";
import { MouseEventHandler, ReactElement, forwardRef } from "react";
import { useRecoilValue } from "recoil";

export enum BlockType {
  Prompt,
  Completer,
  Output,
  OutputError,
  Placeholder,
}

type Props = {
  blockId?: string;
  className?: string;
  type: BlockType;
  onClick?: MouseEventHandler<HTMLDivElement> | null;
  onClickRemove?: MouseEventHandler<HTMLDivElement>;
  children?: ReactElement | string;
  isFromPrevious?: boolean;
  isRemoveButtonEnabled?: boolean;
};

const Block = forwardRef<HTMLDivElement, Props>(function Block(
  {
    blockId,
    className,
    type,
    onClick,
    onClickRemove,
    isFromPrevious = false,
    isRemoveButtonEnabled = false,
    children,
    ...rest
  },
  ref
) {
  const selectedBlockId = useRecoilValue(selectedBlockState);

  if (type === BlockType.Placeholder) {
    return <div className={classNames("Block_placeholder", className)}></div>;
  }

  return (
    <div
      ref={ref}
      className={classNames("Block", className, {
        Block_clickable: onClick != null,
        Block_prompt: type === BlockType.Prompt,
        Block_completer: type === BlockType.Completer,
        Block_output: type === BlockType.Output,
        "Block_output-error": type === BlockType.OutputError,
        "Block_from-previous": isFromPrevious,
        Block_selected: selectedBlockId === blockId,
      })}
      onClick={onClick ?? undefined}
      {...rest}
    >
      {isRemoveButtonEnabled && (
        <div className="Block_remove_btn" onClick={onClickRemove}>
          <CrossIcon className="Block_remove_btn_icon" />
        </div>
      )}
      <div className="Block_text">{children}</div>
    </div>
  );
});

export default Block;

export function parseBlockDisplayData(
  data:
    | {
        __typename: "CompleterBlock";
        model: string;
        temperature: number;
        stop: string;
      }
    | {
        __typename: "PromptBlock";
        role: PromptType;
        content: string;
      }
    | null,
  isSystem: boolean = false
): { type: BlockType; displayContent: ReactElement | string } {
  let type: BlockType;
  let displayContent: ReactElement | string;
  switch (data?.__typename) {
    case "CompleterBlock":
      type = BlockType.Completer;
      displayContent = (
        <>
          {`${data.model}`}
          <br />
          {`🌡️ = ${data.temperature}`}
          <br />
          {`stop = ${data.stop}`}
        </>
      );
      break;
    case "PromptBlock":
      switch (data.role) {
        case PromptType.System:
          type = BlockType.Prompt;
          break;
        case PromptType.User:
          type = BlockType.Prompt;
          break;
        case PromptType.Assistant:
          type = BlockType.Output;
          break;
        default:
          type = BlockType.Prompt;
          break;
      }
      displayContent = (
        <>
          {isSystem ? "SYSTEM" : data.role.toUpperCase()}
          <br />
          {data.content!}
        </>
      );
      break;
    default:
      type = BlockType.Prompt;
      displayContent = "";
      break;
  }

  return {
    type,
    displayContent,
  };
}
