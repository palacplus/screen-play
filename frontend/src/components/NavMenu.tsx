import { useState } from "react";
import { Collapse, Navbar, NavbarBrand, NavbarToggler, NavItem, NavLink } from "reactstrap";
import { Link, useNavigate, useLocation } from "react-router-dom";
import LogoImage from "./Logo";
import "./NavMenu.css";
import "./shared.css";
import NavDropdownMenu from "./NavDropdownMenu";
import LoadingOverlay from "./LoadingOverlay";
import ThemeToggle from "./ThemeToggle";
import { Path } from "../types/endpoints";
import { useAuth } from "./AuthProvider";

export default function NavMenu() {
  const [collapsed, setCollapsed] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check if we're on the library page
  const isOnLibraryPage = location.pathname === Path.LIBRARY;

  const toggleNavbar = () => {
    setCollapsed(!collapsed);
  };

  const handleSearchSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    if (searchQuery.trim()) {
      navigate(`${Path.LIBRARY}?title=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate(Path.LIBRARY);
    }
    setSearchQuery("");
    setIsLoading(false);
  };

  return (
    <header>
      <Navbar className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3" container={false} light={true}>
        {/* NavbarBrand on the very left */}
        <NavbarToggler onClick={toggleNavbar} className="mr-2" />
        <Collapse className="d-sm-inline-flex flex-sm-row-reverse" isOpen={!collapsed} navbar>
          <ul className="navbar-nav flex-grow align-items-center">
            <NavItem className="nav-item-logo">
              <NavbarBrand tag={Link} to={Path.DASHBOARD} className="nav-title">
                <LogoImage />
                <span className="site-title">Screenplay</span>
              </NavbarBrand>
            </NavItem>

            {/* Navigation Link - Changes based on current page */}
            {auth.currentUser && (
              <>
                <NavItem className="nav-item-container">
                  <NavLink
                    tag={Link}
                    to={isOnLibraryPage ? Path.DASHBOARD : Path.LIBRARY}
                    className="btn nav-btn"
                  >
                    {isOnLibraryPage ? "Dashboard" : "View Library"}
                  </NavLink>
                </NavItem>

                <NavItem className="nav-item-container">
                  <form className="search-container" onSubmit={handleSearchSubmit} aria-label="Search library">
                    <LoadingOverlay isLoading={false} />
                    <input
                      type="text"
                      placeholder="Search library..."
                      className="form-control search-input"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </form>
                </NavItem>
              </>
            )}
            
            {/* Theme Toggle */}
            <NavItem className="nav-item-container theme-toggle-nav">
              <ThemeToggle />
            </NavItem>
            
            {/* Dropdown Menu */}
            <NavDropdownMenu />
          </ul>
        </Collapse>
      </Navbar>
    </header>
  );
}
