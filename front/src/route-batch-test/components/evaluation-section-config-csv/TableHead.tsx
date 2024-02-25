import { F } from '@mobily/ts-belt';
import { Option, Select } from '@mui/joy';
import { ConnectorType } from 'flow-models';
import { ReactNode, useMemo } from 'react';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import { CSVRow } from 'state-flow/types';
import { selectAllVariables } from 'state-flow/util/state-utils';

type Props = {
  csvHeaders: CSVRow;
};

export default function TableHead(props: Props) {
  // SECTION: Select state from store

  const variablesDict = useFlowStore((s) => s.getFlowContent().variablesDict);
  const repeatTimes = useFlowStore((s) => s.getRepeatTimes());
  const variableIdToCsvColumnIndexMap = useFlowStore((s) =>
    s.getVariableIdToCsvColumnIndexMap(),
  );

  const setVariableIdToCsvColumnIndexMap = useFlowStore(
    (s) => s.setVariableIdToCsvColumnIndexMap,
  );

  // !SECTION

  const flowInputVariables = useMemo(() => {
    return selectAllVariables(ConnectorType.FlowInput, variablesDict);
  }, [variablesDict]);

  const flowOutputVariables = useMemo(() => {
    return selectAllVariables(ConnectorType.FlowOutput, variablesDict);
  }, [variablesDict]);

  const variableMapTableHeaderRowFirst: ReactNode[] = [];
  const variableMapTableHeaderRowSecond: ReactNode[] = [];

  variableMapTableHeaderRowFirst.push(
    <th key="status" style={{ textAlign: 'center' }} colSpan={repeatTimes}>
      Status
    </th>,
  );

  if (repeatTimes > 1) {
    for (let i = 0; i < repeatTimes; i++) {
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
        style={{ textAlign: 'center', borderBottomWidth: 1 }}
      >
        {inputItem.name}
      </th>,
    );

    variableMapTableHeaderRowSecond.push(
      <th key={inputItem.id}>
        <Select
          placeholder="Choose a column"
          // NOTE: Must fallback to null, otherwise when value is undefined,
          // the select component will become uncontrolled.
          value={variableIdToCsvColumnIndexMap[inputItem.id] ?? null}
          onChange={(_event, index) => {
            // NOTE: When the list of <Option> changes, onChange might be called
            // if it causes the selected value to become invalid.
            setVariableIdToCsvColumnIndexMap(() => ({
              [inputItem.id]: index,
            }));
          }}
        >
          {props.csvHeaders.filter(F.identity).map((name, index) => (
            <Option key={index} value={index}>
              {`Column ${index + 1}: ${name}`}
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
        colSpan={repeatTimes + 1}
        style={{ textAlign: 'center' }}
      >
        {outputItem.name}
      </th>,
    );

    variableMapTableHeaderRowSecond.push(
      <th key={outputItem.id}>
        <Select
          placeholder="Choose a column"
          // NOTE: Must fallback to null, otherwise when value is undefined,
          // the select component will become uncontrolled.
          value={variableIdToCsvColumnIndexMap[outputItem.id] ?? null}
          onChange={(_event, index) => {
            // NOTE: When the list of <Option> changes, onChange might be called
            // if it causes the selected value to become invalid.
            setVariableIdToCsvColumnIndexMap(() => ({
              [outputItem.id]: index,
            }));
          }}
        >
          {props.csvHeaders.filter(F.identity).map((name, index) => (
            <Option key={index} value={index}>
              {`Column ${index + 1}: ${name}`}
            </Option>
          ))}
        </Select>
      </th>,
    );

    if (repeatTimes > 1) {
      for (let i = 0; i < repeatTimes; i++) {
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
