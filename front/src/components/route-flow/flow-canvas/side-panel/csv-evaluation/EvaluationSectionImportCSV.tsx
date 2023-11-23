import { Accordion, AccordionSummary, Textarea, Table } from "@mui/joy";
import { useFlowStore } from "../../../store/store-flow";
import { FlowState } from "../../../store/types-local-state";
import { Section } from "../common/controls-common";
import {
  CSVRow,
  CSVData,
  CustomAccordionDetails,
} from "./csv-evaluation-common";

type Props = {
  csvHeaders: CSVRow;
  csvBody: CSVData;
};

const selector = (state: FlowState) => ({
  csvContent: state.csvEvaluationCsvContent,
  setCsvContent: state.csvEvaluationSetLocalCsvContent,
});

export default function EvaluationSectionImportCSV(props: Props) {
  const { csvContent, setCsvContent } = useFlowStore(selector);

  return (
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
