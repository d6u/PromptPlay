import styled from '@emotion/styled';
import { Textarea } from '@mui/joy';
import { useCallback, useMemo, useState } from 'react';
import invariant from 'tiny-invariant';

import {
  ConnectorType,
  NodeClass,
  type GenericChatbotStartNodeAllLevelConfig,
  type NodeOutputVariable,
} from 'flow-models';

import { useFlowStore } from 'state-flow/flow-store';

import ChatMessageBox, { Message } from './ChatMessageBox';

type Props = {
  nodeConfig: GenericChatbotStartNodeAllLevelConfig;
};

function GenericChatbotTest(props: Props) {
  const nodeConfigs = useFlowStore((s) => s.getFlowContent().nodeConfigs);
  const connectors = useFlowStore((s) => s.getFlowContent().connectors);

  const startFlowSingleRunForResult = useFlowStore(
    (s) => s.startFlowSingleRunForResult,
  );

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

  const [messages, setMessages] = useState<Message[]>([]);

  const [currentMessageContent, setCurrentMessageContent] =
    useState<string>('');

  const submitMessageForReply = useCallback(
    async (chatHistory: Message[], currentMessage: string) => {
      const result = await startFlowSingleRunForResult({
        inputValues: {
          [chatHistoryVariableId]: { value: chatHistory },
          [currentMessageVariableId]: { value: currentMessage },
        },
      });

      const messagesVariableId = Object.keys(result.variableResults).find(
        (variableId) => {
          const variable = connectors[variableId];

          return (
            variable != null &&
            nodeConfigs[variable.nodeId].class === NodeClass.Finish &&
            variable.type === ConnectorType.NodeInput &&
            variable.name === 'messages'
          );
        },
      );

      invariant(messagesVariableId != null, 'messagesVariableId is not null');

      setMessages((messages) => {
        return messages.concat(
          (result.variableResults[messagesVariableId].value as string[]).map(
            (message) => {
              return {
                senderName: 'Bot',
                fromLocalSender: false,
                messageContent: message,
              };
            },
          ),
        );
      });
    },
    [
      chatHistoryVariableId,
      connectors,
      currentMessageVariableId,
      nodeConfigs,
      startFlowSingleRunForResult,
    ],
  );

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

              setMessages((messages) => {
                return [
                  ...messages,
                  {
                    senderName: 'User',
                    fromLocalSender: true,
                    messageContent: currentMessageContent,
                  },
                ];
              });

              setCurrentMessageContent('');

              submitMessageForReply(messages, currentMessageContent);
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
