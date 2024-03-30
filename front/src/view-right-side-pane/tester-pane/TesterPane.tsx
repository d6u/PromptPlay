import styled from '@emotion/styled';
import { Option, Select } from '@mui/joy';
import { useMemo, useState, type ReactNode } from 'react';
import invariant from 'tiny-invariant';

import { NodeClass, NodeType } from 'flow-models';

import { useFlowStore } from 'state-flow/flow-store';

import GenericInputOutputTest from './GenericInputOutputTest';
import GenericChatbotTest from './generic-chatbot-test/GenericChatbotTest';

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
    testerContent = <GenericChatbotTest nodeConfig={selectedNodeConfig} />;
  } else {
    testerContent = <GenericInputOutputTest nodeConfig={selectedNodeConfig} />;
  }

  return (
    <Container>
      <SelectContainer>
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
      </SelectContainer>
      <ContentContainer>{testerContent}</ContentContainer>
    </Container>
  );
}

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const SelectContainer = styled.div`
  margin-top: 10px;
  margin-left: 10px;
  margin-right: 10px;
  margin-bottom: 10px;
`;

const ContentContainer = styled.div`
  flex-grow: 1;
  min-height: 0;
`;

export default TesterPane;
