import ApiAuthorzationRoutes from "./components/api-authorization/ApiAuthorizationRoutes";
import { FetchData } from "./components/FetchData";
import { Search } from "./components/search/Search";
import SearchResultWrapped from "./components/search/SearchResult";
import { Home } from "./components/Home";
import { Queue } from "./components/queue/Queue";

import { Route } from "react-router-dom";

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
    element: <Search />,
    children: [<Route path=":imdbId" element={<SearchResultWrapped />} />],
  },
  {
    path: "/queue",
    element: <Queue />,
  },
  ...ApiAuthorzationRoutes,
];

export default AppRoutes;
