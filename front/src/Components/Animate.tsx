import { useEffect, useRef } from 'react';

interface AnimatedBackgroundProps {
	className?: string;
}

class Star {
	x: number;
	y: number;
	radius: number;
	color: string;
	dy: number;

	constructor(x?: number, y?: number, radius?: number, color?: string) {
		this.x = x || Math.random() * window.innerWidth;
		this.y = y || Math.random() * window.innerHeight;
		this.radius = radius || Math.random() * 1;
		this.color =
			color ||
			['#176ab6', '#f8bab6', '#fff', '#49d1f6', '#e4a8e6'][
				Math.floor(Math.random() * 5)
			];
		this.dy = -Math.random() * 0.4;
	}

	draw(ctx: CanvasRenderingContext2D) {
		ctx.beginPath();
		ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
		ctx.shadowBlur = Math.floor(Math.random() * 13) + 3; // Random shadow blur
		ctx.shadowColor = this.color;
		ctx.strokeStyle = this.color;
		ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
		ctx.fill();
		ctx.stroke();
		ctx.closePath();
	}

	update(ctx: CanvasRenderingContext2D, stars: Star[]) {
		if (this.y - this.radius < 0) this.createNewStar(stars);
		this.y += this.dy;
		this.draw(ctx);
	}

	createNewStar(stars: Star[]) {
		const index = stars.indexOf(this);
		stars.splice(index, 1);
		stars.push(new Star(undefined, window.innerHeight + 5));
	}
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = () => {
	const canvasRef = useRef<HTMLCanvasElement>(null);
	// eslint-disable-next-line react-hooks/exhaustive-deps
	const stars: Star[] = [];
	const n_stars = 400;

	useEffect(() => {
		const canvas = canvasRef.current;
		if (!canvas) return;

		const ctx = canvas.getContext('2d');
		if (!ctx) return;

		canvas.width = window.innerWidth;
		canvas.height = window.innerHeight;

		// Gradient background
		const bg = ctx.createRadialGradient(
			canvas.width / 2,
			canvas.height * 3,
			canvas.height,
			canvas.width / 2,
			canvas.height,
			canvas.height * 4,
		);
		bg.addColorStop(0, '#32465E');
		bg.addColorStop(0.4, '#000814');
		bg.addColorStop(0.8, '#000814');
		bg.addColorStop(1, '#000');

		// Initialize stars
		for (let i = 0; i < n_stars; i++) {
			stars.push(new Star());
		}

		function animate() {
			if (!ctx) return;
			if (!canvas) return;
			ctx.clearRect(0, 0, canvas.width, canvas.height);
			ctx.fillStyle = bg;
			ctx.fillRect(0, 0, canvas.width, canvas.height);
			stars.forEach(star => star.update(ctx, stars)); // Передаем ctx в update
			requestAnimationFrame(animate);
		}

		animate();

		const handleResize = () => {
			canvas.width = window.innerWidth;
			canvas.height = window.innerHeight;
		};

		window.addEventListener('resize', handleResize);

		return () => {
			window.removeEventListener('resize', handleResize);
		};
	}, [stars]);

	return <canvas ref={canvasRef} className="fixed inset-0 z-0" />;
};

export default AnimatedBackground;
