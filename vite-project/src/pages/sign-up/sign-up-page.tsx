import {
  TextInput,
  PasswordInput,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Button,
} from '@mantine/core';

import { formSubmitClicked, signUpForm } from './model';
import { createStringField } from 'efform-react';
import { routes } from '../../shared/routing';

export const SignUpPage = () => {
  return (
    <>
      <Container size={420} my={40}>
        <Title
          align="center"
          sx={(theme) => ({
            fontFamily: `Greycliff CF, ${theme.fontFamily}`,
            fontWeight: 900,
          })}
        >
          Регистрация
        </Title>

        <Paper
          component="form"
          // onSubmit={onFormSubmit}
          withBorder
          shadow="md"
          p={30}
          mt={30}
          radius="md"
        >
          <UsernameField for="username" />
          <EmailField for="email" />
          <PasswordField for="password" />

          <Button
            fullWidth
            // loading={isSignInPending}
            onClick={(evt) => {
              evt.preventDefault();
              formSubmitClicked();
            }}
            type="submit"
            color="teal"
            mt="xl"
          >
            Зарегистрироваться
          </Button>
        </Paper>
        <Text color="dimmed" size="sm" align="center" mt={5}>
          Уже есть аккаунт?{' '}
          <Anchor
            size="sm"
            component="button"
            color="teal"
            onClick={() => routes.signIn.open()}
          >
            Войти
          </Anchor>
        </Text>
      </Container>
    </>
  );
};

const UsernameField = createStringField(
  signUpForm,
  ({ value, onChange, error, validate }) => (
    <TextInput
      label="Имя пользователя"
      placeholder="Введите имя пользователя"
      value={value}
      onChange={(event) => {
        onChange(event.currentTarget.value);
        validate();
      }}
      error={error}
      required
    />
  )
);

const EmailField = createStringField(
  signUpForm,
  ({ value, onChange, error, validate }) => (
    <TextInput
      label="Email"
      placeholder="Введите email"
      value={value}
      onChange={(event) => {
        onChange(event.currentTarget.value);
        validate();
      }}
      error={error}
      mt="md"
      required
    />
  )
);

const PasswordField = createStringField(
  signUpForm,
  ({ value, onChange, error, validate }) => (
    <PasswordInput
      label="Пароль"
      placeholder="Введите пароль"
      required
      value={value}
      onChange={(event) => {
        onChange(event.currentTarget.value);
        validate();
      }}
      error={error}
      mt="md"
    />
  )
);
