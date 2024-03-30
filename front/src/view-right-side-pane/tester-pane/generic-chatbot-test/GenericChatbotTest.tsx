import styled from '@emotion/styled';
import { Textarea } from '@mui/joy';
import { useState } from 'react';

import type { GenericChatbotStartNodeAllLevelConfig } from 'flow-models';

import ChatMessageBox, { Message } from './ChatMessageBox';

type Props = {
  nodeConfig: GenericChatbotStartNodeAllLevelConfig;
};

function GenericChatbotTest(props: Props) {
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
