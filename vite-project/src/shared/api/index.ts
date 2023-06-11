import axios from 'axios';

export interface User {
  id: number;
  username: string;
  email: string;
}

export interface LastMessage {
  id: number;
  content: string;
  sentAt: string;
  sender: User;
  receiver: User;
}

interface RegisterData {
  username: string;
  email: string;
  password: string;
}

interface LoginData {
  email: string;
  password: string;
}

const api = axios.create({
  baseURL: 'http://localhost:5000/',
});

api.interceptors.request.use(
  (config: any) => {
    config.headers.Authorization = `${localStorage.getItem('token')}`;
    return config;
  },
  (err) => {
    return Promise.reject(err);
  }
);

export async function registerUser(data: RegisterData): Promise<string> {
  const response = await api.post('/register', data);
  return response.data.token;
}

export async function loginUser(data: LoginData): Promise<string> {
  const response = await api.post('/login', data);
  return response.data.token;
}

export async function getSession(): Promise<User> {
  const response = await api.get('/session');
  return response.data;
}

export async function searchUsers(username: string) {
  const response = await api.get('/users/search', {
    params: {
      username,
    },
  });
  return response.data;
}

export async function getConversations(userId: string) {
  const response = await api.get(`users/${userId}/dialog-contacts`);
  return response.data;
}
export async function getConversationById({
  userId,
  conversationId,
}: {
  userId: string;
  conversationId: string;
}) {
  const response = await api.get(
    `/conversations2?userId${userId}&interlocutorId=${conversationId}`,
    {
      params: {
        userId,
      },
    }
  );
  return response.data;
}

export async function sendMessage(data: {
  senderId: number;
  receiverId: number;
  content: string;
}) {
  const response = await api.post('/messages2', data);
  return response.data;
}
