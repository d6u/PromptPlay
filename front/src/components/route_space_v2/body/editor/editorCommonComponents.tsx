import styled from "styled-components";

export const FieldRow = styled.div`
  margin-bottom: 10px;
`;

export const FieldTitle = styled.div`
  margin-bottom: 5px;
`;

export const FieldHelperText = styled.div<{ $error?: boolean }>`
  font-size: 12px;
  margin-top: 5px;
  color: ${(props) => (props.$error ? "#b02e2e" : "#179648")};
`;
