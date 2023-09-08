import { Button } from "@mui/joy";
import Input from "@mui/joy/Input";
import filter from "lodash/filter";
import { flatten, propEq } from "ramda";
import { useMemo } from "react";
import { Node } from "reactflow";
import styled from "styled-components";
import { RFState, useRFStore } from "../../../state/flowState";
import { InputNodeData, NodeType } from "../../../static/flowTypes";

const InputRow = styled.div`
  display: flex;
  gap: 5px;
  margin-bottom: 5px;
`;

const selector = (state: RFState) => ({
  nodes: state.nodes,
  setDetailPanelContentType: state.setDetailPanelContentType,
});

export default function PanelFlowConfig() {
  const { nodes, setDetailPanelContentType } = useRFStore(selector);

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
          node.data.outputs.map((output) => {
            return (
              <InputRow>
                <Input
                  key={output.id}
                  color="primary"
                  size="sm"
                  variant="outlined"
                  style={{ flexGrow: 1 }}
                  disabled
                  value={output.name}
                  onChange={(e) => {
                    // setName(e.target.value);
                  }}
                  onKeyUp={(e) => {
                    // if (props.isReadOnly) {
                    //   return;
                    // }
                    // if (e.key === "Enter") {
                    //   props.onConfirmNameChange(name);
                    // }
                  }}
                  onBlur={() => {
                    // if (props.isReadOnly) {
                    //   return;
                    // }
                    // props.onConfirmNameChange(name);
                  }}
                />
                <Input
                  key={output.id}
                  color="primary"
                  size="sm"
                  variant="outlined"
                  style={{ flexGrow: 2 }}
                  value={output.value}
                  onChange={(e) => {
                    // setName(e.target.value);
                  }}
                  onKeyUp={(e) => {
                    // if (props.isReadOnly) {
                    //   return;
                    // }
                    // if (e.key === "Enter") {
                    //   props.onConfirmNameChange(name);
                    // }
                  }}
                  onBlur={() => {
                    // if (props.isReadOnly) {
                    //   return;
                    // }
                    // props.onConfirmNameChange(name);
                  }}
                />
              </InputRow>
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
