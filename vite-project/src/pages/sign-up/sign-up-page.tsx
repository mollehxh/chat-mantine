import {
  TextInput,
  PasswordInput,
  Anchor,
  Paper,
  Title,
  Text,
  Container,
  Button,
  FileButton,
  Avatar,
  UnstyledButton,
  Center,
  Flex,
} from '@mantine/core';

import { $avatar, avatarChanged, formSubmitClicked, signUpForm } from './model';
import { createStringField } from 'efform-react';
import { routes } from '../../shared/routing';
import { useUnit } from 'effector-react/effector-react.mjs';
import { useCallback, useEffect, useMemo, useState } from 'react';

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
          {/* <input
            type="file"
            name="avatar"
            accept="image/*"
            onChange={(evt) => console.log(evt.target.files[0])}
          /> */}
          <AvatarField />
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

const AvatarField = () => {
  const avatar = useUnit($avatar);
  const [fileSrc, setFileSrc] = useState<string | ArrayBuffer | null>('');

  useEffect(() => {
    if (avatar) {
      const reader = new FileReader();
      reader.onloadend = function () {
        setFileSrc(reader.result);
      };
      reader.readAsDataURL(avatar);
    }
  }, [avatar]);

  return (
    <Flex direction="column" align="center" justify="center">
      <FileButton onChange={(file) => avatarChanged(file)}>
        {(props) => (
          <Avatar
            {...props}
            component={UnstyledButton}
            radius="xl"
            size="lg"
            src={fileSrc as string}
          />
        )}
      </FileButton>
      <Text>Аватар пользователя</Text>
    </Flex>
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
      mt="md"
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
