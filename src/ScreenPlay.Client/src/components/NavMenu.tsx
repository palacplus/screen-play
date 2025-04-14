import { useState } from "react";
import { Collapse, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from "reactstrap";
import { Link, useNavigate } from "react-router-dom";
import LogoImage from "./Logo";
import "./NavMenu.css";
import { NavDropdownMenu } from "./NavDropdownMenu";

export default function NavMenu() {
  const [collapsed, setCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  const toggleNavbar = () => {
    setCollapsed(!collapsed);
  };

  const handleSearch = () => {
    if (searchQuery.trim()) {
      navigate(`/library?title=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate("/library");
    }
  };

  return (
    <header>
      <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3" container light>
        <NavbarBrand tag={Link} to="/home" className="nav-title">
          <LogoImage />
        </NavbarBrand>
        <NavbarToggler onClick={toggleNavbar} className="mr-2" />
        <Collapse className="d-sm-inline-flex flex-sm-row-reverse" isOpen={!collapsed} navbar>
          <ul className="navbar-nav flex-grow align-items-center">
            <NavItem className="nav-item-container">
              {/* Go to Library Link */}
              <NavLink tag={Link} to="/library" className="btn view-library-btn">
                View Library
              </NavLink>

              {/* Search Text Box with Button */}
              <div className="search-container">
                <input
                  type="text"
                  placeholder="Search library..."
                  className="form-control search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button className="btn search-btn" onClick={handleSearch}>
                  <span className="material-symbols-outlined">video_search</span>
                </button>
              </div>
            </NavItem>
            <NavDropdownMenu />
          </ul>
        </Collapse>
      </Navbar>
    </header>
  );
}
