import { useState } from "react";
import { Collapse, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import LogoImage from "./Logo";
import "./NavMenu.css";
import NavDropdownMenu from "./NavDropdownMenu";

export default function NavMenu() {
  const [collapsed, setCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const toggleNavbar = () => {
    setCollapsed(!collapsed);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/library?title=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/library");
    }
  };

  return (
    <header>
      <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3" container={false} light={true}>
        {/* NavbarBrand on the very left */}
        <NavbarToggler onClick={toggleNavbar} className="mr-2" />
        <Collapse className="d-sm-inline-flex flex-sm-row-reverse" isOpen={!collapsed} navbar>
          <ul className="navbar-nav flex-grow align-items-center">
            <NavItem className="nav-item-logo">
              <NavbarBrand tag={Link} to="/home" className="nav-title">
                <LogoImage />
              </NavbarBrand>
            </NavItem>

            {/* Go to Library Link */}
            <NavItem className="nav-item-container">
              <NavLink tag={Link} to="/library" className="btn nav-btn">
                Movie Library
              </NavLink>
            </NavItem>

            {/* Search Form */}
            <NavItem className="nav-item-container">
              <form className="search-container" onSubmit={handleSearchSubmit}>
                <input
                  type="text"
                  placeholder="Search library..."
                  className="form-control search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </NavItem>

            {/* Dropdown Menu */}
            <NavDropdownMenu />
          </ul>
        </Collapse>
      </Navbar>
    </header>
  );
}
