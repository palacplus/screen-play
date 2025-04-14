import { Component, ReactNode } from 'react';
import { Container, Row, Col } from 'reactstrap';
import { NavMenu } from './NavMenu';

interface LayoutProps {
  children: ReactNode;
}

export class Layout extends Component<LayoutProps> {
  static displayName = Layout.name;

  render() {
    return (
      <div>
        <NavMenu />
        <Container tag="main" className='main'>
          {this.props.children}
        </Container>
      </div>
    );
  }
}