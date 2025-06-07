import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

const postsDirectory = path.join(process.cwd(), 'posts', 'blog');
const publicImagesDirectory = path.join(process.cwd(), 'public', 'images');

// Disable sharp cache for concurrent operations
sharp.cache(false);

type ImageSize = 'large' | 'medium' | 'small';

interface OptimizeResult {
  optimized: Array<{from: string, to: string[], sizes: ImageSize[]}>;
  skipped: Array<{path: string, reason: string}>;
  errors: Array<{error: string, details: string}>;
}

const supportedContentTypes = [
  'image/jpeg',
  'image/jpg', 
  'image/png',
  'image/tiff',
  'image/gif',
  'image/webp'
];

function findAllImagesInPosts(): string[] {
  const images: string[] = [];
  
  function scanDirectory(directory: string) {
    if (!fs.existsSync(directory)) return;
    
    const items = fs.readdirSync(directory, { withFileTypes: true });
    
    for (const item of items) {
      const fullPath = path.join(directory, item.name);
      
      if (item.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.isFile() && /\.(jpg|jpeg|png|gif|webp|tiff)$/i.test(item.name)) {
        images.push(fullPath);
      }
    }
  }
  
  scanDirectory(postsDirectory);
  return images;
}

function getDestinationDirectory(imagePath: string): string {
  // Extract the path relative to posts/blog
  const relativePath = path.relative(postsDirectory, imagePath);
  
  // Split the path to get [year]/[slug]/filename
  const pathParts = relativePath.split(path.sep);
  
  if (pathParts.length >= 3) {
    // Expected structure: year/slug/filename
    // Extract slug (skip year)
    const slug = pathParts[1];
    
    return path.join(publicImagesDirectory, slug);
  } else {
    // Fallback: preserve the original structure under public/images
    return path.join(publicImagesDirectory, path.dirname(relativePath));
  }
}

function getSizeConfig(size: ImageSize): number {
  switch (size) {
    case 'large':
      return 1920;
    case 'medium':
      return 960;
    case 'small':
      return 480;
    default:
      return 480;
  }
}

