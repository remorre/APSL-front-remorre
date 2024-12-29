import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import { createServer } from 'http';
import { Server } from 'socket.io';

const app = express();
const httpServer = createServer(app);
const allowedOrigins = ['http://localhost:5173', 'http://localhost:5174'];
const io = new Server(httpServer, {
	cors: {
		origin: (origin, callback) => {
			if (origin === undefined || allowedOrigins.indexOf(origin) !== -1) {
				callback(null, true);
			} else {
				callback(new Error('Not allowed by CORS'));
			}
		},
		methods: ['GET', 'POST'],
	},
});

app.use(cors());
app.use(express.json());

// MongoDB connection
mongoose
	.connect(
		'mongodb+srv://mishaushakoff2017:AlibabaInvest1237-@cluster0.gndi3.mongodb.net/tasks?retryWrites=true&w=majority&appName=Cluster0',
	)
	.then(() => {
		console.log('DB ok');
	})
	.catch(err => console.log('DB err', err));

// Schemas
const { Schema } = mongoose;

const TaskSchema = new Schema({
	title: { type: String, required: true },
	description: { type: String, required: true },
	category: { type: String, required: true },
	skills: { type: String, required: true },
	reward: { type: String, required: true },
	deadline: { type: String, required: true },
	userAddress: { type: String, required: true },
});

const Task = mongoose.model('Task', TaskSchema);

const ListChatSchema = new Schema({
	chatId: String,
	dealer: String,
	customer: String,
	send: Number,
	payment: Number,
	finalize: Number,
	dispute: Number,
	address: String,
	reward: String,
});

const ListChat = mongoose.model('ListChat', ListChatSchema);

const ChatSchema = new Schema({
	chatId: String,
	message: {
		type: String,
		required: true,
	},
	sender: String,
	timestamp: { type: Date, default: Date.now },
});

const Chat = mongoose.model('Chat', ChatSchema);

// Routes
app.post('/newtask', async (req, res) => {
	try {
		console.log('Received task data:', req.body);

		const {
			title,
			description,
			category,
			skills,
			reward,
			deadline,
			userAddress,
		} = req.body;

		const newTask = new Task({
			title,
			description,
			category,
			skills,
			reward,
			deadline,
			userAddress,
		});

		const savedTask = await newTask.save();

		res.status(201).json({
			message: 'Task created successfully',
			task: savedTask,
		});
	} catch (error) {
		console.error('Error creating task:', error);
		res.status(500).json({
			message: 'Error creating task',
			error: error.message,
		});
	}
});

app.get('/gettasks', async (req, res) => {
	try {
		const tasks = await Task.find();
		res.status(200).json(tasks);
	} catch (error) {
		console.error('Error fetching tasks:', error);
		res.status(500).json({
			message: 'Error fetching tasks',
			error: error.message,
		});
	}
});

app.post('/check-or-create-chat', async (req, res) => {
	try {
		const { userAddress, currentUserAddress, reward } = req.body;
		let chat = await ListChat.findOne({
			$or: [
				{ dealer: currentUserAddress, customer: userAddress },
				{ dealer: userAddress, customer: currentUserAddress },
			],
		});

		if (!chat) {
			chat = new ListChat({
				chatId: new mongoose.Types.ObjectId(),
				dealer: currentUserAddress,
				customer: userAddress,
				send: 0,
				payment: 0,
				finalize: 0,
				dispute: 0,
				address: '',
				reward: reward,
			});
			await chat.save();
		}

		res.status(200).json({ chatId: chat.chatId });
	} catch (error) {
		console.error('Error checking/creating chat:', error);
		res.status(500).json({
			message: 'Error checking/creating chat',
			error: error.message,
		});
	}
});

app.get('/get-chats', async (req, res) => {
	try {
		const { currentUserAddress } = req.query;
		const chats = await ListChat.find({
			$or: [
				{ dealer: currentUserAddress },
				{ customer: currentUserAddress },
			],
		});
		res.status(200).json(chats);
	} catch (error) {
		console.error('Error fetching chats:', error);
		res.status(500).json({
			message: 'Error fetching chats',
			error: error.message,
		});
	}
});

app.get('/get-messages/:chatId', async (req, res) => {
	try {
		const { chatId } = req.params;
		const messages = await Chat.find({ chatId }).sort({ timestamp: 1 });
		res.status(200).json(messages);
	} catch (error) {
		console.error('Error fetching messages:', error);
		res.status(500).json({
			message: 'Error fetching messages',
			error: error.message,
		});
	}
});

