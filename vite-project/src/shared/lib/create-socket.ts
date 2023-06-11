import { createEvent, createEffect } from 'effector';
import { io } from 'socket.io-client';

export const createSocket = (uri: string) => {
  const socket = io(uri, { autoConnect: false });

  const on = <T>(eventType: string) => {
    const event = createEvent<T>();

    socket.on(eventType, event);

    return event;
  };

  const emit = <T>(eventType: string) => {
    return createEffect<T, void>((data) => {
      socket.emit(eventType, data);
    });
  };

  const connectFx = createEffect(socket.connect);
  const disconnectFx = createEffect(socket.disconnect);

  return {
    on,
    emit,
    disconnect: disconnectFx,
    connect: connectFx,
  };
};
