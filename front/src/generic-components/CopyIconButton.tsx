import styled from '@emotion/styled';
import IconCopy from 'icons/IconCopy';

const CopyIconButton = styled(IconCopy)`
  width: 20px;
  height: 20px;
  cursor: pointer;
  padding: 2px;
  border-radius: 4px;
  fill: rgba(0, 0, 0, 0.6);

  &:hover {
    background-color: rgba(0, 0, 0, 0.1);
    fill: rgba(0, 0, 0, 1);
  }
`;

export default CopyIconButton;
