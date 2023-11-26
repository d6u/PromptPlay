import { Accordion, AccordionSummary, Table, Textarea } from "@mui/joy";
import { useFlowStore } from "../../../state/store-flow-state";
import { Section } from "../common/controls-common";
import {
  CSVData,
  CSVRow,
  CustomAccordionDetails,
} from "./csv-evaluation-common";

type Props = {
  csvHeaders: CSVRow;
  csvBody: CSVData;
};

export default function EvaluationSectionImportCSV(props: Props) {
  const csvStr = useFlowStore.use.csvEvaluationCsvStr();
  const setCsvStr = useFlowStore.use.csvEvaluationSetLocalCsvStr();

  return (
    <Accordion defaultExpanded>
      <AccordionSummary>Import CSV data</AccordionSummary>
      <CustomAccordionDetails>
        <Section>
          <Textarea
            spellCheck={false}
            minRows={6}
            maxRows={6}
            value={csvStr}
            onChange={(event) => setCsvStr(event.target.value)}
          />
        </Section>
        <Section style={{ overflow: "auto" }}>
          <Table>
            <thead>
              <tr>
                {props.csvHeaders.map((item, i) => (
                  <th key={i}>{item}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {props.csvBody.map((row, rowIndex) => (
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
  );
}
