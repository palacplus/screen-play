import { useState } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  NavItem,
  NavLink,
} from "reactstrap";
import { Link } from "react-router-dom";
import "./NavDropdownMenu.css";
import "./shared.css";

export default function NavDropdownMenu() {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const toggle = () => {
    // TODO: Fix dropdown toggle issue
    // setDropdownOpen(!dropdownOpen);
  };

  const items = [
    { Name: "Search", Route: "/search" },
    { Name: "Queue", Route: "/queue" },
    { Name: "Fetch Data", Route: "/fetch-data" },
    { Name: "Login", Route: "/login" },
  ];

  return (
    <div className="nav-dropdown">
      <Dropdown isOpen={dropdownOpen} toggle={toggle}>
        <DropdownToggle
          caret={false}
          onClick={toggle}
          className="dropdown-toggle-btn"
          title="Menu (disabled)"
        >
          <span className="material-symbols-outlined">menu</span>
        </DropdownToggle>
        <DropdownMenu className="dropdown-menu-custom">
          {items.map((item, index) => (
            <DropdownItem key={index} className="dropdown-item-custom">
              <NavItem>
                <NavLink
                  tag={Link}
                  className="dropdown-text-light"
                  to={item.Route}
                >
                  {item.Name}
                </NavLink>
              </NavItem>
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    </div>
  );
}
