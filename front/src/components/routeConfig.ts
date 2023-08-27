export const ROOT_PATH = "/";

export const SPACE_PATH_PATTERN = "spaces/:spaceId";

export function pathToSpace(spaceId: string) {
  return `/spaces/${spaceId}`;
}
