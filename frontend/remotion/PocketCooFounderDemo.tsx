import React, { useMemo } from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	Sequence,
	useCurrentFrame,
	useVideoConfig,
} from 'remotion';

type DemoProps = {
	fontFamily: string;
};

// Light theme colors matching the actual UI
const COLORS = {
	bg: '#f6f7f9',
	card: '#ffffff',
	cardBorder: 'rgba(0,0,0,0.05)',
	text: '#000000',
	textMuted: 'rgba(0,0,0,0.55)',
	textLight: 'rgba(0,0,0,0.35)',
	accent: '#000000',
	accentMuted: 'rgba(0,0,0,0.70)',
	emerald: '#10B981',
	rose: '#EF4444',
	blue: '#3B82F6',
	overlay: 'rgba(0,0,0,0.02)',
	overlayBorder: 'rgba(0,0,0,0.10)',
};

const easeOut = Easing.bezier(0.16, 1, 0.3, 1); // Apple-like easing
const easeInOut = Easing.bezier(0.4, 0, 0.2, 1);

const fadeIn = (frame: number, duration: number) =>
	interpolate(frame, [0, duration], [0, 1], {
		easing: easeOut,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

const fadeOut = (frame: number, duration: number, total: number) =>
	interpolate(frame, [total - duration, total], [1, 0], {
		easing: easeOut,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

const slideUp = (frame: number, duration: number, distance = 40) =>
	interpolate(frame, [0, duration], [distance, 0], {
		easing: easeOut,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

const scale = (frame: number, duration: number, from = 0.94) =>
	interpolate(frame, [0, duration], [from, 1], {
		easing: easeOut,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

// Card component matching actual UI
const Card: React.FC<{
	style?: React.CSSProperties;
	children: React.ReactNode;
}> = ({ style, children }) => {
	return (
		<div
			style={{
				backgroundColor: COLORS.card,
				borderRadius: 24,
				boxShadow: '0 1px 0 rgba(0,0,0,0.06)',
				border: `1px solid ${COLORS.cardBorder}`,
				...style,
			}}
		>
			{children}
		</div>
	);
};

// Opening scene: Hook with problem
const HookScene: React.FC<{ startFrame: number; durationInFrames: number }> = () => {
	const frame = useCurrentFrame();
	const o = fadeIn(frame, 12);
	const y = slideUp(frame, 12, 30);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: COLORS.bg,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: 80,
			}}
		>
			<div
				style={{
					opacity: o,
					transform: `translateY(${y}px)`,
					textAlign: 'center',
					maxWidth: 900,
				}}
			>
				<div
					style={{
						fontSize: 72,
						fontWeight: 700,
						color: COLORS.text,
						letterSpacing: '-0.03em',
						lineHeight: 1.1,
					}}
				>
					毎回、ゼロから<br />説明してませんか？
				</div>
				<div
					style={{
						marginTop: 28,
						fontSize: 28,
						fontWeight: 500,
						color: COLORS.textMuted,
						lineHeight: 1.4,
					}}
				>
					AIは便利。でも、文脈を覚えてない。
				</div>
			</div>
		</AbsoluteFill>
	);
};

// Problem cards scene
const ProblemScene: React.FC<{ startFrame: number; durationInFrames: number }> = () => {
	const frame = useCurrentFrame();

	const problems = [
		{ title: '毎回ゼロから', desc: '前提を毎度説明' },
		{ title: '文脈の断絶', desc: '継続性がない' },
		{ title: '学習しない', desc: '好みが残らない' },
	];

	return (
		<AbsoluteFill
			style={{
				backgroundColor: COLORS.bg,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: 60,
			}}
		>
			<div style={{ width: '100%', maxWidth: 1200 }}>
				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(3, 1fr)',
						gap: 24,
					}}
				>
					{problems.map((p, i) => {
						const delay = i * 6;
						const o = fadeIn(frame - delay, 10);
						const s = scale(frame - delay, 10, 0.9);
						const y = slideUp(frame - delay, 10, 20);

						return (
							<Card
								key={p.title}
								style={{
									padding: 40,
									opacity: o,
									transform: `translateY(${y}px) scale(${s})`,
								}}
							>
								<div
									style={{
										fontSize: 44,
										fontWeight: 700,
										color: COLORS.rose,
										marginBottom: 16,
									}}
								>
									✕
								</div>
								<div
									style={{
										fontSize: 32,
										fontWeight: 700,
										color: COLORS.text,
										marginBottom: 12,
									}}
								>
									{p.title}
								</div>
								<div
									style={{
										fontSize: 20,
										fontWeight: 500,
										color: COLORS.textMuted,
									}}
								>
									{p.desc}
								</div>
							</Card>
						);
					})}
				</div>
			</div>
		</AbsoluteFill>
	);
};

// Solution intro: Pocket COO
const SolutionScene: React.FC<{ startFrame: number; durationInFrames: number }> = () => {
	const frame = useCurrentFrame();
	const o = fadeIn(frame, 15);
	const s = scale(frame, 15, 0.92);
	const y = slideUp(frame, 15, 40);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: COLORS.bg,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<div
				style={{
					opacity: o,
					transform: `translateY(${y}px) scale(${s})`,
					textAlign: 'center',
				}}
			>
				<div
					style={{
						fontSize: 140,
						marginBottom: 20,
						filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.08))',
					}}
				>
					🧠
				</div>
				<div
					style={{
						fontSize: 80,
						fontWeight: 800,
						color: COLORS.text,
						letterSpacing: '-0.03em',
						marginBottom: 12,
					}}
				>
					Pocket COO
				</div>
				<div
					style={{
						fontSize: 32,
						fontWeight: 600,
						color: COLORS.textMuted,
					}}
				>
					長期記憶を持ったAI COOがポケットに
				</div>
			</div>
		</AbsoluteFill>
	);
};

