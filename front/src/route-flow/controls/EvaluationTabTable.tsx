import { Option, Select, Table, Textarea } from "@mui/joy";
import Papa from "papaparse";
import { filter, flatten, identity, map, pipe, propEq } from "ramda";
import { useEffect, useMemo, useState } from "react";
import { FlowState, useFlowStore } from "../flowState";
import { InputNodeConfig, NodeType, OutputNodeConfig } from "../flowTypes";

const selector = (state: FlowState) => ({
  runFlow: state.runFlow,
  nodeConfigs: state.nodeConfigs,
  nodes: state.nodes,
});

export default function EvaluationTabTable() {
  const [csvContent, setCsvContent] = useState<string>("");
  const [csvData, setCsvData] = useState<string[][]>([]);

  useEffect(() => {
    const { data } = Papa.parse<string[]>(csvContent);
    setCsvData(data);
  }, [csvContent]);

  const { runFlow, nodeConfigs, nodes } = useFlowStore(selector);

  const flowInputItems = useMemo(
    () =>
      pipe(
        filter(propEq<string>(NodeType.InputNode, "type")),
        map((node) => nodeConfigs[node.id] as InputNodeConfig),
        map((nodeConfig) => nodeConfig.outputs),
        flatten
      )(nodes),
    [nodeConfigs, nodes]
  );

  const flowOutputItems = useMemo(
    () =>
      pipe(
        filter(propEq<string>(NodeType.OutputNode, "type")),
        map((node) => nodeConfigs[node.id] as OutputNodeConfig),
        map((nodeConfig) => nodeConfig.inputs),
        flatten
      )(nodes),
    [nodeConfigs, nodes]
  );

  const [selectedColumns, setSelectedColumns] = useState<
    Record<string, number | null>
  >({});

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

  return (
    <>
      <Textarea
        minRows={2}
        maxRows={4}
        value={csvContent}
        onChange={(e) => setCsvContent(e.target.value)}
      />
      <Table size="sm" borderAxis="both">
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
      <Table size="sm" borderAxis="both">
        <thead>
          <tr>
            {flowInputItems.map((inputItem) => (
              <th
                key={inputItem.id}
                style={{ textAlign: "center", borderBottomWidth: 1 }}
              >
                {inputItem.name}
              </th>
            ))}
            {flowOutputItems.map((outputItem) => (
              <th
                key={outputItem.id}
                colSpan={2}
                style={{ textAlign: "center" }}
              >
                {outputItem.name}
              </th>
            ))}
          </tr>
          <tr>
            {flowInputItems.map((inputItem) => (
              <th key={inputItem.id}>
                <Select
                  placeholder="Choose column from the CSV..."
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
            ))}
            {flowOutputItems.map((outputItem) => (
              <>
                <th key={outputItem.id}>
                  <Select
                    placeholder="Choose column from the CSV..."
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
                <th key={`${outputItem.id}-2`}></th>
              </>
            ))}
          </tr>
        </thead>
        <tbody>
          {csvData.slice(1).map((row, i) => (
            <tr key={i}>
              {flowInputItems.map((inputItem, j) => {
                const index = selectedColumns[inputItem.id];

                return (
                  <td key={`${i}-${j}`}>{index !== null ? row[index] : ""}</td>
                );
              })}
              {flowOutputItems.map((outputItem, j) => {
                const index = selectedColumns[outputItem.id];

                return (
                  <>
                    <td key={`${i}-${j}`}>
                      {index !== null ? row[index] : ""}
                    </td>
                    <td></td>
                  </>
                );
              })}
            </tr>
          ))}
        </tbody>
      </Table>
    </>
  );
}
