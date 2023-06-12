const { Server } = require('socket.io');
const http = require('http');
const path = require('path');
const { default: axios } = require('axios');
const multer = require('multer');
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Sequelize, DataTypes, Op } = require('sequelize');

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'avatars'); // Directory to store uploaded avatars
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + '-' + uniqueSuffix + '.' + file.mimetype.split('/')[1]
    );
  },
});
const upload = multer({ storage: storage });

app.use('/avatars', express.static('avatars'));

// Параметры подключения к базе данных
const sequelize = new Sequelize('chattie', 'root', 'root', {
  host: 'localhost',
  dialect: 'mysql',
});

// Определение моделей (таблиц)
const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  avatar: {
    type: DataTypes.TEXT('long'),
    allowNull: 'false',
  },
});

const Conversation = sequelize.define('Conversation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
});

const Message = sequelize.define('Message', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  content: {
    type: DataTypes.TEXT('long'),
    allowNull: false,
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
});

const MessageStatus = sequelize.define('MessageStatus', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

const Notification = sequelize.define('Notification', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  sentAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
});

const Block = sequelize.define('Block', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
});

const PinnedConversation = sequelize.define('PinnedConversation', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
});

const Friend = sequelize.define('Friend', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
});

const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  darkThemeEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
  notificationEnabled: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: true,
  },
});

const FriendRequest = sequelize.define('FriendRequest', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  createdAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
  },
  accepted: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

// Определение связей между таблицами
User.hasMany(Conversation, { foreignKey: 'user1Id' });
User.hasMany(Conversation, { foreignKey: 'user2Id' });

Conversation.belongsTo(User, { as: 'user1', foreignKey: 'user1Id' });
Conversation.belongsTo(User, { as: 'user2', foreignKey: 'user2Id' });

Conversation.hasMany(Message, { as: 'messages', foreignKey: 'conversationId' });

Message.belongsTo(Conversation, {
  as: 'messages',
  foreignKey: 'conversationId',
});
Message.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
Message.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

Message.hasMany(MessageStatus, { foreignKey: 'messageId' });

MessageStatus.belongsTo(Message, { foreignKey: 'messageId' });
MessageStatus.belongsTo(User, { foreignKey: 'userId' });

Message.hasOne(Notification, { foreignKey: 'messageId' });

Notification.belongsTo(Message, { foreignKey: 'messageId' });
Notification.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(Block, { foreignKey: 'userId' });
User.hasMany(Block, { foreignKey: 'blockedUserId' });

Block.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Block.belongsTo(User, { as: 'blockedUser', foreignKey: 'blockedUserId' });

User.hasMany(PinnedConversation, { foreignKey: 'userId' });

PinnedConversation.belongsTo(User, { foreignKey: 'userId' });
PinnedConversation.belongsTo(Conversation, { foreignKey: 'conversationId' });

User.hasMany(Friend, { foreignKey: 'userId' });

Friend.belongsTo(User, { as: 'user', foreignKey: 'userId' });
Friend.belongsTo(User, { as: 'friend', foreignKey: 'friendId' });

User.hasMany(Setting, { foreignKey: 'userId' });

Setting.belongsTo(User, { foreignKey: 'userId' });

User.hasMany(FriendRequest, { as: 'sentRequests', foreignKey: 'senderId' });
User.hasMany(FriendRequest, {
  as: 'receivedRequests',
  foreignKey: 'receiverId',
});

FriendRequest.belongsTo(User, { as: 'sender', foreignKey: 'senderId' });
FriendRequest.belongsTo(User, { as: 'receiver', foreignKey: 'receiverId' });

// Синхронизация моделей с базой данных
sequelize
  .sync()
  .then(() => {
    console.log('Таблицы успешно созданы.');
  })
  .catch((error) => {
    console.error('Ошибка при создании таблиц:', error);
  });

// Инициализация приложения Express

