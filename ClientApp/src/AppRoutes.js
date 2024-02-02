import ApiAuthorzationRoutes from "./components/api-authorization/ApiAuthorizationRoutes";
import { FetchData } from "./components/FetchData";
import SearchWrapped from "./components/search/Search";
import SearchResultWrapped from "./components/search/SearchResult";
import { Home } from "./components/Home";
import { Queue } from "./components/queue/Queue";
import { Route } from "react-router-dom";
import { Login } from "./components/login/Login";

const AppRoutes = [
  {
    index: true,
    element: <Home />,
  },
  {
    path: "/fetch-data",
    requireAuth: true,
    element: <FetchData />,
  },
  {
    path: "/search",
    element: <SearchWrapped />,
    children: [<Route key="10" path=":imdbId" element={<SearchResultWrapped />} />],
  },
  {
    path: "/queue",
    element: <Queue />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  ...ApiAuthorzationRoutes,
];

export default AppRoutes;
