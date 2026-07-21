// One-shot image pipeline: heavy source PNGs -> compressed WebP for static/.
// Usage: node scripts/img-webp.mjs
// Sources stay in _assets_src/ (gitignored); only the WebP outputs ship.
import sharp from 'sharp';
import { mkdirSync } from 'node:fs';

const OUT = 'static/images';
mkdirSync(OUT, { recursive: true });

// [src, out, width, quality]
const JOBS = [
	// vehicle product shots (cards) — white studio bg compresses well
	['_assets_src/images/T_LandCruiser_Car.png', `${OUT}/LandCruiserFJ-VX.webp`, 1600, 74],
	['_assets_src/images/T_Alphard_Car.png', `${OUT}/AlphardHybrid-Z.webp`, 1600, 74],
	// lifestyle scenes (full-bleed sliders / parallax)
	['_assets_src/images/T_Alphard_scene_01.png', `${OUT}/scene-machiya.webp`, 2400, 60],
	['_assets_src/images/T_Alphard_scene_02.png', `${OUT}/scene-coast.webp`, 2400, 60],
	['_assets_src/images/T_LandCruiser_scene_01.png', `${OUT}/scene-mountain.webp`, 2400, 60],
	// legacy assets still in use, converted from heavy PNG
	['_assets_src/images/car_10.png', `${OUT}/scene-aerial.webp`, 1600, 62],
	['_assets_src/images/cleaning.png', `${OUT}/cleaning.webp`, 2000, 62]
];

for (const [src, out, width, quality] of JOBS) {
	const img = sharp(src).resize({ width, withoutEnlargement: true }).webp({ quality });
	const info = await img.toFile(out);
	console.log(`${out}  ${(info.size / 1024).toFixed(0)}KB  ${info.width}x${info.height}`);
}
