import { F } from '@mobily/ts-belt';
import {
  Accordion,
  AccordionSummary,
  Button,
  FormControl,
  FormLabel,
  Input,
  Table,
} from '@mui/joy';
import { VariableType } from 'flow-models';
import Papa from 'papaparse';
import posthog from 'posthog-js';
import { useMemo } from 'react';
import { useFlowStore } from '../../../../../store/FlowStoreContext';
import {
  IterationIndex,
  RowIndex,
} from '../../../../../store/slice-csv-evaluation-preset';
import { selectAllVariables } from '../../../../../store/state-utils';
import { Section } from '../../../common/controls-common';
import { CSVData, CSVRow, CustomAccordionDetails } from '../../common';
import TableBody from './TableBody';
import TableHead from './TableHead';

type Props = {
  csvHeaders: CSVRow;
  csvBody: CSVData;
  isRunning: boolean;
  onStartRunning: () => void;
  onStopRunning: () => void;
};

export default function EvaluationSectionConfigCSV(props: Props) {
  // SECTION: Select state from store

  const variablesDict = useFlowStore((s) => s.variablesDict);
  const repeatTimes = useFlowStore((s) => s.getRepeatTimes());
  const concurrencyLimit = useFlowStore((s) => s.getConcurrencyLimit());
  const variableIdToCsvColumnIndexMap = useFlowStore((s) =>
    s.getVariableIdToCsvColumnIndexMap(),
  );
  const runOutputTable = useFlowStore((s) => s.getRunOutputTable());

  const setRepeatTimes = useFlowStore((s) => s.setRepeatTimes);
  const setConcurrencyLimit = useFlowStore((s) => s.setConcurrencyLimit);

  // !SECTION

  const flowInputVariables = useMemo(() => {
    return selectAllVariables(VariableType.FlowInput, variablesDict);
  }, [variablesDict]);

  const flowOutputVariables = useMemo(() => {
    return selectAllVariables(VariableType.FlowOutput, variablesDict);
  }, [variablesDict]);

  return (
    <Accordion defaultExpanded>
      <AccordionSummary>Configurate</AccordionSummary>
      <CustomAccordionDetails>
        <Section style={{ overflow: 'auto', display: 'flex', gap: 10 }}>
          <FormControl size="sm" orientation="horizontal">
            <FormLabel>Reapt</FormLabel>
            <Input
              disabled={props.isRunning}
              size="sm"
              type="number"
              slotProps={{ input: { min: 1, step: 1 } }}
              value={repeatTimes}
              onChange={(e) => setRepeatTimes(Number(e.target.value))}
            />
          </FormControl>
          <FormControl size="sm" orientation="horizontal">
            <FormLabel>Concurrency Limit</FormLabel>
            <Input
              disabled={props.isRunning}
              size="sm"
              type="number"
              slotProps={{ input: { min: 1, step: 1 } }}
              value={concurrencyLimit}
              onChange={(e) => setConcurrencyLimit(Number(e.target.value))}
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
          <Button
            color="neutral"
            variant="outlined"
            onClick={() => {
              const resultCsv: CSVRow[] = [];

              resultCsv.push([], []);

              // Status

              resultCsv[0].push('Status');
              for (let i = 0; i < repeatTimes - 1; i++) {
                resultCsv[0].push('');
              }

              if (repeatTimes > 1) {
                for (let i = 0; i < repeatTimes; i++) {
                  resultCsv[1].push(`Run ${i + 1}`);
                }
              } else {
                resultCsv[1].push('');
              }

              // Inputs

              for (const inputItem of flowInputVariables) {
                resultCsv[0].push(inputItem.name);

                const index = variableIdToCsvColumnIndexMap[inputItem.id];
                resultCsv[1].push(
                  index != null
                    ? props.csvHeaders.filter(F.identity)[index]
                    : '',
                );
              }

              // Outputs

              for (const outputItem of flowOutputVariables) {
                resultCsv[0].push(outputItem.name);
                for (let i = 0; i < repeatTimes; i++) {
                  resultCsv[0].push('');
                }

                resultCsv[1].push('');
                if (repeatTimes > 1) {
                  for (let i = 0; i < repeatTimes; i++) {
                    resultCsv[1].push(`Result ${i + 1}`);
                  }
                } else {
                  resultCsv[1].push('Result');
                }
              }

              // Body

              for (const [rowIndex, row] of props.csvBody.entries()) {
                const cells: string[] = [];

                // Status
                for (let i = 0; i < repeatTimes; i++) {
                  cells.push('');
                }

                // Inputs
                for (const inputItem of flowInputVariables) {
                  const index = variableIdToCsvColumnIndexMap[inputItem.id];
                  cells.push(index != null ? row[index] : '');
                }

                // Outputs
                for (const outputItem of flowOutputVariables) {
                  const index = variableIdToCsvColumnIndexMap[outputItem.id];
                  cells.push(index != null ? row[index] : '');

                  for (let i = 0; i < repeatTimes; i++) {
                    const value =
                      runOutputTable[rowIndex as RowIndex]?.[
                        i as IterationIndex
                      ]?.[outputItem.id] ?? '';

                    cells.push(
                      typeof value === 'string' ? value : JSON.stringify(value),
                    );
                  }
                }

                resultCsv.push(cells);
              }

              const csv = Papa.unparse(resultCsv);

              const blob = new Blob([csv], { type: 'text/plain' });
              const url = URL.createObjectURL(blob);
              const a = document.createElement('a');
              a.href = url;
              a.download = 'result.csv';
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);

              navigator.clipboard
                .writeText(csv)
                .then(() => {
                  posthog.capture('Copied CSV Evaluation Result to Clipboard');
                })
                .catch((err) => {
                  console.error('Could not copy text: ', err);
                });
            }}
          >
            Download result as CSV
          </Button>
        </Section>
        <Section style={{ overflow: 'auto' }}>
          <Table>
            <TableHead csvHeaders={props.csvHeaders} />
            <TableBody csvBody={props.csvBody} />
          </Table>
        </Section>
      </CustomAccordionDetails>
    </Accordion>
  );
}
