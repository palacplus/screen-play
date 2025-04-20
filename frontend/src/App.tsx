import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import LoginPanel from './components/LoginPanel';
import HomePage from './pages/HomePage';
import AuthProvider from './components/AuthProvider';
import './index.css';
import LibraryPage from './pages/LibraryPage';

export default function App() {
    return (
      <Layout>
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/library" element={<LibraryPage />} />
          {/* // <Route path="/fetch-data" element={<FetchData />} /> */}
          {/* <Route path="/search" element={<SearchWrapped />}>
            <Route path=":imdbId" element={<SearchResultWrapped />} />
          </Route> */}
          {/* <Route path="/queue" element={<Queue />} /> */}
          {/* <Route path="*" element={<NotFound />} /> */}
        </Routes>
      </Layout>
    );
}
