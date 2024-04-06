import { ReactNode, useMemo } from 'react';

import { OverallStatus } from 'flow-run/run-types';
import { CSVData, IterationIndex, RowIndex } from 'state-flow/common-types';
import { useFlowStore } from 'state-flow/flow-store';
import {
  selectVariablesOnAllEndNodes,
  selectVariablesOnAllStartNodes,
} from 'state-flow/util/state-utils';
import OutputDisplay from 'view-right-side-pane/common/OutputDisplay';

type Props = {
  csvBody: CSVData;
};

export default function TableBody(props: Props) {
  // SECTION: Select state from store
  const nodeConfigs = useFlowStore((s) => s.getFlowContent().nodeConfigs);
  const variableMap = useFlowStore((s) => s.getFlowContent().connectors);

  const {
    repeatTimes,
    variableIdToCsvColumnIndexMap: variableIdToCsvColumnIndexLookUpDict,
    runOutputTable: csvRunResultTable,
    runMetadataTable: runStatusTable,
  } = useFlowStore((s) => s.batchTest.config.content);
  // !SECTION

  const flowInputVariables = useMemo(() => {
    return selectVariablesOnAllStartNodes(variableMap, nodeConfigs);
  }, [nodeConfigs, variableMap]);

  const flowOutputVariables = useMemo(() => {
    return selectVariablesOnAllEndNodes(variableMap, nodeConfigs);
  }, [nodeConfigs, variableMap]);

  const variableMapTableBodyRows: ReactNode[] = [];

  for (const [rowIndex, row] of props.csvBody.entries()) {
    const cells: ReactNode[] = [];

    // Columns for "Status"
    for (let colIndex = 0; colIndex < repeatTimes; colIndex++) {
      const metadata =
        runStatusTable[rowIndex as RowIndex]?.[colIndex as IterationIndex] ??
        null;

      let content = '';
      if (metadata?.overallStatus == null) {
        content = OverallStatus.Unknown;
      } else if (metadata.overallStatus === OverallStatus.Interrupted) {
        content = metadata.errors[0];
      } else {
        content = metadata.overallStatus;
      }

      cells.push(<td key={`status-${rowIndex}-${colIndex}`}>{content}</td>);
    }

    // Input columns
    for (const inputItem of flowInputVariables) {
      const index = variableIdToCsvColumnIndexLookUpDict[inputItem.id];
      cells.push(
        <td key={`${inputItem.id}`}>{index != null ? row[index] : ''}</td>,
      );
    }

    // Output columns
    for (const outputItem of flowOutputVariables) {
      const index = variableIdToCsvColumnIndexLookUpDict[outputItem.id];
      cells.push(
        <td key={`${outputItem.id}`}>{index != null ? row[index] : ''}</td>,
      );

      for (let colIndex = 0; colIndex < repeatTimes; colIndex++) {
        const value =
          csvRunResultTable[rowIndex as RowIndex]?.[
            colIndex as IterationIndex
          ]?.[outputItem.id] ?? '';

        cells.push(
          <td key={`${outputItem.id}-result-${colIndex}`}>
            <pre style={{ whiteSpace: 'pre-wrap', margin: 0 }}>
              <OutputDisplay value={value} />
            </pre>
          </td>,
        );
      }
    }

    // Add current row to the table
    variableMapTableBodyRows.push(<tr key={rowIndex}>{cells}</tr>);
  }

  return <tbody>{variableMapTableBodyRows}</tbody>;
}
