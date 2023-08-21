import Header from "./header/Header";
import RootRoute from "./route_root/RootRoute";
import WorkspaceRoute from "./route_space/WorkspaceRoute";
import RouteSpaceV2 from "./route_space_v2/RouteSpaceV2";
import { Redirect, Route, Switch } from "wouter";

export default function Routes() {
  return (
    <div className="App">
      <Header />
      <Switch>
        <Route path="/">
          <RootRoute />
        </Route>
        <Route path="/spaces/:spaceId">
          {(params: { spaceId: string }) => (
            <WorkspaceRoute workspaceId={params.spaceId} />
          )}
        </Route>
        <Route path="/spaces_v2/:spaceId">
          {(params: { spaceId: string }) => (
            <RouteSpaceV2 spaceId={params.spaceId} />
          )}
        </Route>
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    </div>
  );
}
