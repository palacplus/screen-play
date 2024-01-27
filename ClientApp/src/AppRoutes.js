import ApiAuthorzationRoutes from "./components/api-authorization/ApiAuthorizationRoutes";
import { Movie } from "./components/Movie";
import { FetchData } from "./components/FetchData";
import { Search } from "./components/Search";
import { Home } from "./components/Home";
import { Queue } from "./components/Queue";

const AppRoutes = [
  {
    index: true,
    element: <Home />,
  },
  {
    path: "/result",
    element: <Movie />,
  },
  {
    path: "/fetch-data",
    requireAuth: true,
    element: <FetchData />,
  },
  {
    path: "/search",
    element: <Search />,
  },
  {
    path: "/queue",
    element: <Queue />,
  },
  ...ApiAuthorzationRoutes,
];

export default AppRoutes;
