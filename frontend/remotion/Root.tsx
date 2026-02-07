import React from 'react';
import {Composition} from 'remotion';
import {loadFont as loadInter} from '@remotion/google-fonts/Inter';
import {getInfo as getNotoSansJpInfo, loadFont as loadNotoSansJp} from '@remotion/google-fonts/NotoSansJP';

import {PocketCooDemo30s} from './PocketCooDemo30s';
import {PresscutFounderDemo} from './presscut/PresscutFounderDemo';

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
				}}
			/>
		</>
	);
};
