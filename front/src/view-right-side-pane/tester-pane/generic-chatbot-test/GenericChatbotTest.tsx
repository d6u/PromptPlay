import styled from '@emotion/styled';
import { Textarea } from '@mui/joy';
import { useMemo, useState } from 'react';

import {
  ConnectorType,
  type GenericChatbotStartNodeAllLevelConfig,
  type NodeOutputVariable,
} from 'flow-models';

import { useFlowStore } from 'state-flow/flow-store';

import invariant from 'tiny-invariant';
import ChatMessageBox, { Message } from './ChatMessageBox';

type Props = {
  nodeConfig: GenericChatbotStartNodeAllLevelConfig;
};

function GenericChatbotTest(props: Props) {
  const connectors = useFlowStore((s) => s.getFlowContent().variablesDict);

  const startFlowSingleRun = useFlowStore((s) => s.startFlowSingleRun);

  const chatHistoryVariableId = useMemo(() => {
    const chatHistoryVariable = Object.values(connectors).find(
      (connector): connector is NodeOutputVariable =>
        connector.nodeId === props.nodeConfig.nodeId &&
        connector.type === ConnectorType.NodeOutput &&
        connector.index === 0,
    );

    invariant(chatHistoryVariable != null, 'chatHistoryVariable is not null');

    return chatHistoryVariable.id;
  }, [props.nodeConfig.nodeId, connectors]);

  const currentMessageVariableId = useMemo(() => {
    const currentMessageVariable = Object.values(connectors).find(
      (connector): connector is NodeOutputVariable =>
        connector.nodeId === props.nodeConfig.nodeId &&
        connector.type === ConnectorType.NodeOutput &&
        connector.index === 1,
    );

    invariant(
      currentMessageVariable != null,
      'currentMessageVariable is not null',
    );

    return currentMessageVariable.id;
  }, [props.nodeConfig.nodeId, connectors]);

  const [messages, setMessages] = useState<Message[]>([
    {
      senderName: 'Bot',
      fromLocalSender: false,
      messageContent: 'Hello! How can I help you?',
    },
    {
      senderName: 'User',
      fromLocalSender: true,
      messageContent: 'I need help with my account',
    },
    {
      senderName: 'Bot',
      fromLocalSender: false,
      messageContent: 'Sure! What do you need help with?',
    },
    {
      senderName: 'User',
      fromLocalSender: true,
      messageContent: 'I need to reset my password',
    },
  ]);

  const [currentMessageContent, setCurrentMessageContent] =
    useState<string>('');

  return (
    <Conatiner>
      <ChatMessagesContainer>
        {messages.map((message, index) => (
          <ChatMessageBox key={index} message={message} />
        ))}
      </ChatMessagesContainer>
      <TextareaContainer>
        <Textarea
          minRows={2}
          maxRows={10}
          placeholder="Type a message..."
          value={currentMessageContent}
          onChange={(event) => setCurrentMessageContent(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();

              if (currentMessageContent === '') {
                return;
              }

              setMessages([
                ...messages,
                {
                  senderName: 'User',
                  fromLocalSender: true,
                  messageContent: currentMessageContent,
                },
              ]);

              setCurrentMessageContent('');

              startFlowSingleRun({
                variableValues: {
                  [chatHistoryVariableId]: messages,
                  [currentMessageVariableId]: currentMessageContent,
                },
              });
            }
          }}
        />
      </TextareaContainer>
    </Conatiner>
  );
}

const Conatiner = styled.div`
  padding-left: 10px;
  padding-right: 10px;
  padding-bottom: 10px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ChatMessagesContainer = styled.div`
  margin-bottom: 10px;
  border: 1px solid #cfd7e0;
  padding-left: 10px;
  padding-right: 10px;
  border-radius: 6px;
  min-height: 0;
  flex-grow: 1;
  overflow-y: auto;
`;

const TextareaContainer = styled.div``;

export default GenericChatbotTest;
