import BlockV2 from "../block_v2/BlockV2";
import VariableMapArrow from "../icons/VaribleMapArrow";
import { Block, isObject } from "./utils";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { ReactNode } from "react";

export default function BlockComponent({ block }: { block: Block }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: block.id,
  });

  const inputChips: ReactNode[] = [];

  if (isObject(block.input)) {
    for (const [nameOnScope, argumentName] of Object.entries(block.input)) {
      (inputChips as ReactNode[]).push(
        <div
          key={`scope-name-${nameOnScope}`}
          className="RouteSpaceV2_block_variable_scope_name"
        >
          {nameOnScope}
        </div>,
        <VariableMapArrow
          key={`${nameOnScope}-${argumentName}-arrow`}
          className="RouteSpaceV2_block_arrow_icon"
        />,
        <div
          key={`argument-name-${argumentName}`}
          className="RouteSpaceV2_block_variable_argument_name"
        >
          {argumentName}
        </div>
      );
    }
  } else if (block.input) {
    inputChips.push(
      <div key="scope-name" className="RouteSpaceV2_block_variable_scope_name">
        {block.input}
      </div>,
      <VariableMapArrow
        key="arrow"
        className="RouteSpaceV2_block_arrow_icon"
      />,
      <div
        key="argument-name"
        className="RouteSpaceV2_block_variable_argument_name"
      >
        _
      </div>
    );
  }

  const outputChips: ReactNode[] = [];

  if (isObject(block.output)) {
    for (const [returnName, nameOnScope] of Object.entries(block.output)) {
      outputChips.push(
        <div
          key={`argument-name-${returnName}`}
          className="RouteSpaceV2_block_variable_argument_name"
        >
          {returnName}
        </div>,
        <VariableMapArrow
          key={`${returnName}-${nameOnScope}-arrow`}
          className="RouteSpaceV2_block_arrow_icon"
        />,
        <div
          key={`scope-name-${nameOnScope}`}
          className="RouteSpaceV2_block_variable_scope_name"
        >
          {nameOnScope}
        </div>
      );
    }
  } else if (block.output) {
    outputChips.push(
      <div
        key="argument-name"
        className="RouteSpaceV2_block_variable_argument_name"
      >
        _
      </div>,
      <VariableMapArrow
        key="arrow"
        className="RouteSpaceV2_block_arrow_icon"
      />,
      <div key="scope-name" className="RouteSpaceV2_block_variable_scope_name">
        {block.output}
      </div>
    );
  }

  return (
    <div
      className="RouteSpaceV2_block"
      ref={setNodeRef}
      style={{ transform: CSS.Translate.toString(transform) }}
      {...listeners}
      {...attributes}
    >
      <div className="RouteSpaceV2_block_input">{inputChips}</div>
      <BlockV2 type={block.type}>{block.id}</BlockV2>
      <div className="RouteSpaceV2_block_output">{outputChips}</div>
    </div>
  );
}