// Memory layers explanation
const MemoryLayersScene: React.FC<{ startFrame: number; durationInFrames: number }> = () => {
	const frame = useCurrentFrame();

	const layers = [
		{
			name: 'Identity',
			desc: 'あなたのスタイル・判断基準',
			color: COLORS.blue,
		},
		{
			name: 'Project',
			desc: '進行中の目標・制約',
			color: COLORS.emerald,
		},
		{
			name: 'Episode',
			desc: '具体的な会話・出来事',
			color: COLORS.accent,
		},
	];

	return (
		<AbsoluteFill
			style={{
				backgroundColor: COLORS.bg,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: 80,
			}}
		>
			<div style={{ maxWidth: 1100 }}>
				<div
					style={{
						textAlign: 'center',
						marginBottom: 50,
						opacity: fadeIn(frame, 10),
						transform: `translateY(${slideUp(frame, 10, 20)}px)`,
					}}
				>
					<div
						style={{
							fontSize: 56,
							fontWeight: 700,
							color: COLORS.text,
							letterSpacing: '-0.02em',
						}}
					>
						3層の記憶モデル
					</div>
				</div>

				<div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
					{layers.map((layer, i) => {
						const delay = 15 + i * 8;
						const o = fadeIn(frame - delay, 10);
						const x = interpolate(frame - delay, [0, 10], [-40, 0], {
							easing: easeOut,
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						});

						return (
							<Card
								key={layer.name}
								style={{
									padding: 32,
									opacity: o,
									transform: `translateX(${x}px)`,
									display: 'flex',
									alignItems: 'center',
									gap: 28,
								}}
							>
								<div
									style={{
										width: 80,
										height: 80,
										borderRadius: 20,
										backgroundColor: `${layer.color}15`,
										border: `2px solid ${layer.color}40`,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontSize: 36,
										fontWeight: 800,
										color: layer.color,
									}}
								>
									{i + 1}
								</div>
								<div>
									<div
										style={{
											fontSize: 38,
											fontWeight: 700,
											color: COLORS.text,
											marginBottom: 6,
										}}
									>
										{layer.name}
									</div>
									<div
										style={{
											fontSize: 22,
											fontWeight: 500,
											color: COLORS.textMuted,
										}}
									>
										{layer.desc}
									</div>
								</div>
							</Card>
						);
					})}
				</div>
			</div>
		</AbsoluteFill>
	);
};

