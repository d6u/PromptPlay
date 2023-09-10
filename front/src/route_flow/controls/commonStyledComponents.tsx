import styled from "styled-components";

export const PanelContentContainer = styled.div`
  padding: 20px 20px 0 20px;
`;

export const HeaderSection = styled.div`
  margin: 0 0 10px 0;
  padding-bottom: 5px;
  border-bottom: 1px solid #000;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: ${32 + 5}px;
`;

export const HeaderSectionHeader = styled.h3`
  margin: 0;
  font-size: 16px;
`;

export const Section = styled.div`
  margin-bottom: 20px;
`;

export const OutputValueItem = styled.div`
  margin-bottom: 10px;
`;

export const OutputValueName = styled.code`
  margin: 0 0 5px 0;
  font-size: 14px;
  display: block;
`;

export const RawValue = styled.pre`
  margin: 0;
  border: 1px solid #ddd;
  padding: 10px;
  border-radius: 5px;
  white-space: pre-wrap;
`;
