import { Navigate, Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import HomePage from './pages/HomePage';
import LibraryPage from './pages/LibraryPage';
import { Path } from './types/endpoints';
import './index.css';


export default function App() {
    return (
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to={Path.DASHBOARD} replace />} />
          <Route path={Path.DASHBOARD} element={<HomePage />} />
          <Route path={Path.LIBRARY} element={<LibraryPage />} />
        </Routes>
      </Layout>
    );
}
