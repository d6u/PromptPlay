import { css } from "@emotion/react";
import styled from "@emotion/styled";
import StyleResetLink from "../../component_common/StyleResetLink";
import { DashboardTileType } from "./dashboardTypes";

const Tile = styled.div<{ $add?: boolean }>`
  aspect-ratio: 1 / 1;
  padding: 20px;
  border: 2px solid black;
  border-radius: 10px;
  background: none;
  color: black;
  font-size: 20px;
  line-height: 1.3;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 500ms;
  display: flex;

  ${(props) =>
    props.$add
      ? css`
          justify-content: center;
          align-items: center;
        `
      : null}

  &:hover {
    background-color: #ececf1;
  }

  @media only screen and (max-width: 500px) {
    padding: 10px;
    font-size: 18px;
    line-height: 1.1;
  }
`;

const TileContent = styled.div`
  max-height: 100%;
  font-style: normal;
  text-decoration: none;
  overflow-wrap: break-word;
  overflow: hidden;
`;

type Props = (
  | {
      type: DashboardTileType.ADD;
      onClick: () => void;
    }
  | {
      type: DashboardTileType.SPACE;
      href: string;
    }
) & {
  children?: React.ReactNode;
};

export default function DashboardTile(props: Props) {
  let content: React.ReactNode;

  if (props.type === DashboardTileType.ADD) {
    content = (
      <Tile $add onClick={props.onClick}>
        <TileContent>{props.children}</TileContent>
      </Tile>
    );
  } else {
    content = (
      <StyleResetLink to={props.href}>
        <Tile>
          <TileContent>{props.children}</TileContent>
        </Tile>
      </StyleResetLink>
    );
  }

  return content;
}
