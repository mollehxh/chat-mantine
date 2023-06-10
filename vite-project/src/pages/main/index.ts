import { createRouteView } from 'atomic-router-react';

import { authorizedRoute, currentRoute } from './model';
import { PageLoader } from '../../shared/ui/page-loader';
import { MainPage } from './main-page';

export const MainRoute = {
  view: createRouteView({
    route: authorizedRoute,
    view: MainPage,
    otherwise: PageLoader,
  }),
  route: currentRoute,
};
