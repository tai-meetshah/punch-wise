const jwt = require('jsonwebtoken');

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

                const userId = decoded._id;
                const recentChats = await Chat.aggregate([
                    {
                        $match: {
                            $or: [
                                {
                                    sender: new mongoose.Types.ObjectId(
                                        userId.toString()
                                    ),
                                },
                                {
                                    receiver: new mongoose.Types.ObjectId(
                                        userId.toString()
                                    ),
                                },
                            ],
                            deletedBy: {
                                $ne: new mongoose.Types.ObjectId(
                                    userId.toString()
                                ),
                            },
                        },
                    },
                    {
                        $sort: { date: -1 }, // Sort messages by most recent
                    },
                    {
                        $group: {
                            _id: {
                                chatWith: {
                                    $cond: [
                                        {
                                            $eq: [
                                                '$sender',
                                                new mongoose.Types.ObjectId(
                                                    userId.toString()
                                                ),
                                            ],
                                        },
                                        '$receiver',
                                        '$sender',
                                    ],
                                },
                            },
                            chatId: { $first: '$_id' },
                            lastMessage: { $first: '$message' },
                            lastMessageDate: { $first: '$date' },
                            lastMessageSender: { $first: '$sender' },
                            lastMessageReceiver: {
                                $first: '$receiver',
                            },
                            unreadCount: {
                                $sum: {
                                    $cond: [
                                        {
                                            $and: [
                                                {
                                                    $ne: [
                                                        '$sender',
                                                        new mongoose.Types.ObjectId(
                                                            userId.toString()
                                                        ),
                                                    ],
                                                },
                                                {
                                                    $not: {
                                                        $in: [
                                                            new mongoose.Types.ObjectId(
                                                                userId.toString()
                                                            ),
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
                    {
                        $lookup: {
                            from: 'users',
                            localField: '_id.chatWith',
                            foreignField: '_id',
                            as: 'chatWithUser',
                        },
                    },
                    {
                        $unwind: '$chatWithUser',
                    },
                    {
                        $project: {
                            chatWithName: '$chatWithUser.name',
                            images: '$chatWithUser.images',
                            lastMessage: 1,
                            lastMessageDate: 1,
                            lastMessageSender: 1,
                            lastMessageReceiver: 1,
                            unreadCount: 1,
                            _id: 0,
                            chatId: 1,
                        },
                    },
                    {
                        $sort: { lastMessageDate: -1 }, // Ensure sorting by latest message
                    },
                ]);

                socket.emit('recentChats', recentChats);
            } catch (error) {
                console.error('Error retrieving old messages:', error.message);
                socket.emit('chatMessages', {
                    success: false,
                    error: error.message,
                });
            }
        });

        socket.on('getChatMessages', async data => {
            try {
                const { token, sender, receiver } = data;

                const decoded = jwt.verify(token, process.env.JWT_SECRET);

                const messageData = await Chat.find({
                    $or: [
                        { sender: sender, receiver: receiver },
                        { sender: receiver, receiver: sender },
                    ],
                    deletedBy: { $ne: decoded._id },
                })
                    .populate({
                        path: 'sender',
                        select: 'name images fcmToken',
                    })
                    .populate({
                        path: 'receiver',
                        select: 'name images fcmToken',
                    })
                    .select('-__v -deletedBy')
                    .sort({ date: -1 });

                const messages = messageData.map(msg => ({
                    ...msg.toObject(),
                    sender: msg.sender || {
                        _id: null,
                        name: 'Deleted User',
                        images: [],
                    },
                    receiver: msg.receiver || {
                        _id: null,
                        name: 'Deleted User',
                        images: [],
                    },
                }));
                socket.emit('chatMessages', messages);
            } catch (error) {
                console.error('Error retrieving old messages:', error.message);
                socket.emit('chatMessages', {
                    success: false,
                    error: error.message,
                });
            }
        });

        socket.on('sendMessage', async data => {
            try {
                const { token, receiverId, receiverType, message, image } =
                    data;

                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                const senderId = decoded._id;
                const senderType = decoded.role; // Ensure role exists in your token payload

                if (!['Salesman', 'Manager', 'Company'].includes(receiverType))
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

                console.log('receiverModel: ', receiverModel);
                console.log('receiverUser:', receiverUser);

                // const notification = await Notification.create({
                //     sentTo: [receiverId],
                //     title: 'New Message',
                //     body: message,
                //     senderId,
                //     senderType,
                //     receiverId,
                //     receiverType,
                //     type: 'chat notification',
                // });

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
                const { token, receiver } = data;

                const decoded = jwt.verify(token, process.env.JWT_SECRET);

                const senderId = decoded._id;

                const result = await Chat.updateMany(
                    {
                        $or: [
                            { sender: senderId, receiver },
                            { sender: receiver, receiver: senderId },
                        ],
                    },
                    { $addToSet: { deletedBy: senderId } }
                );

                socket.emit('chatCleared', {
                    success: true,
                    message: 'Cleared chat successfully.',
                });
            } catch (error) {
                console.error('Error sending message:', error.message);
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
                const receiverId = decoded._id;

                await Chat.updateMany(
                    {
                        sender: senderId,
                        receiver: receiverId,
                        readBy: { $ne: receiverId }, // Only update messages not already read
                    },
                    { $addToSet: { readBy: receiverId } }
                );

                socket.emit('messageReadByReceiver', {
                    success: true,
                    message: 'Message Read By Receiver successfully.',
                });
            } catch (error) {
                console.error('Error sending message:', error.message);
            }
        });
    });
};
