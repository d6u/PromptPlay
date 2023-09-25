import { useFlowStore } from "../store/store-flow";
import { FlowOutputItem, OutputValueType } from "../store/types-flow-content";
import { FlowState } from "../store/types-local-state";
import OutputDisplay from "./OutputDisplay";
import { OutputValueItem, OutputValueName, RawValue } from "./controls-common";

const selector = (state: FlowState) => ({
  defaultVariableValueMap: state.getDefaultVariableValueMap(),
});

type Props = {
  flowOutputItem: FlowOutputItem;
};

export default function OutputRenderer(props: Props) {
  const { defaultVariableValueMap: variableValueMap } = useFlowStore(selector);

  const value = variableValueMap[props.flowOutputItem.id];

  if (props.flowOutputItem.valueType === OutputValueType.Audio) {
    return (
      <OutputValueItem key={props.flowOutputItem.id}>
        <OutputValueName>{props.flowOutputItem.name}</OutputValueName>
        <audio controls src={value as string} />
      </OutputValueItem>
    );
  }

  return (
    <OutputValueItem key={props.flowOutputItem.id}>
      <OutputValueName>{props.flowOutputItem.name}</OutputValueName>
      <RawValue>
        <OutputDisplay value={value} />
      </RawValue>
    </OutputValueItem>
  );
}
