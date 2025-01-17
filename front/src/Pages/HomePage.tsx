import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

interface FAQItem {
	question: string;
	answer: string;
}

const FAQSection = ({ faqs }: { faqs: FAQItem[] }) => {
	const [openIndex, setOpenIndex] = useState<number | null>(null);

	const toggleQuestion = (index: number) => {
		setOpenIndex(openIndex === index ? null : index);
	};

	return (
		<div className="w-full max-w-3xl">
			{faqs.map((faq, index) => (
				<div key={index} className="mb-4">
					<button
						onClick={() => toggleQuestion(index)}
						className="flex justify-between items-center w-full text-left p-5 bg-white bg-opacity-10 rounded-t-lg hover:bg-opacity-20 transition-all duration-300"
					>
						<span className="text-lg font-semibold">
							{faq.question}
						</span>
						<motion.div
							animate={{ rotate: openIndex === index ? 180 : 0 }}
							transition={{ duration: 0.3 }}
						>
							<ChevronDown className="w-6 h-6" />
						</motion.div>
					</button>
					<AnimatePresence>
						{openIndex === index && (
							<motion.div
								initial={{ opacity: 0, height: 0 }}
								animate={{ opacity: 1, height: 'auto' }}
								exit={{ opacity: 0, height: 0 }}
								transition={{ duration: 0.3 }}
								className="overflow-hidden"
							>
								<p className="p-5 text-gray-300 bg-white bg-opacity-5 rounded-b-lg">
									{faq.answer}
								</p>
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			))}
		</div>
	);
};

export default function HomePage() {
	const featureDescriptions = [
		'Just 5% on each transaction, ensuring you keep more of your earnings.',
		'Our own smart contracts, regular audits and a reliable arbitration system.',
		"Think that's a disadvantage? Not anymore. We are changing the rules of the game.",
		'Regular contests and competitions for users, fostering a vibrant community and continuous improvement.',
		'We welcome feedback and actively work on enhancing our service to meet user needs.',
		'We are the first freelance exchange on TON, leading the way in decentralized opportunities!',
	];

	const faqs: FAQItem[] = [
		{
			question: 'How to use the platform?',
			answer: "It's simple. Connect your Ton wallet, choose the task that interests you, contact the client, discuss the details, and start the 4-stage deal. If you are the client, there are no fundamental differences. You create an order and wait for the performers to contact you. Nothing extra.",
		},
		{
			question: 'What is the uniqueness of APSL?',
			answer: 'We have abandoned the reputation system. We believe that everyone should have equal opportunities for execution. This is blockchain, not established freelance games. We are changing the rules.',
		},
		{
			question: 'How is dispute resolution handled?',
			answer: 'We have a reliable arbitration system in place. In case of disputes, our team reviews the case and makes a fair decision based on the evidence provided by both parties.',
		},
		{
			question: 'Is my data safe?',
			answer: "Yes, that's right. Imagine, we don't even collect hidden analytics. Your information is your property.",
		},
		{
			question: 'What are the fees for using the platform?',
			answer: 'We charge a low 5% fee on each transaction, ensuring you keep the majority of your earnings.',
		},
		{
			question: 'What does the 4-stage deal represent?',
			answer: 'Since we work with a smart contract, each deal must go through it to ensure security guarantees for each party. You will see more in the chat window.',
		},
	];

	return (
		<>
			<main className="flex-grow flex flex-col items-center justify-center px-8 py-20 relative z-10">
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5 }}
					className="text-center space-y-8"
				>
					<h2 className="text-5xl font-extrabold leading-tight">
						The simplest decentralized freelance exchange
						<br />
						<span className="text-white">on TON</span>
					</h2>
					<p className="text-xl text-gray-300 max-w-2xl mx-auto">
						Connect your wallet, create an order, wait for it to be
						completed - nothing complicated. Ordered - received.
						Powered by TON blockchain technology.
					</p>
				</motion.div>

				<motion.div
					initial={{ opacity: 0.5, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.2 }}
					className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 backdrop-blur-0"
				>
					{[
						'Low Trading Fees',
						'High Reliability',
						'No Reputation Requirements',
						'Commitment to Development',
						'Responsive Interface',
						'Pioneers in Freelancing',
					].map((feature, index) => (
						<div
							key={index}
							className="bg-white bg-opacity-10 p-6 rounded-lg"
						>
							<h3 className="text-xl font-semibold mb-2">
								{feature}
							</h3>
							<p className="text-gray-400">
								{featureDescriptions[index]}
							</p>
						</div>
					))}
				</motion.div>

				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.4 }}
					className="mt-16 w-full flex flex-col items-center"
				>
					<h2 className="text-4xl font-bold mb-8 text-center">
						Have questions?
					</h2>
					<div className="w-full max-w-3xl">
						<FAQSection faqs={faqs} />
					</div>
				</motion.div>
			</main>
		</>
	);
}
