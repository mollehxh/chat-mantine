import { useEffect, useRef, useState } from 'react';

import {
  ActionIcon,
  AppShell,
  Footer,
  Header,
  Indicator,
  MediaQuery,
  Navbar,
  ScrollArea,
  TextInput,
  Group,
  UnstyledButton,
  Avatar,
  Text,
  Box,
  useMantineTheme,
  Flex,
  Divider,
  Stack,
  Space,
  Menu,
  Modal,
  Switch,
  Card,
  FileButton,
} from '@mantine/core';

import {
  IconSearch,
  IconSend,
  IconDotsVertical,
  IconMenu2,
  IconSettings,
  IconLogout,
  IconSun,
  IconBell,
  IconBellOff,
  IconMoon,
  IconArrowNarrowDown,
  IconArrowNarrowLeft,
  IconHandStop,
  IconPin,
  IconTrash,
} from '@tabler/icons-react';
import { $user, signOut } from '../../shared/session/model';
import { useUnit } from 'effector-react';
import {
  $conversationMessages,
  $conversations,
  $interlocutor,
  $messageValue,
  $searchResults,
  $searchValue,
  conversationClicked,
  messageValueChanged,
  searchValueChanged,
  sendMessageClicked,
} from './model';
import { useList } from 'effector-react';

function Aform() {
  const session = useUnit($user);

  return (
    <form>
      <Stack spacing="md">
        <Flex align="center" direction="column">
          <FileButton onChange={() => {}}>
            {(props) => (
              <Avatar
                {...props}
                component={UnstyledButton}
                radius="xl"
                size="lg"
                src={`http://localhost:5000/avatars/${session!.avatar}`}
              />
            )}
          </FileButton>
          <Text>{session?.username}</Text>
        </Flex>

        <Switch
          label="Темная тема"
          color="teal"
          onLabel={<IconMoon size="1rem" stroke={2.5} />}
          offLabel={<IconSun size="1rem" stroke={2.5} />}
          size="md"
        />
        <Switch
          label="Уведомления"
          color="teal"
          onLabel={<IconBell size="1rem" stroke={2.5} />}
          offLabel={<IconBellOff size="1rem" stroke={2.5} />}
          size="md"
        />
      </Stack>
    </form>
  );
}

function AppShellDemo() {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(true);
  const [opened2, setOpened2] = useState(false);
  const session = useUnit($user);
  const messageValue = useUnit($messageValue);
  const interlocutor = useUnit($interlocutor);
  const messages = useUnit($conversationMessages);
  console.log(interlocutor);

  const searchValue = useUnit($searchValue);
  const searchResults = useList($searchResults, {
    fn: ({ id, username, avatar }) => (
      <span
        onClick={() => {
          conversationClicked(String(id));
          setOpened(() => false);
        }}
      >
        <User
          name={username}
          avatar={avatar}
          selected={interlocutor?.id == id}
        />
      </span>
    ),
    keys: [interlocutor],
  });
  const conversations = useList($conversations, {
    fn: ({ id, avatar, username, lastMessage }: any) => (
      <span
        onClick={() => {
          conversationClicked(String(id));
          setOpened(() => false);
        }}
      >
        <User
          name={username}
          avatar={avatar}
          sub={lastMessage.content}
          selected={interlocutor?.id == id}
        />
      </span>
    ),
    keys: [interlocutor],
  });
  const conversationMessages = useList(
    $conversationMessages,
    ({ content, sender }: any) => (
      <Message content={content} isMe={session?.id === sender.id} />
    )
  );

  const viewport = useRef<HTMLDivElement>(null);

  useEffect(() => {
    viewport.current?.scrollTo({
      top: viewport.current.scrollHeight,
    });
  }, [messages]);

  return (
    <>
      <Modal
        opened={opened2}
        onClose={() => setOpened2(false)}
        title="Настройки"
        overlayProps={{
          color:
            theme.colorScheme === 'dark'
              ? theme.colors.dark[9]
              : theme.colors.gray[2],
          opacity: 0.55,
          blur: 3,
        }}
        centered
      >
        <Aform />
      </Modal>
      <AppShell
        styles={{
          main: {
            maxHeight: '100vh',
            paddingBottom: '73px',
            overflow: 'hidden',
            position: 'relative',
            background:
              theme.colorScheme === 'dark'
                ? theme.colors.dark[8]
                : theme.colors.gray[2],
          },
        }}
        navbarOffsetBreakpoint="sm"
        asideOffsetBreakpoint="sm"
        layout="alt"
        navbar={
          <Navbar
            px="md"
            pt="md"
            sx={{
              zIndex: 200,
            }}
            hiddenBreakpoint="sm"
            hidden={!opened}
            width={{ sm: 300, lg: 300 }}
          >
            <Navbar.Section>
              <Flex justify="space-between" align="center" gap="sm">
                <Menu position="bottom-start" shadow="md" withArrow width={200}>
                  <Menu.Target>
                    <ActionIcon>
                      <IconMenu2 />
                    </ActionIcon>
                  </Menu.Target>

                  <Menu.Dropdown>
                    <Menu.Label>{session?.username}</Menu.Label>

                    <Menu.Item
                      icon={<IconSettings size={14} />}
                      onClick={() => setOpened2(true)}
                    >
                      Настройки
                    </Menu.Item>

                    <Menu.Divider />

                    <Menu.Label>Опасная зона</Menu.Label>

                    <Menu.Item
                      color="red"
                      icon={<IconLogout size={14} />}
                      onClick={() => signOut()}
                    >
                      Выход
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>

                <TextInput
                  w="100%"
                  value={searchValue}
                  onChange={(event) =>
                    searchValueChanged(event.currentTarget.value)
                  }
                  placeholder="Поиск"
                  icon={<IconSearch size="1.25rem" />}
                />
              </Flex>
            </Navbar.Section>
            <Space h="md" />
            <Divider />
            <Space h="md" />
            <Navbar.Section
              grow
              component={ScrollArea}
              type="hover"
              scrollbarSize={6}
              mx="-xs"
              px="xs"
            >
              <Stack spacing="sm">
                {searchResults}
                {!searchValue && conversations}
              </Stack>
            </Navbar.Section>
          </Navbar>
        }
        footer={
          <>
            {interlocutor && (
              <Footer height="auto" px={theme.spacing.md} py={theme.spacing.xs}>
                <Flex gap="xs" justify="space-between" align="center">
                  <TextInput
                    w="100%"
                    variant="unstyled"
                    value={messageValue}
                    onChange={(event) =>
                      messageValueChanged(event.currentTarget.value)
                    }
                    placeholder="Введите сообщение..."
                  />
                  <ActionIcon
                    size="lg"
                    variant="subtle"
                    color="teal"
                    onClick={() => sendMessageClicked()}
                  >
                    <IconSend />
                  </ActionIcon>
                </Flex>
              </Footer>
            )}
          </>
        }
        header={
          interlocutor && (
            <Header height={{ base: 70, md: 70 }} px="md">
              <Flex align="center" h="100%" justify="space-between">
                <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                  <ActionIcon onClick={() => setOpened((o) => !o)}>
                    <IconArrowNarrowLeft />
                  </ActionIcon>
                </MediaQuery>
                <Text size="sm" weight={500}>
                  {interlocutor?.username}
                </Text>

                <Group>
                  <Menu position="bottom-end" shadow="md" withArrow width={200}>
                    <Menu.Target>
                      <ActionIcon>
                        <IconDotsVertical size="1.125rem" />
                      </ActionIcon>
                    </Menu.Target>

                    <Menu.Dropdown>
                      <Menu.Item icon={<IconPin size={14} />}>
                        Закрепить
                      </Menu.Item>
                      <Menu.Item color="red" icon={<IconHandStop size={14} />}>
                        Заблокировать
                      </Menu.Item>
                      <Menu.Item color="red" icon={<IconTrash size={14} />}>
                        Удалить диалог
                      </Menu.Item>
                    </Menu.Dropdown>
                  </Menu>
                </Group>
              </Flex>
            </Header>
          )
        }
      >
        {interlocutor && (
          <ActionIcon
            onClick={() => {
              viewport.current?.scrollTo({
                top: viewport.current.scrollHeight,
                behavior: 'smooth',
              });
            }}
            size="lg"
            variant="default"
            sx={{
              position: 'fixed',
              bottom: 73,
              right: 16,
              zIndex: 100,
            }}
          >
            <IconArrowNarrowDown />
          </ActionIcon>
        )}
        <ScrollArea
          h="100%"
          type="hover"
          px={36}
          scrollbarSize={6}
          viewportRef={viewport}
        >
          {conversationMessages}
        </ScrollArea>
      </AppShell>
    </>
  );
}