// Use case: PM workflow
const UseCasePMScene: React.FC<{ startFrame: number; durationInFrames: number }> = () => {
	const frame = useCurrentFrame();

	return (
		<AbsoluteFill
			style={{
				backgroundColor: COLORS.bg,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: 60,
			}}
		>
			<div style={{ maxWidth: 1000 }}>
				<div
					style={{
						opacity: fadeIn(frame, 10),
						transform: `translateY(${slideUp(frame, 10)}px)`,
						marginBottom: 40,
					}}
				>
					<div
						style={{
							fontSize: 20,
							fontWeight: 600,
							color: COLORS.textLight,
							letterSpacing: '0.05em',
							textTransform: 'uppercase',
							marginBottom: 12,
						}}
					>
						Use Case
					</div>
					<div
						style={{
							fontSize: 52,
							fontWeight: 700,
							color: COLORS.text,
							letterSpacing: '-0.02em',
						}}
					>
						プロダクト開発を加速
					</div>
				</div>

				<Card
					style={{
						padding: 36,
						opacity: fadeIn(frame - 15, 12),
						transform: `translateY(${slideUp(frame - 15, 12, 30)}px) scale(${scale(frame - 15, 12, 0.96)})`,
					}}
				>
					<div
						style={{
							display: 'inline-block',
							padding: '14px 20px',
							borderRadius: 999,
							backgroundColor: COLORS.overlay,
							border: `1px solid ${COLORS.overlayBorder}`,
							fontSize: 18,
							fontWeight: 600,
							color: COLORS.accentMuted,
							marginBottom: 24,
						}}
					>
						👤 あなた
					</div>
					<div
						style={{
							fontSize: 28,
							fontWeight: 600,
							color: COLORS.text,
							lineHeight: 1.5,
						}}
					>
						この新プロダクトのPRDを10分で<br />叩き台にして
					</div>
				</Card>

				<Card
					style={{
						padding: 36,
						marginTop: 20,
						opacity: fadeIn(frame - 35, 12),
						transform: `translateY(${slideUp(frame - 35, 12, 30)}px) scale(${scale(frame - 35, 12, 0.96)})`,
					}}
				>
					<div
						style={{
							display: 'inline-block',
							padding: '14px 20px',
							borderRadius: 999,
							backgroundColor: COLORS.overlay,
							border: `1px solid ${COLORS.overlayBorder}`,
							fontSize: 18,
							fontWeight: 600,
							color: COLORS.accentMuted,
							marginBottom: 24,
						}}
					>
						🧠 Pocket COO
					</div>
					<div
						style={{
							fontSize: 26,
							fontWeight: 600,
							color: COLORS.text,
							lineHeight: 1.6,
						}}
					>
						了解。前提/成功指標/非ゴール/リスク<br />を整理しますね。
					</div>
				</Card>

				<div
					style={{
						marginTop: 32,
						display: 'flex',
						justifyContent: 'flex-end',
						opacity: fadeIn(frame - 55, 10),
					}}
				>
					<div
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 8,
							padding: '10px 16px',
							borderRadius: 999,
							backgroundColor: `${COLORS.emerald}15`,
							border: `1px solid ${COLORS.emerald}40`,
							fontSize: 20,
							fontWeight: 700,
							color: COLORS.emerald,
						}}
					>
						<span>✓</span>
						<span>記憶に保存</span>
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// Growth visualization
const GrowthScene: React.FC<{ startFrame: number; durationInFrames: number }> = () => {
	const frame = useCurrentFrame();

	const days = [
		{ day: 'Day 1', score: 15 },
		{ day: 'Day 7', score: 35 },
		{ day: 'Day 30', score: 78 },
	];

	return (
		<AbsoluteFill
			style={{
				backgroundColor: COLORS.bg,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: 80,
			}}
		>
			<div style={{ maxWidth: 1100 }}>
				<div
					style={{
						textAlign: 'center',
						marginBottom: 60,
						opacity: fadeIn(frame, 10),
						transform: `translateY(${slideUp(frame, 10, 20)}px)`,
					}}
				>
					<div
						style={{
							fontSize: 56,
							fontWeight: 700,
							color: COLORS.text,
							letterSpacing: '-0.02em',
						}}
					>
						使うほど、賢くなる
					</div>
				</div>

				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(3, 1fr)',
						gap: 24,
					}}
				>
					{days.map((d, i) => {
						const delay = 15 + i * 10;
						const o = fadeIn(frame - delay, 10);
						const s = scale(frame - delay, 10, 0.88);
						const scoreProgress = interpolate(frame - delay, [0, 20], [0, d.score], {
							easing: easeOut,
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						});

						return (
							<Card
								key={d.day}
								style={{
									padding: 36,
									opacity: o,
									transform: `scale(${s})`,
									textAlign: 'center',
								}}
							>
								<div
									style={{
										fontSize: 20,
										fontWeight: 600,
										color: COLORS.textMuted,
										marginBottom: 20,
									}}
								>
									{d.day}
								</div>
								<div
									style={{
										position: 'relative',
										width: 120,
										height: 120,
										margin: '0 auto',
									}}
								>
									<svg
										width="120"
										height="120"
										viewBox="0 0 120 120"
										style={{ transform: 'rotate(-90deg)' }}
									>
										<circle
											cx="60"
											cy="60"
											r="52"
											fill="none"
											stroke={COLORS.overlay}
											strokeWidth="8"
										/>
										<circle
											cx="60"
											cy="60"
											r="52"
											fill="none"
											stroke={COLORS.accent}
											strokeWidth="8"
											strokeDasharray={`${(scoreProgress / 100) * 326.73} 326.73`}
											strokeLinecap="round"
										/>
									</svg>
									<div
										style={{
											position: 'absolute',
											inset: 0,
											display: 'flex',
											alignItems: 'center',
											justifyContent: 'center',
											fontSize: 36,
											fontWeight: 800,
											color: COLORS.text,
										}}
									>
										{Math.round(scoreProgress)}%
									</div>
								</div>
								<div
									style={{
										marginTop: 20,
										fontSize: 16,
										fontWeight: 600,
										color: COLORS.textLight,
									}}
								>
									分身スコア
								</div>
							</Card>
						);
					})}
				</div>
			</div>
		</AbsoluteFill>
	);
};

