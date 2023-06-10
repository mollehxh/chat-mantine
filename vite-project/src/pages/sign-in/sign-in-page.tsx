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

import { formSubmitClicked, signInForm } from './model';
import { createStringField } from 'efform-react';
import { routes } from '../../shared/routing';

export const SignInPage = () => {
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
          Вход
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
            Войти
          </Button>
        </Paper>
        <Text color="dimmed" size="sm" align="center" mt={5}>
          Еще нет аккаунта?{' '}
          <Anchor
            size="sm"
            component="button"
            color="teal"
            onClick={() => routes.signUp.open()}
          >
            Зарегистрироваться
          </Anchor>
        </Text>
      </Container>
    </>
  );
};

const EmailField = createStringField(
  signInForm,
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
      required
    />
  )
);

const PasswordField = createStringField(
  signInForm,
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
