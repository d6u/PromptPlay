import styled from '@emotion/styled';

export type Message = {
  senderName: string;
  fromLocalSender: boolean;
  messageContent: string;
};

type Props = {
  message: Message;
};

function ChatMessageBox(props: Props) {
  return (
    <Container $fromLocalSender={props.message.fromLocalSender}>
      <SenderName>{props.message.senderName}</SenderName>
      <MessageBubble $fromLocalSender={props.message.fromLocalSender}>
        {/* \u00A0 is &nbsp; */}
        {props.message.messageContent.replace(/ /g, '\u00A0')}
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
  // Make sure we render new line character in string as new line
  white-space: pre-line;
`;

export default ChatMessageBox;
