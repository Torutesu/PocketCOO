import React from 'react';
import {
	AbsoluteFill,
	Easing,
	Img,
	Sequence,
	interpolate,
	staticFile,
	useCurrentFrame,
} from 'remotion';

type PresscutFounderDemoProps = {
	brandName: string;
	accentColor: string;
	fontFamily: string;
};

const easeOut = Easing.out(Easing.cubic);

const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));

const fade = (f: number, inFrames: number, outFrames: number, total: number) => {
	const i = interpolate(f, [0, inFrames], [0, 1], {
		easing: easeOut,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	const o = interpolate(f, [total - outFrames, total], [1, 0], {
		easing: easeOut,
		extrapolateLeft: 'clamp',
		extrapolateRight: 'clamp',
	});
	return i * o;
};

const BrowserFrame: React.FC<{
	title: string;
	children: React.ReactNode;
}> = ({title, children}) => {
	return (
		<div
			style={{
				borderRadius: 22,
				border: '1px solid rgba(148,163,184,0.18)',
				background: 'rgba(15,23,42,0.70)',
				boxShadow: '0 28px 90px rgba(0,0,0,0.55)',
				overflow: 'hidden',
			}}
		>
			<div
				style={{
					height: 54,
					display: 'flex',
					alignItems: 'center',
					gap: 12,
					padding: '0 18px',
					borderBottom: '1px solid rgba(148,163,184,0.14)',
					background: 'rgba(2,6,23,0.55)',
				}}
			>
				<div style={{display: 'flex', gap: 8}}>
					<div style={{width: 12, height: 12, borderRadius: 999, background: '#EF4444'}} />
					<div style={{width: 12, height: 12, borderRadius: 999, background: '#F59E0B'}} />
					<div style={{width: 12, height: 12, borderRadius: 999, background: '#10B981'}} />
				</div>
				<div
					style={{
						flex: 1,
						height: 34,
						borderRadius: 999,
						border: '1px solid rgba(148,163,184,0.16)',
						background: 'rgba(30,41,59,0.45)',
						display: 'flex',
						alignItems: 'center',
						padding: '0 14px',
						color: 'rgba(226,232,240,0.78)',
						fontSize: 14,
						fontWeight: 800,
					}}
				>
					{title}
				</div>
			</div>
			<div style={{width: '100%', height: '100%'}}>{children}</div>
		</div>
	);
};

const PlaceholderScreen: React.FC<{label: string; accentColor: string}> = ({
	label,
	accentColor,
}) => {
	return (
		<div
			style={{
				width: '100%',
				height: 840,
				display: 'flex',
				alignItems: 'center',
				justifyContent: 'center',
				background:
					'radial-gradient(1000px 700px at 25% 30%, rgba(59,130,246,0.18), transparent 60%), radial-gradient(900px 600px at 70% 60%, rgba(16,185,129,0.14), transparent 55%), rgba(15,23,42,0.92)',
			}}
		>
			<div style={{textAlign: 'center'}}>
				<div style={{fontSize: 16, fontWeight: 900, letterSpacing: 2, color: 'rgba(148,163,184,0.8)'}}>
					DROP IN A REAL SCREENSHOT OR SCREEN RECORDING
				</div>
				<div style={{marginTop: 16, fontSize: 52, fontWeight: 1000, color: 'rgba(226,232,240,0.92)'}}>
					{label}
				</div>
				<div
					style={{
						marginTop: 20,
						display: 'inline-flex',
						alignItems: 'center',
						gap: 10,
						padding: '10px 14px',
						borderRadius: 999,
						border: `1px solid ${accentColor}55`,
						background: `${accentColor}18`,
						color: 'rgba(226,232,240,0.88)',
						fontSize: 16,
						fontWeight: 900,
					}}
				>
					{`public/remotion/presscut/${label.toLowerCase().replace(/\\s+/g, '-')}.png`}
				</div>
			</div>
		</div>
	);
};

const TitleScene: React.FC<{
	startFrame: number;
	durationInFrames: number;
	brandName: string;
	accentColor: string;
}> = ({startFrame, durationInFrames, brandName, accentColor}) => {
	const frame = useCurrentFrame();
	const f = frame - startFrame;
	const opacity = fade(f, 8, 10, durationInFrames);
	const y = interpolate(f, [0, 12], [18, 0], {easing: easeOut, extrapolateRight: 'clamp'});
	const s = interpolate(f, [0, 12], [0.98, 1], {easing: easeOut, extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{opacity, transform: `translateY(${y}px) scale(${s})`}}>
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					background:
						'radial-gradient(900px 600px at 30% 25%, rgba(59,130,246,0.24), transparent 60%), radial-gradient(900px 600px at 75% 65%, rgba(16,185,129,0.16), transparent 55%), #0B1220',
				}}
			>
				<div style={{textAlign: 'center', maxWidth: 1400}}>
					<div style={{fontSize: 18, fontWeight: 900, letterSpacing: 2, color: 'rgba(148,163,184,0.85)'}}>
						FOUNDER-LED DEMO
					</div>
					<div style={{marginTop: 18, fontSize: 92, fontWeight: 1100, color: 'rgba(226,232,240,0.95)'}}>
						{brandName}
					</div>
					<div style={{marginTop: 14, fontSize: 34, fontWeight: 900, color: 'rgba(226,232,240,0.78)'}}>
						The fastest way to show the product value in 60 seconds
					</div>
					<div
						style={{
							marginTop: 22,
							display: 'inline-flex',
							alignItems: 'center',
							gap: 10,
							padding: '12px 18px',
							borderRadius: 999,
							border: `1px solid ${accentColor}55`,
							background: `${accentColor}18`,
							color: 'rgba(226,232,240,0.92)',
							fontSize: 18,
							fontWeight: 1000,
						}}
					>
						Simple language. Real UI. No fluff.
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

const UiScene: React.FC<{
	startFrame: number;
	durationInFrames: number;
	title: string;
	subtitle: string;
	accentColor: string;
	assetPath?: string;
	placeholderLabel: string;
}> = ({startFrame, durationInFrames, title, subtitle, accentColor, assetPath, placeholderLabel}) => {
	const frame = useCurrentFrame();
	const f = frame - startFrame;
	const opacity = fade(f, 6, 8, durationInFrames);
	const x = interpolate(f, [0, 10], [40, 0], {easing: easeOut, extrapolateRight: 'clamp'});

	return (
		<AbsoluteFill style={{opacity}}>
			<div
				style={{
					width: '100%',
					height: '100%',
					display: 'flex',
					alignItems: 'center',
					justifyContent: 'center',
					padding: '0 90px',
					background: '#0B1220',
				}}
			>
				<div style={{width: '100%', maxWidth: 1760, display: 'grid', gridTemplateColumns: '1.35fr 0.65fr', gap: 34}}>
					<div style={{transform: `translateX(${x}px)`}}>
						<BrowserFrame title={title}>
							{assetPath ? (
								<Img
									src={staticFile(assetPath)}
									style={{
										width: '100%',
										height: 840,
										objectFit: 'cover',
										display: 'block',
									}}
								/>
							) : (
								<PlaceholderScreen label={placeholderLabel} accentColor={accentColor} />
							)}
						</BrowserFrame>
					</div>
					<div style={{display: 'flex', alignItems: 'center'}}>
						<div style={{maxWidth: 520}}>
							<div style={{fontSize: 44, fontWeight: 1100, color: 'rgba(226,232,240,0.95)', lineHeight: 1.08}}>
								{title}
							</div>
							<div style={{marginTop: 14, fontSize: 22, fontWeight: 850, color: 'rgba(148,163,184,0.9)', lineHeight: 1.35}}>
								{subtitle}
							</div>
							<div
								style={{
									marginTop: 22,
									padding: '14px 16px',
									borderRadius: 18,
									border: `1px solid ${accentColor}55`,
									background: `${accentColor}12`,
									color: 'rgba(226,232,240,0.88)',
									fontSize: 18,
									fontWeight: 900,
								}}
							>
								Replace this panel with your founder voiceover script.
							</div>
						</div>
					</div>
				</div>
			</div>
		</AbsoluteFill>
	);
};

export const PresscutFounderDemo: React.FC<PresscutFounderDemoProps> = ({
	brandName,
	accentColor,
	fontFamily,
}) => {
	return (
		<AbsoluteFill style={{fontFamily, backgroundColor: '#0B1220'}}>
			<Sequence from={0} durationInFrames={90}>
				<TitleScene startFrame={0} durationInFrames={90} brandName={brandName} accentColor={accentColor} />
			</Sequence>
			<Sequence from={90} durationInFrames={210}>
				<UiScene
					startFrame={90}
					durationInFrames={210}
					title="Start from the marketing promise"
					subtitle="What does the homepage claim? We'll prove it in 3 clicks."
					accentColor={accentColor}
					assetPath={undefined}
					placeholderLabel="Homepage"
				/>
			</Sequence>
			<Sequence from={300} durationInFrames={210}>
				<UiScene
					startFrame={300}
					durationInFrames={210}
					title="The core workflow"
					subtitle="Show the main job-to-be-done, end-to-end, without explaining every feature."
					accentColor={accentColor}
					assetPath={undefined}
					placeholderLabel="Core Workflow"
				/>
			</Sequence>
			<Sequence from={510} durationInFrames={210}>
				<UiScene
					startFrame={510}
					durationInFrames={210}
					title="The payoff"
					subtitle="The moment the customer says: 'Oh, I get it.'"
					accentColor={accentColor}
					assetPath={undefined}
					placeholderLabel="Result"
				/>
			</Sequence>
			<Sequence from={720} durationInFrames={180}>
				<TitleScene startFrame={720} durationInFrames={180} brandName={brandName} accentColor={accentColor} />
			</Sequence>
		</AbsoluteFill>
	);
};

