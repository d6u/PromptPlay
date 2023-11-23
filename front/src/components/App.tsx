import { Provider as GraphQLProvider } from "urql";
import { client } from "../state/urql";
import Routes from "./Routes";
import UITheme from "./UITheme";

export default function App() {
  return (
    <UITheme>
      <GraphQLProvider value={client}>
        <Routes />
      </GraphQLProvider>
    </UITheme>
  );
}
