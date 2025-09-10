#!/usr/bin/env tsx

import fs from 'fs/promises'
import path from 'path'
import exifr from 'exifr'
import sharp from 'sharp'

interface PhotoData {
  filename: string
  camera: string
  lens: string
}

interface SceneContent {
  title?: string
  date: string
  photos: PhotoData[]
}

async function generateWebpImages(
  inputPath: string, 
  outputDir: string, 
  filename: string
): Promise<void> {
  const baseName = path.parse(filename).name
  const inputFilePath = path.join(inputPath, filename)
  
  // 出力ディレクトリを作成
  await fs.mkdir(outputDir, { recursive: true })
  
  try {
    const image = sharp(inputFilePath)
    const metadata = await image.metadata()
    
    console.log(`    Processing image: ${filename} (${metadata.width}x${metadata.height})`)
    
    // Small版を生成 (長辺1980px)
    const smallOutputPath = path.join(outputDir, `${baseName}_small.webp`)
    if (metadata.width && metadata.height) {
      const isLandscape = metadata.width > metadata.height
      const resizeOptions = isLandscape 
        ? { width: Math.min(metadata.width, 1980) }
        : { height: Math.min(metadata.height, 1980) }
      
      await image
        .rotate() // EXIFの回転情報を自動適用
        .resize(resizeOptions)
        .webp({ quality: 85 })
        .toFile(smallOutputPath)
      
      console.log(`      Generated: ${baseName}_small.webp`)
    }
    
    // Full版を生成 (元サイズ)
    const fullOutputPath = path.join(outputDir, `${baseName}_full.webp`)
    await image
      .rotate() // EXIFの回転情報を自動適用
      .webp({ quality: 95 })
      .toFile(fullOutputPath)
    
    console.log(`      Generated: ${baseName}_full.webp`)
    
  } catch (error) {
    console.error(`    Error processing ${filename}:`, error)
  }
}

