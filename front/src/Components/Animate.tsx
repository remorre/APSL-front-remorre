import React, { useEffect, useRef } from 'react';

interface AnimateProps {
	className?: string;
}

const Animate: React.FC<AnimateProps> = ({ className }) => {
	const canvasRef = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		const konkani =
			'゠アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレワヰヱヲンヺ・ーヽヿ0123456789';
		const characters = konkani.split('');
		const font_size = 14;
		const columns = canvas.width / font_size;
		const drops: number[] = Array(Math.floor(columns)).fill(1);

		const root = {
			matrixspeed: 50, // Скорость анимации
		};

		const draw = () => {
			// Очистка холста с полупрозрачным черным фоном для эффекта "шлейфа"
			ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			// Устанавливаем кроваво-красный цвет для текста
			ctx.fillStyle = '#8B0000'; // Кроваво-красный цвет
			ctx.font = `${font_size}px arial`;

			for (let i = 0; i < drops.length; i++) {
				const text =
					characters[Math.floor(Math.random() * characters.length)];
				ctx.fillText(text, i * font_size, drops[i] * font_size);

				// Перемещение капли вниз
				drops[i]++;

				// Если капля вышла за пределы экрана, возвращаем её в начало
				if (
					drops[i] * font_size > canvas.height &&
					Math.random() > 0.975
				) {
					drops[i] = 0;
				}
			}
		};

		const interval = setInterval(draw, root.matrixspeed);

		const handleResize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		window.addEventListener('resize', handleResize);

		return () => {
			clearInterval(interval);
			window.removeEventListener('resize', handleResize);
		};
	}, []);

	return <canvas ref={canvasRef} className={className} />;
};

export default Animate;
