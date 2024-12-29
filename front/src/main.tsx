import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import { BrowserRouter } from 'react-router-dom';

const manifestUrl =
	'https://raw.githubusercontent.com/remorre/manifest/refs/heads/main/tonconnect-manifest.json';

createRoot(document.getElementById('root')!).render(
	<StrictMode>
		<TonConnectUIProvider manifestUrl={manifestUrl}>
			<BrowserRouter>
				<App />
			</BrowserRouter>
		</TonConnectUIProvider>
	</StrictMode>,
);
