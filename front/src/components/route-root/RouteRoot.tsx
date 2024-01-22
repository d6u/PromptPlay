import { Outlet } from 'react-router-dom';
import Header from '../common/header/Header';

export default function RouteRoot() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
