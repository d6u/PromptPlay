import { styled, AccordionDetails } from "@mui/joy";
import { FlowOutputVariableMap } from "../../flowRun";
import { VariableID } from "../../flowTypes";

export type CSVRow = Array<string>;
export type CSVHeader = CSVRow;
export type CSVData = Array<CSVRow>;

export type RowIndex = number & { readonly "": unique symbol };
export type ColumnIndex = number & { readonly "": unique symbol };

export type VariableColumnMap = Record<VariableID, ColumnIndex | null>;

export type GeneratedResult = Record<
  RowIndex,
  Record<ColumnIndex, FlowOutputVariableMap>
>;

export const CustomAccordionDetails = styled(AccordionDetails)`
  & .MuiAccordionDetails-content {
    padding: 20px;
  }

  & .MuiAccordionDetails-content:not(.Mui-expanded) {
    padding-top: 0;
    padding-bottom: 0;
  }
`;
