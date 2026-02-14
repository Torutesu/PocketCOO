import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Img,
	interpolate,
	Sequence,
	staticFile,
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
		},
		growth: {
			title: '使うほど、賢くなる',
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
		},
		growth: {
			title: 'Gets smarter as you use it',
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

// Use case with real UI
const UseCasePMScene: React.FC<{ lang: 'ja' | 'en' }> = ({ lang }) => {
	const frame = useCurrentFrame();
	const copy = COPY[lang].useCase;

	// Check if screenshot exists
	const hasScreenshot = true; // Will be true if screenshot exists

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
			<div style={{ maxWidth: 1400, width: '100%' }}>
				<div
					style={{
						opacity: fadeIn(frame, 8),
						transform: `translateY(${slideUp(frame, 8)}px)`,
						marginBottom: 32,
						textAlign: 'center',
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

				{/* Real UI Screenshot */}
				<div
					style={{
						opacity: fadeIn(frame - 15, 12),
						transform: `scale(${scale(frame - 15, 12, 0.94)})`,
					}}
				>
					<Card
						style={{
							padding: 0,
							overflow: 'hidden',
							width: '100%',
							height: 600,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						{hasScreenshot ? (
							<Img
								src={staticFile('screenshots/chat-usecase.png')}
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
								}}
							/>
						) : (
							<div
								style={{
									padding: 40,
									textAlign: 'center',
									color: COLORS.textMuted,
								}}
							>
								<div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
								<div style={{ fontSize: 20, fontWeight: 600 }}>
									{lang === 'ja'
										? 'スクリーンショットを配置してください'
										: 'Place screenshot here'}
								</div>
								<div
									style={{
										marginTop: 12,
										fontSize: 14,
										color: COLORS.textLight,
									}}
								>
									frontend/public/screenshots/chat-usecase.png
								</div>
							</div>
						)}
					</Card>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// Memory Map with real UI
const MemoryMapScene: React.FC<{ lang: 'ja' | 'en' }> = ({ lang }) => {
	const frame = useCurrentFrame();
	const hasScreenshot = true;

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
			<div style={{ maxWidth: 1300, width: '100%' }}>
				<div
					style={{
						opacity: fadeIn(frame, 8),
						transform: `translateY(${slideUp(frame, 8, 15)}px)`,
						marginBottom: 40,
						textAlign: 'center',
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
						{lang === 'ja' ? 'Memory Map' : 'Memory Map'}
					</div>
					<div
						style={{
							marginTop: 12,
							fontSize: 24,
							fontWeight: 500,
							color: COLORS.textMuted,
						}}
					>
						{lang === 'ja'
							? '記憶のつながりを可視化'
							: 'Visualize memory connections'}
					</div>
				</div>

				<div
					style={{
						opacity: fadeIn(frame - 12, 10),
						transform: `scale(${scale(frame - 12, 10, 0.94)})`,
					}}
				>
					<Card
						style={{
							padding: 0,
							overflow: 'hidden',
							width: '100%',
							height: 600,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						{hasScreenshot ? (
							<Img
								src={staticFile('screenshots/memory-map.png')}
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
								}}
							/>
						) : (
							<div
								style={{
									padding: 40,
									textAlign: 'center',
									color: COLORS.textMuted,
								}}
							>
								<div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
								<div style={{ fontSize: 20, fontWeight: 600 }}>
									{lang === 'ja'
										? 'スクリーンショットを配置してください'
										: 'Place screenshot here'}
								</div>
								<div
									style={{
										marginTop: 12,
										fontSize: 14,
										color: COLORS.textLight,
									}}
								>
									frontend/public/screenshots/memory-map.png
								</div>
							</div>
						)}
					</Card>
				</div>
			</div>
		</AbsoluteFill>
	);
};

// Growth with real UI
const GrowthScene: React.FC<{ lang: 'ja' | 'en' }> = ({ lang }) => {
	const frame = useCurrentFrame();
	const copy = COPY[lang].growth;
	const hasScreenshot = true;

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
			<div style={{ maxWidth: 1200, width: '100%' }}>
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

				<div
					style={{
						opacity: fadeIn(frame - 12, 10),
						transform: `scale(${scale(frame - 12, 10, 0.94)})`,
					}}
				>
					<Card
						style={{
							padding: 0,
							overflow: 'hidden',
							width: '100%',
							height: 600,
							display: 'flex',
							alignItems: 'center',
							justifyContent: 'center',
						}}
					>
						{hasScreenshot ? (
							<Img
								src={staticFile('screenshots/memory-profile.png')}
								style={{
									width: '100%',
									height: '100%',
									objectFit: 'cover',
								}}
							/>
						) : (
							<div
								style={{
									padding: 40,
									textAlign: 'center',
									color: COLORS.textMuted,
								}}
							>
								<div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
								<div style={{ fontSize: 20, fontWeight: 600 }}>
									{lang === 'ja'
										? 'スクリーンショットを配置してください'
										: 'Place screenshot here'}
								</div>
								<div
									style={{
										marginTop: 12,
										fontSize: 14,
										color: COLORS.textLight,
									}}
								>
									frontend/public/screenshots/memory-profile.png
								</div>
							</div>
						)}
					</Card>
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

export const PocketCooFounderDemoWithUI: React.FC<DemoProps> = ({
	fontFamily,
	language = 'ja',
}) => {
	// 22 seconds total with real UI
	const scenes = {
		hook: 50,          // 1.67s
		problem: 55,       // 1.83s
		solution: 50,      // 1.67s
		memoryLayers: 70,  // 2.33s
		useCasePM: 110,    // 3.67s (longer to show real UI)
		memoryMap: 90,     // 3s (new scene for Memory Map)
		growth: 90,        // 3s (show real profile UI)
		vision: 75,        // 2.5s
		closing: 85,       // 2.83s
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

			<Sequence from={335} durationInFrames={scenes.memoryMap}>
				<MemoryMapScene lang={language} />
			</Sequence>

			<Sequence from={425} durationInFrames={scenes.growth}>
				<GrowthScene lang={language} />
			</Sequence>

			<Sequence from={515} durationInFrames={scenes.vision}>
				<VisionScene lang={language} />
			</Sequence>

			<Sequence from={590} durationInFrames={scenes.closing}>
				<ClosingScene lang={language} durationInFrames={scenes.closing} />
			</Sequence>
		</AbsoluteFill>
	);
};
