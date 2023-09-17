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
import { useQuery } from "urql";
import { graphql } from "../../../gql";
import {
  FlowInputVariableMap,
  FlowOutputVariableMap,
  RunEvent,
  RunEventType,
  run,
} from "../../flowRun";
import {
  FlowInputItem,
  LocalEdge,
  NodeConfigs,
  VariableID,
} from "../../flowTypes";
import {
  flowInputItemsSelector,
  flowOutputItemsSelector,
  useFlowStore,
} from "../../store/flowStore";
import { FlowState } from "../../store/flowStore";
import { Section } from "../controls-common";

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

const EVALUATION_MODE_CSV_CONTENT_QUERY = graphql(`
  query EvaluationModeCSVContentQuery($spaceId: UUID!, $presetId: ID!) {
    result: space(id: $spaceId) {
      space {
        id
        csvEvaluationPreset(id: $presetId) {
          id
          csvContent
          configContent
        }
      }
    }
  }
`);

const selector = (state: FlowState) => ({
  spaceId: state.spaceId,
  edges: state.edges,
  nodeConfigs: state.nodeConfigs,
  flowInputItems: flowInputItemsSelector(state),
  flowOutputItems: flowOutputItemsSelector(state),
  presetId: state.csvEvaluationCurrentPresetId,
  csvContent: state.csvEvaluationCsvContent,
  setCsvContent: state.csvEvaluationSetLocalCsvContent,
});

export default function EvaluationModeCSVContent() {
  const {
    spaceId,
    edges,
    nodeConfigs,
    flowInputItems,
    flowOutputItems,
    presetId,
    csvContent,
    setCsvContent,
  } = useFlowStore(selector);

  const [queryResult] = useQuery({
    query: EVALUATION_MODE_CSV_CONTENT_QUERY,
    variables: { spaceId, presetId: presetId! },
    pause: !(spaceId && presetId),
  });

  useEffect(() => {
    setCsvContent(
      queryResult.data?.result?.space.csvEvaluationPreset.csvContent ?? ""
    );
  }, [
    setCsvContent,
    queryResult.data?.result?.space.csvEvaluationPreset.csvContent,
  ]);

  const csvData = useMemo<CSVData>(
    () => Papa.parse(csvContent).data as CSVData,
    [csvContent]
  );

  const { csvHeaders, csvBody } = useMemo<{
    csvHeaders: CSVHeader;
    csvBody: CSVData;
  }>(() => {
    if (csvData.length === 0) {
      return { csvHeaders: [""], csvBody: [[""]] };
    }

    return { csvHeaders: csvData[0], csvBody: csvData.slice(1) };
  }, [csvData]);

  const [repeatCount, setRepeatCount] = useState(1);
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
    setGeneratedResult(
      A.makeWithIndex(csvData.length, () =>
        A.makeWithIndex(repeatCount, D.makeEmpty<FlowOutputVariableMap>)
      )
    );
  }, [csvData.length, repeatCount]);

  const [isRunning, setIsRunning] = useState(false);
  const runningSubscriptionRef = useRef<Subscription | null>(null);

  useEffect(() => {
    if (!isRunning) {
      runningSubscriptionRef.current?.unsubscribe();
      runningSubscriptionRef.current = null;
      return;
    }

    if (runningSubscriptionRef.current) {
      return;
    }

    const obs = runForEachRow({
      edges,
      nodeConfigs,
      flowInputItems,
      csvBody,
      variableColumnMap,
      repeatCount,
    }).subscribe({
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
      error(err) {
        console.error(err);
        setIsRunning(false);
        runningSubscriptionRef.current = null;
      },
      complete() {
        setIsRunning(false);
        runningSubscriptionRef.current = null;
      },
    });

    runningSubscriptionRef.current = obs;

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
    repeatCount,
    variableColumnMap,
  ]);

  // console.log({ generatedResult });

  if (queryResult.fetching) {
    return null;
  }

  if (queryResult.error) {
    return null;
  }

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
        colSpan={repeatCount + 1}
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

    if (repeatCount > 1) {
      for (let i = 0; i < repeatCount; i++) {
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

      for (let colIndex = 0; colIndex < repeatCount; colIndex++) {
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

  return (
    <>
      <AccordionGroup size="lg">
        <Accordion defaultExpanded>
          <AccordionSummary>Import CSV data</AccordionSummary>
          <CustomAccordionDetails>
            <Section>
              <Textarea
                minRows={6}
                maxRows={6}
                value={csvContent}
                onChange={(event) => setCsvContent(event.target.value)}
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
                  value={repeatCount}
                  onChange={(e) => setRepeatCount(Number(e.target.value))}
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

function runForEachRow({
  edges,
  nodeConfigs,
  flowInputItems,
  csvBody,
  variableColumnMap,
  repeatCount,
  concurrent = 1,
}: {
  edges: LocalEdge[];
  nodeConfigs: NodeConfigs;
  flowInputItems: readonly FlowInputItem[];
  csvBody: CSVData;
  variableColumnMap: VariableColumnMap;
  repeatCount: number;
  concurrent?: number;
}): Observable<{
  iteratonIndex: number;
  rowIndex: number;
  outputs: FlowOutputVariableMap;
}> {
  return range(0, repeatCount).pipe(
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

const CustomAccordionDetails = styled(AccordionDetails)`
  & .MuiAccordionDetails-content {
    padding: 20px;
  }

  & .MuiAccordionDetails-content:not(.Mui-expanded) {
    padding-top: 0;
    padding-bottom: 0;
  }
`;
