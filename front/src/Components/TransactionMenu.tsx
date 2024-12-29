import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Info } from 'lucide-react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import {
	beginCell,
	Cell,
	contractAddress,
	StateInit,
	storeStateInit,
	Address,
	toNano,
} from '@ton/core';
import axios from 'axios';

type TransactionStage = {
	name: string;
	buttonText: string;
	count: number;
	maxCount: number;
	completed: boolean;
	info: string;
};

type TransactionMenuProps = {
	onStageAction: (index: number) => void;
	initialStages: {
		send: number;
		payment: number;
		finalize: number;
		dispute: number;
	};
	chatId: string | undefined;
	dealer1: string | null;
	address1: string | null;
};

export default function TransactionMenu({
	onStageAction,
	initialStages,
	chatId,
	dealer1,
	address1,
}: TransactionMenuProps) {
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const [activeTooltip, setActiveTooltip] = useState<number | null>(null);
	const menuRef = useRef<HTMLDivElement>(null);
	const [transactionStages, setTransactionStages] = useState<
		TransactionStage[]
	>([
		{
			name: 'Deploy contract',
			buttonText: 'Deploy',
			count: initialStages.send,
			maxCount: 1,
			completed: initialStages.send >= 1,
			info: 'Stage 1 - Initialization of the Deal. Customer and contractor confirm the initiation of the deal with each other by deploying a contract.',
		},
		{
			name: 'Payment',
			buttonText: 'Pay',
			count: initialStages.payment,
			maxCount: 2,
			completed: initialStages.payment >= 2,
			info: 'Stage 2 - Customer pays the specified amount outlined in the assignment, while the contractor pays 10% of that amount as a security deposit, which will be used for compensation in case of any damages.',
		},
		{
			name: 'Finalize Deal',
			buttonText: 'Finalize',
			count: initialStages.finalize,
			maxCount: 2,
			completed: initialStages.finalize >= 2,
			info: "Stage 3 - If everything proceeds successfully, the funds that were frozen under the contract for the customer are transferred to the Contractor, while the contractor's security deposit is returned without any fees. The platform charges a commission solely on the funds from the customers.",
		},
		{
			name: 'Dispute',
			buttonText: 'Open Dispute',
			count: initialStages.dispute,
			maxCount: 2,
			completed: initialStages.dispute >= 2,
			info: "Stage 4 - If any extraordinary circumstances arise, the platform's arbitrator intervenes and resolves the issue in a court-like format, determining who violated the terms of the fair deal.",
		},
	]);
	const [tonConnectUI] = useTonConnectUI();

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				menuRef.current &&
				!menuRef.current.contains(event.target as Node)
			) {
				setIsMenuOpen(false);
			}
		};

		document.addEventListener('mousedown', handleClickOutside);
		return () => {
			document.removeEventListener('mousedown', handleClickOutside);
		};
	}, []);

	const transaction = async (index: number) => {
		let address: any;
		const response1 = await axios.get(
			`http://localhost:3000/get-dealer-customer/${chatId}`,
		);
		if (index === 0) {
			const dealer = response1.data.dealer;
			const customer = response1.data.customer;

			const response = await axios.post('http://localhost:8888/compile', {
				dealer: dealer,
				customer: customer,
			});
			const { code, data } = response.data;
			const init = {
				code: Cell.fromBase64(`${code}`),
				data: Cell.fromBase64(`${data}`),
			} satisfies StateInit;
			address = contractAddress(0, init);

			const stateInit = beginCell().store(storeStateInit(init)).endCell();
			await tonConnectUI.sendTransaction({
				validUntil: Date.now() + 1 * 60 * 1000, // 1 minute
				messages: [
					{
						address: address.toRawString(),
						amount: '5000000',
						stateInit: stateInit.toBoc().toString('base64'),
					},
				],
			});

			await axios.post('http://localhost:3000/update-address', {
				chatId: chatId,
				address: address.toRawString(),
			});
		}

		const getAddress = async () => {
			const response = await axios.get(
				`http://localhost:3000/get-address/${chatId}`,
			);
			return response.data.address;
		};

		const getReward = async () => {
			const response = await axios.get(
				`http://localhost:3000/get-reward/${chatId}`,
			);
			return response.data.reward;
		};

		if (index === 1 && address1 !== dealer1) {
			const reward = await getReward();
			console.log(reward);
			address = await getAddress();
			const addressTo = Address.parse(address);
			const body = beginCell()
				.storeUint(0, 32)
				.storeStringTail('Payment')
				.endCell();

			await tonConnectUI.sendTransaction({
				validUntil: Date.now() + 2 * 60 * 1000,
				messages: [
					{
						address: addressTo.toRawString(),
						amount: toNano(reward).toString(),
						payload: body.toBoc().toString('base64'),
					},
				],
			});
		}

		if (index === 1 && address1 === dealer1) {
			const reward = await getReward();
			address = await getAddress();
			const addressTo = Address.parse(address);
			const body = beginCell()
				.storeUint(0, 32)
				.storeStringTail('Payment')
				.endCell();

			await tonConnectUI.sendTransaction({
				validUntil: Date.now() + 2 * 60 * 1000,
				messages: [
					{
						address: addressTo.toRawString(),
						amount: toNano(reward).toString(),
						payload: body.toBoc().toString('base64'),
					},
				],
			});
		}

		if (index === 2) {
			address = await getAddress();
			const addressTo = Address.parse(address);
			const body = beginCell()
				.storeUint(0, 32)
				.storeStringTail('End')
				.endCell();

			await tonConnectUI.sendTransaction({
				validUntil: Date.now() + 2 * 60 * 1000,
				messages: [
					{
						address: addressTo.toRawString(),
						amount: toNano(0.05).toString(),
						payload: body.toBoc().toString('base64'),
					},
				],
			});
		}
	};

	const handleStageAction = async (index: number) => {
		transaction(index);
		if (
			transactionStages[index].count < transactionStages[index].maxCount
		) {
			await onStageAction(index);
		}
	};

	useEffect(() => {
		setTransactionStages(prevStages =>
			prevStages.map((stage, index) => ({
				...stage,
				count: Object.values(initialStages)[index],
				completed:
					Object.values(initialStages)[index] >= stage.maxCount,
			})),
		);
	}, [initialStages, address1, dealer1]);

	return (
		<div className="relative" ref={menuRef}>
			<button
				onClick={() => setIsMenuOpen(!isMenuOpen)}
				className="ml-4 px-4 py-2 bg-white bg-opacity-20 text-white font-semibold rounded-md hover:bg-opacity-30 transition-colors flex items-center backdrop-blur-sm"
			>
				Transaction Menu <ChevronDown className="ml-2" />
			</button>
			<AnimatePresence>
				{isMenuOpen && (
					<motion.div
						initial={{ opacity: 0, y: -10 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -10 }}
						className="absolute right-0 mt-2 w-64 bg-gray-800 rounded-md shadow-lg z-10 border-2 border-gray-500"
					>
						{transactionStages.map((stage, index) => (
							<div
								key={stage.name}
								className="p-4 border-b border-gray-700 last:border-b-0"
							>
								<div className="flex justify-between items-center mb-2">
									<span className="font-semibold text-white flex items-center">
										<div className="relative mr-2">
											<Info
												size={16}
												className="text-white cursor-help"
												onMouseEnter={() =>
													setActiveTooltip(index)
												}
												onMouseLeave={() =>
													setActiveTooltip(null)
												}
											/>
											{activeTooltip === index && (
												<div className="absolute right-6 top-0 w-48 p-2 bg-gray-900 text-white text-xs rounded shadow-lg">
													{stage.info}
												</div>
											)}
										</div>
										{stage.name}
									</span>
									<span className="text-sm text-gray-400">
										{stage.count}/{stage.maxCount}
									</span>
								</div>
								<button
									onClick={() => handleStageAction(index)}
									disabled={
										((stage.completed ||
											address1 !== dealer1) &&
											index == 0) ||
										((stage.completed ||
											initialStages.send < 1) &&
											index == 1) ||
										((stage.completed ||
											initialStages.payment < 2) &&
											index == 2) ||
										((stage.completed ||
											initialStages.payment < 1) &&
											index == 3)
									}
									className={`w-full py-2 rounded-md transition-colors ${
										((stage.completed ||
											address1 !== dealer1) &&
											index == 0) ||
										((stage.completed ||
											initialStages.send < 1) &&
											index == 1) ||
										((stage.completed ||
											initialStages.payment < 2) &&
											index == 2) ||
										((stage.completed ||
											initialStages.payment < 1) &&
											index == 3)
											? 'bg-green-600 text-white cursor-not-allowed'
											: 'bg-blue-600 text-white hover:bg-blue-700'
									}`}
								>
									{stage.completed
										? 'Completed'
										: stage.buttonText}
								</button>
							</div>
						))}
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
}
