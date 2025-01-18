import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useTonAddress } from '@tonconnect/ui-react';

type Task = {
	_id: string;
	title: string;
	description: string;
	reward: string;
	category: string;
	skills?: string;
	deadline?: string;
	userAddress: string;
};

type TaskDetailsModalProps = {
	task: Task;
	onClose: () => void;
};

export default function TaskDetailsModal({
	task,
	onClose,
}: TaskDetailsModalProps) {
	const [isLoading, setIsLoading] = useState(false);
	const navigate = useNavigate();

	const address = useTonAddress();

	const handleChatClick = async () => {
		setIsLoading(true);
		try {
			const response = await axios.post(
				'https://apslspace.run.place/check-or-create-chat',
				{
					userAddress: task.userAddress,
					currentUserAddress: address,
					reward: task.reward,
				},
			);
			setIsLoading(false);
			navigate(`/chats/${response.data.chatId}`);
		} catch (error) {
			console.error('Error checking/creating chat:', error);
			setIsLoading(false);
		}
	};

	console.log(task);

	const formatDate = (dateString: string) => {
		const options: Intl.DateTimeFormatOptions = {
			year: 'numeric',
			month: 'long',
			day: 'numeric',
		};
		const date = new Date(dateString);
		return date.toLocaleDateString('ru-RU', options);
	};

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-100 p-4"
		>
			<motion.div
				initial={{ scale: 0.9, opacity: 0 }}
				animate={{ scale: 1, opacity: 1 }}
				exit={{ scale: 0.9, opacity: 0 }}
				className="bg-black border-2 border-gray-500 font-medium rounded-lg max-w-2xl relative flex flex-col"
			>
				<div className="p-8">
					<button
						onClick={onClose}
						className="absolute top-4 right-4 text-white hover:text-gray-300"
					>
						<X size={24} />
					</button>
					<h2 className="text-3xl font-bold text-white mb-6">
						{task.title}
					</h2>
					<div className="space-y-4">
						<p className="text-gray-300 whitespace-pre-wrap">
							{task.description}
						</p>
						<div className="flex justify-between">
							<span className="text-white font-bold">
								Reward: {task.reward + ' TON'}
							</span>
							<span className="text-white">
								Category: {task.category}
							</span>
						</div>
						{task.skills && (
							<div>
								<h3 className="text-xl font-semibold text-white mb-2">
									Required Skills:
								</h3>
								<p className="text-gray-300">{task.skills}</p>
							</div>
						)}
						{task.deadline && (
							<div>
								<h3 className="text-xl font-semibold text-white mb-2">
									Deadline:
								</h3>
								<p className="text-gray-300">
									{formatDate(task.deadline)}
								</p>
							</div>
						)}
						{task.userAddress && (
							<div>
								<h3 className="text-xl font-semibold text-white mb-2">
									Customer wallet:
								</h3>
								<p className="text-gray-300">
									{task.userAddress}
								</p>
							</div>
						)}
					</div>
				</div>
				<div className="p-8 border-t border-gray-700">
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className="w-full px-4 py-2 bg-white text-black rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800"
						onClick={handleChatClick}
						disabled={isLoading}
					>
						{isLoading ? (
							<span className="flex items-center justify-center">
								<svg
									className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
									xmlns="http://www.w3.org/2000/svg"
									fill="none"
									viewBox="0 0 24 24"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
									></circle>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									></path>
								</svg>
								Loading...
							</span>
						) : (
							'Chat with the customer'
						)}
					</motion.button>
				</div>
			</motion.div>
		</motion.div>
	);
}
