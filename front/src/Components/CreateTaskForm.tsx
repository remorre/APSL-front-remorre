import { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useTonAddress } from '@tonconnect/ui-react';

type FormData = {
	title: string;
	description: string;
	category: string;
	skills: string;
	reward: string;
	deadline: string;
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

export default function CreateTaskForm({ onClose }: { onClose: () => void }) {
	const [formData, setFormData] = useState<FormData>({
		title: '',
		description: '',
		category: '',
		skills: '',
		reward: '',
		deadline: '',
	});
	const [isSubmitting, setIsSubmitting] = useState(false);
	const userAddress = useTonAddress();

	const handleChange = (
		e: React.ChangeEvent<
			HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
		>,
	) => {
		const { name, value } = e.target;
		setFormData(prev => ({ ...prev, [name]: value }));
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setIsSubmitting(true);

		try {
			const dataToSend = {
				...formData,
				userAddress: userAddress || '',
			};

			// Log the data being sent
			console.log('Sending data:', dataToSend);

			const response = await axios.post(
				'http://localhost:3000/newtask',
				dataToSend,
				{
					headers: {
						'Content-Type': 'application/json',
					},
				},
			);

			console.log('Form submitted successfully:', response.data);
			onClose();
		} catch (error) {
			console.error('Error submitting form:', error);
		} finally {
			setIsSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			<h2 className="text-3xl font-bold text-white mb-6">
				Create New Task
			</h2>

			<div>
				<label
					htmlFor="title"
					className="block text-sm font-medium text-gray-300"
				>
					Title
				</label>
				<input
					type="text"
					id="title"
					name="title"
					value={formData.title}
					onChange={handleChange}
					required
					className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-10 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
			</div>

			<div>
				<label
					htmlFor="description"
					className="block text-sm font-medium text-gray-300"
				>
					Description
				</label>
				<textarea
					id="description"
					name="description"
					value={formData.description}
					onChange={handleChange}
					required
					rows={4}
					className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-10 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				></textarea>
			</div>

			<div>
				<label
					htmlFor="category"
					className="block text-sm font-medium text-gray-300"
				>
					Category
				</label>
				<select
					id="category"
					name="category"
					value={formData.category}
					onChange={handleChange}
					required
					className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				>
					<option value="" disabled>
						Select a category
					</option>
					{categories.map(category => (
						<option
							key={category}
							value={category}
							className="bg-gray-800"
						>
							{category}
						</option>
					))}
				</select>
			</div>

			<div>
				<label
					htmlFor="skills"
					className="block text-sm font-medium text-gray-300"
				>
					Required Skills (comma-separated)
				</label>
				<input
					type="text"
					id="skills"
					name="skills"
					value={formData.skills}
					onChange={handleChange}
					required
					className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-10 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
			</div>

			<div>
				<label
					htmlFor="reward"
					className="block text-sm font-medium text-gray-300"
				>
					Reward (in TON)
				</label>
				<input
					type="number"
					id="reward"
					name="reward"
					value={formData.reward}
					onChange={handleChange}
					required
					min="0"
					step="0.1"
					className="mt-1 block w-full px-3 py-2 bg-white bg-opacity-10 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
			</div>

			<div>
				<label
					htmlFor="deadline"
					className="block text-sm font-medium text-gray-300"
				>
					Deadline
				</label>
				<input
					type="date"
					id="deadline"
					name="deadline"
					value={formData.deadline}
					onChange={handleChange}
					required
					className="mt-1 block w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
				/>
			</div>

			<div className="flex justify-end space-x-4">
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					type="button"
					onClick={onClose}
					className="px-4 py-2 border border-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
				>
					Cancel
				</motion.button>
				<motion.button
					whileHover={{ scale: 1.05 }}
					whileTap={{ scale: 0.95 }}
					type="submit"
					disabled={isSubmitting}
					className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50"
				>
					{isSubmitting ? 'Submitting...' : 'Create Task'}
				</motion.button>
			</div>
		</form>
	);
}
