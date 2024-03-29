import styled from '@emotion/styled';
import { Option, Select } from '@mui/joy';
import { useMemo, useState, type ReactNode } from 'react';

import { useFlowStore } from 'state-flow/flow-store';

import { NodeClass, NodeType } from 'flow-models';
import invariant from 'tiny-invariant';
import GenericInputOutputTest from './GenericInputOutputTest';

function TesterPane() {
  const nodeConfigs = useFlowStore((s) => s.getFlowContent().nodeConfigsDict);

  const startNodeConfigs = useMemo(() => {
    return Object.values(nodeConfigs).filter((nodeConfig) => {
      return nodeConfig.class === NodeClass.Start;
    });
  }, [nodeConfigs]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);

  const selectedNodeConfig = useMemo(() => {
    if (selectedNodeId == null) {
      return null;
    }
    const nodeConfig = nodeConfigs[selectedNodeId];
    invariant(nodeConfig.class === NodeClass.Start, 'Node class is Start');
    return nodeConfig;
  }, [nodeConfigs, selectedNodeId]);

  let testerContent: ReactNode;

  if (selectedNodeConfig == null) {
    testerContent = null;
  } else if (selectedNodeConfig.type === NodeType.GenericChatbotStart) {
    //
  } else {
    testerContent = <GenericInputOutputTest nodeConfig={selectedNodeConfig} />;
  }

  return (
    <Container>
      <Select
        placeholder="Select start node"
        value={selectedNodeId}
        onChange={(_, value) => {
          setSelectedNodeId(value);
        }}
      >
        {startNodeConfigs.map((nodeConfig) => {
          invariant(
            nodeConfig.class === NodeClass.Start,
            'Node class is Start',
          );

          return (
            <Option key={nodeConfig.nodeId} value={nodeConfig.nodeId}>
              {nodeConfig.nodeName}
            </Option>
          );
        })}
      </Select>
      {testerContent}
    </Container>
  );
}

const Container = styled.div`
  padding: 15px;
`;

export default TesterPane;
