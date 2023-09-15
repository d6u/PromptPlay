import {
  Accordion,
  AccordionDetails,
  AccordionGroup,
  AccordionSummary,
  Button,
  Option,
  Select,
  Table,
  Textarea,
} from "@mui/joy";
import Papa from "papaparse";
import { adjust, assoc, identity, mergeLeft, path } from "ramda";
import { ReactNode, useEffect, useState } from "react";
import { concatMap, from, map, reduce } from "rxjs";
import { RunEvent, RunEventType, run } from "../flowRun";
import {
  FlowState,
  flowInputItemsSelector,
  flowOutputItemsSelector,
  useFlowStore,
} from "../flowState";
import { InputID, NodeType, OutputID, OutputNodeConfig } from "../flowTypes";
import { Section } from "./controls-common";

const selector = (state: FlowState) => ({
  edges: state.edges,
  nodeConfigs: state.nodeConfigs,
  flowInputItems: flowInputItemsSelector(state),
  flowOutputItems: flowOutputItemsSelector(state),
});

export default function EvaluationModeCSVContent() {
  const { edges, nodeConfigs, flowInputItems, flowOutputItems } =
    useFlowStore(selector);

  const [selectedColumns, setSelectedColumns] = useState<
    Record<string, number | null>
  >({});
  const [generatedResult, setGeneratedResult] = useState<
    Record<InputID, string>[]
  >([]);

  useEffect(() => {
    const data: Record<string, number | null> = {};

    for (const inputItem of flowInputItems) {
      data[inputItem.id] = null;
    }

    for (const outputItem of flowOutputItems) {
      data[outputItem.id] = null;
    }

    setSelectedColumns(data);
  }, [flowInputItems, flowOutputItems]);

  const [csvContent, setCsvContent] = useState<string>("");
  const [csvData, setCsvData] = useState<string[][]>([]);

  useEffect(() => {
    const { data } = Papa.parse<string[]>(csvContent);
    setCsvData(data);

    const r = [];
    for (let i = 0; i < data.length - 1; i++) {
      r.push({});
    }
    setGeneratedResult(r);
  }, [csvContent]);

  const variableMapTableFirstHeaderRow: ReactNode[] = [];
  const variableMapTableSecondHeaderRow: ReactNode[] = [];

  for (const inputItem of flowInputItems) {
    variableMapTableFirstHeaderRow.push(
      <th
        key={inputItem.id}
        style={{ textAlign: "center", borderBottomWidth: 1 }}
      >
        {inputItem.name}
      </th>
    );

    variableMapTableSecondHeaderRow.push(
      <th key={inputItem.id}>
        <Select
          placeholder="Choose a column"
          value={selectedColumns[inputItem.id]}
          onChange={(e, index) => {
            setSelectedColumns((prev) => ({
              ...prev,
              [inputItem.id]: index,
            }));
          }}
        >
          {csvData[0]?.filter(identity).map((item, i) => (
            <Option key={i} value={i}>
              {item}
            </Option>
          ))}
        </Select>
      </th>
    );
  }

  for (const outputItem of flowOutputItems) {
    variableMapTableFirstHeaderRow.push(
      <th key={outputItem.id} colSpan={2} style={{ textAlign: "center" }}>
        {outputItem.name}
      </th>
    );

    variableMapTableSecondHeaderRow.push(
      <th key={outputItem.id}>
        <Select
          placeholder="Choose a column"
          value={selectedColumns[outputItem.id]}
          onChange={(e, index) => {
            setSelectedColumns((prev) => ({
              ...prev,
              [outputItem.id]: index,
            }));
          }}
        >
          {csvData[0]?.filter(identity).map((item, i) => (
            <Option key={i} value={i}>
              {item}
            </Option>
          ))}
        </Select>
      </th>
    );

    variableMapTableSecondHeaderRow.push(
      <th key={`${outputItem.id}-result`}>Result</th>
    );
  }

  const variableMapTableBodyRows: ReactNode[] = [];

  for (const [rowIndex, row] of csvData.slice(1).entries()) {
    const cells: ReactNode[] = [];

    for (const inputItem of flowInputItems) {
      const index = selectedColumns[inputItem.id];
      cells.push(
        <td key={`${inputItem.id}`}>{index !== null ? row[index] : ""}</td>
      );
    }

    for (const outputItem of flowOutputItems) {
      const index = selectedColumns[outputItem.id];
      cells.push(
        <td key={`${outputItem.id}`}>{index !== null ? row[index] : ""}</td>
      );

      const resultValue =
        path([rowIndex, outputItem.id], generatedResult) ?? "";
      cells.push(<td key={`${outputItem.id}-result`}>{resultValue}</td>);
    }

    variableMapTableBodyRows.push(<tr key={rowIndex}>{cells}</tr>);
  }

  return (
    <>
      <AccordionGroup>
        <Accordion defaultExpanded>
          <AccordionSummary>Uplod CSV</AccordionSummary>
          <AccordionDetails>
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
                    {csvData[0]?.map((item, i) => (
                      <th key={i}>{item}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {csvData.slice(1).map((row, i) => (
                    <tr key={i}>
                      {row.map((item, j) => (
                        <td key={`${i}-${j}`}>{item}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </Table>
            </Section>
          </AccordionDetails>
        </Accordion>
        <Accordion defaultExpanded>
          <AccordionSummary>
            Map input and output variables to columns
          </AccordionSummary>
          <AccordionDetails>
            <Section style={{ overflow: "auto" }}>
              <Button
                color="success"
                onClick={() => {
                  const maps = csvData.slice(1).map((row) => {
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    const inputVariableMap: Record<OutputID, any> = {};

                    flowInputItems.forEach((inputItem) => {
                      const index = selectedColumns[inputItem.id];
                      const value = index !== null ? row[index] : "";
                      inputVariableMap[inputItem.id] = value;
                    });

                    return inputVariableMap;
                  });

                  from(maps)
                    .pipe(
                      concatMap((inputVariableMap, index) => {
                        return run(edges, nodeConfigs, inputVariableMap).pipe(
                          // eslint-disable-next-line @typescript-eslint/no-explicit-any
                          reduce<RunEvent, Record<InputID, any>>(
                            (acc, event) => {
                              if (
                                event.type !== RunEventType.NodeConfigChange
                              ) {
                                return acc;
                              }
                              const config = nodeConfigs[event.nodeId]!;
                              if (config.nodeType !== NodeType.OutputNode) {
                                return acc;
                              }
                              const change =
                                event.nodeChange as Partial<OutputNodeConfig>;
                              if (!change.inputs) {
                                return acc;
                              }
                              for (const item of change.inputs) {
                                acc = assoc(item.id, item.value, acc);
                              }
                              return acc;
                            },
                            {}
                          ),
                          map((outputs) => ({ outputs, index }))
                        );
                      })
                    )
                    .subscribe({
                      next({ outputs, index }) {
                        setGeneratedResult((prev) =>
                          adjust(index, mergeLeft(outputs), prev)
                        );
                      },
                      error(e) {
                        console.error(e);
                      },
                      complete() {
                        console.log("all complete");
                      },
                    });
                }}
              >
                Run
              </Button>
              <Table>
                <thead>
                  <tr>{variableMapTableFirstHeaderRow}</tr>
                  <tr>{variableMapTableSecondHeaderRow}</tr>
                </thead>
                <tbody>{variableMapTableBodyRows}</tbody>
              </Table>
            </Section>
          </AccordionDetails>
        </Accordion>
      </AccordionGroup>
    </>
  );
}
