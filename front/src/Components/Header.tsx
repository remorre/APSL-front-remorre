import { TonConnectButton } from '@tonconnect/ui-react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronsUp } from 'lucide-react';
import { ChevronsDown } from 'lucide-react';

const NavigationArrow = () => {
	const location = useLocation();

	const targetRoute = location.pathname === '/chats' ? '/exchenge' : '/chats';

	return (
		<Link
			to={targetRoute}
			className="ml-4 p-1 bg-opacity-20 bg-white rounded-sm hover:bg-opacity-90 transition-all duration-300 hover:translate-y-1"
		>
			{location.pathname === '/exchenge' ? (
				<ChevronsDown className="w-6 h-6 text-white hover:text-black" />
			) : (
				<ChevronsUp className="w-6 h-6 text-white hover:text-black" />
			)}
		</Link>
	);
};

const Header = ({ isWalletConnected }: { isWalletConnected: boolean }) => {
	return (
		<header className="mb-auto top-0 left-0 right-0 flex justify-between items-center p-6 px-8 bg-black bg-opacity-50 backdrop-blur-0 z-10">
			<Link
				to="/"
				className="text-3xl font-bold tracking-wider font-orbitron"
				style={{ fontFamily: 'Orbitron, sans-serif' }}
			>
				APSL
			</Link>
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
