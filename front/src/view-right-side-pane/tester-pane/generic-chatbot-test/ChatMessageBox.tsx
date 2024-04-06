import styled from '@emotion/styled';

export type Message = {
  role: string;
  content: string;
};

type Props = {
  message: Message;
};

function ChatMessageBox(props: Props) {
  return (
    <Container $fromLocalSender={props.message.role === 'user'}>
      <SenderName>{props.message.role}</SenderName>
      <MessageBubble $fromLocalSender={props.message.role === 'user'}>
        {props.message.content}
      </MessageBubble>
    </Container>
  );
}

const Container = styled.div<{ $fromLocalSender: boolean }>`
  margin-top: 10px;
  margin-bottom: 10px;
  display: flex;
  flex-direction: column;
  align-items: ${(props) =>
    props.$fromLocalSender ? 'flex-end' : 'flex-start'};
`;

const SenderName = styled.div`
  font-size: 12px;
  font-weight: bold;
  line-height: 1;
`;

const MessageBubble = styled.div<{ $fromLocalSender: boolean }>`
  font-size: 14px;
  line-height: 18px;
  margin-top: 5px;
  padding-left: 8px;
  padding-right: 8px;
  padding-top: 5px;
  padding-bottom: 5px;
  border-radius: 14px;
  background-color: ${(props) =>
    props.$fromLocalSender ? '#3A80F6' : '#e9e9eb'};
  color: ${(props) => (props.$fromLocalSender ? 'white' : 'black')};
  min-width: 28px;
  // Make sure we render text bubble correctly by preserving whitespace
  // and new line character.
  // Firefox doesn't support "white-space-collapse: preserve;"
  white-space: break-spaces;
`;

export default ChatMessageBox;
