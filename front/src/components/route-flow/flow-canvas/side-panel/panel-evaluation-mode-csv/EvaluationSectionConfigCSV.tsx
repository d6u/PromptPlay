import { A, D, F } from "@mobily/ts-belt";
import {
  Accordion,
  AccordionSummary,
  Button,
  FormControl,
  FormLabel,
  Input,
  Option,
  Select,
  Table,
} from "@mui/joy";
import Papa from "papaparse";
import posthog from "posthog-js";
import { ReactNode, useEffect, useMemo } from "react";
import {
  V3VariableID,
  V3VariableValueLookUpDict,
  VariableType,
} from "../../../../../models/v3-flow-content-types";
import {
  ColumnIndex,
  RowIndex,
} from "../../../state/slice-csv-evaluation-preset";
import { selectAllVariables } from "../../../state/state-utils";
import { useFlowStore } from "../../../state/store-flow-state";
import { Section } from "../common/controls-common";
import OutputDisplay from "../common/OutputDisplay";
import {
  CSVData,
  CSVRow,
  CustomAccordionDetails,
} from "./csv-evaluation-common";

type Props = {
  csvHeaders: CSVRow;
  csvBody: CSVData;
  isRunning: boolean;
  onStartRunning: () => void;
  onStopRunning: () => void;
};

