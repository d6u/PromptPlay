import { Table, Textarea } from '@mui/joy';

import SidePaneSection from 'components/side-pane/SidePaneSection';
import { CSVData, CSVRow } from 'state-flow/common-types';
import { useFlowStore } from 'state-flow/flow-store';

type Props = {
  csvHeaders: CSVRow;
  csvBody: CSVData;
  isRunning: boolean;
};

export default function EvaluationSectionImportCSV(props: Props) {
  const csvStr = useFlowStore((s) => s.batchTest.csvString);
  const setCsvStr = useFlowStore((s) => s.batchTest.setCsvStr);

  return (
    <>
      <SidePaneSection>
        <Textarea
          disabled={props.isRunning}
          spellCheck={false}
          minRows={6}
          maxRows={6}
          value={csvStr}
          onChange={(event) => setCsvStr(event.target.value)}
        />
      </SidePaneSection>
      <SidePaneSection style={{ overflow: 'auto' }}>
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
      </SidePaneSection>
    </>
  );
}
