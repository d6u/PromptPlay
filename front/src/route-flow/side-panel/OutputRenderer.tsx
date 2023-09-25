import { useFlowStore } from "../store/store-flow";
import {
  FlowOutputItem,
  NodeOutputItem,
  OutputValueType,
} from "../store/types-flow-content";
import { FlowState } from "../store/types-local-state";
import OutputDisplay from "./OutputDisplay";
import { OutputValueItem, OutputValueName, RawValue } from "./controls-common";

const selector = (state: FlowState) => ({
  defaultVariableValueMap: state.getDefaultVariableValueMap(),
});

type Props = {
  outputItem: FlowOutputItem | NodeOutputItem;
};

export default function OutputRenderer(props: Props) {
  const { defaultVariableValueMap: variableValueMap } = useFlowStore(selector);

  const value = variableValueMap[props.outputItem.id];

  if (props.outputItem.valueType === OutputValueType.Audio) {
    return (
      <OutputValueItem key={props.outputItem.id}>
        <OutputValueName>{props.outputItem.name}</OutputValueName>
        <audio controls src={value as string} />
      </OutputValueItem>
    );
  }

  return (
    <OutputValueItem key={props.outputItem.id}>
      <OutputValueName>{props.outputItem.name}</OutputValueName>
      <RawValue>
        <OutputDisplay value={value} />
      </RawValue>
    </OutputValueItem>
  );
}
