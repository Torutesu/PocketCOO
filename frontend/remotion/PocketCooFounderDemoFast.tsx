import React from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	Sequence,
	useCurrentFrame,
} from 'remotion';

type DemoProps = {
	fontFamily: string;
	language?: 'ja' | 'en';
};

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

const COPY = {
	ja: {
		hook: {
			title: '毎回、ゼロから\n説明してませんか？',
			subtitle: 'AIは便利。でも、文脈を覚えてない。',
		},
		problems: [
			{ title: '毎回ゼロから', desc: '前提を毎度説明' },
			{ title: '文脈の断絶', desc: '継続性がない' },
			{ title: '学習しない', desc: '好みが残らない' },
		],
		solution: {
			title: 'Pocket COO',
			subtitle: '長期記憶を持ったAI COOがポケットに',
		},
		memoryLayers: {
			title: '3層の記憶モデル',
			layers: [
				{ name: 'Identity', desc: 'あなたのスタイル・判断基準' },
				{ name: 'Project', desc: '進行中の目標・制約' },
				{ name: 'Episode', desc: '具体的な会話・出来事' },
			],
		},
		useCase: {
			label: 'Use Case',
			title: 'プロダクト開発を加速',
			userLabel: 'あなた',
			userMessage: 'この新プロダクトのPRDを\n10分で叩き台にして',
			aiLabel: 'Pocket COO',
			aiMessage: '了解。前提/成功指標/非ゴール/リスク\nを整理しますね。',
			saved: '記憶に保存',
		},
		growth: {
			title: '使うほど、賢くなる',
			scoreLabel: '分身スコア',
		},
		vision: {
			title: '一人でAI軍団を指揮。\n少数精鋭でユニコーンを築く。',
			subtitle: 'あなた専属のAI COO。\n「いつもの感じで」が通じる世界へ。',
		},
		closing: {
			cta: '今すぐご連絡を',
		},
	},
	en: {
		hook: {
			title: 'Explaining everything\nfrom scratch?',
			subtitle: 'AI is useful. But it forgets context.',
		},
		problems: [
			{ title: 'Always reset', desc: 'Every conversation starts over' },
			{ title: 'No continuity', desc: 'Context is lost' },
			{ title: 'Never learns', desc: 'Preferences forgotten' },
		],
		solution: {
			title: 'Pocket COO',
			subtitle: 'An AI COO with long-term memory in your pocket',
		},
		memoryLayers: {
			title: '3-Layer Memory',
			layers: [
				{ name: 'Identity', desc: 'Your style & principles' },
				{ name: 'Project', desc: 'Goals & constraints' },
				{ name: 'Episode', desc: 'Specific conversations' },
			],
		},
		useCase: {
			label: 'Use Case',
			title: 'Accelerate Product Development',
			userLabel: 'You',
			userMessage: 'Draft a PRD for this new product\nin 10 minutes',
			aiLabel: 'Pocket COO',
			aiMessage: 'Got it. I\'ll organize:\nPremise / Success metrics / Non-goals / Risks',
			saved: 'Saved to memory',
		},
		growth: {
			title: 'Gets smarter as you use it',
			scoreLabel: 'Personalization',
		},
		vision: {
			title: 'Command an AI squad solo.\nBuild a unicorn with a lean team.',
			subtitle: 'Your dedicated AI COO.\nWhere "the usual way" just works.',
		},
		closing: {
			cta: 'Contact us now',
		},
	},
};

const easeOut = Easing.bezier(0.16, 1, 0.3, 1);

// Faster animations (reduced duration by ~30%)
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

const HookScene: React.FC<{ lang: 'ja' | 'en' }> = ({ lang }) => {
	const frame = useCurrentFrame();
	const copy = COPY[lang].hook;
	const o = fadeIn(frame, 8);
	const y = slideUp(frame, 8, 20);

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
						fontSize: 68,
						fontWeight: 700,
						color: COLORS.text,
						letterSpacing: '-0.03em',
						lineHeight: 1.1,
						whiteSpace: 'pre-line',
					}}
				>
					{copy.title}
				</div>
				<div
					style={{
						marginTop: 24,
						fontSize: 26,
						fontWeight: 500,
						color: COLORS.textMuted,
						lineHeight: 1.4,
					}}
				>
					{copy.subtitle}
				</div>
			</div>
		</AbsoluteFill>
	);
};

