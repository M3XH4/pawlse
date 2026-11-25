import { useEffect, useRef } from 'react';

interface ConfettiPiece {
    x: number;
    y: number;
    vx: number;
    vy: number;
    width: number;
    height: number;
    color: string;
    rotation: number;
    rotationSpeed: number;
    tilt: number;
    tiltSpeed: number;
    opacity: number;
}

const PAWLSE_CONFETTI_COLORS = [
    '#FF750F',
    '#F59E0B',
    '#FDE047',
    '#10B981',
    '#38BDF8',
    '#F472B6',
    '#0B2340',
];

export function ConfettiBurst({
    active,
    onComplete,
}: {
    active: boolean;
    onComplete?: () => void;
}) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!active) {
            return;
        }

        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext('2d');

        if (!ctx) {
            return;
        }

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        resize();
        window.addEventListener('resize', resize);

        const pieces: ConfettiPiece[] = [];
        const origins = [
            { x: canvas.width * 0.25, y: canvas.height * 0.35 },
            { x: canvas.width * 0.5, y: canvas.height * 0.25 },
            { x: canvas.width * 0.75, y: canvas.height * 0.35 },
        ];

        for (const origin of origins) {
            for (let i = 0; i < 45; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = 4 + Math.random() * 10;
                const isStrip = Math.random() > 0.45;
                pieces.push({
                    x: origin.x,
                    y: origin.y,
                    vx: Math.cos(angle) * speed,
                    vy: Math.sin(angle) * speed - 5,
                    width: isStrip ? 5 + Math.random() * 4 : 8 + Math.random() * 5,
                    height: isStrip ? 14 + Math.random() * 10 : 8 + Math.random() * 5,
                    color: PAWLSE_CONFETTI_COLORS[
                        Math.floor(Math.random() * PAWLSE_CONFETTI_COLORS.length)
                    ],
                    rotation: Math.random() * Math.PI * 2,
                    rotationSpeed: (Math.random() - 0.5) * 0.16,
                    tilt: Math.random() * Math.PI * 2,
                    tiltSpeed: 0.08 + Math.random() * 0.12,
                    opacity: 1,
                });
            }
        }

        let frameId = 0;
        const start = performance.now();
        const duration = 3600;

        const tick = (now: number) => {
            const elapsed = now - start;
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            let aliveCount = 0;

            for (const p of pieces) {
                p.vy += 0.24; // gravity
                p.vx *= 0.985; // air drag
                p.x += p.vx;
                p.y += p.vy;
                p.rotation += p.rotationSpeed;
                p.tilt += p.tiltSpeed;

                if (elapsed > duration * 0.6) {
                    p.opacity = Math.max(0, p.opacity - 0.025);
                }

                if (p.opacity > 0 && p.y < canvas.height + 40) {
                    aliveCount++;
                    ctx.save();
                    ctx.globalAlpha = p.opacity;
                    ctx.translate(p.x, p.y);
                    ctx.rotate(p.rotation);
                    ctx.scale(1, Math.cos(p.tilt));
                    ctx.fillStyle = p.color;
                    ctx.fillRect(-p.width / 2, -p.height / 2, p.width, p.height);
                    ctx.restore();
                }
            }

            if (aliveCount > 0 && elapsed < duration + 500) {
                frameId = requestAnimationFrame(tick);
            } else {
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                onComplete?.();
            }
        };

        frameId = requestAnimationFrame(tick);

        return () => {
            cancelAnimationFrame(frameId);
            window.removeEventListener('resize', resize);
        };
    }, [active, onComplete]);

    if (!active) {
        return null;
    }

    return (
        <canvas
            ref={canvasRef}
            aria-hidden="true"
            className="pointer-events-none fixed inset-0 z-50 h-full w-full"
        />
    );
}
