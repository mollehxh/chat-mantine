import { createRoutesView } from 'atomic-router-react';
import { SignInRoute } from './sign-in';
import { MainRoute } from './main';
import { SignUpRoute } from './sign-up';

export const Pages = createRoutesView({
  routes: [SignInRoute, SignUpRoute, MainRoute],
});
