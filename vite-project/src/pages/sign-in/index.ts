import { createRouteView } from 'atomic-router-react';

import { anonymousRoute, currentRoute } from './model';
import { PageLoader } from '../../shared/ui/page-loader';
import { SignInPage } from './sign-in-page';

export const SignInRoute = {
  view: createRouteView({
    route: anonymousRoute,
    view: SignInPage,
    otherwise: PageLoader,
  }),
  route: currentRoute,
};
