import styled from "@emotion/styled";
import { A, D, F } from "@mobily/ts-belt";
import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Button,
  FormControl,
  FormLabel,
  Input,
  Option,
  Select,
  Table,
  Textarea,
} from "@mui/joy";
import Papa from "papaparse";
import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  Observable,
  Subscription,
  concatMap,
  from,
  map,
  mergeMap,
  range,
  reduce,
} from "rxjs";
import {
  FlowInputVariableMap,
  FlowOutputVariableMap,
  RunEvent,
  RunEventType,
  run,
} from "../flowRun";
import {
  FlowInputItem,
  LocalEdge,
  NodeConfigs,
  VariableID,
} from "../flowTypes";
import {
  flowInputItemsSelector,
  flowOutputItemsSelector,
  useFlowStore,
} from "../store/flowStore";
import { FlowState } from "../store/flowStore";
import EvaluationModePresetSelector from "./EvaluationModePresetSelector";
import { Section } from "./controls-common";

type CSVRow = Array<string>;
type CSVHeader = CSVRow;
type CSVData = Array<CSVRow>;

type RowIndex = number & { readonly "": unique symbol };
type ColumnIndex = number & { readonly "": unique symbol };

type VariableColumnMap = Record<VariableID, ColumnIndex | null>;

type GeneratedResult = Record<
  RowIndex,
  Record<ColumnIndex, FlowOutputVariableMap>
>;

const CustomAccordionDetails = styled(AccordionDetails)`
  & .MuiAccordionDetails-content {
    padding: 20px;
  }

  & .MuiAccordionDetails-content:not(.Mui-expanded) {
    padding-top: 0;
    padding-bottom: 0;
  }
`;

const selector = (state: FlowState) => ({
  edges: state.edges,
  nodeConfigs: state.nodeConfigs,
  flowInputItems: flowInputItemsSelector(state),
  flowOutputItems: flowOutputItemsSelector(state),
  csvEvaluationPresetCsvContent: state.csvEvaluationPresetCsvContent,
  csvEvaluationPresetSetCsvContent: state.csvEvaluationPresetSetCsvContent,
});