const ProblemScene: React.FC<{ lang: 'ja' | 'en' }> = ({ lang }) => {
	const frame = useCurrentFrame();
	const problems = COPY[lang].problems;

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
						gap: 20,
					}}
				>
					{problems.map((p, i) => {
						const delay = i * 4;
						const o = fadeIn(frame - delay, 8);
						const s = scale(frame - delay, 8, 0.9);
						const y = slideUp(frame - delay, 8, 15);

						return (
							<Card
								key={p.title}
								style={{
									padding: 32,
									opacity: o,
									transform: `translateY(${y}px) scale(${s})`,
								}}
							>
								<div
									style={{
										fontSize: 40,
										fontWeight: 700,
										color: COLORS.rose,
										marginBottom: 12,
									}}
								>
									✕
								</div>
								<div
									style={{
										fontSize: 28,
										fontWeight: 700,
										color: COLORS.text,
										marginBottom: 8,
									}}
								>
									{p.title}
								</div>
								<div
									style={{
										fontSize: 18,
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

const SolutionScene: React.FC<{ lang: 'ja' | 'en' }> = ({ lang }) => {
	const frame = useCurrentFrame();
	const copy = COPY[lang].solution;
	const o = fadeIn(frame, 10);
	const s = scale(frame, 10, 0.92);
	const y = slideUp(frame, 10, 30);

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
						fontSize: 120,
						marginBottom: 16,
						filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.08))',
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
						marginBottom: 10,
					}}
				>
					{copy.title}
				</div>
				<div
					style={{
						fontSize: 28,
						fontWeight: 600,
						color: COLORS.textMuted,
					}}
				>
					{copy.subtitle}
				</div>
			</div>
		</AbsoluteFill>
	);
};

const MemoryLayersScene: React.FC<{ lang: 'ja' | 'en' }> = ({ lang }) => {
	const frame = useCurrentFrame();
	const copy = COPY[lang].memoryLayers;

	return (
		<AbsoluteFill
			style={{
				backgroundColor: COLORS.bg,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: 70,
			}}
		>
			<div style={{ maxWidth: 1000 }}>
				<div
					style={{
						textAlign: 'center',
						marginBottom: 40,
						opacity: fadeIn(frame, 8),
						transform: `translateY(${slideUp(frame, 8, 15)}px)`,
					}}
				>
					<div
						style={{
							fontSize: 50,
							fontWeight: 700,
							color: COLORS.text,
							letterSpacing: '-0.02em',
						}}
					>
						{copy.title}
					</div>
				</div>

				<div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
					{copy.layers.map((layer, i) => {
						const delay = 10 + i * 6;
						const o = fadeIn(frame - delay, 8);
						const x = interpolate(frame - delay, [0, 8], [-30, 0], {
							easing: easeOut,
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						});

						const colors = [COLORS.blue, COLORS.emerald, COLORS.accent];

						return (
							<Card
								key={layer.name}
								style={{
									padding: 24,
									opacity: o,
									transform: `translateX(${x}px)`,
									display: 'flex',
									alignItems: 'center',
									gap: 20,
								}}
							>
								<div
									style={{
										width: 64,
										height: 64,
										borderRadius: 16,
										backgroundColor: `${colors[i]}15`,
										border: `2px solid ${colors[i]}40`,
										display: 'flex',
										alignItems: 'center',
										justifyContent: 'center',
										fontSize: 30,
										fontWeight: 800,
										color: colors[i],
										flexShrink: 0,
									}}
								>
									{i + 1}
								</div>
								<div>
									<div
										style={{
											fontSize: 32,
											fontWeight: 700,
											color: COLORS.text,
											marginBottom: 4,
										}}
									>
										{layer.name}
									</div>
									<div
										style={{
											fontSize: 18,
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

const UseCasePMScene: React.FC<{ lang: 'ja' | 'en' }> = ({ lang }) => {
	const frame = useCurrentFrame();
	const copy = COPY[lang].useCase;

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
			<div style={{ maxWidth: 950 }}>
				<div
					style={{
						opacity: fadeIn(frame, 8),
						transform: `translateY(${slideUp(frame, 8)}px)`,
						marginBottom: 32,
					}}
				>
					<div
						style={{
							fontSize: 18,
							fontWeight: 600,
							color: COLORS.textLight,
							letterSpacing: '0.05em',
							textTransform: 'uppercase',
							marginBottom: 10,
						}}
					>
						{copy.label}
					</div>
					<div
						style={{
							fontSize: 46,
							fontWeight: 700,
							color: COLORS.text,
							letterSpacing: '-0.02em',
						}}
					>
						{copy.title}
					</div>
				</div>

				<Card
					style={{
						padding: 28,
						opacity: fadeIn(frame - 12, 8),
						transform: `translateY(${slideUp(frame - 12, 8, 20)}px) scale(${scale(frame - 12, 8, 0.96)})`,
					}}
				>
					<div
						style={{
							display: 'inline-block',
							padding: '10px 16px',
							borderRadius: 999,
							backgroundColor: COLORS.overlay,
							border: `1px solid ${COLORS.overlayBorder}`,
							fontSize: 16,
							fontWeight: 600,
							color: COLORS.accentMuted,
							marginBottom: 18,
						}}
					>
						👤 {copy.userLabel}
					</div>
					<div
						style={{
							fontSize: 24,
							fontWeight: 600,
							color: COLORS.text,
							lineHeight: 1.5,
							whiteSpace: 'pre-line',
						}}
					>
						{copy.userMessage}
					</div>
				</Card>

				<Card
					style={{
						padding: 28,
						marginTop: 16,
						opacity: fadeIn(frame - 26, 8),
						transform: `translateY(${slideUp(frame - 26, 8, 20)}px) scale(${scale(frame - 26, 8, 0.96)})`,
					}}
				>
					<div
						style={{
							display: 'inline-block',
							padding: '10px 16px',
							borderRadius: 999,
							backgroundColor: COLORS.overlay,
							border: `1px solid ${COLORS.overlayBorder}`,
							fontSize: 16,
							fontWeight: 600,
							color: COLORS.accentMuted,
							marginBottom: 18,
						}}
					>
						🧠 {copy.aiLabel}
					</div>
					<div
						style={{
							fontSize: 22,
							fontWeight: 600,
							color: COLORS.text,
							lineHeight: 1.6,
							whiteSpace: 'pre-line',
						}}
					>
						{copy.aiMessage}
					</div>
				</Card>

				<div
					style={{
						marginTop: 24,
						display: 'flex',
						justifyContent: 'flex-end',
						opacity: fadeIn(frame - 40, 8),
					}}
				>
					<div
						style={{
							display: 'inline-flex',
							alignItems: 'center',
							gap: 6,
							padding: '8px 14px',
							borderRadius: 999,
							backgroundColor: `${COLORS.emerald}15`,
							border: `1px solid ${COLORS.emerald}40`,
							fontSize: 18,
							fontWeight: 700,
							color: COLORS.emerald,
						}}
					>
						<span>✓</span>
						<span>{copy.saved}</span>
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

const GrowthScene: React.FC<{ lang: 'ja' | 'en' }> = ({ lang }) => {
	const frame = useCurrentFrame();
	const copy = COPY[lang].growth;

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
				padding: 70,
			}}
		>
			<div style={{ maxWidth: 1000 }}>
				<div
					style={{
						textAlign: 'center',
						marginBottom: 50,
						opacity: fadeIn(frame, 8),
						transform: `translateY(${slideUp(frame, 8, 15)}px)`,
					}}
				>
					<div
						style={{
							fontSize: 50,
							fontWeight: 700,
							color: COLORS.text,
							letterSpacing: '-0.02em',
						}}
					>
						{copy.title}
					</div>
				</div>

				<div
					style={{
						display: 'grid',
						gridTemplateColumns: 'repeat(3, 1fr)',
						gap: 20,
					}}
				>
					{days.map((d, i) => {
						const delay = 12 + i * 7;
						const o = fadeIn(frame - delay, 8);
						const s = scale(frame - delay, 8, 0.88);
						const scoreProgress = interpolate(frame - delay, [0, 15], [0, d.score], {
							easing: easeOut,
							extrapolateLeft: 'clamp',
							extrapolateRight: 'clamp',
						});

						return (
							<Card
								key={d.day}
								style={{
									padding: 28,
									opacity: o,
									transform: `scale(${s})`,
									textAlign: 'center',
								}}
							>
								<div
									style={{
										fontSize: 18,
										fontWeight: 600,
										color: COLORS.textMuted,
										marginBottom: 16,
									}}
								>
									{d.day}
								</div>
								<div
									style={{
										position: 'relative',
										width: 100,
										height: 100,
										margin: '0 auto',
									}}
								>
									<svg
										width="100"
										height="100"
										viewBox="0 0 100 100"
										style={{ transform: 'rotate(-90deg)' }}
									>
										<circle
											cx="50"
											cy="50"
											r="44"
											fill="none"
											stroke={COLORS.overlay}
											strokeWidth="6"
										/>
										<circle
											cx="50"
											cy="50"
											r="44"
											fill="none"
											stroke={COLORS.accent}
											strokeWidth="6"
											strokeDasharray={`${(scoreProgress / 100) * 276.46} 276.46`}
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
											fontSize: 32,
											fontWeight: 800,
											color: COLORS.text,
										}}
									>
										{Math.round(scoreProgress)}%
									</div>
								</div>
								<div
									style={{
										marginTop: 16,
										fontSize: 14,
										fontWeight: 600,
										color: COLORS.textLight,
									}}
								>
									{copy.scoreLabel}
								</div>
							</Card>
						);
					})}
				</div>
			</div>
		</AbsoluteFill>
	);
};

const VisionScene: React.FC<{ lang: 'ja' | 'en' }> = ({ lang }) => {
	const frame = useCurrentFrame();
	const copy = COPY[lang].vision;
	const o = fadeIn(frame, 10);
	const y = slideUp(frame, 10, 30);

	return (
		<AbsoluteFill
			style={{
				backgroundColor: COLORS.bg,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: 70,
			}}
		>
			<div
				style={{
					opacity: o,
					transform: `translateY(${y}px)`,
					textAlign: 'center',
					maxWidth: 950,
				}}
			>
				<div
					style={{
						fontSize: 60,
						fontWeight: 800,
						color: COLORS.text,
						letterSpacing: '-0.03em',
						lineHeight: 1.2,
						marginBottom: 24,
						whiteSpace: 'pre-line',
					}}
				>
					{copy.title}
				</div>
				<div
					style={{
						fontSize: 24,
						fontWeight: 500,
						color: COLORS.textMuted,
						lineHeight: 1.5,
						whiteSpace: 'pre-line',
					}}
				>
					{copy.subtitle}
				</div>
			</div>
		</AbsoluteFill>
	);
};

const ClosingScene: React.FC<{ lang: 'ja' | 'en'; durationInFrames: number }> = ({
	lang,
	durationInFrames,
}) => {
	const frame = useCurrentFrame();
	const copy = COPY[lang].closing;
	const o = fadeIn(frame, 10) * fadeOut(frame, 15, durationInFrames);
	const s = scale(frame, 10, 0.94);
	const y = slideUp(frame, 10, 25);

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
						fontSize: 90,
						marginBottom: 20,
					}}
				>
					🧠
				</div>
				<div
					style={{
						fontSize: 64,
						fontWeight: 800,
						color: COLORS.text,
						letterSpacing: '-0.03em',
						marginBottom: 24,
					}}
				>
					Pocket COO
				</div>
				<Card
					style={{
						display: 'inline-block',
						padding: '16px 36px',
						backgroundColor: COLORS.accent,
						borderColor: COLORS.accent,
					}}
				>
					<div
						style={{
							fontSize: 28,
							fontWeight: 700,
							color: COLORS.card,
						}}
					>
						{copy.cta}
					</div>
				</Card>
				<div
					style={{
						marginTop: 24,
						fontSize: 18,
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

export const PocketCooFounderDemoFast: React.FC<DemoProps> = ({
	fontFamily,
	language = 'ja',
}) => {
	// Faster pacing: 20 seconds total (600 frames at 30fps)
	const scenes = {
		hook: 50,        // 1.67s (was 3s)
		problem: 55,     // 1.83s (was 3s)
		solution: 50,    // 1.67s (was 2.5s)
		memoryLayers: 70, // 2.33s (was 4s)
		useCasePM: 90,   // 3s (was 5s)
		growth: 75,      // 2.5s (was 4s)
		vision: 75,      // 2.5s (was 4s)
		closing: 85,     // 2.83s (was 4.5s)
	};

	return (
		<AbsoluteFill style={{ fontFamily, backgroundColor: COLORS.bg }}>
			<Sequence from={0} durationInFrames={scenes.hook}>
				<HookScene lang={language} />
			</Sequence>

			<Sequence from={50} durationInFrames={scenes.problem}>
				<ProblemScene lang={language} />
			</Sequence>

			<Sequence from={105} durationInFrames={scenes.solution}>
				<SolutionScene lang={language} />
			</Sequence>

			<Sequence from={155} durationInFrames={scenes.memoryLayers}>
				<MemoryLayersScene lang={language} />
			</Sequence>

			<Sequence from={225} durationInFrames={scenes.useCasePM}>
				<UseCasePMScene lang={language} />
			</Sequence>

			<Sequence from={315} durationInFrames={scenes.growth}>
				<GrowthScene lang={language} />
			</Sequence>

			<Sequence from={390} durationInFrames={scenes.vision}>
				<VisionScene lang={language} />
			</Sequence>

			<Sequence from={465} durationInFrames={scenes.closing}>
				<ClosingScene lang={language} durationInFrames={scenes.closing} />
			</Sequence>
		</AbsoluteFill>
	);
};
