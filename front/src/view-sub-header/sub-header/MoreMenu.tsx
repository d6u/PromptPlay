import styled from '@emotion/styled';
import { Dropdown, IconButton, Menu, MenuButton, MenuItem } from '@mui/joy';

import IconThreeDots from 'icons/IconThreeDots';

function MoreMenu() {
  return (
    false && (
      <Dropdown>
        <MoreMenuButton
          slots={{ root: IconButton }}
          slotProps={{ root: { color: 'neutral' } }}
        >
          <IconThreeDots style={{ rotate: '90deg', width: '18px' }} />
        </MoreMenuButton>
        <Menu>
          <MenuItem color="neutral">Placeholder</MenuItem>
        </Menu>
      </Dropdown>
    )
  );
}

const MoreMenuButton = styled(MenuButton)`
  grid-area: more-menu;
`;

export default MoreMenu;
