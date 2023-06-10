import react from '@vitejs/plugin-react-swc';
import { defineConfig } from 'vite';
import { MockServerConfig, startMockServer } from 'mock-config-server';

const mockServerConfig: MockServerConfig = {
  // rest: {
  //   baseUrl: '/api',
  //   configs: [
  //     {
  //       path: '/signin',
  //       method: 'post',
  //       routes: [
  //         {
  //           data: { error: 'invalid_request' },
  //           interceptors: {
  //             response: (data, { setStatusCode }) => {
  //               setStatusCode(400);
  //               return data;
  //             },
  //           },
  //         },
  //         {
  //           data: { error: 'invalid_credentials' },
  //           entities: {
  //             body: {
  //               email: 'sergeysova@gmail.com',
  //             },
  //           },
  //           interceptors: {
  //             response: (data, { setStatusCode }) => {
  //               setStatusCode(403);
  //               return data;
  //             },
  //           },
  //         },
  //         {
  //           data: { email: 'sergeysova@gmail.com', username: 'sergeysova' },
  //           entities: {
  //             body: {
  //               email: 'sergeysova@gmail.com',
  //               password: 'qweasd123',
  //             },
  //           },
  //           interceptors: {
  //             response: (data, { appendHeader }) => {
  //               appendHeader('Set-Cookie', 'token=auth-user-token');
  //               return data;
  //             },
  //           },
  //         },
  //       ],
  //     },
  //     {
  //       path: '/signup',
  //       method: 'post',
  //       routes: [
  //         {
  //           data: {
  //             username: 'sergei sova',
  //           },
  //           interceptors: {
  //             response: (data, { appendHeader, request }) => {
  //               appendHeader('Set-Cookie', 'token=auth-user-token');
  //               return { ...data, email: request.body.email };
  //             },
  //           },
  //         },
  //       ],
  //     },
  //     {
  //       path: '/reset-password',
  //       method: 'post',
  //       routes: [
  //         {
  //           data: { success: true },
  //           interceptors: {
  //             response: (data, { appendHeader }) => {
  //               appendHeader('Set-Cookie', 'token=auth-user-token');
  //               return data;
  //             },
  //           },
  //         },
  //       ],
  //     },
  //   ],
  // },

  rest: {
    baseUrl: '/api',
    configs: [
      {
        path: '/user',
        method: 'get',
        routes: [{ data: { emoji: '🦁', name: 'Nursultan' } }],
      },
    ],
  },
};

startMockServer(mockServerConfig);

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
});
