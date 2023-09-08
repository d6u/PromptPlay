import Button from "@mui/joy/Button";
import filter from "lodash/filter";
import { adjust, assoc, flatten, propEq } from "ramda";
import { useMemo } from "react";
import { Node } from "reactflow";
import { RFState, useRFStore } from "../../../state/flowState";
import {
  InputNodeData,
  InputValueType,
  NodeOutputItem,
  NodeType,
} from "../../../static/flowTypes";
import InputBlock from "./InputBlock";

const selector = (state: RFState) => ({
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
  } = useRFStore(selector);

  const inputNodes = useMemo(
    () =>
      filter(
        nodes,
        propEq<string>(NodeType.InputNode, "type")
      ) as Node<InputNodeData>[],
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
              type={
                flowConfig?.inputConfigMap[output.id]?.valueType ??
                InputValueType.String
              }
              onSaveType={(type) => {
                onFlowConfigUpdate({
                  ...flowConfig,
                  inputConfigMap: {
                    ...flowConfig?.inputConfigMap,
                    [output.id]: {
                      valueType: type,
                    },
                  },
                });
              }}
            />
          ))
        )
      )}
      <Button size="sm" onClick={() => setDetailPanelContentType(null)}>
        Close
      </Button>
    </>
  );
}
