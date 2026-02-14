import React from 'react';
import {Composition} from 'remotion';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {getInfo as getNotoSansJpInfo, loadFont as loadNotoSansJp} from '@remotion/google-fonts/NotoSansJP';

import {PocketCooDemo30s} from './PocketCooDemo30s';
import {PresscutFounderDemo} from './presscut/PresscutFounderDemo';
import {PocketCooFounderDemo} from './PocketCooFounderDemo';
import {PocketCooFounderDemoFast} from './PocketCooFounderDemoFast';
import {PocketCooFounderDemoWithUI} from './PocketCooFounderDemoWithUI';

const inter = loadInter('normal', {
	weights: ['700', '800', '900'],
	subsets: ['latin'],
	ignoreTooManyRequestsWarning: true,
});

const notoSansJpInfo = getNotoSansJpInfo();
const notoSansJpJapaneseChunks = Object.keys(notoSansJpInfo.fonts.normal['900']).filter((k) =>
	k.startsWith('['),
);

const notoSansJp = loadNotoSansJp('normal', {
	weights: ['900'],
	subsets: notoSansJpJapaneseChunks as unknown as string[],
	ignoreTooManyRequestsWarning: true,
});

const fontFamily = [
	notoSansJp.fontFamily,
	inter.fontFamily,
	'system-ui',
	'-apple-system',
	'BlinkMacSystemFont',
	'"Segoe UI"',
	'Arial',
].join(', ');

export const Root: React.FC = () => {
	return (
		<>
			<Composition
				id="PocketCOO30s"
				component={PocketCooDemo30s}
				durationInFrames={30 * 30}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{
					fontFamily,
				}}
			/>
			<Composition
				id="PresscutFounderDemo"
				component={PresscutFounderDemo}
				durationInFrames={30 * 30}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{
					brandName: 'Presscut',
					accentColor: '#3B82F6',
					fontFamily,
					screens: {
						homepage: '',
						coreWorkflow: '',
						result: '',
					},
					voiceover: {
						homepage: "I'll start on the homepage and show you the promise in under 10 seconds.",
						coreWorkflow: "Here's the core workflow—this is what you'd do every day.",
						result: "And here's the output you'd actually ship to your team/customers.",
					},
				}}
			/>
			<Composition
				id="PocketCOOFounderDemo"
				component={PocketCooFounderDemo}
				durationInFrames={900}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{
					fontFamily,
				}}
			/>
			<Composition
				id="PocketCOOFounderDemoFast-JA"
				component={PocketCooFounderDemoFast}
				durationInFrames={550}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{
					fontFamily,
					language: 'ja',
				}}
			/>
			<Composition
				id="PocketCOOFounderDemoFast-EN"
				component={PocketCooFounderDemoFast}
				durationInFrames={550}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{
					fontFamily,
					language: 'en',
				}}
			/>
			<Composition
				id="PocketCOOFounderDemoWithUI-JA"
				component={PocketCooFounderDemoWithUI}
				durationInFrames={675}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{
					fontFamily,
					language: 'ja',
				}}
			/>
			<Composition
				id="PocketCOOFounderDemoWithUI-EN"
				component={PocketCooFounderDemoWithUI}
				durationInFrames={675}
				fps={30}
				width={1920}
				height={1080}
				defaultProps={{
					fontFamily,
					language: 'en',
				}}
			/>
		</>
	);
};