app.post('/update-transaction-stage', async (req, res) => {
	try {
		const { chatId, stage } = req.body;

		// Map the stage names to the database field names
		const stageMap = {
			sendtransaction: 'send',
			payment: 'payment',
			finalizedeal: 'finalize',
			dispute: 'dispute',
		};

		const dbField = stageMap[stage];

		if (!dbField) {
			return res.status(400).json({ message: 'Invalid stage name' });
		}

		// Find the chat and increment the specified stage
		const updatedChat = await ListChat.findOneAndUpdate(
			{ chatId },
			{ $inc: { [dbField]: 1 } },
			{ new: true },
		);

		if (!updatedChat) {
			return res.status(404).json({ message: 'Chat not found' });
		}

		// Prepare the response data
		const stageData = {
			sendtransaction: updatedChat.send,
			payment: updatedChat.payment,
			finalizedeal: updatedChat.finalize,
			dispute: updatedChat.dispute,
		};

		res.status(200).json(stageData);
	} catch (error) {
		console.error('Error updating transaction stage:', error);
		res.status(500).json({
			message: 'Error updating transaction stage',
			error: error.message,
		});
	}
});

app.post('/update-address', async (req, res) => {
	try {
		const { chatId, address } = req.body;

		const updatedChat = await ListChat.findOneAndUpdate(
			{ chatId: chatId },
			{ address: address },
			{ new: true },
		);

		if (!updatedChat) {
			return res.status(404).json({ message: 'Chat not found' });
		}

		res.status(200).json({
			message: 'Address updated successfully',
			chat: updatedChat,
		});
	} catch (error) {
		console.error('Error updating address:', error);
		res.status(500).json({
			message: 'Error updating address',
			error: error.message,
		});
	}
});

app.get('/get-address/:chatId', async (req, res) => {
	try {
		const { chatId } = req.params;

		const chat = await ListChat.findOne({ chatId: chatId });

		if (!chat) {
			return res.status(404).json({ message: 'Chat not found' });
		}

		res.status(200).json({ address: chat.address });
	} catch (error) {
		console.error('Error fetching address:', error);
		res.status(500).json({
			message: 'Error fetching address',
			error: error.message,
		});
	}
});

app.get('/get-dealer/:chatId', async (req, res) => {
	try {
		const { chatId } = req.params;

		const chat = await ListChat.findOne({ chatId: chatId });

		if (!chat) {
			return res.status(404).json({ message: 'Chat not found' });
		}

		res.status(200).json({ dealer: chat.dealer });
	} catch (error) {
		console.error('Error fetching dealer:', error);
		res.status(500).json({
			message: 'Error fetching dealer',
			error: error.message,
		});
	}
});

app.get('/get-dealer-customer/:chatId', async (req, res) => {
	try {
		const { chatId } = req.params;

		const chat = await ListChat.findOne({ chatId: chatId });

		if (!chat) {
			return res.status(404).json({ message: 'Chat not found' });
		}

		res.status(200).json({ dealer: chat.dealer, customer: chat.customer });
	} catch (error) {
		console.error('Error fetching dealer:', error);
		res.status(500).json({
			message: 'Error fetching dealer',
			error: error.message,
		});
	}
});

app.get('/get-reward/:chatId', async (req, res) => {
	try {
		const { chatId } = req.params;

		const chat = await ListChat.findOne({ chatId: chatId });

		if (!chat) {
			return res.status(404).json({ message: 'Chat not found' });
		}

		res.status(200).json({ reward: chat.reward });
	} catch (error) {
		console.error('Error fetching dealer:', error);
		res.status(500).json({
			message: 'Error fetching dealer',
			error: error.message,
		});
	}
});

// Socket.io
io.on('connection', socket => {
	console.log('A user connected');

	socket.on('join', chatId => {
		socket.join(chatId);
	});

	socket.on('sendMessage', async ({ chatId, message }) => {
		console.log(message);
		try {
			const newMessage = new Chat({
				chatId,
				message: message.message,
				sender: message.sender,
				timestamp: new Date(),
			});
			await newMessage.save();

			io.to(chatId).emit('message', newMessage);
		} catch (error) {
			console.error('Error saving message:', error);
		}
	});

	socket.on('disconnect', () => {
		console.log('A user disconnected');
	});
});

// Start server
const PORT = process.env.PORT || 3000;
httpServer.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
});
