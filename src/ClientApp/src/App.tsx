import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import AuthProvider from './components/AuthProvider';
import './index.css';

export default function App() {
    return (
      <Layout>
        <Routes>
          
          <Route path="/home" element={<AuthProvider><HomePage /></AuthProvider>} />
          {/* // <Route path="/fetch-data" element={<FetchData />} /> */}
          {/* <Route path="/search" element={<SearchWrapped />}>
            <Route path=":imdbId" element={<SearchResultWrapped />} />
          </Route> */}
          {/* <Route path="/queue" element={<Queue />} /> */}
          <Route path="/login" element={<AuthProvider><LoginPage /></AuthProvider>} />
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </Layout>
    );
}
