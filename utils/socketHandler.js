const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const Chat = require('../models/chatMessageModel');
const Salesman = require('../models/salesmanModel');
const Manager = require('../models/managerModel');
const Company = require('../models/companyModel');

module.exports = io => {
    io.on('connection', socket => {
        // Join
        socket.on('join', data => {
            try {
                const decoded = jwt.verify(data.token, process.env.JWT_SECRET);
                socket.join(decoded._id);
            } catch (error) {
                console.log('Invalid token in join.', data.token);
            }
        });

        socket.on('recentChats', async data => {
            try {
                const { token } = data;
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const userId = new mongoose.Types.ObjectId(decoded._id);

                // Aggregate recent chats
                const recentChats = await Chat.aggregate([
                    {
                        $match: {
                            $or: [{ senderId: userId }, { receiverId: userId }],
                            deletedBy: { $ne: userId },
                        },
                    },
                    { $sort: { date: -1 } }, // Sort by most recent messages
                    {
                        $group: {
                            _id: {
                                chatWith: {
                                    $cond: [
                                        { $eq: ['$senderId', userId] },
                                        '$receiverId',
                                        '$senderId',
                                    ],
                                },
                            },
                            chatId: { $first: '$_id' },
                            lastMessage: { $first: '$message' },
                            lastMessageDate: { $first: '$date' },
                            lastMessageSender: { $first: '$senderId' },
                            lastMessageReceiver: { $first: '$receiverId' },
                            unreadCount: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                { $ne: ['$senderId', userId] },
                                                {
                                                    $not: {
                                                        $in: [
                                                            userId,
                                                            {
                                                                $ifNull: [
                                                                    '$readBy',
                                                                    [],
                                                                ],
                                                            },
                                                        ],
                                                    },
                                                },
                                            ],
                                        },
                                        1,
                                        0,
                                    ],
                                },
                            },
                        },
                    },
                ]);

                // Fetch chat participants dynamically from their respective models
                for (let chat of recentChats) {
                    const chatWithId = chat._id.chatWith;
                    let userDetails = null;

                    const userModels = ['Salesman', 'Manager', 'Company'];
                    for (let modelName of userModels) {
                        const model = mongoose.model(modelName);
                        userDetails = await model
                            .findById(chatWithId)
                            .select('name images');
                        if (userDetails) break; // Stop once found
                    }

                    chat.chatWith = userDetails || {
                        _id: null,
                        name: 'Deleted User',
                        images: [],
                    };
                }

                socket.emit('recentChats', recentChats);
            } catch (error) {
                console.error('Error retrieving recent chats:', error.message);
                socket.emit('recentChats', {
                    success: false,
                    error: error.message,
                });
            }
        });

        socket.on('getChatMessages', async data => {
            try {
                const {
                    token,
                    senderId,
                    senderType,
                    receiverId,
                    receiverType,
                } = data;

                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const userId = decoded._id;

                if (
                    !['Salesman', 'Manager', 'Company'].includes(senderType) ||
                    !['Salesman', 'Manager', 'Company'].includes(receiverType)
                )
                    throw new Error('Invalid sender or receiver type');

                const messageData = await Chat.find({
                    $or: [
                        { senderId, senderType, receiverId, receiverType },
                        {
                            senderId: receiverId,
                            senderType: receiverType,
                            receiverId: senderId,
                            receiverType: senderType,
                        },
                    ],
                    deletedBy: { $ne: userId }, // Exclude messages deleted by this user
                })
                    .sort({ date: -1 })
                    .lean();

                // Fetch sender & receiver details dynamically
                for (let msg of messageData) {
                    const senderModel = mongoose.model(msg.senderType);
                    const receiverModel = mongoose.model(msg.receiverType);

                    msg.sender = (await senderModel
                        .findById(msg.senderId)
                        .select('name images fcmToken')) || {
                        _id: null,
                        name: 'Deleted User',
                        images: [],
                    };

                    msg.receiver = (await receiverModel
                        .findById(msg.receiverId)
                        .select('name images fcmToken')) || {
                        _id: null,
                        name: 'Deleted User',
                        images: [],
                    };
                }

                socket.emit('chatMessages', messageData);
            } catch (error) {
                console.error('Error retrieving messages:', error.message);
                socket.emit('chatMessages', {
                    success: false,
                    error: error.message,
                });
            }
        });

        socket.on('sendMessage', async data => {
            try {
                const {
                    token,
                    senderType,
                    receiverId,
                    receiverType,
                    message,
                    image,
                } = data;

                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const senderId = decoded._id;

                if (!['Salesman', 'Manager', 'Company'].includes(receiverType))
                    throw new Error('Invalid receiver type');
                if (!['Salesman', 'Manager', 'Company'].includes(senderType))
                    throw new Error('Invalid receiver type');

                let fileName = null;

                // Handle file upload
                if (image) {
                    const matches = image.match(
                        /^data:(image\/\w+|application\/pdf);base64,/
                    );
                    if (!matches) throw new Error('Invalid file format');

                    const mimeType = matches[1]; // e.g., "image/jpeg" or "application/pdf"
                    const fileExtension = mimeType.split('/')[1];

                    const base64Data = image.replace(
                        /^data:(image\/\w+|application\/pdf);base64,/,
                        ''
                    );

                    const uploadDir = path.join(process.cwd(), 'uploads');
                    if (!fs.existsSync(uploadDir)) {
                        fs.mkdirSync(uploadDir, { recursive: true });
                    }

                    fileName = `${Date.now()}.${fileExtension}`;
                    const absolutePath = path.join(uploadDir, fileName);

                    fs.writeFileSync(
                        absolutePath,
                        Buffer.from(base64Data, 'base64')
                    );
                }

                const chatMessage = await Chat.create({
                    senderId,
                    senderType,
                    receiverId,
                    receiverType,
                    message,
                    file: fileName ? `/uploads/${fileName}` : null,
                });

                // Find the receiver in the correct collection dynamically
                const receiverModel = mongoose.model(receiverType); // Get the correct model
                const receiverUser = await receiverModel
                    .findById(receiverId)
                    .select('fcmToken');

                if (!receiverUser) throw new Error('Receiver not found');

                const { deletedBy, readBy, ...messageToSend } =
                    chatMessage.toObject();

                // Send the message to the receiver via WebSocket
                io.to(receiverId).emit('receiveMessage', {
                    ...messageToSend,
                });

                // Send confirmation back to the sender
                socket.emit('receiveMessage', {
                    success: true,
                    ...messageToSend,
                });
            } catch (error) {
                console.error('Error sending message:', error.message);
                socket.emit('receiveMessage', {
                    success: false,
                    error: error.message,
                });
            }
        });

        socket.on('clearChat', async data => {
            try {
                const { token, receiverId } = data;
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const senderId = new mongoose.Types.ObjectId(decoded._id);

                // Check if chat exists between sender and receiver
                const chatExists = await Chat.findOne({
                    $or: [
                        { sender: senderId, receiver: receiverId },
                        { sender: receiverId, receiver: senderId },
                    ],
                });

                if (!chatExists)
                    return socket.emit('chatCleared', {
                        success: false,
                        message: 'No chat history found.',
                    });

                // Mark chat as deleted for the sender
                await Chat.updateMany(
                    {
                        $or: [
                            { sender: senderId, receiver: receiverId },
                            { sender: receiverId, receiver: senderId },
                        ],
                    },
                    { $addToSet: { deletedBy: senderId } }
                );

                socket.emit('chatCleared', {
                    success: true,
                    message: 'Chat cleared successfully.',
                });
            } catch (error) {
                console.error('Error clearing chat:', error.message);
                socket.emit('chatCleared', {
                    success: false,
                    error: error.message,
                });
            }
        });

        socket.on('messageRead', async data => {
            try {
                const { token, senderId } = data;
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const receiverId = new mongoose.Types.ObjectId(decoded._id);

                const unreadMessages = await Chat.find({
                    sender: senderId,
                    receiver: receiverId,
                    readBy: { $ne: receiverId }, // Only find unread messages
                });

                if (unreadMessages.length === 0)
                    return socket.emit('messageReadByReceiver', {
                        success: false,
                        message: 'No unread messages found.',
                    });

                await Chat.updateMany(
                    {
                        sender: senderId,
                        receiver: receiverId,
                        readBy: { $ne: receiverId },
                    },
                    { $addToSet: { readBy: receiverId } }
                );

                socket.emit('messageReadByReceiver', {
                    success: true,
                    message: 'Messages marked as read successfully.',
                });

                // Optionally, notify sender that their messages were read
                // socket.to(senderId).emit('messageReadNotification', {
                //     success: true,
                //     message: `Your messages to ${receiverId} have been read.`,
                // });
            } catch (error) {
                console.error('Error marking messages as read:', error.message);
                socket.emit('messageReadByReceiver', {
                    success: false,
                    error: error.message,
                });
            }
        });
    });
};