export default function EvaluationModeCSVContent() {
  const {
    edges,
    nodeConfigs,
    flowInputItems,
    flowOutputItems,
    csvEvaluationPresetCsvContent: csvContent,
    csvEvaluationPresetSetCsvContent: setCsvContent,
  } = useFlowStore(selector);

  const csvData = useMemo<CSVData>(
    () => Papa.parse(csvContent).data as CSVData,
    [csvContent]
  );

  const { headers: csvHeaders, body: csvBody } = useMemo<{
    headers: CSVHeader;
    body: CSVData;
  }>(() => {
    if (csvData.length === 0) {
      return { headers: [], body: [] };
    }

    return {
      headers: csvData[0],
      body: csvData.slice(1),
    };
  }, [csvData]);

  const [repeatTimes, setRepeatTimes] = useState(1);
  const [variableColumnMap, setVariableColumnMap] = useState<VariableColumnMap>(
    {}
  );
  const [generatedResult, setGeneratedResult] = useState<GeneratedResult>([]);

  useEffect(() => {
    const data: Record<VariableID, ColumnIndex | null> = {};

    for (const inputItem of flowInputItems) {
      data[inputItem.id] = null;
    }

    for (const outputItem of flowOutputItems) {
      data[outputItem.id] = null;
    }

    setVariableColumnMap(data);
  }, [flowInputItems, flowOutputItems]);

  useEffect(() => {
    const generatedResultPlaceholder = [];
    for (let i = 0; i < csvData.length; i++) {
      generatedResultPlaceholder.push(A.make(repeatTimes, {}));
    }

    setGeneratedResult(generatedResultPlaceholder);
  }, [csvData, repeatTimes]);

  const variableMapTableHeaderRowFirst: ReactNode[] = [];
  const variableMapTableHeaderRowSecond: ReactNode[] = [];

  for (const inputItem of flowInputItems) {
    variableMapTableHeaderRowFirst.push(
      <th
        key={inputItem.id}
        style={{ textAlign: "center", borderBottomWidth: 1 }}
      >
        {inputItem.name}
      </th>
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
          {csvHeaders.filter(F.identity).map((item, i) => (
            <Option key={i} value={i}>
              {item}
            </Option>
          ))}
        </Select>
      </th>
    );
  }

  for (const outputItem of flowOutputItems) {
    variableMapTableHeaderRowFirst.push(
      <th
        key={outputItem.id}
        colSpan={repeatTimes + 1}
        style={{ textAlign: "center" }}
      >
        {outputItem.name}
      </th>
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
          {csvHeaders.filter(F.identity).map((item, i) => (
            <Option key={i} value={i}>
              {item}
            </Option>
          ))}
        </Select>
      </th>
    );

    if (repeatTimes > 1) {
      for (let i = 0; i < repeatTimes; i++) {
        variableMapTableHeaderRowSecond.push(
          <th key={`${outputItem.id}-result-${i}`}>Result {i + 1}</th>
        );
      }
    } else {
      variableMapTableHeaderRowSecond.push(
        <th key={`${outputItem.id}-result-0`}>Result</th>
      );
    }
  }

  const variableMapTableBodyRows: ReactNode[] = [];

  for (const [rowIndex, row] of csvBody.entries()) {
    const cells: ReactNode[] = [];

    for (const inputItem of flowInputItems) {
      const index = variableColumnMap[inputItem.id];
      cells.push(
        <td key={`${inputItem.id}`}>{index !== null ? row[index] : ""}</td>
      );
    }

    for (const outputItem of flowOutputItems) {
      const index = variableColumnMap[outputItem.id];
      cells.push(
        <td key={`${outputItem.id}`}>{index !== null ? row[index] : ""}</td>
      );

      for (let colIndex = 0; colIndex < repeatTimes; colIndex++) {
        const value =
          generatedResult[rowIndex as RowIndex]?.[colIndex as ColumnIndex]?.[
            outputItem.id
          ] ?? "";

        cells.push(
          <td key={`${outputItem.id}-result-${colIndex}`}>{value}</td>
        );
      }
    }

    variableMapTableBodyRows.push(<tr key={rowIndex}>{cells}</tr>);
  }

  const [isRunning, setIsRunning] = useState(false);
  const runningSubscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    if (isRunning) {
      if (runningSubscriptionRef.current) {
        return;
      }

      runningSubscriptionRef.current = runForEachRow(
        csvBody,
        flowInputItems,
        variableColumnMap,
        edges,
        nodeConfigs,
        repeatTimes
      ).subscribe({
        next({ iteratonIndex: colIndex, rowIndex, outputs }) {
          setGeneratedResult((prev) => {
            console.log({ colIndex, rowIndex, outputs });

            let row = prev[rowIndex as RowIndex]!;

            row = A.updateAt(
              row as Array<FlowOutputVariableMap>,
              colIndex,
              D.merge(outputs)
            );

            return A.replaceAt(
              prev as Array<Record<ColumnIndex, FlowOutputVariableMap>>,
              rowIndex,
              row
            );
          });
        },
        error(e) {
          console.error(e);
          setIsRunning(false);
          runningSubscriptionRef.current = null;
        },
        complete() {
          setIsRunning(false);
          runningSubscriptionRef.current = null;
        },
      });
    } else {
      runningSubscriptionRef.current?.unsubscribe();
      runningSubscriptionRef.current = null;
    }

    return () => {
      runningSubscriptionRef.current?.unsubscribe();
      runningSubscriptionRef.current = null;
    };
  }, [
    csvBody,
    edges,
    flowInputItems,
    isRunning,
    nodeConfigs,
    repeatTimes,
    variableColumnMap,
  ]);

  return (
    <>
      <EvaluationModePresetSelector />
      <AccordionGroup size="lg">
        <Accordion defaultExpanded>
          <AccordionSummary>Import CSV data</AccordionSummary>
          <CustomAccordionDetails>
            <Section>
              <Textarea
                minRows={2}
                maxRows={6}
                value={csvContent}
                onChange={(e) => setCsvContent(e.target.value)}
              />
            </Section>
            <Section style={{ overflow: "auto" }}>
              <Table>
                <thead>
                  <tr>
                    {csvHeaders.map((item, i) => (
                      <th key={i}>{item}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvBody.map((row, rowIndex) => (
                    <tr key={rowIndex}>
                      {row.map((value, colIndex) => (
                        <td key={`${rowIndex}-${colIndex}`}>{value}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Section>
          </CustomAccordionDetails>
        </Accordion>
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
                  onChange={(e) => setRepeatTimes(Number(e.target.value))}
                />
              </FormControl>
              {isRunning ? (
                <Button color="danger" onClick={() => setIsRunning(false)}>
                  Stop
                </Button>
              ) : (
                <Button color="success" onClick={() => setIsRunning(true)}>
                  Run
                </Button>
              )}
            </Section>
            <Section>
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
      </AccordionGroup>
    </>
  );
}

function runForEachRow(
  csvBody: CSVData,
  flowInputItems: readonly FlowInputItem[],
  variableColumnMap: VariableColumnMap,
  edges: LocalEdge[],
  nodeConfigs: NodeConfigs,
  repeatTimes: number,
  concurrent: number = 1
): Observable<{
  iteratonIndex: number;
  rowIndex: number;
  outputs: FlowOutputVariableMap;
}> {
  return range(0, repeatTimes).pipe(
    concatMap((iteratonIndex) => {
      return from(csvBody).pipe(
        map((row) => {
          const inputVariableMap: FlowInputVariableMap = {};

          for (const inputItem of flowInputItems) {
            const colIndex = variableColumnMap[inputItem.id];
            const value = colIndex != null ? row[colIndex] : null;
            inputVariableMap[inputItem.id] = value;
          }

          return inputVariableMap;
        }),
        mergeMap((inputVariableMap, rowIndex) => {
          return run(edges, nodeConfigs, inputVariableMap).pipe(
            reduce<RunEvent, FlowOutputVariableMap>((acc, event) => {
              if (event.type !== RunEventType.VariableValueChanges) {
                return acc;
              }

              const changes = event.changes;

              for (const [variableId, value] of Object.entries(changes)) {
                acc = D.set(acc, variableId, value);
              }

              return acc;
            }, {}),
            map((outputs) => ({ iteratonIndex, rowIndex, outputs }))
          );
        }, concurrent)
      );
    })
  );
}
