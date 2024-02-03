import { Outlet } from 'react-router-dom';
import Header from '../components/common/header/Header';

export default function RouteRoot() {
  return (
    <>
      <Header />
      <Outlet />
    </>
  );
}