export default function EvaluationSectionConfigCSV(props: Props) {
  const variableMap = useFlowStore.use.variablesDict();
  const {
    repeatCount,
    concurrencyLimit,
    variableColumnMap,
    generatedResult,
    runStatuses,
  } = useFlowStore.use.csvEvaluationConfigContent();
  const setRepeatCount = useFlowStore.use.csvEvaluationSetRepeatCount();
  const setConcurrencyLimit =
    useFlowStore.use.csvEvaluationSetConcurrencyLimit();
  const setVariableColumnMap =
    useFlowStore.use.csvEvaluationSetVariableColumnMap();
  const setGeneratedResult = useFlowStore.use.csvEvaluationSetGeneratedResult();
  const setRunStatuses = useFlowStore.use.csvEvaluationSetRunStatuses();

  const flowInputVariables = useMemo(() => {
    return selectAllVariables(VariableType.FlowInput, variableMap);
  }, [variableMap]);

  const flowOutputVariables = useMemo(() => {
    return selectAllVariables(VariableType.FlowOutput, variableMap);
  }, [variableMap]);

  useEffect(() => {
    const data: Record<V3VariableID, ColumnIndex | null> = {};

    for (const inputItem of flowInputVariables) {
      data[inputItem.id] = null;
    }

    for (const outputItem of flowOutputVariables) {
      data[outputItem.id] = null;
    }

    setVariableColumnMap(data);
  }, [setVariableColumnMap, flowInputVariables, flowOutputVariables]);

  useEffect(() => {
    setGeneratedResult(
      A.makeWithIndex(props.csvBody.length, () =>
        A.makeWithIndex(repeatCount, D.makeEmpty<V3VariableValueLookUpDict>),
      ),
    );
  }, [props.csvBody.length, repeatCount, setGeneratedResult]);

  useEffect(() => {
    setRunStatuses(
      A.makeWithIndex(props.csvBody.length, () =>
        A.makeWithIndex(repeatCount, () => null),
      ),
    );
  }, [props.csvBody.length, repeatCount, setRunStatuses]);

  const variableMapTableHeaderRowFirst: ReactNode[] = [];
  const variableMapTableHeaderRowSecond: ReactNode[] = [];

  variableMapTableHeaderRowFirst.push(
    <th key="status" style={{ textAlign: "center" }} colSpan={repeatCount}>
      Status
    </th>,
  );

  if (repeatCount > 1) {
    for (let i = 0; i < repeatCount; i++) {
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
          value={variableColumnMap[inputItem.id]}
          onChange={(e, index) => {
            setVariableColumnMap((prev) => ({
              ...prev,
              [inputItem.id]: index,
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
          value={variableColumnMap[outputItem.id]}
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

  const variableMapTableBodyRows: ReactNode[] = [];

  for (const [rowIndex, row] of props.csvBody.entries()) {
    const cells: ReactNode[] = [];

    // Columns for "Status"
    for (let colIndex = 0; colIndex < repeatCount; colIndex++) {
      const statusValue =
        runStatuses[rowIndex as RowIndex]?.[colIndex as ColumnIndex] ?? null;
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
      const index = variableColumnMap[inputItem.id];
      cells.push(
        <td key={`${inputItem.id}`}>{index !== null ? row[index] : ""}</td>,
      );
    }

    // Output columns
    for (const outputItem of flowOutputVariables) {
      const index = variableColumnMap[outputItem.id];
      cells.push(
        <td key={`${outputItem.id}`}>{index !== null ? row[index] : ""}</td>,
      );

      for (let colIndex = 0; colIndex < repeatCount; colIndex++) {
        const value =
          generatedResult[rowIndex as RowIndex]?.[colIndex as ColumnIndex]?.[
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

  return (
    <Accordion defaultExpanded>
      <AccordionSummary>Configurate</AccordionSummary>
      <CustomAccordionDetails>
        <Section style={{ overflow: "auto", display: "flex", gap: 10 }}>
          <FormControl size="lg" orientation="horizontal">
            <FormLabel>Reapt</FormLabel>
            <Input
              size="sm"
              type="number"
              slotProps={{ input: { min: 1, step: 1 } }}
              value={repeatCount}
              onChange={(e) => setRepeatCount(Number(e.target.value))}
            />
          </FormControl>
          <FormControl size="lg" orientation="horizontal">
            <FormLabel>Concurrency Limit</FormLabel>
            <Input
              size="sm"
              type="number"
              slotProps={{ input: { min: 1, step: 1 } }}
              value={concurrencyLimit}
              onChange={(e) => setConcurrencyLimit(Number(e.target.value))}
            />
          </FormControl>
          {props.isRunning ? (
            <Button
              color="danger"
              onClick={() => {
                props.onStopRunning();
              }}
            >
              Stop
            </Button>
          ) : (
            <Button
              color="success"
              onClick={() => {
                props.onStartRunning();
              }}
            >
              Run
            </Button>
          )}
          <Button
            color="neutral"
            variant="outlined"
            onClick={() => {
              const resultCsv: CSVRow[] = [];

              resultCsv.push([], []);

              // Status

              resultCsv[0].push("Status");
              for (let i = 0; i < repeatCount - 1; i++) {
                resultCsv[0].push("");
              }

              if (repeatCount > 1) {
                for (let i = 0; i < repeatCount; i++) {
                  resultCsv[1].push(`Run ${i + 1}`);
                }
              } else {
                resultCsv[1].push("");
              }

              // Inputs

              for (const inputItem of flowInputVariables) {
                resultCsv[0].push(inputItem.name);

                const index = variableColumnMap[inputItem.id];
                resultCsv[1].push(
                  index != null
                    ? props.csvHeaders.filter(F.identity)[index]
                    : "",
                );
              }

              // Outputs

              for (const outputItem of flowOutputVariables) {
                resultCsv[0].push(outputItem.name);
                for (let i = 0; i < repeatCount; i++) {
                  resultCsv[0].push("");
                }

                resultCsv[1].push("");
                if (repeatCount > 1) {
                  for (let i = 0; i < repeatCount; i++) {
                    resultCsv[1].push(`Result ${i + 1}`);
                  }
                } else {
                  resultCsv[1].push("Result");
                }
              }

              // Body

              for (const [rowIndex, row] of props.csvBody.entries()) {
                const cells: string[] = [];

                // Status
                for (let i = 0; i < repeatCount; i++) {
                  cells.push("");
                }

                // Inputs
                for (const inputItem of flowInputVariables) {
                  const index = variableColumnMap[inputItem.id];
                  cells.push(index !== null ? row[index] : "");
                }

                // Outputs
                for (const outputItem of flowOutputVariables) {
                  const index = variableColumnMap[outputItem.id];
                  cells.push(index !== null ? row[index] : "");

                  for (let i = 0; i < repeatCount; i++) {
                    const value =
                      generatedResult[rowIndex as RowIndex]?.[
                        i as ColumnIndex
                      ]?.[outputItem.id] ?? "";

                    cells.push(
                      typeof value === "string" ? value : JSON.stringify(value),
                    );
                  }
                }

                resultCsv.push(cells);
              }

              const csv = Papa.unparse(resultCsv);

              const blob = new Blob([csv], { type: "text/plain" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "result.csv";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);

              navigator.clipboard
                .writeText(csv)
                .then(() => {
                  posthog.capture("Copied CSV Evaluation Result to Clipboard");
                })
                .catch((err) => {
                  console.error("Could not copy text: ", err);
                });
            }}
          >
            Copy result as CSV to clipboard
          </Button>
        </Section>
        <Section style={{ overflow: "auto" }}>
          <Table>
            <thead>
              <tr>{variableMapTableHeaderRowFirst}</tr>
              <tr>{variableMapTableHeaderRowSecond}</tr>
            </thead>
            <tbody>{variableMapTableBodyRows}</tbody>
          </Table>
        </Section>
      </CustomAccordionDetails>
    </Accordion>
  );
}
