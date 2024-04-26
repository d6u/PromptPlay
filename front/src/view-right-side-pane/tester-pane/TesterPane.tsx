import styled from '@emotion/styled';
import { Option, Select } from '@mui/joy';
import { useMemo, type ReactNode } from 'react';
import invariant from 'tiny-invariant';

import { NodeKind, NodeType } from 'flow-models';

import { useFlowStore } from 'state-flow/flow-store';

import GenericInputOutputTest from './GenericInputOutputTest';
import GenericChatbotTest from './generic-chatbot-test/GenericChatbotTest';

function TesterPane() {
  const nodeConfigs = useFlowStore((s) => s.getFlowContent().nodeConfigs);

  const canvasTesterStartNodeId = useFlowStore(
    (s) => s.canvasTesterStartNodeId,
  );
  const setCanvasTesterStartNodeId = useFlowStore(
    (s) => s.setCanvasTesterStartNodeId,
  );

  const startNodeConfigs = useMemo(() => {
    return Object.values(nodeConfigs).filter((nodeConfig) => {
      return nodeConfig.kind === NodeKind.Start;
    });
  }, [nodeConfigs]);

  const selectedNodeConfig = useMemo(() => {
    if (canvasTesterStartNodeId == null) {
      return null;
    }
    const nodeConfig = nodeConfigs[canvasTesterStartNodeId];
    if (nodeConfig == null) {
      return null;
    }
    invariant(nodeConfig.kind === NodeKind.Start, 'Node class is Start');
    return nodeConfig;
  }, [nodeConfigs, canvasTesterStartNodeId]);

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
          value={canvasTesterStartNodeId}
          onChange={(_, value) => {
            setCanvasTesterStartNodeId(value);
          }}
        >
          {startNodeConfigs.map((nodeConfig) => {
            invariant(
              nodeConfig.kind === NodeKind.Start,
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
