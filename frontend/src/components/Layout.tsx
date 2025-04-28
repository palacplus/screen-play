import { Component, ReactNode } from 'react';
import { Container } from 'reactstrap';
import NavMenu from './NavMenu';
import AuthProvider from './AuthProvider';

interface LayoutProps {
  children: ReactNode;
}

export class Layout extends Component<LayoutProps> {
  static displayName = Layout.name;

  render() {
    return (
      <div>
        <AuthProvider>
        <NavMenu />
        <Container tag="main" className='main'>
          {this.props.children}
        </Container>
        </AuthProvider>
      </div>
    );
  }
}