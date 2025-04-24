import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout';
import HomePage from './pages/HomePage';
import './index.css';
import LibraryPage from './pages/LibraryPage';

export default function App() {
    return (
      <Layout>
        <Routes>
          <Route path="/home" element={<HomePage />} />
          <Route path="/library" element={<LibraryPage />} />
        </Routes>
      </Layout>
    );
}
