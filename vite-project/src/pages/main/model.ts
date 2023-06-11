import { createEffect, createEvent, createStore, sample } from 'effector';
import { routes } from '../../shared/routing';
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

export const currentRoute = routes.main;
export const authorizedRoute = chainAuthorized(currentRoute, {
  otherwise: routes.signIn.open,
});

const socket = createSocket('');

sample({
  clock: authorizedRoute.opened,
  target: socket.connect,
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
  clock: authorizedRoute.opened,
  source: $user,
  filter: Boolean,
  fn: ({ id }) => String(id),
  target: getConversationsFx,
});

sample({
  clock: getConversationsFx.doneData,
  target: $conversations,
});

sample({
  clock: conversationClicked,
  source: { user: $user },
  filter: ({ user }) => Boolean(user),
  fn: ({ user }, conversationId) => ({
    userId: String(user!.id),
    conversationId,
  }),
  target: getConversationByIdFx,
});

sample({
  clock: getConversationByIdFx.doneData,
  target: $selectedConversation,
});

debug($searchResults);
