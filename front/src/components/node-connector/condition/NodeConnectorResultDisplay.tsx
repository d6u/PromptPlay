import styled from '@emotion/styled';
import { D } from '@mobily/ts-belt';
import { ComponentProps } from 'react';

type Props = {
  label: string;
  value: unknown;
  onClick?: () => void;
} & ComponentProps<'div'>;

function NodeConnectorResultDisplay(props: Props) {
  return (
    <Container {...D.deleteKeys(props, ['label', 'value'])}>
      <Name>{props.label} =&nbsp;</Name>
      <Value>{props.value != null ? JSON.stringify(props.value) : ''}</Value>
    </Container>
  );
}

const Container = styled.div`
  margin-top: 5px;
  margin-bottom: 5px;
  height: 32px;
  border: 1px solid blue;
  padding-left: 6px;
  padding-right: 6px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 5px;
  min-width: 0;
  flex-grow: 1;
  cursor: pointer;
  font-size: 14px;
`;

const Name = styled.code`
  white-space: nowrap;
`;

const Value = styled.code`
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
`;

export default NodeConnectorResultDisplay;
