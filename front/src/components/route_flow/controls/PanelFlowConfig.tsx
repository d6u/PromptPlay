import Button from "@mui/joy/Button";
import { adjust, assoc, filter, flatten, map, pipe, propEq } from "ramda";
import { ReactNode, useMemo } from "react";
import { FlowState, useFlowStore } from "../flowState";
import {
  InputNodeConfig,
  NodeOutputItem,
  NodeType,
  OutputNodeConfig,
} from "../flowTypes";
import InputBlock from "./InputBlock";
import { RawValue } from "./commonStyledComponents";

const selector = (state: FlowState) => ({
  flowConfig: state.flowConfig,
  onFlowConfigUpdate: state.onFlowConfigUpdate,
  nodeConfigs: state.nodeConfigs,
  nodes: state.nodes,
  updateNodeConfig: state.updateNodeConfig,
  setDetailPanelContentType: state.setDetailPanelContentType,
});

export default function PanelFlowConfig() {
  const {
    flowConfig,
    onFlowConfigUpdate,
    nodeConfigs,
    nodes,
    updateNodeConfig,
    setDetailPanelContentType,
  } = useFlowStore(selector);

  const inputNodeConfigs = useMemo(
    () =>
      pipe(
        filter(propEq<string>(NodeType.InputNode, "type")),
        map((node) => nodeConfigs[node.id])
      )(nodes) as InputNodeConfig[],
    [nodeConfigs, nodes]
  );

  const outputNodeConfigs = useMemo(
    () =>
      pipe(
        filter(propEq<string>(NodeType.OutputNode, "type")),
        map((node) => nodeConfigs[node.id])
      )(nodes) as OutputNodeConfig[],
    [nodeConfigs, nodes]
  );

  return (
    <>
      {flatten(
        inputNodeConfigs.map((nodeConfig) =>
          nodeConfig.outputs.map((output, i) => (
            <InputBlock
              key={output.id}
              id={output.id}
              name={output.name}
              value={output.value}
              onSaveValue={(value) => {
                const newOutputs = adjust<NodeOutputItem>(
                  i,
                  assoc("value", value)<NodeOutputItem>
                )(nodeConfig.outputs);

                updateNodeConfig(nodeConfig.nodeId, { outputs: newOutputs });
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
        outputNodeConfigs.map((nodeConfig) =>
          nodeConfig.inputs.map((input, i) => {
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
