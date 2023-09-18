import { F } from "@mobily/ts-belt";
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
import { Dispatch, ReactNode, SetStateAction } from "react";
import {
  FlowState,
  flowInputItemsSelector,
  flowOutputItemsSelector,
  useFlowStore,
} from "../../store/flowStore";
import { VariableColumnMap } from "../../store/storeCsvEvaluationPresetSlice";
import { GeneratedResult } from "../../store/storeCsvEvaluationPresetSlice";
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
});

type Props = {
  csvHeaders: CSVRow;
  csvBody: CSVData;
  generatedResult: GeneratedResult;
  variableColumnMap: VariableColumnMap;
  setVariableColumnMap: Dispatch<SetStateAction<VariableColumnMap>>;
  repeatCount: number;
  setRepeatCount: (value: number) => void;
  isRunning: boolean;
  setIsRunning: (value: boolean) => void;
};

export default function ConfigCSVEvaluationSection(props: Props) {
  const { flowInputItems, flowOutputItems } = useFlowStore(selector);

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
          value={props.variableColumnMap[inputItem.id]}
          onChange={(e, index) => {
            props.setVariableColumnMap((prev) => ({
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
        colSpan={props.repeatCount + 1}
        style={{ textAlign: "center" }}
      >
        {outputItem.name}
      </th>
    );

    variableMapTableHeaderRowSecond.push(
      <th key={outputItem.id}>
        <Select
          placeholder="Choose a column"
          value={props.variableColumnMap[outputItem.id]}
          onChange={(e, index) => {
            props.setVariableColumnMap((prev) => ({
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

    if (props.repeatCount > 1) {
      for (let i = 0; i < props.repeatCount; i++) {
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
      const index = props.variableColumnMap[inputItem.id];
      cells.push(
        <td key={`${inputItem.id}`}>{index !== null ? row[index] : ""}</td>
      );
    }

    for (const outputItem of flowOutputItems) {
      const index = props.variableColumnMap[outputItem.id];
      cells.push(
        <td key={`${outputItem.id}`}>{index !== null ? row[index] : ""}</td>
      );

      for (let colIndex = 0; colIndex < props.repeatCount; colIndex++) {
        const value =
          props.generatedResult[rowIndex as RowIndex]?.[
            colIndex as ColumnIndex
          ]?.[outputItem.id] ?? "";

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
              value={props.repeatCount}
              onChange={(e) => props.setRepeatCount(Number(e.target.value))}
            />
          </FormControl>
          {props.isRunning ? (
            <Button color="danger" onClick={() => props.setIsRunning(false)}>
              Stop
            </Button>
          ) : (
            <Button color="success" onClick={() => props.setIsRunning(true)}>
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