// Vision: Solo founder
const VisionScene: React.FC<{ startFrame: number; durationInFrames: number }> = () => {
	const frame = useCurrentFrame();
	const o = fadeIn(frame, 15);
	const y = slideUp(frame, 15, 40);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: COLORS.bg,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: 80,
			}}
		>
			<div
				style={{
					opacity: o,
					transform: `translateY(${y}px)`,
					textAlign: 'center',
					maxWidth: 1000,
				}}
			>
				<div
					style={{
						fontSize: 68,
						fontWeight: 800,
						color: COLORS.text,
						letterSpacing: '-0.03em',
						lineHeight: 1.2,
						marginBottom: 28,
					}}
				>
					一人でAI軍団を指揮。<br />
					少数精鋭でユニコーンを築く。
				</div>
				<div
					style={{
						fontSize: 28,
						fontWeight: 500,
						color: COLORS.textMuted,
						lineHeight: 1.5,
					}}
				>
					あなた専属のAI COO。<br />
					「いつもの感じで」が通じる世界へ。
				</div>
			</div>
		</AbsoluteFill>
	);
};

// Closing with CTA
const ClosingScene: React.FC<{ startFrame: number; durationInFrames: number }> = ({
	durationInFrames,
}) => {
	const frame = useCurrentFrame();
	const o = fadeIn(frame, 12) * fadeOut(frame, 20, durationInFrames);
	const s = scale(frame, 12, 0.94);
	const y = slideUp(frame, 12, 30);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: COLORS.bg,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
			}}
		>
			<div
				style={{
					opacity: o,
					transform: `translateY(${y}px) scale(${s})`,
					textAlign: 'center',
				}}
			>
				<div
					style={{
						fontSize: 100,
						marginBottom: 24,
					}}
				>
					🧠
				</div>
				<div
					style={{
						fontSize: 72,
						fontWeight: 800,
						color: COLORS.text,
						letterSpacing: '-0.03em',
						marginBottom: 28,
					}}
				>
					Pocket COO
				</div>
				<Card
					style={{
						display: 'inline-block',
						padding: '20px 40px',
						backgroundColor: COLORS.accent,
						borderColor: COLORS.accent,
					}}
				>
					<div
						style={{
							fontSize: 32,
							fontWeight: 700,
							color: COLORS.card,
						}}
					>
						今すぐご連絡を
					</div>
				</Card>
				<div
					style={{
						marginTop: 28,
						fontSize: 20,
						fontWeight: 500,
						color: COLORS.textMuted,
					}}
				>
					github.com/yourusername/PocketCOO
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const PocketCooFounderDemo: React.FC<DemoProps> = ({ fontFamily }) => {
	return (
		<AbsoluteFill style={{ fontFamily, backgroundColor: COLORS.bg }}>
			{/* Hook Scene */}
			<Sequence from={0} durationInFrames={90}>
				<HookScene startFrame={0} durationInFrames={90} />
			</Sequence>

			{/* Problem Scene */}
			<Sequence from={90} durationInFrames={90}>
				<ProblemScene startFrame={90} durationInFrames={90} />
			</Sequence>

			{/* Solution Scene */}
			<Sequence from={180} durationInFrames={75}>
				<SolutionScene startFrame={180} durationInFrames={75} />
			</Sequence>

			{/* Memory Layers Scene */}
			<Sequence from={255} durationInFrames={120}>
				<MemoryLayersScene startFrame={255} durationInFrames={120} />
			</Sequence>

			{/* Use Case PM Scene */}
			<Sequence from={375} durationInFrames={150}>
				<UseCasePMScene startFrame={375} durationInFrames={150} />
			</Sequence>

			{/* Growth Scene */}
			<Sequence from={525} durationInFrames={120}>
				<GrowthScene startFrame={525} durationInFrames={120} />
			</Sequence>

			{/* Vision Scene */}
			<Sequence from={645} durationInFrames={120}>
				<VisionScene startFrame={645} durationInFrames={120} />
			</Sequence>

			{/* Closing Scene */}
			<Sequence from={765} durationInFrames={135}>
				<ClosingScene startFrame={765} durationInFrames={135} />
			</Sequence>
		</AbsoluteFill>
	);
};
