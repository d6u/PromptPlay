import { A, D, F } from "@mobily/ts-belt";
import {
  Accordion,
  AccordionSummary,
  FormControl,
  FormLabel,
  Input,
  Button,
  Table,
  Select,
  Option,
} from "@mui/joy";
import { ReactNode, useEffect } from "react";
import { FlowOutputVariableMap } from "../../flowRun";
import { VariableID } from "../../flowTypes";
import {
  FlowState,
  flowInputItemsSelector,
  flowOutputItemsSelector,
  useFlowStore,
} from "../../store/flowStore";
import {
  RowIndex,
  ColumnIndex,
} from "../../store/storeCsvEvaluationPresetSlice";
import { Section } from "../controls-common";
import {
  CSVData,
  CSVRow,
  CustomAccordionDetails,
} from "./csv-evaluation-common";

const selector = (state: FlowState) => ({
  flowInputItems: flowInputItemsSelector(state),
  flowOutputItems: flowOutputItemsSelector(state),
  repeatCount: state.csvEvaluationConfigContent.repeatCount,
  setRepeatCount: state.csvEvaluationSetRepeatCount,
  variableColumnMap: state.csvEvaluationConfigContent.variableColumnMap,
  setVariableColumnMap: state.csvEvaluationSetVariableColumnMap,
  generatedResult: state.csvEvaluationConfigContent.generatedResult,
  setGeneratedResult: state.csvEvaluationSetGeneratedResult,
});

type Props = {
  csvHeaders: CSVRow;
  csvBody: CSVData;
  isRunning: boolean;
  onStartRunning: () => void;
  onStopRunning: () => void;
};

export default function ConfigCSVEvaluationSection(props: Props) {
  const {
    flowInputItems,
    flowOutputItems,
    repeatCount,
    setRepeatCount,
    variableColumnMap,
    setVariableColumnMap,
    generatedResult,
    setGeneratedResult,
  } = useFlowStore(selector);

  useEffect(() => {
    const data: Record<VariableID, ColumnIndex | null> = {};

    for (const inputItem of flowInputItems) {
      data[inputItem.id] = null;
    }

    for (const outputItem of flowOutputItems) {
      data[outputItem.id] = null;
    }

    setVariableColumnMap(data);
  }, [setVariableColumnMap, flowInputItems, flowOutputItems]);

  useEffect(() => {
    setGeneratedResult(
      A.makeWithIndex(props.csvBody.length, () =>
        A.makeWithIndex(repeatCount, D.makeEmpty<FlowOutputVariableMap>)
      )
    );
  }, [props.csvBody.length, repeatCount, setGeneratedResult]);

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
          {props.csvHeaders.filter(F.identity).map((item, i) => (
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
          {props.csvHeaders.filter(F.identity).map((item, i) => (
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

  for (const [rowIndex, row] of props.csvBody.entries()) {
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
  );
}
