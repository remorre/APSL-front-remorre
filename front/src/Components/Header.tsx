import { TonConnectButton } from '@tonconnect/ui-react';
import { Link, useLocation } from 'react-router-dom';

const Header = ({ isWalletConnected }: { isWalletConnected: boolean }) => {
	const location = useLocation();

	return (
		<header className="mb-auto top-0 left-0 right-0 flex justify-between items-center p-6 px-8 bg-black bg-opacity-50 backdrop-blur-0 z-10">
			<Link
				to="/"
				className="text-3xl font-bold tracking-wider font-orbitron"
				style={{ fontFamily: 'Orbitron, sans-serif' }}
			>
				APSL
			</Link>
			{isWalletConnected && location.pathname !== '/chats' && (
				<Link
					to="/chats"
					className="ml-4 px-4 py-2 bg-white text-black font-semibold rounded-md hover:bg-opacity-90 transition-colors"
				>
					My chats
				</Link>
			)}
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
