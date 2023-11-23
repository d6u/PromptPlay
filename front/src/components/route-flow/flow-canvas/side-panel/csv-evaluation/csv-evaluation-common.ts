import { styled, AccordionDetails } from "@mui/joy";

export type CSVRow = Array<string>;
export type CSVHeader = CSVRow;
export type CSVData = Array<CSVRow>;

export const CustomAccordionDetails = styled(AccordionDetails)`
  & .MuiAccordionDetails-content {
    padding: 20px;
  }

  & .MuiAccordionDetails-content:not(.Mui-expanded) {
    padding-top: 0;
    padding-bottom: 0;
  }
`;
