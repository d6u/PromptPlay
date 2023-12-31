import { API_SERVER_BASE_URL } from '../constants';
import { ContentVersion } from '../gql/graphql';

export const ROOT_PATH = '/';

export const FLOWS_PATH_PATTERN = '/flows/:spaceId';

export function pathToFlow(spaceId: string) {
  return `/flows/${spaceId}`;
}

export function pathToCurrentContent(
  id: string,
  contentVersion: ContentVersion,
): string {
  switch (contentVersion) {
    case ContentVersion.V1:
      // TODO: Report to telemetry
      console.warn('V1 is not supported anymore');
      return '';
    case ContentVersion.V2:
      return pathToFlow(id);
    case ContentVersion.V3:
      return pathToFlow(id);
  }
}

export const LOGIN_PATH = `${API_SERVER_BASE_URL}/login`;
export const LOGOUT_PATH = `${API_SERVER_BASE_URL}/logout`;
