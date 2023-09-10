import styled from "@emotion/styled";
import { Handle } from "reactflow";
import IconCopy from "../../../component_icons/IconCopy";
import IconGear from "../../../component_icons/IconGear";
import { BACKDROP_PADDING } from "./NodeBox";

export const SECTION_PADDING_BOTTOM = 10;
export const HANDLE_WIDTH = 15;
export const HANDLE_HEIGHT = 34;

export const StyledHandle = styled(Handle)`
  width: ${HANDLE_WIDTH}px;
  height: ${HANDLE_HEIGHT}px;
  border-radius: ${HANDLE_WIDTH / 2}px;
  background: #00b3ff;
  transform: none;
`;

export const InputHandle = styled(StyledHandle)`
  left: -${HANDLE_WIDTH / 2 - BACKDROP_PADDING / 2}px;
`;

export const OutputHandle = styled(StyledHandle)`
  top: unset;
  right: -${HANDLE_WIDTH / 2 - BACKDROP_PADDING / 2}px;
`;

export const Section = styled.div`
  padding: 0 10px ${SECTION_PADDING_BOTTOM}px;
`;

export const SmallSection = styled(Section)`
  padding: 0 10px 5px;
  display: flex;
  gap: 5px;
`;

export const StyledIconGear = styled(IconGear)`
  width: 20px;
  fill: #636b74;
`;

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
