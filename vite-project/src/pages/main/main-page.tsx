import { useRef, useState } from 'react';

import {
  ActionIcon,
  AppShell,
  Aside,
  Burger,
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
  Select,
  Switch,
  FileButton,
  Card,
} from '@mantine/core';

import {
  IconSearch,
  IconSend,
  IconPaperclip,
  IconDotsVertical,
  IconLayoutSidebarRight,
  IconMenu2,
  IconSettings,
  IconLogout,
  IconUser,
  IconSun,
  IconBell,
  IconBellOff,
  IconWorld,
  IconMoon,
  IconArrowNarrowDown,
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
  $selectedConversation,
  conversationClicked,
  messageValueChanged,
  searchValueChanged,
  sendMessageClicked,
} from './model';
import { useList } from 'effector-react';

function Aform() {
  return (
    <form>
      <Stack spacing="md">
        <Select
          icon={<IconWorld size="1.25rem" />}
          label="Your language"
          placeholder="Pick language"
          data={[
            { value: 'ru', label: 'Russian' },
            { value: 'eng', label: 'English' },
          ]}
        />

        <Switch
          label="Dark theme"
          color="teal"
          onLabel={<IconMoon size="1rem" stroke={2.5} />}
          offLabel={<IconSun size="1rem" stroke={2.5} />}
          size="md"
        />
        <Switch
          label="Notifications"
          color="teal"
          onLabel={<IconBell size="1rem" stroke={2.5} />}
          offLabel={<IconBellOff size="1rem" stroke={2.5} />}
          size="md"
        />
      </Stack>
    </form>
  );
}

function AppShellDemo({ changeAuth }: { changeAuth: any }) {
  const theme = useMantineTheme();
  const [opened, setOpened] = useState(false);
  const [opened2, setOpened2] = useState(false);
  const session = useUnit($user);
  const messageValue = useUnit($messageValue);

  const searchValue = useUnit($searchValue);
  const searchResults = useList($searchResults, ({ username }) => (
    <User name={username} />
  ));
  const conversations = useList($conversations, ({ id, user, lastMessage }) => (
    <span onClick={() => conversationClicked(String(id))}>
      <User
        name={user.username}
        sub={
          `${
            lastMessage.sender.id === session!.id
              ? 'Вы'
              : lastMessage.sender.username
          }: ` + lastMessage.content
        }
      />
    </span>
  ));
  const conversationMessages = useList(
    $conversationMessages,
    ({ content, sender }: any) => (
      <Message content={content} isMe={session?.id === sender.id} />
    )
  );
  const interlocutor = useUnit($interlocutor);

  const viewport = useRef<HTMLDivElement>(null);

  return (
    <>
      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Proflie"
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
        {/* Modal content */}
      </Modal>
      <Modal
        opened={opened2}
        onClose={() => setOpened2(false)}
        title="Settings"
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
            hiddenBreakpoint="sm"
            hidden={!opened}
            width={{ sm: 200, lg: 300 }}
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
                    <Menu.Label>User</Menu.Label>
                    <Menu.Item
                      icon={<IconUser size={14} />}
                      onClick={() => setOpened(true)}
                    >
                      Profile
                    </Menu.Item>
                    <Menu.Item
                      icon={<IconSettings size={14} />}
                      onClick={() => setOpened2(true)}
                    >
                      Settings
                    </Menu.Item>

                    <Menu.Divider />

                    <Menu.Label>Danger zone</Menu.Label>

                    <Menu.Item
                      color="red"
                      icon={<IconLogout size={14} />}
                      onClick={() => signOut()}
                    >
                      Sign out
                    </Menu.Item>
                  </Menu.Dropdown>
                </Menu>

                <TextInput
                  w="100%"
                  value={searchValue}
                  onChange={(event) =>
                    searchValueChanged(event.currentTarget.value)
                  }
                  placeholder="Search"
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
                    placeholder="Write a message..."
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
          <>
            {interlocutor && (
              <Header height={{ base: 50, md: 70 }} p="md">
                <MediaQuery largerThan="sm" styles={{ display: 'none' }}>
                  <Burger
                    opened={opened}
                    onClick={() => setOpened((o) => !o)}
                    size="sm"
                    color={theme.colors.gray[6]}
                    mr="xl"
                  />
                </MediaQuery>

                <Flex align="center" justify="space-between">
                  <Box>
                    <Text size="sm" weight={500}>
                      {interlocutor.username}
                    </Text>
                    <Text color="dimmed" size="xs">
                      ahorsefighter@gmail.com
                    </Text>
                  </Box>

                  <Group>
                    <ActionIcon>
                      <IconDotsVertical size="1.125rem" />
                    </ActionIcon>
                  </Group>
                </Flex>
              </Header>
            )}
          </>
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
          scrollbarSize={6}
          viewportRef={viewport}
        >
          {conversationMessages}
          {/* <Message content="Hello" isMe />
          <Message content="Hello" />
          <Message content="How are you?" isMe />
          <Message content="Мне норм, а ты как? слышал ты устал жить?" />
          <Message
            content="Совсем придурок? Давай прекращай варить кашу, нам надо топоры затачивать что бы получать больше чем кто либо из врозлхыл, они же хотели онлайн играть в гта но никогда не пробовали котлеты с мазиком"
            isMe
          />

          <Message content="Hello" isMe />
          <Message content="Hello" />
          <Message content="How are you?" isMe />
          <Message content="Мне норм, а ты как? слышал ты устал жить?" />
          <Message
            content="Совсем придурок? Давай прекращай варить кашу, нам надо топоры затачивать что бы получать больше чем кто либо из врозлхыл, они же хотели онлайн играть в гта но никогда не пробовали котлеты с мазиком"
            isMe
          />
          <Message content="Hello" isMe />
          <Message content="Hello" />
          <Message content="How are you?" isMe />
          <Message content="Мне норм, а ты как? слышал ты устал жить?" />
          <Message
            content="Совсем придурок? Давай прекращай варить кашу, нам надо топоры затачивать что бы получать больше чем кто либо из врозлхыл, они же хотели онлайн играть в гта но никогда не пробовали котлеты с мазиком"
            isMe
          />
          <Message content="Hello" />
          <Message content="Hello" isMe />
          <Message content="Hello" />
          <Message content="How are you?" isMe />
          <Message content="Мне норм, а ты как? слышал ты устал жить?" />
          <Message
            content="Совсем придурок? Давай прекращай варить кашу, нам надо топоры затачивать что бы получать больше чем кто либо из врозлхыл, они же хотели онлайн играть в гта но никогда не пробовали котлеты с мазиком"
            isMe
          />
          <Message content="Hello" />
          <Message content="Hello" isMe />
          <Message content="Hello" />
          <Message content="How are you?" isMe />
          <Message content="Мне норм, а ты как? слышал ты устал жить?" />
          <Message
            content="Совсем придурок? Давай прекращай варить кашу, нам надо топоры затачивать что бы получать больше чем кто либо из врозлхыл, они же хотели онлайн играть в гта но никогда не пробовали котлеты с мазиком"
            isMe
          />
          <Message content="Hello" /> */}
        </ScrollArea>
        {/* <Text>Resize app to see responsive navbar in action</Text> */}
      </AppShell>
    </>
  );
}