async function optimizeImage(inputPath: string, outputDir: string, baseFileName: string): Promise<string[]> {
  const sizes: ImageSize[] = ['large', 'medium', 'small'];
  const outputPaths: string[] = [];
  
  for (const size of sizes) {
    const longSide = getSizeConfig(size);
    const outputFileName = `${baseFileName}_${size}.webp`;
    const outputPath = path.join(outputDir, outputFileName);
    
    try {
      await sharp(inputPath, { failOnError: false, animated: true })
        .rotate()
        .resize(longSide, longSide, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({
          quality: 85,
          effort: 4
        })
        .toFile(outputPath);
      
      outputPaths.push(outputPath);
    } catch (error) {
      console.error(`Failed to create ${size} version of ${inputPath}:`, error);
      throw error;
    }
  }
  
  return outputPaths;
}

function shouldOptimize(filePath: string): boolean {
  const ext = path.extname(filePath).toLowerCase();
  return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.tiff'].includes(ext);
}

async function optimizeImages(): Promise<OptimizeResult> {
  console.log('🔍 Finding images in posts/blog directory...');
  
  const result: OptimizeResult = {
    optimized: [],
    skipped: [],
    errors: []
  };
  
  const images = findAllImagesInPosts();
  console.log(`📊 Found ${images.length} images in posts/blog`);
  
  for (const imagePath of images) {
    try {
      if (!shouldOptimize(imagePath)) {
        result.skipped.push({
          path: imagePath,
          reason: 'Unsupported file type'
        });
        console.log(`⏭️  Skipped ${path.relative(process.cwd(), imagePath)} - unsupported file type`);
        continue;
      }
      
      const destinationDir = getDestinationDirectory(imagePath);
      const originalFileName = path.basename(imagePath);
      const baseFileName = path.parse(originalFileName).name;
      
      // Check if all optimized versions already exist
      const sizes: ImageSize[] = ['large', 'medium', 'small'];
      const expectedOutputPaths = sizes.map(size => 
        path.join(destinationDir, `${baseFileName}_${size}.webp`)
      );
      const existingFiles = expectedOutputPaths.filter(outputPath => fs.existsSync(outputPath));
      
      if (existingFiles.length === sizes.length) {
        result.skipped.push({
          path: imagePath,
          reason: 'All optimized versions already exist'
        });
        console.log(`⏭️  Skipped ${path.relative(process.cwd(), imagePath)} - all WebP variants already exist:`);
        existingFiles.forEach(file => {
          console.log(`     📁 ${path.relative(process.cwd(), file)}`);
        });
        continue;
      } else if (existingFiles.length > 0) {
        console.log(`⚠️  Partial optimization found for ${path.relative(process.cwd(), imagePath)}:`);
        console.log(`     Existing: ${existingFiles.length}/${sizes.length} variants - regenerating all`);
        existingFiles.forEach(file => {
          console.log(`     📁 ${path.relative(process.cwd(), file)}`);
        });
      }
      
      // Create destination directory if it doesn't exist
      if (!fs.existsSync(destinationDir)) {
        fs.mkdirSync(destinationDir, { recursive: true });
      }
      
      // Optimize the image to multiple sizes
      const outputPaths = await optimizeImage(imagePath, destinationDir, baseFileName);
      
      result.optimized.push({
        from: imagePath,
        to: outputPaths,
        sizes: ['large', 'medium', 'small']
      });
      
      console.log(`✅ Generated ${path.relative(process.cwd(), imagePath)} → ${outputPaths.length} WebP variants:`);
      outputPaths.forEach(outputPath => {
        console.log(`     📁 ${path.relative(process.cwd(), outputPath)}`);
      });
      
    } catch (error) {
      result.errors.push({
        error: `Failed to optimize image ${imagePath}`,
        details: error instanceof Error ? error.message : String(error)
      });
      console.error(`❌ Error optimizing ${imagePath}:`, error);
    }
  }
  
  return result;
}

function printSummary(result: OptimizeResult) {
  const totalWebPFiles = result.optimized.reduce((total, item) => total + item.to.length, 0);
  const totalProcessed = result.optimized.length + result.skipped.length + result.errors.length;
  
  console.log('\\n📊 Image Optimization Summary:');
  console.log(`📂 Total images found: ${totalProcessed}`);
  console.log(`✅ Images optimized: ${result.optimized.length}`);
  console.log(`📁 WebP files generated: ${totalWebPFiles}`);
  console.log(`⏭️  Images skipped: ${result.skipped.length}`);
  console.log(`❌ Errors: ${result.errors.length}`);
  
  // Visual progress bar
  if (totalProcessed > 0) {
    const optimizedRatio = result.optimized.length / totalProcessed;
    const skippedRatio = result.skipped.length / totalProcessed;
    const errorRatio = result.errors.length / totalProcessed;
    
    console.log('\\n📈 Processing breakdown:');
    console.log(`   Generated: ${'█'.repeat(Math.round(optimizedRatio * 20))}${'░'.repeat(20 - Math.round(optimizedRatio * 20))} ${(optimizedRatio * 100).toFixed(1)}%`);
    console.log(`   Skipped:   ${'█'.repeat(Math.round(skippedRatio * 20))}${'░'.repeat(20 - Math.round(skippedRatio * 20))} ${(skippedRatio * 100).toFixed(1)}%`);
    if (result.errors.length > 0) {
      console.log(`   Errors:    ${'█'.repeat(Math.round(errorRatio * 20))}${'░'.repeat(20 - Math.round(errorRatio * 20))} ${(errorRatio * 100).toFixed(1)}%`);
    }
  }
  
  if (result.skipped.length > 0) {
    console.log('\\n⏭️  Skipped images:');
    result.skipped.forEach(item => {
      console.log(`  ${path.relative(process.cwd(), item.path)}: ${item.reason}`);
    });
  }
  
  if (result.errors.length > 0) {
    console.log('\\n❌ Errors:');
    result.errors.forEach(err => {
      console.log(`  ${err.error}: ${err.details}`);
    });
  }
  
  console.log('\\n✨ Image optimization completed!');
  console.log('💡 Note: Original images remain in posts/blog/, optimized WebP versions are in public/images/');
}

// Run the image optimization
optimizeImages()
  .then(printSummary)
  .catch((error) => {
    console.error('💥 Script failed:', error);
    process.exit(1);
  });