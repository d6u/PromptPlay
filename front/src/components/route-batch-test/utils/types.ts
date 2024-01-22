export type CSVRow = Array<string>;
export type CSVData = Array<CSVRow>;
export type CSVHeader = CSVRow;

export enum BatchTestTab {
  RunTests = 'RunTests',
  UploadCsv = 'UploadCsv',
}
