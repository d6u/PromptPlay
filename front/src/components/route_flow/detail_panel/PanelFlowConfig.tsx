import Button from "@mui/joy/Button";
import filter from "lodash/filter";
import { adjust, assoc, flatten, propEq } from "ramda";
import { ReactNode, useMemo } from "react";
import { Node } from "reactflow";
import { FlowState, useFlowStore } from "../../../state/flowState";
import {
  InputNodeData,
  NodeOutputItem,
  NodeType,
  OutputNodeData,
} from "../../../static/flowTypes";
import { RawValue } from "../common/commonStyledComponents";
import InputBlock from "./InputBlock";

const selector = (state: FlowState) => ({
  flowConfig: state.flowConfig,
  onFlowConfigUpdate: state.onFlowConfigUpdate,
  nodes: state.nodes,
  onUpdateNode: state.onUpdateNode,
  setDetailPanelContentType: state.setDetailPanelContentType,
});

export default function PanelFlowConfig() {
  const {
    flowConfig,
    onFlowConfigUpdate,
    nodes,
    onUpdateNode,
    setDetailPanelContentType,
  } = useFlowStore(selector);

  const inputNodes = useMemo(
    () =>
      filter(
        nodes,
        propEq<string>(NodeType.InputNode, "type")
      ) as Node<InputNodeData>[],
    [nodes]
  );

  const outputNodes = useMemo(
    () =>
      filter(
        nodes,
        propEq<string>(NodeType.OutputNode, "type")
      ) as Node<OutputNodeData>[],
    [nodes]
  );

  return (
    <>
      {flatten(
        inputNodes.map((node) =>
          node.data.outputs.map((output, i) => (
            <InputBlock
              key={output.id}
              id={output.id}
              name={output.name}
              value={output.value}
              onSaveValue={(value) => {
                const newOutputs = adjust<NodeOutputItem>(
                  i,
                  assoc("value", value)<NodeOutputItem>
                )(node.data.outputs);

                onUpdateNode({
                  id: node.id,
                  data: { ...node.data, outputs: newOutputs },
                });
              }}
              type={flowConfig?.inputConfigMap[output.id]?.valueType}
              onSaveType={(type) => {
                if (!flowConfig) {
                  onFlowConfigUpdate({
                    inputConfigMap: {
                      [output.id]: {
                        valueType: type,
                      },
                    },
                    outputValueMap: {},
                  });
                } else {
                  onFlowConfigUpdate({
                    ...flowConfig,
                    inputConfigMap: {
                      ...flowConfig?.inputConfigMap,
                      [output.id]: {
                        valueType: type,
                      },
                    },
                  });
                }
              }}
            />
          ))
        )
      )}
      {flatten(
        outputNodes.map((node) =>
          node.data.inputs.map((input, i) => {
            const value = flowConfig?.outputValueMap[input.id] ?? null;
            let content: ReactNode;
            if (typeof value === "string") {
              content = value;
            } else {
              content = JSON.stringify(value, null, 2);
            }

            return (
              <div key={i}>
                <h4>{input.name}</h4>
                <RawValue>{content}</RawValue>
              </div>
            );
          })
        )
      )}
      <Button size="sm" onClick={() => setDetailPanelContentType(null)}>
        Close
      </Button>
    </>
  );
}
