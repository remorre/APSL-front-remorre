import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Send, ChevronLeft } from 'lucide-react';
import { useParams, useNavigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import axios from 'axios';
import { useTonAddress } from '@tonconnect/ui-react';
import TransactionMenu from '../Components/TransactionMenu';

type Chat = {
	chatId: string;
	dealer: string;
	customer: string;
	_id: string;
	send: number;
	payment: number;
	finalize: number;
	dispute: number;
};

type Message = {
	chatId: string;
	message: string;
	sender: string;
	timestamp: string;
};

export default function ChatPage() {
	const [chats, setChats] = useState<Chat[]>([]);
	const [messages, setMessages] = useState<Message[]>([]);
	const [selectedChat, setSelectedChat] = useState<Chat | null>(null);
	const [newMessage, setNewMessage] = useState('');
	const messagesEndRef = useRef<HTMLDivElement>(null);
	const socketRef = useRef<Socket | null>(null);
	const { chatId } = useParams<{ chatId: string }>();
	const [dealer, setDealer] = useState<string | null>(null);
	const address = useTonAddress();
	const navigate = useNavigate();

	useEffect(() => {
		socketRef.current = io('http://localhost:3000');

		socketRef.current.on('connect', () => {
			console.log('Connected to server');
			if (chatId) {
				socketRef.current?.emit('join', chatId);
			}
		});

		socketRef.current.on('message', (message: Message) => {
			if (message.chatId === chatId) {
				setMessages(prevMessages => [...prevMessages, message]);
			}
		});

		return () => {
			socketRef.current?.disconnect();
		};
	}, [chatId]);

	useEffect(() => {
		const fetchDealer = async () => {
			if (chatId) {
				try {
					const response = await axios.get(
						`http://localhost:3000/get-dealer/${chatId}`,
					);
					setDealer(response.data.dealer);
				} catch (error) {
					console.error('Error fetching dealer:', error);
				}
			}
		};

		fetchDealer();
	}, [chatId]);

	useEffect(() => {
		const fetchChats = async () => {
			try {
				const response = await axios.get(
					'http://localhost:3000/get-chats',
					{
						params: { currentUserAddress: address },
					},
				);
				setChats(response.data);
			} catch (error) {
				console.error('Error fetching chats:', error);
			}
		};

		fetchChats();
	}, [address]);

	useEffect(() => {
		const fetchMessages = async () => {
			try {
				const response = await fetch(
					`http://localhost:3000/get-messages/${chatId}`,
				);
				const data = await response.json();
				setMessages(data);
			} catch (error) {
				console.error('Error fetching messages:', error);
			}
		};

		if (chatId) {
			fetchMessages();
			setMessages([]); // Clear messages when chatId changes
		}
	}, [chatId]);

	useEffect(() => {
		if (chatId) {
			const selectedChat = chats.find(chat => chat.chatId === chatId);
			if (selectedChat) {
				setSelectedChat(selectedChat);
			}
		}
	}, [chatId, chats]);

	const handleSendMessage = () => {
		if (newMessage.trim() && chatId) {
			const newMsg: Message = {
				chatId: chatId,
				sender: address || '',
				message: newMessage,
				timestamp: new Date().toISOString(),
			};
			socketRef.current?.emit('sendMessage', { chatId, message: newMsg });
			setNewMessage('');
			messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
		}
	};

	useEffect(() => {
		const updateChatHeight = () => {
			const headerHeight = 80;
			const footerHeight = 80;
			const chatContainer = document.getElementById('chat-container');
			if (chatContainer) {
				chatContainer.style.height = `calc(100vh - ${
					headerHeight + footerHeight
				}px)`;
			}
		};

		updateChatHeight();
		window.addEventListener('resize', updateChatHeight);

		return () => window.removeEventListener('resize', updateChatHeight);
	}, []);

	const handleStageAction = async (index: number) => {
		if (selectedChat) {
			try {
				const stageName = [
					'sendtransaction',
					'payment',
					'finalizedeal',
					'dispute',
				][index];
				const response = await axios.post(
					'http://localhost:3000/update-transaction-stage',
					{
						chatId: selectedChat.chatId,
						stage: stageName,
					},
				);

				const updatedStageData = response.data;
				setSelectedChat(prevChat => {
					if (prevChat) {
						return {
							...prevChat,
							send: updatedStageData.sendtransaction,
							payment: updatedStageData.payment,
							finalize: updatedStageData.finalizedeal,
							dispute: updatedStageData.dispute,
						};
					}
					return prevChat;
				});
			} catch (error) {
				console.error('Error updating transaction stage:', error);
			}
		}
	};

	const getChatName = (chat: Chat) => {
		const otherUser = chat.dealer === address ? chat.customer : chat.dealer;
		return otherUser ? otherUser.slice(0, 10) + '...' : 'Unknown';
	};

	return (
		<div
			id="chat-container"
			className="flex flex-col md:flex-row bg-black bg-opacity-50 text-white p-4 overflow-hidden"
		>
			{/* Chat List */}
			<motion.div
				initial={{ opacity: 0, x: -20 }}
				animate={{ opacity: 1, x: 0 }}
				transition={{ duration: 0.5 }}
				className={`w-full md:w-1/3 bg-white bg-opacity-10 p-4 overflow-y-auto rounded-lg md:mr-2 ${
					selectedChat ? 'hidden md:block' : ''
				} custom-scrollbar`}
			>
				<h2 className="text-2xl font-bold mb-4">Chats</h2>
				{chats.map(chat => (
					<motion.div
						key={chat.chatId}
						whileHover={{ scale: 1.02 }}
						whileTap={{ scale: 0.98 }}
						className="bg-white bg-opacity-10 p-4 rounded-lg mb-2 cursor-pointer"
						onClick={() => navigate(`/chats/${chat.chatId}`)}
					>
						<h3 className="font-semibold">{getChatName(chat)}</h3>
						<p className="text-sm text-gray-300">
							Click to view conversation
						</p>
					</motion.div>
				))}
			</motion.div>

			{/* Chat Window */}
			{selectedChat && (
				<motion.div
					key={selectedChat.chatId}
					initial={{ opacity: 0, x: 20 }}
					animate={{ opacity: 1, x: 0 }}
					exit={{ opacity: 0, x: 20 }}
					transition={{ duration: 0.5 }}
					className="w-full md:w-2/3 flex flex-col bg-white bg-opacity-10 rounded-lg md:ml-2"
				>
					{/* Chat Header */}
					<div className="bg-white bg-opacity-10 p-4 flex items-center justify-between rounded-t-lg">
						<button
							className="md:hidden mr-2"
							onClick={() => navigate('/chats')}
						>
							<ChevronLeft size={24} />
						</button>
						<h2 className="text-xl font-semibold">
							{getChatName(selectedChat)}
						</h2>
						<TransactionMenu
							onStageAction={handleStageAction}
							initialStages={{
								send: selectedChat.send,
								payment: selectedChat.payment,
								finalize: selectedChat.finalize,
								dispute: selectedChat.dispute,
							}}
							chatId={chatId}
							dealer1={dealer}
							address1={address}
						/>
					</div>

					{/* Messages */}
					<div className="flex-grow p-4 overflow-auto custom-scrollbar">
						{messages.map(message => (
							<motion.div
								key={`${message.chatId}-${message.timestamp}`} // Уникальный ключ
								initial={{ opacity: 0, y: 10 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.3 }}
								className={`mb-4 ${
									message.sender === address
										? 'text-right'
										: 'text-left'
								}`}
							>
								<div
									className={`inline-block p-3 rounded-lg ${
										message.sender === address
											? 'bg-blue-600 bg-opacity-80'
											: 'bg-white bg-opacity-10'
									}`}
								>
									<p>{message.message}</p>
									<span className="text-xs text-gray-400 mt-1 block">
										{new Date(
											message.timestamp,
										).toLocaleTimeString([], {
											hour: '2-digit',
											minute: '2-digit',
										})}
									</span>
								</div>
							</motion.div>
						))}
						<div ref={messagesEndRef} />
					</div>

					{/* Message Input */}
					<div className="bg-white bg-opacity-10 p-4 rounded-b-lg">
						<div className="flex items-center">
							<input
								type="text"
								value={newMessage}
								onChange={e => setNewMessage(e.target.value)}
								onKeyDown={e =>
									e.key === 'Enter' && handleSendMessage()
								}
								placeholder="Type your message..."
								className="flex-grow px-4 py-2 bg-white bg-opacity-10 text-white rounded-md focus:outline-none"
							/>
							<button
								onClick={handleSendMessage}
								className="px-4 py-2 bg-blue-600 bg-opacity-80 text-white rounded-md ml-1 hover:bg-opacity-100 focus:outline-none"
							>
								<Send size={20} />
							</button>
						</div>
					</div>
				</motion.div>
			)}
		</div>
	);
}
