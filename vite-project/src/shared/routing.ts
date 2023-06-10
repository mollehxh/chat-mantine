import {
  createHistoryRouter,
  createRoute,
  createRouterControls,
} from 'atomic-router';
import { sample } from 'effector';
import { appStarted } from './config/init';
import { createBrowserHistory } from 'history';

export const routes = {
  main: createRoute(),
  signIn: createRoute(),
  signUp: createRoute(),
};

export const controls = createRouterControls();

export const router = createHistoryRouter({
  routes: [
    {
      path: '/',
      route: routes.main,
    },
    {
      path: '/sign-in',
      route: routes.signIn,
    },
    {
      path: '/sign-up',
      route: routes.signUp,
    },
  ],
});

sample({
  clock: appStarted,
  fn: () => createBrowserHistory(),
  target: router.setHistory,
});
