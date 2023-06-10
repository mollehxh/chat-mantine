import { createEffect, sample } from 'effector';
import { createForm, string } from 'efform';
import { debug } from 'patronum';
import { routes } from '../../shared/routing';
import {
  $token,
  chainAnonymous,
  sessionRequestFx,
} from '../../shared/session/model';
import { createEvent } from 'effector/effector.mjs';
import { loginUser } from '../../shared/api';
import { notifications } from '@mantine/notifications';
import { AxiosError } from 'axios';

export const currentRoute = routes.signIn;
export const anonymousRoute = chainAnonymous(currentRoute, {
  otherwise: routes.main.open,
});

export const formSubmitClicked = createEvent();
export const signInFx = createEffect(loginUser);

export const signInForm = createForm({
  email: string()
    .required('Обязательное поле')
    .pattern(/.+@.+/, 'Введите Email'),
  password: string()
    .required('Обязательное поле')
    .length(5, Infinity, 'Пароль должен быть больше 5 символов'),
});

sample({
  clock: formSubmitClicked,
  target: signInForm.validate,
});

sample({
  clock: signInForm.validate.done,
  target: signInForm.submit,
});

sample({
  clock: signInForm.submitted,
  target: signInFx,
});

sample({
  clock: signInFx.doneData,
  target: $token,
});

sample({
  clock: signInFx.failData,
  fn: (error: any) =>
    notifications.show({
      message: error.response.data.message,
      color: 'red',
      autoClose: 5000,
      withCloseButton: true,
      withBorder: true,
    }),
});

sample({
  clock: currentRoute.closed,
  fn: () => ({ email: '', password: '' }),
  target: signInForm.fill,
});

debug(signInForm.submitted);
