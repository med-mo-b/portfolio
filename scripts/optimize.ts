/**
 * Image Optimization Script
 * Converts PNG/JPG images to WebP format with multiple size variants
 * Also generates missing size variants for existing WebP files
 * 
 * Usage: bun scripts/optimize.ts
 * Requires: bun add -d sharp
 */

import sharp from 'sharp';
import { readdir, stat } from 'node:fs/promises';
import { join } from 'node:path';

const IMG_DIR = './public/images';

async function optimizeImages(): Promise<void> {
    try {
        const files = await readdir(IMG_DIR);
        const imageFiles = files.filter(file => 
            file.endsWith('.png') || 
            file.endsWith('.jpg') || 
            file.endsWith('.jpeg')
        );

        if (imageFiles.length === 0) {
            console.log('No PNG/JPG images found in', IMG_DIR);
            return;
        }

        console.log(`Found ${imageFiles.length} image(s) to process...\n`);

        for (const file of imageFiles) {
            const inputPath = join(IMG_DIR, file);
            const baseName = file.replace(/\.(png|jpg|jpeg)$/i, '');
            const outputBase = join(IMG_DIR, baseName);

            // Skip if WebP already exists
            const webpPath = `${outputBase}.webp`;
            try {
                await stat(webpPath);
                console.log(`⏭️  Skipping ${file} (WebP already exists)`);
                continue;
            } catch {
                // File doesn't exist, proceed with conversion
            }

            console.log(`📸 Processing ${file}...`);

            try {
                // Get image metadata to determine original dimensions
                const metadata = await sharp(inputPath).metadata();
                const originalWidth = metadata.width || 1200;

                // Create original WebP (maintain original size)
                await sharp(inputPath)
                    .webp({ quality: 85 })
                    .toFile(`${outputBase}.webp`);
                console.log(`   ✓ Created ${baseName}.webp`);

                // Create medium variant (800px width, maintain aspect ratio)
                await sharp(inputPath)
                    .resize(800, null, {
                        withoutEnlargement: true,
                        fit: 'inside'
                    })
                    .webp({ quality: 85 })
                    .toFile(`${outputBase}-medium.webp`);
                console.log(`   ✓ Created ${baseName}-medium.webp (800w)`);

                // Create small variant (400px width, maintain aspect ratio)
                await sharp(inputPath)
                    .resize(400, null, {
                        withoutEnlargement: true,
                        fit: 'inside'
                    })
                    .webp({ quality: 85 })
                    .toFile(`${outputBase}-small.webp`);
                console.log(`   ✓ Created ${baseName}-small.webp (400w)`);

                console.log(`   ✅ Completed ${file}\n`);
            } catch (error) {
                console.error(`   ❌ Error processing ${file}:`, error);
            }
        }

        console.log('✨ PNG/JPG to WebP conversion complete!\n');
    } catch (error) {
        console.error('Error reading image directory:', error);
        process.exit(1);
    }
}

/**
 * Generate missing size variants for existing WebP files
 */
async function generateWebPVariants(): Promise<void> {
    try {
        const files = await readdir(IMG_DIR);
        // Find WebP files that are NOT variants themselves (exclude -small.webp, -medium.webp)
        const webpFiles = files.filter(file => 
            file.endsWith('.webp') && 
            !file.includes('-small.webp') && 
            !file.includes('-medium.webp')
        );

        if (webpFiles.length === 0) {
            console.log('No WebP files found in', IMG_DIR);
            return;
        }

        console.log(`Found ${webpFiles.length} WebP file(s) to check for variants...\n`);

        for (const file of webpFiles) {
            const inputPath = join(IMG_DIR, file);
            const baseName = file.replace('.webp', '');
            const outputBase = join(IMG_DIR, baseName);

            const smallPath = `${outputBase}-small.webp`;
            const mediumPath = `${outputBase}-medium.webp`;

            // Check which variants are missing
            let needsSmall = false;
            let needsMedium = false;

            try {
                await stat(smallPath);
            } catch {
                needsSmall = true;
            }

            try {
                await stat(mediumPath);
            } catch {
                needsMedium = true;
            }

            // Skip if both variants already exist
            if (!needsSmall && !needsMedium) {
                console.log(`⏭️  Skipping ${file} (all variants already exist)`);
                continue;
            }

            console.log(`📸 Processing ${file}...`);

            try {
                if (needsSmall) {
                    await sharp(inputPath)
                        .resize(400, null, {
                            withoutEnlargement: true,
                            fit: 'inside'
                        })
                        .webp({ quality: 85 })
                        .toFile(smallPath);
                    console.log(`   ✓ Created ${baseName}-small.webp (400w)`);
                }

                if (needsMedium) {
                    await sharp(inputPath)
                        .resize(800, null, {
                            withoutEnlargement: true,
                            fit: 'inside'
                        })
                        .webp({ quality: 85 })
                        .toFile(mediumPath);
                    console.log(`   ✓ Created ${baseName}-medium.webp (800w)`);
                }

                console.log(`   ✅ Completed ${file}\n`);
            } catch (error) {
                console.error(`   ❌ Error processing ${file}:`, error);
            }
        }

        console.log('✨ WebP variant generation complete!');
    } catch (error) {
        console.error('Error generating WebP variants:', error);
    }
}

// Run the optimization
async function main(): Promise<void> {
    await optimizeImages();
    await generateWebPVariants();
    console.log('\n🎉 All optimizations complete!');
}

main();
