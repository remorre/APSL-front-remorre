import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import axios from 'axios';
import CreateTaskForm from '../Components/CreateTaskForm';
import TaskDetailsModal from '../Components/TaskDetailsModal';

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

const categories = [
	'Design',
	'Development',
	'Art',
	'Writing',
	'Marketing',
	'Life',
	'Web3',
	'Other',
];

export default function ExchengePage() {
	const [tasks, setTasks] = useState<Task[]>([]);
	const [selectedCategory, setSelectedCategory] = useState<string | null>(
		null,
	);
	const [activeModal, setActiveModal] = useState<'create' | 'details' | null>(
		null,
	);
	const [selectedTask, setSelectedTask] = useState<Task | null>(null);
	const [expandedTasks, setExpandedTasks] = useState<{
		[key: string]: boolean;
	}>({});

	useEffect(() => {
		const fetchTasks = async () => {
			try {
				const response = await axios.get(
					'https://apslspace.run.place/gettasks',
				);
				setTasks(response.data);
			} catch (error) {
				console.error('Error fetching tasks:', error);
			}
		};

		fetchTasks();
	}, []);

	const filteredTasks = selectedCategory
		? tasks.filter(task => task.category === selectedCategory)
		: tasks;

	const closeModal = () => {
		setActiveModal(null);
		setSelectedTask(null);
	};

	const toggleTaskExpansion = (taskId: string) => {
		setExpandedTasks(prev => ({ ...prev, [taskId]: !prev[taskId] }));
	};

	return (
		<main className="flex-grow flex flex-col items-center justify-start px-8 py-20 relative z-10">
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5 }}
				className="text-center space-y-8 mb-12"
			>
				<h2 className="text-5xl font-extrabold leading-tight">
					Welcome to the{' '}
					<span className="text-white">Freelance Marketplace</span>
				</h2>
				<p className="text-xl text-gray-300 max-w-2xl mx-auto">
					Browse available tasks or create your own. Connect, work,
					and earn in the decentralized economy.
				</p>
			</motion.div>

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className="w-full max-w-4xl mb-8"
			>
				<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
					{categories.map(category => (
						<motion.button
							key={category}
							whileHover={{ scale: 1.05 }}
							whileTap={{ scale: 0.95 }}
							onClick={() => setSelectedCategory(category)}
							className={`p-4 rounded-lg font-semibold ${
								selectedCategory === category
									? 'bg-white text-black'
									: 'bg-white bg-opacity-10 text-white'
							}`}
						>
							{category}
						</motion.button>
					))}
				</div>
			</motion.div>

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ duration: 0.5, delay: 0.2 }}
				className="w-full max-w-4xl mb-8"
			>
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					onClick={() => setActiveModal('create')}
					className="w-full bg-white text-black font-semibold py-4 rounded-lg shadow-lg hover:shadow-xl transition duration-300"
				>
					Create Task
				</motion.button>
			</motion.div>

			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.5, delay: 0.4 }}
				className="w-full max-w-4xl"
			>
				<h3 className="text-3xl font-bold mb-6">
					{selectedCategory
						? `${selectedCategory} Tasks`
						: 'All Tasks'}
				</h3>
				<div className="space-y-6">
					<AnimatePresence>
						{filteredTasks.map(task => (
							<motion.div
								key={task._id}
								initial={{ opacity: 0, y: 20 }}
								animate={{ opacity: 1, y: 0 }}
								exit={{ opacity: 0, y: -20 }}
								whileHover={{ scale: 1.02 }}
								className="bg-white bg-opacity-10 p-6 rounded-lg cursor-pointer"
							>
								<div className="flex justify-between">
									<h4 className="text-xl font-semibold mb-2">
										{task.title}
									</h4>
									<h4 className="text-sm font-semibold mb-2">
										{task.userAddress.slice(0, 15) + '...'}
									</h4>
								</div>
								<div className="text-gray-400 mb-4 overflow-hidden">
									<p
										className={
											expandedTasks[task._id]
												? ''
												: 'line-clamp-3'
										}
									>
										{task.description}
									</p>
									{task.description.length > 150 && (
										<button
											onClick={() =>
												toggleTaskExpansion(task._id)
											}
											className="text-blue-400 hover:text-blue-300 mt-2 flex items-center"
										>
											{expandedTasks[task._id] ? (
												<>
													Show less{' '}
													<ChevronUp
														className="ml-1"
														size={16}
													/>
												</>
											) : (
												<>
													Read more{' '}
													<ChevronDown
														className="ml-1"
														size={16}
													/>
												</>
											)}
										</button>
									)}
								</div>
								<div className="flex justify-between items-center">
									<span className="text-white font-bold">
										Reward: {task.reward} TON
									</span>
									<motion.button
										whileHover={{ scale: 1.05 }}
										whileTap={{ scale: 0.95 }}
										className="px-4 py-2 bg-white text-black font-semibold rounded-md shadow-lg hover:shadow-xl transition duration-300"
										onClick={() => {
											setSelectedTask(task);
											setActiveModal('details');
										}}
									>
										View Details
									</motion.button>
								</div>
							</motion.div>
						))}
					</AnimatePresence>
				</div>
			</motion.div>

			<AnimatePresence>
				{activeModal === 'create' && (
					<motion.div
						initial={{ opacity: 0 }}
						animate={{ opacity: 1 }}
						exit={{ opacity: 0 }}
						className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
					>
						<motion.div
							initial={{ scale: 0.9, opacity: 0 }}
							animate={{ scale: 1, opacity: 1 }}
							exit={{ scale: 0.9, opacity: 0 }}
							className="bg-gray-900 p-8 rounded-lg w-full max-w-2xl relative"
						>
							<button
								onClick={closeModal}
								className="absolute top-4 right-4 text-white hover:text-gray-300"
							>
								<X size={24} />
							</button>
							<CreateTaskForm onClose={closeModal} />
						</motion.div>
					</motion.div>
				)}
			</AnimatePresence>

			<AnimatePresence>
				{activeModal === 'details' && selectedTask && (
					<TaskDetailsModal
						task={selectedTask}
						onClose={closeModal}
					/>
				)}
			</AnimatePresence>
		</main>
	);
}
