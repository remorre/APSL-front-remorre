import { TonConnectButton } from '@tonconnect/ui-react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';

const NavigationArrow = () => {
	const location = useLocation();

	const targetRoute =
		location.pathname === '/exchenge' ? '/chats' : '/exchenge';

	return (
		<Link to={targetRoute}>
			{location.pathname === '/exchenge' ? (
				<motion.button className="w-24 h-10 flex items-center justify-center bg-black text-white border font-semibold py-4 rounded-lg shadow-lg hover:shadow-xl">
					Chats
				</motion.button>
			) : (
				<motion.button className="w-24 h-10 flex items-center justify-center bg-black text-white border font-semibold py-4 rounded-lg shadow-lg hover:shadow-xl">
					Exchange
				</motion.button>
			)}
		</Link>
	);
};

const Header = ({ isWalletConnected }: { isWalletConnected: boolean }) => {
	const location1 = useLocation();
	return (
		<header className="mb-auto top-0 left-0 right-0 flex justify-between items-center p-6 px-8 bg-black bg-opacity-50 backdrop-blur-0 z-1">
			{location1.pathname === '/' && (
				<Link
					to="/"
					className="text-3xl font-bold tracking-wider font-orbitron"
					style={{ fontFamily: 'Orbitron, sans-serif' }}
				>
					APSL
				</Link>
			)}
			{isWalletConnected && <NavigationArrow />}
			<div
				className="
          [&_button]:justify-center 
          [&_button]:rounded-md 
          [&_button]:bg-white 
          [&_button_div]:text-black 
          [&_button_svg_path]:fill-black 
          md:[&_button_div]:whitespace-nowrap 
          [&_button]:shadow-none 
          [&_button]:hover:bg-white 
          [&_button]:hover:text-black 
          [&_button_svg_path]:hover:fill-black 
          [&_button]:hover:border-neutral-200
          [&_button]:border [&_button]:border-neutral-200 [&_button]:border-solid
          [&_button]:hover:transform-none
        "
			>
				<TonConnectButton />
			</div>
		</header>
	);
};

export default Header;
