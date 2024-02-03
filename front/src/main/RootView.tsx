import { Outlet } from 'react-router-dom';
import HeaderView from 'view-header/HeaderView';

export default function RouteRoot() {
  return (
    <>
      <HeaderView />
      <Outlet />
    </>
  );
}
