import { createEffect, createEvent, createStore, sample } from 'effector';
import { routes } from '../../shared/routing';
import notify from '../../shared/sounds/notify.mp3';
import { $user, chainAuthorized } from '../../shared/session/model';
import {
  LastMessage,
  User,
  deleteConversation,
  getConversationById,
  getConversations,
  pinConversation,
  searchUsers,
  sendMessage,
  unpinConversation,
} from '../../shared/api';
import { debug, reset } from 'patronum';
import { createSocket } from '../../shared/lib/create-socket';
import { notifications } from '@mantine/notifications';
import { Avatar } from '@mantine/core';
import { modals } from '@mantine/modals';
const audio = new Audio(notify);

export const currentRoute = routes.main;
export const authorizedRoute = chainAuthorized(currentRoute, {
  otherwise: routes.signIn.open,
});

const socket = createSocket('http://localhost:5000');
const msgRecived = socket.on<any>('msg');
const conversationDeleted = socket.on<any>('conversationDeleted');
const conversationUpdated = socket.on<any>('conversationUpdated');
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
export const deleteConversationClicked = createEvent<number>();
export const pinConversationClicked = createEvent();
export const unpinConversationClicked = createEvent();

const searchUsersFx = createEffect(searchUsers);
const getConversationsFx = createEffect(getConversations);
const getConversationByIdFx = createEffect(getConversationById);
const sendMessageFx = createEffect(sendMessage);
const deleteConversationFx = createEffect(deleteConversation);
const pinConversationFx = createEffect(pinConversation);
const unpinConversationFx = createEffect(unpinConversation);

export const $messageValue = createStore('');
export const $searchValue = createStore('');
export const $selectedConversation = createStore<any>(null);
export const $searchResults = createStore<User[]>([]);
export const $conversations = createStore<
  {
    id: number;
    user: User;
    lastMessage: LastMessage;
  }[]
>([]);

export const $conversationMessages = $selectedConversation.map(
  (conversation) => {
    if (conversation) return conversation.messages;
    return [];
  }
);
export const $interlocutor = $selectedConversation.map((conversation) => {
  if (conversation) return conversation.user;
  return null;
});

// $selectedConversation.on(msgRecived, (old, message) => {
//   console.log('old', old);
//   console.log('old', message);
//   return {
//     ...old,
//     messages: [...old.messages, message],
//   };
// });

sample({
  clock: pinConversationClicked,
  source: { user: $user, currentConversation: $selectedConversation },
  fn: ({ user, currentConversation }) => {
    return {
      userId: user!.id,
      conversationId: currentConversation.id,
    };
  },
  target: pinConversationFx,
});
sample({
  clock: unpinConversationClicked,
  source: { user: $user, currentConversation: $selectedConversation },
  fn: ({ user, currentConversation }) => {
    return {
      userId: user!.id,
      conversationId: currentConversation.id,
    };
  },
  target: unpinConversationFx,
});

sample({
  clock: deleteConversationClicked,
  fn: (id) => {
    modals.openConfirmModal({
      title: 'Вы точно хотите удалить диалог?',
      overlayProps: {
        opacity: 0.55,
        blur: 3,
      },
      labels: { confirm: 'Удалить', cancel: 'Отменить' },
      onConfirm: () => deleteConversationFx(id),
      confirmProps: { color: 'red' },
      centered: true,
    });
  },
});

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
  clock: [
    authorizedRoute.opened,
    msgRecived,
    conversationDeleted,
    conversationUpdated,
  ],
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

reset({
  clock: sample({
    clock: conversationDeleted,
    source: { currentConversation: $selectedConversation },
    filter: ({ currentConversation }, deletedConversationId) =>
      currentConversation.id == deletedConversationId,
  }),
  target: [$selectedConversation],
});

sample({
  clock: msgRecived,
  source: { user: $user, selectedConversation: $selectedConversation },
  fn: (
    { user, selectedConversation },
    { receiver, sender, content, conversation }
  ) => {
    console.log('rec', receiver.id);
    console.log('selectConv', selectedConversation.id);
    console.log('conv', conversation.id);
    if (!user) return;
    if (user.id !== receiver.id || selectedConversation.id == conversation.id)
      return;
    console.log('PLAY');

    audio.play();
    notifications.show({
      message: content,
      title: `Новое сообщение от ${sender.username}`,
      color: 'gray',
      autoClose: 5000,
      onClick: () => {
        conversationClicked(String(sender.id));
      },
      icon: (
        <Avatar
          src={`http://localhost:5000/avatars/${sender.avatar}`}
          radius="xl"
        />
      ),
      withBorder: true,
    });
  },
});

sample({
  clock: getConversationByIdFx.doneData,
  target: $selectedConversation,
});

debug($selectedConversation);
