import styled from "@emotion/styled";
import { Tabs, TabPanel, TabList, Tab } from "@mui/joy";
import { useState } from "react";
import EvaluationTabNormal from "./EvaluationTabNormal";
import EvaluationTabTable from "./EvaluationTabTable";

const Container = styled.div`
  width: 70vw;
`;

export default function PanelEvaluationMode() {
  const [tabIndex, setTabIndex] = useState(1);

  return (
    <Container>
      <Tabs
        value={tabIndex}
        onChange={(e, value) => setTabIndex(value as number)}
      >
        <TabList>
          <Tab>Normal</Tab>
          <Tab>Table</Tab>
        </TabList>
        <TabPanel value={0}>
          <EvaluationTabNormal />
        </TabPanel>
        <TabPanel value={1}>
          <EvaluationTabTable />
        </TabPanel>
      </Tabs>
    </Container>
  );
}