const Message = ({ isMe, content, loading }: any) => {
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
  online,
  right,
}: {
  name?: any;
  sub?: any;
  online?: boolean;
  right?: any;
}) {
  const theme = useMantineTheme();

  return (
    <UnstyledButton
      sx={{
        display: 'block',
        width: '267px',
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
          <Avatar
            src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=250&q=80"
            radius="xl"
          />
        </Indicator>
        <Box sx={{ flex: 1, width: '267px', overflow: 'hidden' }}>
          <Text size="sm" weight={500}>
            {name || 'Amy Horsefighter'}
          </Text>
          <Text
            color="dimmed"
            size="xs"
            sx={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
          >
            {sub || 'ahorsefighter@gmail.com'}
          </Text>
        </Box>
        {right}
      </Group>
    </UnstyledButton>
  );
}

export const MainPage = () => {
  return (
    <AppShellDemo changeAuth={() => {}} />
    // <AppShell
    //   padding="md"
    //   navbar={
    //     <Navbar width={{ base: 300 }} p="xs">
    //       {/* Navbar content */}
    //       <User />
    //       <MenuWrapper target={<User online />} />
    //       <User />
    //     </Navbar>
    //   }
    //   header={
    //     <Header height={60} p="xs">
    //       {/* Header content */}
    //       <TextInput />
    //     </Header>
    //   }
    //   styles={(theme) => ({
    //     main: {
    //       backgroundColor:
    //         theme.colorScheme === 'dark'
    //           ? theme.colors.dark[8]
    //           : theme.colors.gray[0],
    //     },
    //   })}
    // >
    //   {/* Your application here */}
    // </AppShell>
  );
};
