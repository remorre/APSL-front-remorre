import { useState, useEffect } from 'react';
import { TonConnectUIProvider, useTonAddress } from '@tonconnect/ui-react';
import {
	Route,
	Routes,
	useNavigate,
	Navigate,
	useLocation,
} from 'react-router-dom';
import Header from './Components/Header';
import Footer from './Components/Footer';
import HomePage from './Pages/HomePage';
import AnimatedBackground from './Components/Animate';
import NotFoundPage from './Pages/NotFoundPage';
import ExchengePage from './Pages/ExchengePage';
import ChatPage from './Pages/ChatPage';
import './App.css';

function WalletChecker({ children }: { children: React.ReactNode }) {
	const address = useTonAddress();
	const navigate = useNavigate();
	const location = useLocation();

	useEffect(() => {
		if (address && location.pathname === '/') {
			navigate('/exchenge');
		}
	}, [address, navigate, location.pathname]);

	return <>{children}</>;
}

function App() {
	const [isWalletConnected, setIsWalletConnected] = useState(false);
	const address = useTonAddress();

	useEffect(() => {
		setIsWalletConnected(!!address);
	}, [address]);

	return (
		<div className="min-h-screen flex flex-col text-white bg-black">
			<TonConnectUIProvider manifestUrl="https://apsl/tonconnect-manifest.json">
				<WalletChecker>
					<AnimatedBackground className="z-2" />
					<Header isWalletConnected={isWalletConnected} />
					<main className="flex-grow">
						<Routes>
							<Route path="/" element={<HomePage />} />
							<Route
								path="/exchenge"
								element={
									isWalletConnected ? (
										<ExchengePage />
									) : (
										<Navigate to="/" />
									)
								}
							/>
							<Route
								path="/chats"
								element={
									isWalletConnected ? (
										<ChatPage />
									) : (
										<Navigate to="/" />
									)
								}
							/>
							<Route
								path="/chats/:chatId"
								element={
									isWalletConnected ? (
										<ChatPage />
									) : (
										<Navigate to="/" />
									)
								}
							/>
							<Route path="*" element={<NotFoundPage />} />
						</Routes>
					</main>
					<Footer />
				</WalletChecker>
			</TonConnectUIProvider>
		</div>
	);
}

export default App;
