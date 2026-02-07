import React, {useMemo} from 'react';
import {
	AbsoluteFill,
	Easing,
	interpolate,
	Sequence,
	useCurrentFrame,
} from 'remotion';

type DemoProps = {
	fontFamily: string;
};

const COLORS = {
	bg: '#0F172A',
	card: '#1E293B',
	blue: '#3B82F6',
	green: '#10B981',
	red: '#EF4444',
	text: '#E2E8F0',
	muted: '#94A3B8',
};

const easeOut = Easing.out(Easing.cubic);

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

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

const slideInX = (frame: number, duration: number, fromX: number) =>
	interpolate(frame, [0, duration], [fromX, 0], {
		easing: easeOut,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

const popScale = (frame: number, duration: number) =>
	interpolate(frame, [0, duration], [0.92, 1], {
		easing: easeOut,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

const SceneWrap: React.FC<{
	startFrame: number;
	durationInFrames: number;
	children: React.ReactNode;
}> = ({children}) => {
	return <AbsoluteFill>{children}</AbsoluteFill>;
};

const Card: React.FC<{
	style?: React.CSSProperties;
	children: React.ReactNode;
}> = ({style, children}) => {
	return (
		<div
			style={{
				backgroundColor: COLORS.card,
				border: `1px solid rgba(148,163,184,0.18)`,
				borderRadius: 24,
				boxShadow: '0 20px 60px rgba(0,0,0,0.35)',
				...style,
			}}
		>
			{children}
		</div>
	);
};

const TopLabel: React.FC<{text: string}> = ({text}) => {
	return (
		<div
			style={{
				position: 'absolute',
				top: 48,
				left: 64,
				fontSize: 34,
				fontWeight: 800,
				letterSpacing: 0.5,
				color: COLORS.muted,
				textTransform: 'uppercase',
			}}
		>
			{text}
		</div>
	);
};

const Bubble: React.FC<{
	text: string;
	kind: 'user' | 'ai';
	atFrame: number;
	startFrame: number;
}> = ({text, kind, atFrame, startFrame}) => {
	const frame = useCurrentFrame();
	const f = frame - startFrame - atFrame;
	const opacity = fadeIn(f, 6);
	const x = slideInX(f, 6, kind === 'user' ? 36 : -36);
	const y = interpolate(f, [0, 6], [8, 0], {easing: easeOut, extrapolateRight: 'clamp'});

	const isUser = kind === 'user';
	return (
		<div
			style={{
				alignSelf: isUser ? 'flex-end' : 'flex-start',
				maxWidth: 980,
				padding: '22px 26px',
				borderRadius: 22,
				background: isUser
					? 'linear-gradient(180deg, rgba(59,130,246,0.22), rgba(59,130,246,0.10))'
					: 'linear-gradient(180deg, rgba(148,163,184,0.16), rgba(148,163,184,0.08))',
				border: `1px solid ${isUser ? 'rgba(59,130,246,0.35)' : 'rgba(148,163,184,0.22)'}`,
				color: COLORS.text,
				fontSize: 42,
				fontWeight: 800,
				lineHeight: 1.22,
				opacity,
				transform: `translate3d(${x}px, ${y}px, 0)`,
				whiteSpace: 'pre-wrap',
			}}
		>
			{text}
		</div>
	);
};

const Tag: React.FC<{
	text: string;
	atFrame: number;
	startFrame: number;
	color: 'blue' | 'green';
}> = ({text, atFrame, startFrame, color}) => {
	const frame = useCurrentFrame();
	const f = frame - startFrame - atFrame;
	const opacity = fadeIn(f, 5);
	const s = popScale(f, 5);
	const background = color === 'green' ? 'rgba(16,185,129,0.16)' : 'rgba(59,130,246,0.16)';
	const border = color === 'green' ? 'rgba(16,185,129,0.42)' : 'rgba(59,130,246,0.42)';
	const textColor = color === 'green' ? '#A7F3D0' : '#BFDBFE';
	return (
		<div
			style={{
				display: 'inline-flex',
				alignItems: 'center',
				gap: 10,
				padding: '10px 14px',
				borderRadius: 999,
				background,
				border: `1px solid ${border}`,
				color: textColor,
				fontSize: 26,
				fontWeight: 900,
				letterSpacing: 0.3,
				opacity,
				transform: `scale(${s})`,
			}}
		>
			<span style={{opacity: 0.85}}>#</span>
			<span>{text}</span>
		</div>
	);
};

const ScoreCard: React.FC<{
	label: string;
	targetPercent: number;
	atFrame: number;
	startFrame: number;
}> = ({label, targetPercent, atFrame, startFrame}) => {
	const frame = useCurrentFrame();
	const f = frame - startFrame - atFrame;
	const opacity = fadeIn(f, 6);
	const progress = interpolate(f, [0, 9], [0, targetPercent], {
		easing: easeOut,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const shown = Math.round(clamp(progress, 0, targetPercent));

	return (
		<div style={{opacity}}>
			<Card
				style={{
					padding: 28,
					width: 520,
				}}
			>
				<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'baseline'}}>
					<div style={{fontSize: 24, color: COLORS.muted, fontWeight: 900}}>{label}</div>
					<div style={{fontSize: 38, color: COLORS.text, fontWeight: 950}}>{shown}%</div>
				</div>
				<div
					style={{
						marginTop: 18,
						height: 14,
						borderRadius: 999,
						backgroundColor: 'rgba(148,163,184,0.18)',
						overflow: 'hidden',
						border: '1px solid rgba(148,163,184,0.14)',
					}}
				>
					<div
						style={{
							height: '100%',
							width: `${clamp(progress, 0, 100)}%`,
							background: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.green})`,
						}}
					/>
				</div>
				<div style={{marginTop: 14, fontSize: 18, color: COLORS.muted, fontWeight: 800}}>
					記憶スコア
				</div>
			</Card>
		</div>
	);
};

const ChatLayout: React.FC<{
	children: React.ReactNode;
	side?: React.ReactNode;
}> = ({children, side}) => {
	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				gap: 44,
				padding: '0 80px',
			}}
		>
			<Card
				style={{
					width: 1180,
					padding: 34,
				}}
			>
				<div style={{display: 'flex', flexDirection: 'column', gap: 20}}>{children}</div>
			</Card>
			<div style={{width: 560}}>{side}</div>
		</div>
	);
};

const ScorePill: React.FC<{
	label: string;
	targetPercent: number;
	atFrame: number;
	startFrame: number;
}> = ({label, targetPercent, atFrame, startFrame}) => {
	const frame = useCurrentFrame();
	const f = frame - startFrame - atFrame;
	const opacity = fadeIn(f, 6);
	const progress = interpolate(f, [0, 9], [0, targetPercent], {
		easing: easeOut,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const shown = Math.round(clamp(progress, 0, targetPercent));

	return (
		<div
			style={{
				opacity,
				display: 'flex',
				alignItems: 'center',
				gap: 14,
				padding: '10px 14px',
				borderRadius: 999,
				border: '1px solid rgba(148,163,184,0.22)',
				background: 'rgba(30,41,59,0.75)',
				backdropFilter: 'blur(8px)',
				WebkitBackdropFilter: 'blur(8px)',
				minWidth: 320,
			}}
		>
			<div style={{fontSize: 16, fontWeight: 900, color: COLORS.muted, letterSpacing: 0.3}}>
				{label}
			</div>
			<div style={{flex: 1, height: 10, borderRadius: 999, background: 'rgba(148,163,184,0.18)', overflow: 'hidden'}}>
				<div
					style={{
						height: '100%',
						width: `${clamp(progress, 0, 100)}%`,
						background: `linear-gradient(90deg, ${COLORS.blue}, ${COLORS.green})`,
					}}
				/>
			</div>
			<div style={{fontSize: 20, fontWeight: 950, color: COLORS.text, width: 56, textAlign: 'right'}}>
				{shown}%
			</div>
		</div>
	);
};

const MapMock: React.FC = () => {
	const nodes = [
		{x: 0.18, y: 0.28, r: 18},
		{x: 0.42, y: 0.22, r: 12},
		{x: 0.66, y: 0.32, r: 14},
		{x: 0.28, y: 0.55, r: 12},
		{x: 0.52, y: 0.58, r: 18},
		{x: 0.78, y: 0.62, r: 12},
	];
	const links: Array<[number, number]> = [
		[0, 1],
		[1, 2],
		[0, 3],
		[3, 4],
		[4, 2],
		[4, 5],
	];

	return (
		<div style={{position: 'relative', width: '100%', height: '100%'}}>
			<svg width="100%" height="100%" viewBox="0 0 1000 700" preserveAspectRatio="none">
				<defs>
					<linearGradient id="linkGrad" x1="0" y1="0" x2="1" y2="1">
						<stop offset="0%" stopColor={COLORS.blue} stopOpacity={0.35} />
						<stop offset="100%" stopColor={COLORS.green} stopOpacity={0.28} />
					</linearGradient>
				</defs>
				{links.map(([a, b], i) => {
					const na = nodes[a];
					const nb = nodes[b];
					return (
						<line
							key={i}
							x1={na.x * 1000}
							y1={na.y * 700}
							x2={nb.x * 1000}
							y2={nb.y * 700}
							stroke="url(#linkGrad)"
							strokeWidth={3}
						/>
					);
				})}
			</svg>

			{nodes.map((n, i) => (
				<div
					key={i}
					style={{
						position: 'absolute',
						left: `${n.x * 100}%`,
						top: `${n.y * 100}%`,
						transform: 'translate(-50%, -50%)',
						width: n.r * 2,
						height: n.r * 2,
						borderRadius: 999,
						background:
							i % 2 === 0
								? 'rgba(59,130,246,0.22)'
								: 'rgba(16,185,129,0.18)',
						border:
							i % 2 === 0
								? '1px solid rgba(59,130,246,0.55)'
								: '1px solid rgba(16,185,129,0.55)',
						boxShadow:
							i % 2 === 0
								? '0 0 40px rgba(59,130,246,0.22)'
								: '0 0 40px rgba(16,185,129,0.18)',
					}}
				/>
			))}
		</div>
	);
};

const SpaceUi: React.FC<{
	startFrame: number;
	day: string;
	scoreTarget: number;
	scoreAtFrame: number;
	children: React.ReactNode;
	memoryTags?: React.ReactNode;
}> = ({startFrame, day, scoreTarget, scoreAtFrame, children, memoryTags}) => {
	return (
		<div
			style={{
				width: '100%',
				height: '100%',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				padding: '0 70px',
			}}
		>
			<Card
				style={{
					width: 1780,
					height: 930,
					overflow: 'hidden',
					background:
						'linear-gradient(180deg, rgba(30,41,59,0.65), rgba(30,41,59,0.38))',
				}}
			>
				<div
					style={{
						height: 86,
						display: 'flex',
						alignItems: 'center',
						justifyContent: 'space-between',
						padding: '0 26px',
						borderBottom: '1px solid rgba(148,163,184,0.16)',
					}}
				>
					<div style={{display: 'flex', alignItems: 'center', gap: 16}}>
						<div style={{fontSize: 26, fontWeight: 1000, color: COLORS.text}}>
							🧠 Pocket COO
						</div>
						<div
							style={{
								display: 'flex',
								alignItems: 'center',
								gap: 10,
								fontSize: 16,
								fontWeight: 900,
								color: COLORS.muted,
							}}
						>
							<div style={{padding: '8px 12px', borderRadius: 999, background: 'rgba(148,163,184,0.10)', border: '1px solid rgba(148,163,184,0.14)'}}>
								Chat
							</div>
							<div style={{padding: '8px 12px', borderRadius: 999, background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.10)'}}>
								Map
							</div>
							<div style={{padding: '8px 12px', borderRadius: 999, background: 'rgba(148,163,184,0.06)', border: '1px solid rgba(148,163,184,0.10)'}}>
								Memory
							</div>
						</div>
					</div>
					<div style={{display: 'flex', alignItems: 'center', gap: 16}}>
						<div style={{fontSize: 18, fontWeight: 1000, color: COLORS.muted, letterSpacing: 0.4}}>
							{day}
						</div>
						<ScorePill
							startFrame={startFrame}
							atFrame={scoreAtFrame}
							label="Memory"
							targetPercent={scoreTarget}
						/>
					</div>
				</div>
				<div
					style={{
						height: 930 - 86,
						display: 'grid',
						gridTemplateColumns: '1.35fr 1fr 0.8fr',
						gap: 18,
						padding: 18,
					}}
				>
					<Card style={{padding: 22, overflow: 'hidden'}}>
						<div style={{display: 'flex', flexDirection: 'column', gap: 18}}>{children}</div>
					</Card>
					<Card style={{padding: 18}}>
						<div style={{height: '100%'}}>
							<div style={{fontSize: 16, fontWeight: 900, color: COLORS.muted}}>Memory Map</div>
							<div style={{marginTop: 12, height: 'calc(100% - 28px)'}}>
								<MapMock />
							</div>
						</div>
					</Card>
					<Card style={{padding: 18}}>
						<div style={{fontSize: 16, fontWeight: 900, color: COLORS.muted}}>Remembered</div>
						<div style={{marginTop: 12, display: 'flex', flexWrap: 'wrap', gap: 10}}>
							{memoryTags}
						</div>
						<div style={{marginTop: 18, fontSize: 14, fontWeight: 900, color: 'rgba(226,232,240,0.70)'}}>
							スタイル: 結論→理由→次アクション
						</div>
						<div style={{marginTop: 8, fontSize: 14, fontWeight: 900, color: 'rgba(226,232,240,0.70)'}}>
							形式: 箇条書き + 必要なら表
						</div>
					</Card>
				</div>
			</Card>
		</div>
	);
};

const HookScene: React.FC<{startFrame: number; durationInFrames: number}> = ({
	startFrame,
	durationInFrames,
}) => {
	return (
		<SceneWrap startFrame={startFrame} durationInFrames={durationInFrames}>
			<ChatLayout>
				<Bubble startFrame={startFrame} atFrame={0} kind="user" text="先週話したじゃん" />
				<Bubble startFrame={startFrame} atFrame={18} kind="ai" text="記憶がありません" />
			</ChatLayout>
		</SceneWrap>
	);
};

const ProblemScene: React.FC<{startFrame: number; durationInFrames: number}> = ({
	startFrame,
	durationInFrames,
}) => {
	const frame = useCurrentFrame();
	const f = frame - startFrame;
	const s = popScale(f, 6);
	const o = fadeIn(f, 6);

	const items = useMemo(
		() => [
			{title: '毎回ゼロから', sub: '会話が積み上がらない'},
			{title: '覚えない', sub: '好み・前提が残らない'},
			{title: '学習しない', sub: '同じ指示を繰り返す'},
		],
		[],
	);

	return (
		<SceneWrap startFrame={startFrame} durationInFrames={durationInFrames}>
			<div style={{width: '100%', height: '100%', padding: '0 90px', display: 'flex', alignItems: 'center'}}>
				<div style={{width: '100%', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 26}}>
					{items.map((it) => (
						<Card key={it.title} style={{padding: 34, opacity: o, transform: `scale(${s})`}}>
							<div style={{display: 'flex', alignItems: 'center', gap: 14}}>
								<div style={{fontSize: 44, fontWeight: 1000, color: COLORS.red}}>✕</div>
								<div style={{fontSize: 44, fontWeight: 1000, color: COLORS.text}}>{it.title}</div>
							</div>
							<div style={{marginTop: 14, fontSize: 24, fontWeight: 800, color: COLORS.muted}}>
								{it.sub}
							</div>
						</Card>
					))}
				</div>
			</div>
		</SceneWrap>
	);
};

const SolutionScene: React.FC<{startFrame: number; durationInFrames: number}> = ({
	startFrame,
	durationInFrames,
}) => {
	const frame = useCurrentFrame();
	const f = frame - startFrame;
	const s = interpolate(f, [0, 10], [0.88, 1], {easing: easeOut, extrapolateRight: 'clamp'});
	const o = fadeIn(f, 8);
	const y = interpolate(f, [0, 10], [18, 0], {easing: easeOut, extrapolateRight: 'clamp'});

	return (
		<SceneWrap startFrame={startFrame} durationInFrames={durationInFrames}>
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
				}}
			>
				<div style={{textAlign: 'center', opacity: o, transform: `translateY(${y}px) scale(${s})`}}>
					<div style={{fontSize: 120, filter: 'drop-shadow(0 20px 40px rgba(0,0,0,0.45))'}}>🧠</div>
					<div
						style={{
							marginTop: 18,
							fontSize: 86,
							fontWeight: 1000,
							letterSpacing: 0.4,
							color: COLORS.text,
						}}
					>
						Pocket COO
					</div>
					<div style={{marginTop: 10, fontSize: 34, fontWeight: 900, color: COLORS.blue}}>
						育つ分身AI
					</div>
				</div>
			</div>
		</SceneWrap>
	);
};

const Day1Scene: React.FC<{startFrame: number; durationInFrames: number}> = ({
	startFrame,
	durationInFrames,
}) => {
	return (
		<SceneWrap startFrame={startFrame} durationInFrames={durationInFrames}>
			<SpaceUi
				startFrame={startFrame}
				day="Day 1"
				scoreAtFrame={66}
				scoreTarget={15}
				memoryTags={
					<>
						<Tag startFrame={startFrame} atFrame={44} color="blue" text="市場調査" />
						<Tag startFrame={startFrame} atFrame={48} color="green" text="箇条書き" />
					</>
				}
			>
				<Bubble startFrame={startFrame} atFrame={0} kind="user" text="市場調査やって" />
				<Bubble startFrame={startFrame} atFrame={14} kind="user" text="箇条書きで" />
				<Bubble
					startFrame={startFrame}
					atFrame={28}
					kind="ai"
					text={'了解。\n・市場規模\n・顧客課題\n・競合動向'}
				/>
			</SpaceUi>
		</SceneWrap>
	);
};

const Day7Scene: React.FC<{startFrame: number; durationInFrames: number}> = ({
	startFrame,
	durationInFrames,
}) => {
	const frame = useCurrentFrame();
	const f = frame - startFrame - 54;
	const o = fadeIn(f, 6);
	const y = interpolate(f, [0, 6], [10, 0], {easing: easeOut, extrapolateRight: 'clamp'});
	return (
		<SceneWrap startFrame={startFrame} durationInFrames={durationInFrames}>
			<SpaceUi
				startFrame={startFrame}
				day="Day 7"
				scoreAtFrame={66}
				scoreTarget={35}
				memoryTags={
					<>
						<Tag startFrame={startFrame} atFrame={44} color="blue" text="競合分析" />
						<Tag startFrame={startFrame} atFrame={50} color="green" text="要点から" />
					</>
				}
			>
				<Bubble startFrame={startFrame} atFrame={0} kind="user" text="競合分析" />
				<Bubble startFrame={startFrame} atFrame={16} kind="ai" text="前回の希望に沿って、要点から整理します。" />
				<div
					style={{
						marginTop: 6,
						alignSelf: 'flex-end',
						color: COLORS.green,
						fontSize: 34,
						fontWeight: 1000,
						opacity: o,
						transform: `translateY(${y}px)`,
					}}
				>
					覚えてるじゃん👍
				</div>
			</SpaceUi>
		</SceneWrap>
	);
};

const Check: React.FC<{atFrame: number; startFrame: number; i: number}> = ({
	atFrame,
	startFrame,
	i,
}) => {
	const frame = useCurrentFrame();
	const f = frame - startFrame - atFrame - i * 3;
	const o = fadeIn(f, 5);
	const s = popScale(f, 5);
	return (
		<div
			style={{
				width: 74,
				height: 74,
				borderRadius: 18,
				background: 'rgba(16,185,129,0.18)',
				border: '1px solid rgba(16,185,129,0.55)',
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				color: '#A7F3D0',
				fontSize: 40,
				fontWeight: 1000,
				opacity: o,
				transform: `scale(${s})`,
			}}
		>
			✓
		</div>
	);
};

const Day30Scene: React.FC<{startFrame: number; durationInFrames: number}> = ({
	startFrame,
	durationInFrames,
}) => {
	const frame = useCurrentFrame();
	const highlightF = frame - startFrame - 18;
	const glow = interpolate(highlightF, [0, 15], [0, 1], {
		easing: easeOut,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});

	return (
		<SceneWrap startFrame={startFrame} durationInFrames={durationInFrames}>
			<SpaceUi
				startFrame={startFrame}
				day="Day 30"
				scoreAtFrame={150}
				scoreTarget={78}
				memoryTags={
					<>
						<Tag startFrame={startFrame} atFrame={38} color="blue" text="いつもの感じで" />
						<Tag startFrame={startFrame} atFrame={48} color="green" text="トーン" />
						<Tag startFrame={startFrame} atFrame={54} color="green" text="形式" />
					</>
				}
			>
				<div style={{position: 'relative', alignSelf: 'flex-end'}}>
					<Bubble startFrame={startFrame} atFrame={0} kind="user" text="いつもの感じで" />
					<div
						style={{
							position: 'absolute',
							inset: -8,
							borderRadius: 26,
							boxShadow: `0 0 0 1px rgba(59,130,246,0.4), 0 0 70px rgba(59,130,246,${0.55 * glow})`,
							opacity: glow,
							pointerEvents: 'none',
						}}
					/>
				</div>
				<div style={{display: 'flex', gap: 12, marginTop: 18, alignSelf: 'flex-end'}}>
					{new Array(5).fill(0).map((_, i) => (
						<Check key={i} startFrame={startFrame} atFrame={40} i={i} />
					))}
				</div>
				<Bubble startFrame={startFrame} atFrame={74} kind="ai" text="完璧。" />
			</SpaceUi>
		</SceneWrap>
	);
};

const ClosingScene: React.FC<{startFrame: number; durationInFrames: number}> = ({
	startFrame,
	durationInFrames,
}) => {
	const frame = useCurrentFrame();
	const f = frame - startFrame;
	const o = fadeIn(f, 8) * fadeOut(f, 18, durationInFrames);
	const y = interpolate(f, [0, 10], [14, 0], {easing: easeOut, extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{opacity: o, transform: `translateY(${y}px)`}}>
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					flexDirection: 'column',
					gap: 18,
					textAlign: 'center',
				}}
			>
				<div style={{fontSize: 96, fontWeight: 1000, color: COLORS.text}}>🧠 Pocket COO</div>
				<div style={{fontSize: 44, fontWeight: 900, color: COLORS.muted}}>
					「いつもの感じで」が通じるAI
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const PocketCooDemo30s: React.FC<DemoProps> = ({fontFamily}) => {
	return (
		<AbsoluteFill
			style={{
				backgroundColor: COLORS.bg,
				fontFamily,
			}}
		>
			<Sequence from={0} durationInFrames={90}>
				<HookScene startFrame={0} durationInFrames={90} />
			</Sequence>
			<Sequence from={90} durationInFrames={90}>
				<ProblemScene startFrame={90} durationInFrames={90} />
			</Sequence>
			<Sequence from={180} durationInFrames={60}>
				<SolutionScene startFrame={180} durationInFrames={60} />
			</Sequence>
			<Sequence from={240} durationInFrames={150}>
				<Day1Scene startFrame={240} durationInFrames={150} />
			</Sequence>
			<Sequence from={390} durationInFrames={150}>
				<Day7Scene startFrame={390} durationInFrames={150} />
			</Sequence>
			<Sequence from={540} durationInFrames={210}>
				<Day30Scene startFrame={540} durationInFrames={210} />
			</Sequence>
			<Sequence from={750} durationInFrames={150}>
				<ClosingScene startFrame={750} durationInFrames={150} />
			</Sequence>
		</AbsoluteFill>
	);
};
