import { ReactNode, useContext, useMemo } from "react";
import invariant from "ts-invariant";
import { useStore } from "zustand";
import { VariableType } from "../../../../../../models/v3-flow-content-types";
import FlowContext from "../../../../FlowContext";
import {
  IterationIndex,
  RowIndex,
} from "../../../../store/slice-csv-evaluation-preset";
import { selectAllVariables } from "../../../../store/state-utils";
import OutputDisplay from "../../common/OutputDisplay";
import { CSVData } from "../common";

type Props = {
  csvBody: CSVData;
};

export default function TableBody(props: Props) {
  const { flowStore } = useContext(FlowContext);
  invariant(flowStore != null, "Must provide flowStore");

  // SECTION: Select state from store

  const variableMap = useStore(flowStore, (s) => s.variablesDict);
  const {
    repeatTimes,
    variableIdToCsvColumnIndexLookUpDict,
    csvRunResultTable,
    runStatusTable,
  } = useStore(flowStore, (s) => s.csvEvaluationConfigContent);

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
    for (let colIndex = 0; colIndex < repeatTimes; colIndex++) {
      const statusValue =
        runStatusTable[rowIndex as RowIndex]?.[colIndex as IterationIndex] ??
        null;
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

      for (let colIndex = 0; colIndex < repeatTimes; colIndex++) {
        const value =
          csvRunResultTable[rowIndex as RowIndex]?.[
            colIndex as IterationIndex
          ]?.[outputItem.id] ?? "";

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
