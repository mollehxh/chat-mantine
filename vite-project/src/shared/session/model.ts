import {
  chainRoute,
  RouteInstance,
  RouteParams,
  RouteParamsAndQuery,
} from 'atomic-router';
import {
  attach,
  createEffect,
  createEvent,
  createStore,
  Effect,
  Event,
  sample,
} from 'effector';

import { getSession, User } from '../api';
import { persist } from 'effector-storage/local';
import { reset } from 'patronum';
import { modals } from '@mantine/modals';

enum AuthStatus {
  Initial = 0,
  Pending,
  Anonymous,
  Authenticated,
}

export const signOut = createEvent();
const signOutConfirmed = createEvent();

export const sessionRequestFx = createEffect(getSession);

export const $user = createStore<User | null>(null);
export const $token = createStore('');
const $authenticationStatus = createStore(AuthStatus.Initial);

sample({
  clock: signOut,
  fn: () => {
    modals.openConfirmModal({
      title: 'Вы точно хотите выйти из аккаунта?',
      labels: { confirm: 'Выйти', cancel: 'Отменить' },
      onConfirm: () => signOutConfirmed(),
      confirmProps: { color: 'red' },
      centered: true,
    });
  },
});

reset({
  clock: signOutConfirmed,
  target: [$user, $token, $authenticationStatus],
});

$authenticationStatus.on(sessionRequestFx, (status) => {
  if (status === AuthStatus.Initial) return AuthStatus.Pending;
  return status;
});

$user.on(sessionRequestFx.doneData, (_, user) => user);
$authenticationStatus.on(
  sessionRequestFx.doneData,
  () => AuthStatus.Authenticated
);

$authenticationStatus.on(sessionRequestFx.fail, () => AuthStatus.Anonymous);
$user.on(sessionRequestFx.fail, () => null);

const fx = createEffect(() => getSession());

sample({
  clock: $token,
  target: sessionRequestFx,
});

interface ChainParams<Params extends RouteParams> {
  otherwise?: Event<void> | Effect<void, any, any>;
}

export function chainAuthorized<Params extends RouteParams>(
  route: RouteInstance<Params>,
  { otherwise }: ChainParams<Params> = {}
): RouteInstance<Params> {
  const sessionCheckStarted = createEvent<RouteParamsAndQuery<Params>>();
  const sessionReceivedAnonymous = createEvent<RouteParamsAndQuery<Params>>();

  const alreadyAuthenticated = sample({
    clock: sessionCheckStarted,
    source: $authenticationStatus,
    filter: (status) => status === AuthStatus.Authenticated,
  });

  const alreadyAnonymous = sample({
    clock: sessionCheckStarted,
    source: $authenticationStatus,
    filter: (status) => status === AuthStatus.Anonymous,
  });

  sample({
    clock: sessionCheckStarted,
    source: $authenticationStatus,
    filter: (status) => status === AuthStatus.Initial,
    target: sessionRequestFx,
  });

  sample({
    clock: [alreadyAnonymous, sessionRequestFx.fail],
    source: { params: route.$params, query: route.$query },
    filter: route.$isOpened,
    target: sessionReceivedAnonymous,
  });

  if (otherwise) {
    sample({
      clock: sessionReceivedAnonymous,
      target: otherwise as Event<void>,
    });
  }

  return chainRoute({
    route,
    beforeOpen: sessionCheckStarted,
    openOn: [alreadyAuthenticated, sessionRequestFx.done],
    cancelOn: sessionReceivedAnonymous,
  });
}

export function chainAnonymous<Params extends RouteParams>(
  route: RouteInstance<Params>,
  { otherwise }: ChainParams<Params> = {}
): RouteInstance<Params> {
  const sessionCheckStarted = createEvent<RouteParamsAndQuery<Params>>();
  const sessionReceivedAuthenticated =
    createEvent<RouteParamsAndQuery<Params>>();

  const alreadyAuthenticated = sample({
    clock: sessionCheckStarted,
    source: $authenticationStatus,
    filter: (status) => status === AuthStatus.Authenticated,
  });

  const alreadyAnonymous = sample({
    clock: sessionCheckStarted,
    source: $authenticationStatus,
    filter: (status) => status === AuthStatus.Anonymous,
  });

  sample({
    clock: sessionCheckStarted,
    source: $authenticationStatus,
    filter: (status) => status === AuthStatus.Initial,
    target: sessionRequestFx,
  });

  sample({
    clock: [alreadyAuthenticated, sessionRequestFx.done],
    source: { params: route.$params, query: route.$query },
    filter: route.$isOpened,
    target: sessionReceivedAuthenticated,
  });

  if (otherwise) {
    sample({
      clock: sessionReceivedAuthenticated,
      target: otherwise as Event<void>,
    });
  }

  return chainRoute({
    route,
    beforeOpen: sessionCheckStarted,
    openOn: [alreadyAnonymous, sessionRequestFx.fail],
    cancelOn: sessionReceivedAuthenticated,
  });
}

persist({
  store: $token,
  key: 'token',
});