const Message = ({ isMe, content }: any) => {
  const theme = useMantineTheme();

  return (
    <div>
      <Flex justify={isMe ? 'flex-end' : 'flex-start'}>
        <Card
          radius="lg"
          display={'inline-block'}
          mb={8}
          sx={{
            maxWidth: '50%',
            overflow: 'hidden',
            borderTopRightRadius: isMe ? 0 : 'auto',
            borderTopLeftRadius: !isMe ? 0 : 'auto',
            border: '1px solid',
            borderColor: isMe ? theme.colors.teal[5] : theme.colors.dark[4],
          }}
          bg={
            isMe
              ? theme.fn.gradient({ from: 'teal', to: 'green', deg: 105 })
              : theme.colors.dark[6]
          }
        >
          <Text weight={500} color="#fff"></Text>
          <Text size="sm" color="#fff">
            {content}
          </Text>
        </Card>
      </Flex>
    </div>
  );
};

export function User({
  name,
  sub,
  avatar,
  online,
  right,
  selected,
}: {
  name?: any;
  sub?: any;
  avatar: any;
  online?: boolean;
  right?: any;
  selected?: boolean;
}) {
  const theme = useMantineTheme();

  return (
    <UnstyledButton
      w={{
        sm: '267px',
      }}
      sx={{
        display: 'block',
        background: selected
          ? theme.fn.gradient({ from: 'teal', to: 'green', deg: 105 })
          : 'transparent',
        width: '100%',
        padding: theme.spacing.xs,
        overflow: 'hidden',
        borderRadius: theme.radius.sm,
        color:
          theme.colorScheme === 'dark' ? theme.colors.dark[0] : theme.black,

        '&:hover': {
          backgroundColor:
            theme.colorScheme === 'dark'
              ? theme.colors.dark[6]
              : theme.colors.gray[0],
        },
      }}
    >
      <Group>
        <Indicator
          size={14}
          offset={4}
          position="bottom-end"
          color="teal"
          disabled={!online}
          withBorder
        >
          <Avatar src={`http://localhost:5000/avatars/${avatar}`} radius="xl" />
        </Indicator>
        <Box sx={{ flex: 1, width: '267px', overflow: 'hidden' }}>
          <Text size="sm" weight={500} color={selected ? '#fff' : ''}>
            {name}
          </Text>
          <Text
            color={selected ? '#fff' : 'dimmed'}
            size="xs"
            sx={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
          >
            {sub || ''}
          </Text>
        </Box>
        {right}
      </Group>
    </UnstyledButton>
  );
}

export const MainPage = () => {
  return <AppShellDemo />;
};
