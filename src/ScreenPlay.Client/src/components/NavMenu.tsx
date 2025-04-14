import { Component } from "react";
import {
  Collapse,
  Navbar,
  NavbarBrand,
  NavbarToggler,
  NavItem,
  NavLink,
} from "reactstrap";
import { Link } from "react-router-dom";
import LogoImage from "./Logo";
import "./NavMenu.css";
import { NavDropdownMenu } from "./NavDropdownMenu";

interface NavMenuState {
  collapsed: boolean;
}

export class NavMenu extends Component<{}, NavMenuState> {
  static displayName = NavMenu.name;

  constructor(props: {}) {
    super(props);

    this.toggleNavbar = this.toggleNavbar.bind(this);
    this.state = {
      collapsed: true,
    };
  }

  toggleNavbar() {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }

  render() {
    return (
      <header>
        <Navbar
          className="navbar-expand-sm navbar-toggleable-sm ng-white border-bottom box-shadow mb-3"
          container
          light
        >
          <NavbarBrand tag={Link} to="/home" className="nav-title">
            <LogoImage />
          </NavbarBrand>
          <NavbarToggler onClick={this.toggleNavbar} className="mr-2" />
          <Collapse
            className="d-sm-inline-flex flex-sm-row-reverse"
            isOpen={!this.state.collapsed}
            navbar
          >
            <ul className="navbar-nav flex-grow align-items-center">
              <NavItem style={{ display: "flex", alignItems: "center" }}>
                {/* Search Text Box */}
                <input
                  type="text"
                  placeholder="Search movies..."
                  className="form-control"
                  style={{
                    width: "200px",
                    marginRight: "10px", // Small gap between the search box and the icon
                  }}
                />
                {/* NavLink Icon */}
                <NavLink tag={Link} className="text-light" to="/search">
                  <span className="material-symbols-outlined">video_search</span>
                </NavLink>
              </NavItem>
              <NavDropdownMenu></NavDropdownMenu>
            </ul>
          </Collapse>
        </Navbar>
      </header>
    );
  }
}