async function generateSceneContent(directoryPath: string, title?: string, date?: string): Promise<void> {
  try {
    // ディレクトリの存在確認
    const stats = await fs.stat(directoryPath)
    if (!stats.isDirectory()) {
      throw new Error(`${directoryPath} is not a directory`)
    }

    // 日付が指定されていない場合は現在日付を使用
    const sceneDate = date || new Date().toISOString().split('T')[0] // YYYY-MM-DD形式

    // ディレクトリ内のファイル一覧を取得
    const files = await fs.readdir(directoryPath)
    
    // 画像ファイルをフィルタリング（.jpg, .jpeg, .png, .webp, .tiff）
    const imageFiles = files.filter(file => {
      const ext = path.extname(file).toLowerCase()
      return ['.jpg', '.jpeg', '.png', '.webp', '.tiff'].includes(ext)
    })

    if (imageFiles.length === 0) {
      throw new Error(`No image files found in ${directoryPath}`)
    }

    console.log(`Found ${imageFiles.length} image files`)

    // 出力ディレクトリを決定（ディレクトリ名をそのまま使用）
    const outputDir = path.join(process.cwd(), 'public', 'images', 'photos', path.basename(directoryPath))
    console.log(`Output directory: ${outputDir}`)

    const photos: PhotoData[] = []

    // 各画像ファイルのEXIF情報を読み取り & 画像生成
    for (const filename of imageFiles) {
      const filePath = path.join(directoryPath, filename)
      console.log(`Processing ${filename}...`)
      
      try {
        // EXIFデータを取得（シンプルな設定）
        const exifData = await exifr.parse(filePath)

        let camera = ''
        let lens = ''

        if (exifData) {
          // カメラ情報の組み立て - Make と Model フィールドを大文字小文字を問わず確認
          const makeFields = ['Make', 'make', 'MAKE']
          const modelFields = ['Model', 'model', 'MODEL']
          
          let make = ''
          let model = ''
          
          for (const field of makeFields) {
            if (exifData[field]) {
              make = String(exifData[field]).trim()
              break
            }
          }
          
          for (const field of modelFields) {
            if (exifData[field]) {
              model = String(exifData[field]).trim()
              break
            }
          }
          
          if (make && model) {
            // メーカー名が既にモデル名に含まれている場合は重複を避ける
            if (model.toLowerCase().includes(make.toLowerCase())) {
              camera = model
            } else {
              camera = `${make} ${model}`.trim()
            }
          } else if (model) {
            camera = model
          } else if (make) {
            camera = make
          }

          // レンズ情報の組み立て - 複数のフィールドを大文字小文字を問わず確認
          const lensFields = [
            'LensModel', 'lensModel', 'LENSMODEL',
            'LensMake', 'lensMake', 'LENSMAKE',
            'LensInfo', 'lensInfo', 'LENSINFO',
            'LensSpecification', 'lensSpecification', 'LENSSPECIFICATION'
          ]
          
          for (const field of lensFields) {
            if (exifData[field] && !lens) {
              if (typeof exifData[field] === 'string') {
                lens = exifData[field].trim()
              } else if (Array.isArray(exifData[field])) {
                // LensInfoの配列の場合、有効な数値のみを処理
                const validValues = exifData[field].filter((val: any) => 
                  typeof val === 'number' && !isNaN(val) && val > 0
                )
                if (validValues.length >= 2) {
                  // 焦点距離範囲とF値範囲を表示
                  const focal1 = Math.round(validValues[0])
                  const focal2 = validValues[1] !== validValues[0] ? Math.round(validValues[1]) : null
                  let focalRange = focal2 && focal2 !== focal1 ? `${focal1}-${focal2}mm` : `${focal1}mm`
                  
                  if (validValues.length >= 4) {
                    const f1 = validValues[2]
                    const f2 = validValues[3]
                    const fRange = f2 !== f1 ? `f/${f1}-${f2}` : `f/${f1}`
                    lens = `${focalRange} ${fRange}`
                  } else {
                    lens = focalRange
                  }
                } else {
                  // 有効な値がない場合は空文字列
                  lens = ''
                }
              } else {
                const stringValue = String(exifData[field]).trim()
                if (stringValue && !stringValue.includes('NaN')) {
                  lens = stringValue
                }
              }
              if (lens) break
            }
          }
        }

        photos.push({
          filename,
          camera,
          lens
        })

        console.log(`  Camera: ${camera || 'Unknown'}`)
        console.log(`  Lens: ${lens || 'Unknown'}`)
        
        // WebP画像を生成
        console.log(`  Generating WebP images...`)
        await generateWebpImages(directoryPath, outputDir, filename)
        
      } catch (exifError) {
        console.warn(`Warning: Could not read EXIF data for ${filename}:`, exifError)
        
        // EXIF読み取りに失敗しても画像生成は行う
        console.log(`  Generating WebP images...`)
        await generateWebpImages(directoryPath, outputDir, filename)
        
        photos.push({
          filename,
          camera: '',
          lens: ''
        })
      }
    }

    // content.jsonを生成
    const content: SceneContent = {
      date: sceneDate,
      photos
    }

    if (title) {
      content.title = title
    }

    const contentPath = path.join(directoryPath, 'content.json')
    await fs.writeFile(contentPath, JSON.stringify(content, null, 2), 'utf8')

    console.log(`\nGenerated ${contentPath}`)
    console.log(`Generated WebP images in ${outputDir}`)
    console.log(`Total photos: ${photos.length}`)
    console.log(`Scene date: ${sceneDate}`)
    
    if (title) {
      console.log(`Scene title: ${title}`)
    }

  } catch (error) {
    console.error('Error generating scene content:', error)
    process.exit(1)
  }
}

// CLI引数の処理
const args = process.argv.slice(2)

if (args.length < 1) {
  console.error('Usage: npm run gen-scene <directory-path> [title] [date]')
  console.error('Example: npm run gen-scene ./photos/morning-walk "Morning Walk" "2025-06-08"')
  console.error('Note: If date is not provided, current date will be used')
  process.exit(1)
}

const directoryPath = args[0]
const title = args[1]
const date = args[2]

generateSceneContent(directoryPath, title, date)