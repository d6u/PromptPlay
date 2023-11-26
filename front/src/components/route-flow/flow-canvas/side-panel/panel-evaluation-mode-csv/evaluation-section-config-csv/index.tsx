import { A, D, F } from "@mobily/ts-belt";
import {
  Accordion,
  AccordionSummary,
  Button,
  FormControl,
  FormLabel,
  Input,
  Table,
} from "@mui/joy";
import Papa from "papaparse";
import posthog from "posthog-js";
import { useEffect, useMemo } from "react";
import {
  V3VariableID,
  V3VariableValueLookUpDict,
  VariableType,
} from "../../../../../../models/v3-flow-content-types";
import {
  ColumnIndex,
  IterationIndex,
  RowIndex,
} from "../../../../state/slice-csv-evaluation-preset";
import { selectAllVariables } from "../../../../state/state-utils";
import { useFlowStore } from "../../../../state/store-flow-state";
import { Section } from "../../common/controls-common";
import { CSVData, CSVRow, CustomAccordionDetails } from "../common";
import TableBody from "./TableBody";
import TableHead from "./TableHead";

type Props = {
  csvHeaders: CSVRow;
  csvBody: CSVData;
  isRunning: boolean;
  onStartRunning: () => void;
  onStopRunning: () => void;
};

export default function EvaluationSectionConfigCSV(props: Props) {
  // SECTION: Select state from store

  const variableMap = useFlowStore.use.variablesDict();
  const {
    repeatTimes,
    concurrencyLimit,
    variableIdToCsvColumnIndexLookUpDict,
    csvRunResultTable,
  } = useFlowStore.use.csvEvaluationConfigContent();
  const setRepeatCount = useFlowStore.use.csvEvaluationSetRepeatCount();
  const setConcurrencyLimit =
    useFlowStore.use.csvEvaluationSetConcurrencyLimit();
  const setVariableColumnMap =
    useFlowStore.use.csvEvaluationSetVariableIdToCsvColumnIndexLookUpDict();
  const setGeneratedResult = useFlowStore.use.csvEvaluationSetGeneratedResult();
  const setRunStatuses = useFlowStore.use.csvEvaluationSetRunStatuses();

  // !SECTION

  const flowInputVariables = useMemo(() => {
    return selectAllVariables(VariableType.FlowInput, variableMap);
  }, [variableMap]);

  const flowOutputVariables = useMemo(() => {
    return selectAllVariables(VariableType.FlowOutput, variableMap);
  }, [variableMap]);

  useEffect(() => {
    // NOTE: Everytime flow input/output variables change, reset the variable
    // ID to CSV column index lookup table.

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
    // NOTE: CSV body row count change, or repeat count change,
    // reset the generated result.

    setGeneratedResult(
      A.makeWithIndex(props.csvBody.length, () =>
        A.makeWithIndex(repeatTimes, D.makeEmpty<V3VariableValueLookUpDict>),
      ),
    );
  }, [props.csvBody.length, repeatTimes, setGeneratedResult]);

  useEffect(() => {
    setRunStatuses(
      A.makeWithIndex(props.csvBody.length, () =>
        A.makeWithIndex(repeatTimes, () => null),
      ),
    );
  }, [props.csvBody.length, repeatTimes, setRunStatuses]);

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
              value={repeatTimes}
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
              for (let i = 0; i < repeatTimes - 1; i++) {
                resultCsv[0].push("");
              }

              if (repeatTimes > 1) {
                for (let i = 0; i < repeatTimes; i++) {
                  resultCsv[1].push(`Run ${i + 1}`);
                }
              } else {
                resultCsv[1].push("");
              }

              // Inputs

              for (const inputItem of flowInputVariables) {
                resultCsv[0].push(inputItem.name);

                const index =
                  variableIdToCsvColumnIndexLookUpDict[inputItem.id];
                resultCsv[1].push(
                  index != null
                    ? props.csvHeaders.filter(F.identity)[index]
                    : "",
                );
              }

              // Outputs

              for (const outputItem of flowOutputVariables) {
                resultCsv[0].push(outputItem.name);
                for (let i = 0; i < repeatTimes; i++) {
                  resultCsv[0].push("");
                }

                resultCsv[1].push("");
                if (repeatTimes > 1) {
                  for (let i = 0; i < repeatTimes; i++) {
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
                for (let i = 0; i < repeatTimes; i++) {
                  cells.push("");
                }

                // Inputs
                for (const inputItem of flowInputVariables) {
                  const index =
                    variableIdToCsvColumnIndexLookUpDict[inputItem.id];
                  cells.push(index !== null ? row[index] : "");
                }

                // Outputs
                for (const outputItem of flowOutputVariables) {
                  const index =
                    variableIdToCsvColumnIndexLookUpDict[outputItem.id];
                  cells.push(index !== null ? row[index] : "");

                  for (let i = 0; i < repeatTimes; i++) {
                    const value =
                      csvRunResultTable[rowIndex as RowIndex]?.[
                        i as IterationIndex
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
            <TableHead csvHeaders={props.csvHeaders} />
            <TableBody csvBody={props.csvBody} />
          </Table>
        </Section>
      </CustomAccordionDetails>
    </Accordion>
  );
}
