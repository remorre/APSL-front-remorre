import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

const NotFoundPage = () => {
	return (
		<div className="min-h-screen flex flex-col flex-grow items-center justify-center p-8 relative overflow-hidden">
			{/* Main content */}
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ duration: 0.5 }}
				className="text-center space-y-8 relative z-10"
			>
				<h1 className="text-9xl font-extrabold text-white">404</h1>
				<p className="text-2xl text-gray-300">Oops! Page not found</p>
				<p className="text-xl text-gray-400 max-w-md mx-auto">
					It seems you've ventured into uncharted territory. Let's get
					you back on track.
				</p>
				<Link
					to="/"
					className="inline-flex items-center px-6 py-3 text-lg font-medium text-white bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-all duration-300"
				>
					<Home className="w-5 h-5 mr-2" />
					Return Home
				</Link>
			</motion.div>
		</div>
	);
};

export default NotFoundPage;
