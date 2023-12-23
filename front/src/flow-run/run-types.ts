export type RunMetadata = {
  overallStatus: OverallStatus;
  errors: string[];
};

export enum OverallStatus {
  NotStarted = 'NotStarted',
  Waiting = 'Waiting',
  Running = 'Running',
  // NOTE: Don't call this success because it might not be fully successful
  Complete = 'Complete',
  // NOTE: Don't call this error because it might be canceled by the user
  Interrupted = 'Interrupted',
  Unknown = 'Unknown',
}
