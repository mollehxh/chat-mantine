import { createEffect, createStore, sample } from 'effector';
import { createForm, record, string } from 'efform';
import { debug } from 'patronum';
import { routes } from '../../shared/routing';
import { $token, chainAnonymous } from '../../shared/session/model';
import { createEvent } from 'effector/effector.mjs';
import { registerUser } from '../../shared/api';
import { notifications } from '@mantine/notifications';

export const currentRoute = routes.signUp;
export const anonymousRoute = chainAnonymous(currentRoute, {
  otherwise: routes.main.open,
});

export const formSubmitClicked = createEvent();
export const signUpFx = createEffect(registerUser);

export const avatarChanged = createEvent<File | null>();
export const $avatar = createStore<File | null>(null);
$avatar.on(avatarChanged, (_, file) => file);

export const signUpForm = createForm({
  username: string()
    .required('Обязательное поле')
    .length(3, Infinity, 'Имя пользователя должен быть больше 3 символов'),
  email: string()
    .required('Обязательное поле')
    .pattern(/.+@.+/, 'Введите Email'),
  password: string()
    .required('Обязательное поле')
    .length(5, Infinity, 'Пароль должен быть больше 5 символов'),
});

sample({
  clock: formSubmitClicked,
  target: signUpForm.validate,
});

sample({
  clock: signUpForm.validate.done,
  target: signUpForm.submit,
});

sample({
  clock: signUpForm.submitted,
  source: { avatar: $avatar },
  fn: ({ avatar }, formData) => ({ ...formData, avatar }),
  target: signUpFx,
});

sample({
  clock: signUpFx.doneData,
  target: $token,
});

sample({
  clock: currentRoute.closed,
  fn: () => ({ username: '', email: '', password: '' }),
  target: signUpForm.fill,
});

sample({
  clock: signUpFx.failData,
  fn: (error: any) =>
    notifications.show({
      message: error.response.data.message,
      color: 'red',
      autoClose: 5000,
      withCloseButton: true,
      withBorder: true,
    }),
});

debug(signUpForm.submitted);
