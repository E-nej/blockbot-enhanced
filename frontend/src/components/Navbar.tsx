import {
  Button,
  Navbar,
  NavbarBrand,
  NavbarCollapse,
  NavbarLink,
  NavbarToggle,
} from 'flowbite-react';
import { Link, useLocation } from 'react-router-dom';

export default function NavbarComponent() {
  const location = useLocation();

  return (
    <Navbar fluid rounded className="mb-0">
      <Link to="/">
        <NavbarBrand>
          <img
            src="/logo.svg"
            className="mr-3 h-6 sm:h-9"
            alt="BrainBlast Logo"
          />
        </NavbarBrand>
      </Link>
      <div className="flex gap-2 md:order-2">
        <Button className="w-32" color="alternative">
          Prijavi se
        </Button>
        <Button className="w-32">Ustvari račun</Button>
        <NavbarToggle />
      </div>
      <NavbarCollapse>
        <Link to="/">
          <NavbarLink active={location.pathname === '/'}>Domov</NavbarLink>
        </Link>
        <Link to="/game">
          <NavbarLink active={location.pathname === '/game'}>Igra</NavbarLink>
        </Link>
        <Link to="/leaderboards">
          <NavbarLink active={location.pathname === '/leaderboards'}>
            Lestvica
          </NavbarLink>
        </Link>
      </NavbarCollapse>
    </Navbar>
  );
}
