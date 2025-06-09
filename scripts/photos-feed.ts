#!/usr/bin/env tsx

import fs from 'fs/promises'
import path from 'path'
import { getAllPhotoScenes } from '../src/lib/photos.js'

interface FeedEntry {
  title: string
  id: string
  updated: string
  summary: string
  enclosures: Array<{
    href: string
    type: string
  }>
}

async function generatePhotosFeed(): Promise<void> {
  try {
    console.log('Generating photos RSS feed...')
    
    // photosデータを取得
    const scenes = getAllPhotoScenes()
    
    if (scenes.length === 0) {
      console.log('No photo scenes found')
      return
    }
    
    // feedエントリを生成
    const entries: FeedEntry[] = scenes.map(scene => {
      // 機材情報をまとめる
      const cameras = new Set<string>()
      const lenses = new Set<string>()
      const cameraInfoStrings = scene.photos.map(photo => {
	if (photo.lens) {
	  return `${photo.camera} / ${photo.lens}`;
	} else {
	  return photo.camera;
	}
      });

      const summary = `${cameraInfoStrings.join(', ')} で撮影`;
      
      // 画像のenclosureリンクを生成
      const enclosures = scene.photos.map(photo => {
        const baseName = photo.filename.split('.')[0]
        return {
          href: `https://horimisli.me/images/photos/${scene.date}/${baseName}_full.webp`,
          type: 'image/webp'
        }
      })
      
      return {
        title: scene.title || scene.date,
        id: `https://horimisli.me/photos/${scene.date}`,
        updated: new Date(scene.date + 'T12:00:00Z').toISOString(),
        summary,
        enclosures
      }
    })
    
    // 最新の更新日時を取得
    const latestUpdate = entries.length > 0 
      ? entries[0].updated 
      : new Date().toISOString()
    
    // Atom XMLを生成
    const atomXml = `<?xml version="1.0" encoding="UTF-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>horimisli.me/photos</title>
  <link href="https://horimisli.me/photos" />
  <updated>${latestUpdate}</updated>
  <author>
    <name>horimislime</name>
  </author>
  <id>https://horimisli.me/photos-feed</id>

${entries.map(entry => `  <entry>
    <title>${escapeXml(entry.title)}</title>
${entry.enclosures.map(enclosure => 
    `    <link rel="enclosure" type="${enclosure.type}" href="${enclosure.href}" />`
  ).join('\n')}
    <id>${entry.id}</id>
    <updated>${entry.updated}</updated>
    <summary>${escapeXml(entry.summary)}</summary>
  </entry>`).join('\n\n')}
</feed>`
    
    // public/photos-feed.xmlに保存
    const outputPath = path.join(process.cwd(), 'public', 'photos-feed.xml')
    await fs.writeFile(outputPath, atomXml, 'utf8')
    
    console.log(`Generated photos feed: ${outputPath}`)
    console.log(`Total entries: ${entries.length}`)
    
  } catch (error) {
    console.error('Error generating photos feed:', error)
    process.exit(1)
  }
}

function escapeXml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

// スクリプトを実行
generatePhotosFeed()
