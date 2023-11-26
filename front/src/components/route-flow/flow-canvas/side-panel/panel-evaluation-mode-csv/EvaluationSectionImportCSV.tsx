import { Accordion, AccordionSummary, Table, Textarea } from "@mui/joy";
import { useContext } from "react";
import { invariant } from "ts-invariant";
import { useStore } from "zustand";
import FlowContext from "../../../FlowContext";
import { Section } from "../common/controls-common";
import { CSVData, CSVRow, CustomAccordionDetails } from "./common";

type Props = {
  csvHeaders: CSVRow;
  csvBody: CSVData;
};

export default function EvaluationSectionImportCSV(props: Props) {
  const { flowStore } = useContext(FlowContext);
  invariant(flowStore != null, "Must provide flowStore");

  const csvStr = useStore(flowStore, (s) => s.csvEvaluationCsvStr);
  const setCsvStr = useStore(flowStore, (s) => s.csvEvaluationSetLocalCsvStr);

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
