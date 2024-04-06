import { Button, ButtonGroup } from '@mui/joy';
import {
  RootRouteSubRoute,
  useRootRouteSubRouteHandle,
} from 'generic-util/route';
import { useNavigate } from 'react-router-dom';

function DashboardTabSwitcher() {
  const subRouteType = useRootRouteSubRouteHandle(
    (h) => h?.subRouteType ?? null,
  );

  const navigate = useNavigate();

  return (
    <ButtonGroup>
      <Button
        variant={
          subRouteType === RootRouteSubRoute.Workspace ? 'solid' : 'outlined'
        }
        onClick={() => navigate('/workspace')}
      >
        Workspace
      </Button>
      <Button
        variant={
          subRouteType === RootRouteSubRoute.ChatBots ? 'solid' : 'outlined'
        }
        onClick={() => navigate('/chatbots')}
      >
        Chat Bots
      </Button>
    </ButtonGroup>
  );
}

export default DashboardTabSwitcher;