class UserController {
  static async register(req, res) {
    try {
      const { username, email, password } = req.body;

      // Проверка наличия пользователя с таким email
      const existingUser = await User.findOne({ where: { email } });

      if (existingUser) {
        res
          .status(409)
          .json({ message: 'Пользователь с таким email уже существует' });
        return;
      }

      // Хеширование пароля
      const hashedPassword = await bcrypt.hash(password, 10);

      // Создание нового пользователя
      const user = await User.create({
        username,
        email,
        password: hashedPassword,
        avatar: req.file ? req.file.filename : null,
      });

      // Создание JWT-токена
      const token = jwt.sign({ userId: user.id }, 'secretKey');

      res.status(201).json({ token });
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }

  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Поиск пользователя по email
      const user = await User.findOne({ where: { email } });

      // Проверка наличия пользователя и сравнение паролей
      if (!user || !(await bcrypt.compare(password, user.password))) {
        res.status(401).json({ message: 'Неверные email или пароль' });
        return;
      }

      // Создание JWT-токена
      const token = jwt.sign({ userId: user.id }, 'secretKey');

      res.json({ token });
    } catch (error) {
      console.error('Ошибка при аутентификации:', error);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }

  static async getSession(req, res) {
    try {
      // Получение JWT-токена из заголовка Authorization
      const token = JSON.parse(req.headers.authorization);

      if (!token) {
        res.status(401).json({ message: 'Отсутствует токен авторизации' });
        return;
      }

      // Верификация и декодирование JWT-токена
      const decodedToken = jwt.verify(token, 'secretKey');

      if (!decodedToken || !decodedToken.userId) {
        res.status(401).json({ message: 'Неверный токен авторизации' });
        return;
      }

      const userId = decodedToken.userId;

      // Получение информации о пользователе по userId
      const user = await User.findByPk(userId, {
        attributes: ['id', 'username', 'email', 'avatar'],
        raw: true,
      });

      if (!user) {
        res.status(404).json({ message: 'Пользователь не найден' });
        return;
      }

      res.json(user);
    } catch (error) {
      console.error('Ошибка при получении сессии:', error);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }

  static async searchUsers(req, res) {
    try {
      const { username } = req.query;

      // Если параметр username пустой, вернуть пустой массив
      if (!username) {
        res.json([]);
        return;
      }

      // Поиск пользователей по username
      const users = await User.findAll({
        where: {
          username: {
            [Op.like]: `%${username}%`, // Поиск совпадений с использованием оператора LIKE
          },
        },
        attributes: ['id', 'username', 'email', 'avatar'],
      });

      res.json(users);
    } catch (error) {
      console.error('Ошибка при поиске пользователей:', error);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }

  static async getConversations(req, res) {
    try {
      const { userId } = req.query;
      // Получение списка диалогов пользователя
      const conversations = await Conversation.findAll({
        where: {
          [Op.or]: [{ user1Id: userId }, { user2Id: userId }],
        },
        include: [
          {
            model: User,
            as: 'user1',
            attributes: ['id', 'username', 'email'],
          },
          {
            model: User,
            as: 'user2',
            attributes: ['id', 'username', 'email'],
          },
          {
            model: Message,
            attributes: ['id', 'content', 'sentAt'],
            include: [
              {
                model: User,
                as: 'sender',
                attributes: ['id', 'username', 'email'],
              },
              {
                model: User,
                as: 'receiver',
                attributes: ['id', 'username', 'email'],
              },
            ],
            order: [['sentAt', 'DESC']],
          },
        ],
        order: [[Message, 'sentAt', 'DESC']],
      });

      // Формирование результата
      const result = conversations.map((conversation) => {
        const { id, user1, user2, Messages } = conversation;
        const lastMessage = Messages[0];

        // Определение пользователя с которым происходит диалог
        const otherUser = userId == user1.id ? user2 : user1;

        return {
          id,
          user: {
            id: otherUser.id,
            username: otherUser.username,
            email: otherUser.email,
            avatar: otherUser.avatar,
          },
          lastMessage,
        };
      });

      res.json(result);
    } catch (error) {
      console.error('Ошибка при получении списка диалогов:', error);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }

  // static async getDialogMessages(req, res) {
  //   try {
  //     const { userId } = req.query;
  //     const { conversationId } = req.params;

  //     // Получение диалога
  //     const conversation = await Conversation.findOne({
  //       where: {
  //         id: conversationId,
  //         [Op.or]: [{ user1Id: userId }, { user2Id: userId }],
  //       },
  //       include: [
  //         {
  //           model: User,
  //           as: 'user1',
  //           attributes: ['id', 'username', 'email'],
  //         },
  //         {
  //           model: User,
  //           as: 'user2',
  //           attributes: ['id', 'username', 'email'],
  //         },
  //         {
  //           model: Message,
  //           attributes: ['id', 'content', 'sentAt'],
  //           include: [
  //             {
  //               model: User,
  //               as: 'sender',
  //               attributes: ['id', 'username', 'email'],
  //             },
  //             {
  //               model: User,
  //               as: 'receiver',
  //               attributes: ['id', 'username', 'email'],
  //             },
  //           ],
  //           order: [['sentAt', 'ASC']],
  //         },
  //       ],
  //       order: [[Message, 'sentAt', 'ASC']],
  //     });

  //     // Проверка, есть ли такой диалог
  //     if (!conversation) {
  //       return res.status(404).json({ message: 'Диалог не найден' });
  //     }

  //     // Формирование результата
  //     const { id, user1, user2, Messages } = conversation;
  //     const result = {
  //       id,
  //       user: userId == user1.id ? user2 : user1,
  //       messages: Messages,
  //     };

  //     res.json(result);
  //   } catch (error) {
  //     console.error('Ошибка при получении информации о диалоге:', error);
  //     res.status(500).json({ message: 'Внутренняя ошибка сервера' });
  //   }
  // }

  // static async sendMessage(req, res) {
  //   try {
  //     const { conversationId, senderId, receiverId, content } = req.body;

  //     // Создание нового сообщения
  //     const message = await Message.create({
  //       conversationId,
  //       senderId,
  //       receiverId,
  //       content,
  //       sentAt: new Date(),
  //     });

  //     // Получение информации о диалоге
  //     const conversation = await Conversation.findByPk(conversationId, {
  //       include: [
  //         {
  //           model: User,
  //           as: 'user1',
  //         },
  //         {
  //           model: User,
  //           as: 'user2',
  //         },
  //       ],
  //     });

  //     // Отправка успешного ответа с информацией о сообщении и диалоге
  //     res.json({
  //       message,
  //       conversation,
  //     });
  //   } catch (error) {
  //     // Обработка ошибки
  //     console.error('Error sending message:', error);
  //     res
  //       .status(500)
  //       .json({ error: 'An error occurred while sending the message.' });
  //   }
  // }

  // =============
  // ======
  // =========

  static async getDialogMessages2(req, res) {
    try {
      const { userId, interlocutorId } = req.query;

      // Поиск диалога между пользователями
      const conversation = await Conversation.findOne({
        where: {
          [Op.or]: [
            { user1Id: userId, user2Id: interlocutorId },
            { user1Id: interlocutorId, user2Id: userId },
          ],
        },
        include: [
          {
            model: User,
            as: 'user1',
            attributes: ['id', 'username', 'email', 'avatar'],
          },
          {
            model: User,
            as: 'user2',
            attributes: ['id', 'username', 'email', 'avatar'],
          },
          {
            model: Message,
            as: 'messages',
            attributes: ['id', 'content', 'sentAt'],
            include: [
              {
                model: User,
                as: 'sender',
                attributes: ['id', 'username', 'email', 'avatar'],
              },
              {
                model: User,
                as: 'receiver',
                attributes: ['id', 'username', 'email', 'avatar'],
              },
            ],
            order: [['sentAt', 'ASC']],
          },
        ],
        order: [['messages', 'sentAt', 'ASC']],
      });

      // Формирование результата
      let result;
      if (conversation) {
        const { id, user1, user2, messages } = conversation;
        result = {
          id,
          user: userId == user1.id ? user2 : user1,
          messages,
        };
      } else {
        const interlocutor = await User.findOne({
          where: { id: interlocutorId },
          attributes: ['id', 'username', 'email', 'avatar'],
        });
        result = {
          id: null,
          user: interlocutor,
          messages: [],
        };
      }

      res.json(result);
    } catch (error) {
      console.error('Ошибка при получении информации о диалоге:', error);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
  static async getDialogContacts(req, res) {
    try {
      const { userId } = req.params;

      // Поиск диалогов пользователя с последним сообщением
      const conversations = await Conversation.findAll({
        where: {
          [Op.or]: [{ user1Id: userId }, { user2Id: userId }],
        },
        include: [
          {
            model: User,
            as: 'user1',
            attributes: ['id', 'username', 'email', 'avatar'],
          },
          {
            model: User,
            as: 'user2',
            attributes: ['id', 'username', 'email', 'avatar'],
          },
          {
            model: Message,
            as: 'messages',
            attributes: ['id', 'content', 'sentAt'],
            limit: 1,
            order: [['sentAt', 'DESC']],
          },
        ],
      });

      // Формирование результата
      const contacts = conversations.map((conversation) => {
        const { user1, user2, messages } = conversation;
        const contact = userId == user1.id ? user2 : user1;
        const lastMessage = messages?.length > 0 ? messages[0] : null;
        return {
          id: contact.id,
          username: contact.username,
          email: contact.email,
          avatar: contact.avatar,
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                content: lastMessage.content,
                createdAt: lastMessage.createdAt,
              }
            : null,
        };
      });

      res.json(contacts);
    } catch (error) {
      console.error('Ошибка при получении контактов:', error);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }

  static async sendMessage2(req, res) {
    try {
      const { senderId, receiverId, content } = req.body;

      // Поиск диалога между пользователями
      let conversation = await Conversation.findOne({
        where: {
          [Op.or]: [
            { user1Id: senderId, user2Id: receiverId },
            { user1Id: receiverId, user2Id: senderId },
          ],
        },
      });

      // Если диалог не найден, создаем новый
      if (!conversation) {
        conversation = await Conversation.create({
          user1Id: senderId,
          user2Id: receiverId,
        });
      }

      // Создание сообщения
      const message = await Message.create({
        conversationId: conversation.id,
        senderId: senderId,
        receiverId: receiverId,
        content,
      });

      const receiver = await User.findByPk(receiverId, {
        attributes: ['id', 'username', 'avatar'],
      });
      const sender = await User.findByPk(senderId, {
        attributes: ['id', 'username', 'avatar'],
      });

      io.emit('msg', { receiver, sender, content, conversation });

      res.json({ message: 'Сообщение отправлено успешно' });
    } catch (error) {
      console.error('Ошибка при отправке сообщения:', error);
      res.status(500).json({ message: 'Внутренняя ошибка сервера' });
    }
  }
}
const PORT = 5000;

app.use(cors());
app.use(express.json());

// Роутеры и промежуточное ПО приложения

// Маршруты для регистрации и авторизации пользователя
app.post('/register', upload.single('avatar'), UserController.register);
app.post('/login', UserController.login);
app.get('/session', UserController.getSession);
app.get('/users/search', UserController.searchUsers);
app.get('/conversations', UserController.getConversations);
// app.get('/conversations/:conversationId', UserController.getDialogMessages);
app.get('/conversations2', UserController.getDialogMessages2);
// app.post('/messages', UserController.sendMessage);
app.post('/messages2', UserController.sendMessage2);
app.get('/users/:userId/dialog-contacts', UserController.getDialogContacts);
app.get('/avatar/:filename', (req, res) => {
  const filename = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', filename);

  res.sendFile(filePath);
});

// Обработка сокетов
io.on('connection', (socket) => {
  socket.on('joinConversation', async ({ roomId, userId }) => {
    roomUsers.get(socket.id).roomId = roomId;
    roomUsers.get(socket.id).userId = userId;

    try {
      const roomMember = await RoomMember.create({
        room_id: roomId,
        user_id: userId,
      });
      socket.join(roomUsers.get(socket.id).roomId);
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('sendMessage', async ({ roomId, userId, message }) => {
    try {
      const createdMessage = await Message.create({
        user_id: userId,
        message_text: message,
      });

      await createRoomMessage(createdMessage, roomId);

      const user = await User.findByPk(userId);

      io.to(roomId).emit('message', {
        messageId: createdMessage.message_id,
        username: user.username,
        avatar: user.avatar,
        text: createdMessage.message_text,
        createdAt: createdMessage.createdAt,
      });
    } catch (error) {
      console.error(error);
    }
  });

  socket.on('disconnect', async () => {
    try {
      await RoomMember.destroy({
        where: {
          room_id: roomUsers.get(socket.id).roomId,
          user_id: roomUsers.get(socket.id).userId,
        },
      });
      socket.leave(roomUsers.get(socket.id).roomId);

      roomUsers.delete(socket.id);
    } catch (error) {
      console.error(error);
    }
  });
});

// Запуск сервера
server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
});
