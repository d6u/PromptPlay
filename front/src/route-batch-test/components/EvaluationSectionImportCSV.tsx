import { Table, Textarea } from '@mui/joy';

import Section from 'components/side-pane/SidePaneSection';
import { useFlowStore } from 'state-flow/context/FlowStoreContext';
import { CSVData, CSVRow } from 'state-flow/types';

type Props = {
  csvHeaders: CSVRow;
  csvBody: CSVData;
  isRunning: boolean;
};

export default function EvaluationSectionImportCSV(props: Props) {
  const csvStr = useFlowStore(
    (s) => s.getEventGraphState().batchTestConfigCsvString,
  );
  const setCsvStr = useFlowStore((s) => s.setCsvStr);

  return (
    <>
      <Section>
        <Textarea
          disabled={props.isRunning}
          spellCheck={false}
          minRows={6}
          maxRows={6}
          value={csvStr}
          onChange={(event) => setCsvStr(event.target.value)}
        />
      </Section>
      <Section style={{ overflow: 'auto' }}>
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
    </>
  );
}
