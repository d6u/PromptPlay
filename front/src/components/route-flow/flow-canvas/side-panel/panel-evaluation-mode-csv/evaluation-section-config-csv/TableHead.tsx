import { F } from "@mobily/ts-belt";
import { Option, Select } from "@mui/joy";
import { ReactNode, useMemo } from "react";
import { VariableType } from "../../../../../../models/v3-flow-content-types";
import { selectAllVariables } from "../../../../state/state-utils";
import { useFlowStore } from "../../../../state/store-flow-state";
import { CSVRow } from "../common";

type Props = {
  repeatTimes: number;
  csvHeaders: CSVRow;
};

export default function TableHead(props: Props) {
  // SECTION: Select state from store

  const variableMap = useFlowStore.use.variablesDict();
  const { repeatTimes: repeatCount, variableIdToCsvColumnIndexLookUpDict } =
    useFlowStore.use.csvEvaluationConfigContent();
  const setVariableColumnMap =
    useFlowStore.use.csvEvaluationSetVariableIdToCsvColumnIndexLookUpDict();

  // !SECTION

  const flowInputVariables = useMemo(() => {
    return selectAllVariables(VariableType.FlowInput, variableMap);
  }, [variableMap]);

  const flowOutputVariables = useMemo(() => {
    return selectAllVariables(VariableType.FlowOutput, variableMap);
  }, [variableMap]);

  const variableMapTableHeaderRowFirst: ReactNode[] = [];
  const variableMapTableHeaderRowSecond: ReactNode[] = [];

  variableMapTableHeaderRowFirst.push(
    <th
      key="status"
      style={{ textAlign: "center" }}
      colSpan={props.repeatTimes}
    >
      Status
    </th>,
  );

  if (props.repeatTimes > 1) {
    for (let i = 0; i < props.repeatTimes; i++) {
      variableMapTableHeaderRowSecond.push(
        <th key={`status-${i}`}>Run {i + 1}</th>,
      );
    }
  } else {
    variableMapTableHeaderRowSecond.push(<th key={`status-0`}></th>);
  }

  for (const inputItem of flowInputVariables) {
    variableMapTableHeaderRowFirst.push(
      <th
        key={inputItem.id}
        style={{ textAlign: "center", borderBottomWidth: 1 }}
      >
        {inputItem.name}
      </th>,
    );

    variableMapTableHeaderRowSecond.push(
      <th key={inputItem.id}>
        <Select
          placeholder="Choose a column"
          value={variableIdToCsvColumnIndexLookUpDict[inputItem.id]}
          onChange={(_event, index) => {
            setVariableColumnMap((prev) => ({
              ...prev,
              [inputItem.id]: index,
            }));
          }}
        >
          {props.csvHeaders.filter(F.identity).map((name, index) => (
            <Option key={index} value={index}>
              {name}
            </Option>
          ))}
        </Select>
      </th>,
    );
  }

  for (const outputItem of flowOutputVariables) {
    variableMapTableHeaderRowFirst.push(
      <th
        key={outputItem.id}
        colSpan={repeatCount + 1}
        style={{ textAlign: "center" }}
      >
        {outputItem.name}
      </th>,
    );

    variableMapTableHeaderRowSecond.push(
      <th key={outputItem.id}>
        <Select
          placeholder="Choose a column"
          value={variableIdToCsvColumnIndexLookUpDict[outputItem.id]}
          onChange={(e, index) => {
            setVariableColumnMap((prev) => ({
              ...prev,
              [outputItem.id]: index,
            }));
          }}
        >
          {props.csvHeaders.filter(F.identity).map((item, i) => (
            <Option key={i} value={i}>
              {item}
            </Option>
          ))}
        </Select>
      </th>,
    );

    if (repeatCount > 1) {
      for (let i = 0; i < repeatCount; i++) {
        variableMapTableHeaderRowSecond.push(
          <th key={`${outputItem.id}-result-${i}`}>Result {i + 1}</th>,
        );
      }
    } else {
      variableMapTableHeaderRowSecond.push(
        <th key={`${outputItem.id}-result-0`}>Result</th>,
      );
    }
  }

  return (
    <thead>
      <tr>{variableMapTableHeaderRowFirst}</tr>
      <tr>{variableMapTableHeaderRowSecond}</tr>
    </thead>
  );
}
