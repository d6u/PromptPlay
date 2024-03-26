import { ContentVersion } from 'gencode-gql/graphql';
import { API_SERVER_BASE_URL } from 'global-config/global-config';
import { useMatches } from 'react-router-dom';

// ANCHOR: API paths

export const LOGIN_PATH = `${API_SERVER_BASE_URL}/login`;
export const LOGOUT_PATH = `${API_SERVER_BASE_URL}/logout`;

// ANCHOR: Top level paths

export const FLOWS_PATH_PATTERN = '/flows/:spaceId';

export function pathToFlow(spaceId: string) {
  return `/flows/${spaceId}`;
}

export function pathToCurrentContent(
  id: string,
  contentVersion: ContentVersion,
): string {
  switch (contentVersion) {
    case ContentVersion.V3:
    case ContentVersion.V4:
      return pathToFlow(id);
  }
}

// ANCHOR: Flow level paths

export enum FlowRouteTab {
  Canvas = 'canvas',
  BatchTest = 'batch-test',
}

export type FlowRouteSubRouteHandle = {
  tabType: FlowRouteTab;
};

export function useFlowRouteSubRouteHandle<T>(
  selector: (handle: FlowRouteSubRouteHandle) => T,
): T {
  const matches = useMatches();
  return selector(matches[2].handle as FlowRouteSubRouteHandle);
}

export function pathToFlowCanvasTab(spaceId: string) {
  return `${pathToFlow(spaceId)}/${FlowRouteTab.Canvas}`;
}

export function pathToFlowBatchTestTab(spaceId: string) {
  return `${pathToFlow(spaceId)}/${FlowRouteTab.BatchTest}`;
}
