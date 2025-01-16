import express from 'express';
import mongoose from 'mongoose';
import bodyParser from 'body-parser';
import { exec } from 'child_process';
import { createServer } from 'http';
import { Server } from 'socket.io';
import path from 'path';
import fs from 'fs';
import cors from 'cors';

const app = express();
const httpServer = createServer(app);
const allowedOrigins = ['https://apsl.space'];
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
app.use(bodyParser.json());

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

		const { title, description, category, skills, reward, deadline, userAddress } = req.body;

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
	} catch (error: any) {
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
	} catch (error: any) {
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
	} catch (error: any) {
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
			$or: [{ dealer: currentUserAddress }, { customer: currentUserAddress }],
		});
		res.status(200).json(chats);
	} catch (error: any) {
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
	} catch (error: any) {
		console.error('Error fetching messages:', error);
		res.status(500).json({
			message: 'Error fetching messages',
			error: error.message,
		});
	}
});

type StageKey = 'sendtransaction' | 'payment' | 'finalizedeal' | 'dispute';

const stageMap: Record<StageKey, string> = {
	sendtransaction: 'send',
	payment: 'payment',
	finalizedeal: 'finalize',
	dispute: 'dispute',
};

function isStageKey(value: string): value is StageKey {
	return Object.keys(stageMap).includes(value);
}

app.post('/update-transaction-stage', async (req: any, res: any) => {
	try {
		const { chatId, stage } = req.body;

		// Map the stage names to the database field names
		const stageMap = {
			sendtransaction: 'send',
			payment: 'payment',
			finalizedeal: 'finalize',
			dispute: 'dispute',
		};

		if (!isStageKey(stage)) {
			return res.status(400).json({ message: 'Invalid stage name' });
		}

		const dbField = stageMap[stage];

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
	} catch (error: any) {
		console.error('Error updating transaction stage:', error);
		res.status(500).json({
			message: 'Error updating transaction stage',
			error: error.message,
		});
	}
});

app.post('/update-address', async (req: any, res: any) => {
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
	} catch (error: any) {
		console.error('Error updating address:', error);
		res.status(500).json({
			message: 'Error updating address',
			error: error.message,
		});
	}
});

app.get('/get-address/:chatId', async (req: any, res: any) => {
	try {
		const { chatId } = req.params;

		const chat = await ListChat.findOne({ chatId: chatId });

		if (!chat) {
			return res.status(404).json({ message: 'Chat not found' });
		}

		res.status(200).json({ address: chat.address });
	} catch (error: any) {
		console.error('Error fetching address:', error);
		res.status(500).json({
			message: 'Error fetching address',
			error: error.message,
		});
	}
});

app.get('/get-dealer/:chatId', async (req: any, res: any) => {
	try {
		const { chatId } = req.params;

		const chat = await ListChat.findOne({ chatId: chatId });

		if (!chat) {
			return res.status(404).json({ message: 'Chat not found' });
		}

		res.status(200).json({ dealer: chat.dealer });
	} catch (error: any) {
		console.error('Error fetching dealer:', error);
		res.status(500).json({
			message: 'Error fetching dealer',
			error: error.message,
		});
	}
});

app.get('/get-dealer-customer/:chatId', async (req: any, res: any) => {
	try {
		const { chatId } = req.params;

		const chat = await ListChat.findOne({ chatId: chatId });

		if (!chat) {
			return res.status(404).json({ message: 'Chat not found' });
		}

		res.status(200).json({ dealer: chat.dealer, customer: chat.customer });
	} catch (error: any) {
		console.error('Error fetching dealer:', error);
		res.status(500).json({
			message: 'Error fetching dealer',
			error: error.message,
		});
	}
});

