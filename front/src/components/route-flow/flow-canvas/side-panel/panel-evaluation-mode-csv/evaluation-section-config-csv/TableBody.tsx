import { ReactNode, useMemo } from "react";
import { VariableType } from "../../../../../../models/v3-flow-content-types";
import {
  IterationIndex,
  RowIndex,
} from "../../../../state/slice-csv-evaluation-preset";
import { selectAllVariables } from "../../../../state/state-utils";
import { useFlowStore } from "../../../../state/store-flow-state";
import OutputDisplay from "../../common/OutputDisplay";
import { CSVData } from "../common";

type Props = {
  repeatTimes: number;
  csvBody: CSVData;
};

export default function TableBody(props: Props) {
  // SECTION: Select state from store

  const variableMap = useFlowStore.use.variablesDict();
  const {
    variableIdToCsvColumnIndexLookUpDict,
    csvRunResultTable: generatedResult,
    runStatusTable: runStatuses,
  } = useFlowStore.use.csvEvaluationConfigContent();

  // !SECTION

  const flowInputVariables = useMemo(() => {
    return selectAllVariables(VariableType.FlowInput, variableMap);
  }, [variableMap]);

  const flowOutputVariables = useMemo(() => {
    return selectAllVariables(VariableType.FlowOutput, variableMap);
  }, [variableMap]);

  const variableMapTableBodyRows: ReactNode[] = [];

  for (const [rowIndex, row] of props.csvBody.entries()) {
    const cells: ReactNode[] = [];

    // Columns for "Status"
    for (let colIndex = 0; colIndex < props.repeatTimes; colIndex++) {
      const statusValue =
        runStatuses[rowIndex as RowIndex]?.[colIndex as IterationIndex] ?? null;
      cells.push(
        <td
          key={`status-${rowIndex}-${colIndex}`}
          style={{ color: statusValue == null ? "green" : "red" }}
        >
          {statusValue ?? "OK"}
        </td>,
      );
    }

    // Input columns
    for (const inputItem of flowInputVariables) {
      const index = variableIdToCsvColumnIndexLookUpDict[inputItem.id];
      cells.push(
        <td key={`${inputItem.id}`}>{index !== null ? row[index] : ""}</td>,
      );
    }

    // Output columns
    for (const outputItem of flowOutputVariables) {
      const index = variableIdToCsvColumnIndexLookUpDict[outputItem.id];
      cells.push(
        <td key={`${outputItem.id}`}>{index !== null ? row[index] : ""}</td>,
      );

      for (let colIndex = 0; colIndex < props.repeatTimes; colIndex++) {
        const value =
          generatedResult[rowIndex as RowIndex]?.[colIndex as IterationIndex]?.[
            outputItem.id
          ] ?? "";

        cells.push(
          <td key={`${outputItem.id}-result-${colIndex}`}>
            <pre style={{ whiteSpace: "pre-wrap", margin: 0 }}>
              <OutputDisplay value={value} />
            </pre>
          </td>,
        );
      }
    }

    // Add current row to the table
    variableMapTableBodyRows.push(<tr key={rowIndex}>{cells}</tr>);
  }

  return <tbody>{variableMapTableBodyRows}</tbody>;
}
