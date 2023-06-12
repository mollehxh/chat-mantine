import { createEffect, createEvent, createStore, sample } from 'effector';
import { routes } from '../../shared/routing';
import notify from '../../shared/sounds/notify.mp3';
import { $user, chainAuthorized } from '../../shared/session/model';
import {
  LastMessage,
  User,
  getConversationById,
  getConversations,
  searchUsers,
  sendMessage,
} from '../../shared/api';
import { debug, reset } from 'patronum';
import { createSocket } from '../../shared/lib/create-socket';
import { notifications } from '@mantine/notifications';
import { Avatar } from '@mantine/core';

export const currentRoute = routes.main;
export const authorizedRoute = chainAuthorized(currentRoute, {
  otherwise: routes.signIn.open,
});

const socket = createSocket('http://localhost:5000');
const msgRecived = socket.on<any>('msg');
const connect = socket.emit<string>('connect');

sample({
  clock: authorizedRoute.opened,
  source: $user,
  filter: Boolean,
  fn: ({ id }) => String(id),
  target: connect,
});

export const messageValueChanged = createEvent<string>();
export const sendMessageClicked = createEvent();
export const searchValueChanged = createEvent<string>();
export const conversationClicked = createEvent<string>();

const searchUsersFx = createEffect(searchUsers);
const getConversationsFx = createEffect(getConversations);
const getConversationByIdFx = createEffect(getConversationById);
const sendMessageFx = createEffect(sendMessage);

export const $messageValue = createStore('');
export const $searchValue = createStore('');
export const $selectedConversation = createStore<any>({});
export const $searchResults = createStore<User[]>([]);
export const $conversations = createStore<
  {
    id: number;
    user: User;
    lastMessage: LastMessage;
  }[]
>([]);

export const $conversationMessages = $selectedConversation.map(
  ({ messages }: any) => messages
);
export const $interlocutor = $selectedConversation.map(
  ({ user }: any) => user as User
);

// $selectedConversation.on(msgRecived, (old, message) => {
//   console.log('old', old);
//   console.log('old', message);
//   return {
//     ...old,
//     messages: [...old.messages, message],
//   };
// });

sample({
  clock: sendMessageClicked,
  source: {
    conversation: $selectedConversation,
    session: $user,
    content: $messageValue,
  },
  filter: ({ content }) => Boolean(content.trim()),
  fn: ({ conversation, session, content }) => ({
    conversationId: conversation.id,
    senderId: session!.id,
    receiverId: conversation.user.id,
    content,
  }),
  target: sendMessageFx,
});

reset({
  clock: sendMessageFx,
  target: [$messageValue],
});

sample({
  clock: messageValueChanged,
  target: $messageValue,
});

sample({
  clock: searchValueChanged,
  target: $searchValue,
});

sample({
  clock: $searchValue,
  target: searchUsersFx,
});

sample({
  clock: searchUsersFx.doneData,
  target: $searchResults,
});

sample({
  clock: [authorizedRoute.opened, msgRecived],
  source: $user,
  filter: Boolean,
  fn: ({ id }) => String(id),
  target: getConversationsFx,
});

sample({
  clock: getConversationsFx.doneData,
  target: $conversations,
});

const $conversationId = createStore('');
sample({
  clock: conversationClicked,
  target: $conversationId,
});

sample({
  clock: [$conversationId, msgRecived],
  source: { user: $user, conversationId: $conversationId },
  filter: ({ user }) => Boolean(user),
  fn: ({ user, conversationId }) => ({
    userId: String(user!.id),
    conversationId: String(conversationId),
  }),
  target: getConversationByIdFx,
});

sample({
  clock: msgRecived,
  source: { user: $user, selectedConversation: $selectedConversation },
  fn: (
    { user, selectedConversation },
    { receiver, sender, content, conversation }
  ) => {
    if (!user) return;
    if (user.id !== receiver.id || selectedConversation.id == conversation.id)
      return;
    const audio = new Audio(notify);
    audio.play();
    notifications.show({
      id: 'message',
      message: content,
      title: `Новое сообщение от ${sender.username}`,
      color: 'gray',
      autoClose: 5000,
      onClick: () => {
        notifications.hide('message');
        conversationClicked(String(sender.id));
      },
      icon: (
        <Avatar
          src={`http://localhost:5000/avatars/${sender.avatar}`}
          radius="xl"
        />
      ),
      withCloseButton: true,
      withBorder: true,
    });
  },
});

sample({
  clock: getConversationByIdFx.doneData,
  target: $selectedConversation,
});

debug(conversationClicked, msgRecived);