app.get('/get-reward/:chatId', async (req: any, res: any) => {
	try {
		const { chatId } = req.params;

		const chat = await ListChat.findOne({ chatId: chatId });

		if (!chat) {
			return res.status(404).json({ message: 'Chat not found' });
		}

		res.status(200).json({ reward: chat.reward });
	} catch (error: any) {
		console.error('Error fetching dealer:', error);
		res.status(500).json({
			message: 'Error fetching dealer',
			error: error.message,
		});
	}
});

app.post('/compile', async (req: any, res: any) => {
	const { dealer, customer } = req.body;

	if (!dealer || !customer) {
		return res.status(400).json({ error: 'Missing required fields' });
	}

	// Создание папки и файла contract.tact
	const sourcesPath = path.join(__dirname, 'sources');
	const outputPath = path.join(sourcesPath, 'temp');
	const contractPath = path.join(outputPath, 'contract.tact');

	fs.mkdirSync(outputPath, { recursive: true });
	fs.writeFileSync(
		contractPath,
		`import \"@stdlib/deploy\";\n\ncontract TactApsl with Deployable {\n    PaymentNum: Int as uint8;\n    EndNum: Int as uint8;\n    customerAmount: Int as coins;  \n    dealerGuarantee: Int as coins; \n    owner: Address = address(\"UQCvpZAXC3sFrBY9yJ3rNXtEBvgF9mgwZLtlHIPwr4g_4-OR\");\n    dealer: Address = address(\"${dealer}\");\n    customer: Address = address(\"${customer}\");\n\n    init() {\n        self.PaymentNum = 0;\n        self.EndNum = 0;\n        self.customerAmount = 0;  \n        self.dealerGuarantee = 0; \n    }\n\n    receive(\"Payment\") {\n        if (sender() == self.dealer) {\n            self.PaymentNum = self.PaymentNum + 1;\n            self.dealerGuarantee = myBalance() - self.customerAmount;\n        } else if (sender() == self.customer) {\n            self.PaymentNum = self.PaymentNum + 1;\n            self.customerAmount = myBalance() - self.dealerGuarantee;\n        } else {dump(\"Access denied\")}}\n\n    receive(\"End\") {\n        if (sender() == self.dealer) {\n            self.EndNum = self.EndNum + 1;\n        } else if (sender() == self.customer) {\n            self.EndNum = self.EndNum + 1;\n        } else {dump(\"Access denied\")}\n\n        if (self.EndNum == 2) {\n            send(SendParameters{\n            to: self.dealer,\n            bounce: true,\n            value: self.dealerGuarantee + (self.customerAmount - (self.customerAmount / 20)) - context().value,\n            mode: SendRemainingValue + SendIgnoreErrors\n            });\n\n            send(SendParameters{\n            to: self.owner,\n            bounce: true,\n            value: 0,\n            mode: SendRemainingBalance + SendIgnoreErrors\n            })\n        }\n    }\n}`,
	);

	// Запуск билда
	exec(
		`yarn tact --config ./tact.config.json`,
		{ cwd: __dirname },
		async (error, stdout, stderr) => {
			if (error) {
				console.error(`Error during compilation: ${stderr}`);
				return res.status(500).json({ error: 'Compilation failed' });
			}

			try {
				// Динамический импорт модуля
				const modulePath = `./sources/temp/output/APSL_TactApsl.ts`;
				const { TactApsl } = await import(modulePath);

				const initResult = await TactApsl.init();

				const result = () => {
					return {
						code: initResult.code.toBoc().toString('base64'),
						data: initResult.data.toBoc().toString('base64'),
					};
				};
				const m = result();
				console.log(m);
				res.json(m);
				fs.rm(sourcesPath, { recursive: true, force: true }, err => {
					if (err) {
						console.error('Error deleting sources folder:', err);
					} else {
						console.log('Sources folder deleted successfully');
					}
				});
			} catch (importError) {
				console.error(`Error importing module: ${importError}`);
				res.status(500).json({ error: 'Failed to import module' });
			}
		},
	);
});

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

httpServer.listen(3000, () => {
	console.log(`Server running on port ${3000}`);
});
