import "./DashboardTile.css";
import { Link } from "wouter";

export enum DashboardTileType {
  ADD = "ADD",
  SPACE = "SPACE",
}

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
      <div className="DashboardTile DashboardTile_add" onClick={props.onClick}>
        <div className="DashboardTile_inner">{props.children}</div>
      </div>
    );
  } else {
    content = (
      <Link href={props.href}>
        <div className="DashboardTile">
          <div className="DashboardTile_inner">{props.children}</div>
        </div>
      </Link>
    );
  }

  return content;
}
