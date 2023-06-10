import { createRouteView } from 'atomic-router-react';

import { anonymousRoute, currentRoute } from './model';
import { PageLoader } from '../../shared/ui/page-loader';
import { SignUpPage } from './sign-up-page';

export const SignUpRoute = {
  view: createRouteView({
    route: anonymousRoute,
    view: SignUpPage,
    otherwise: PageLoader,
  }),
  route: currentRoute,
};
