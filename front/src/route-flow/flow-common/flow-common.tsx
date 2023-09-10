import styled from "@emotion/styled";
import IconCopy from "../../component-icons/IconCopy";

export const LabelWithIconContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

export const CopyIcon = styled(IconCopy)`
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
