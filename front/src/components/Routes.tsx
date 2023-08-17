import Header from "./header/Header";
import RootRoute from "./route_root/RootRoute";
import WorkspaceRoute from "./route_space/WorkspaceRoute";
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
          {(params) => <WorkspaceRoute workspaceId={params.spaceId} />}
        </Route>
        <Route>
          <Redirect to="/" />
        </Route>
      </Switch>
    </div>
  );
}
