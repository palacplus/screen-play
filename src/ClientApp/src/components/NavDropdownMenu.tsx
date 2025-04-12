import { Component } from "react";
import {
  Dropdown,
  DropdownToggle,
  DropdownMenu,
  DropdownItem,
  NavItem,
  NavLink,
} from "reactstrap";
import { Link } from "react-router-dom";

interface NavDropdownMenuState {
  dropdownOpen: boolean;
}

export class NavDropdownMenu extends Component<{}, NavDropdownMenuState> {
  constructor(props: {}) {
    super(props);
    this.toggle = this.toggle.bind(this);
    this.state = {
      dropdownOpen: false,
    };
  }

  toggle() {
    this.setState({
      dropdownOpen: !this.state.dropdownOpen,
    });
  }

  render() {
    const { dropdownOpen } = this.state;
    // TODO: use the app routes here
    const items = [
      { Name: "Search", Route: "/search" },
      { Name: "Queue", Route: "/queue" },
      { Name: "Fetch Data", Route: "/fetch-data" },
      { Name: "Login", Route: "/login" },
    ];

    return (
      <div className="nav-dropdown">
        <Dropdown isOpen={dropdownOpen} toggle={this.toggle}>
          <DropdownToggle caret={false} onClick={this.toggle}>
            <span className="material-symbols-outlined">menu</span>
          </DropdownToggle>
          <DropdownMenu>
            {items.map((item, index) => (
              <DropdownItem key={index}>
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
}
