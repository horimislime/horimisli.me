import fs from 'fs'
import path from 'path'

export interface PhotoData {
  filename: string
  camera: string
  lens: string
}

export interface SceneData {
  title?: string
  photos: PhotoData[]
  date: string // YYYY-MM-DD format
}

export interface PhotoWithScene extends PhotoData {
  scene: SceneData
  fullPath: string
  smallPath: string
  webpPath: string
}

const PHOTOS_DIR = path.join(process.cwd(), 'photos')

export function getAllPhotoScenes(): SceneData[] {
  try {
    const scenes: SceneData[] = []
    
    if (!fs.existsSync(PHOTOS_DIR)) {
      return scenes
    }

    const entries = fs.readdirSync(PHOTOS_DIR, { withFileTypes: true })
    
    for (const entry of entries) {
      if (entry.isDirectory()) {
        const dateMatch = entry.name.match(/^\d{4}-\d{2}-\d{2}$/)
        if (dateMatch) {
          const scenePath = path.join(PHOTOS_DIR, entry.name)
          const contentPath = path.join(scenePath, 'content.json')
          
          if (fs.existsSync(contentPath)) {
            try {
              const contentData = JSON.parse(fs.readFileSync(contentPath, 'utf8'))
              scenes.push({
                ...contentData,
                date: entry.name
              })
            } catch (error) {
              console.warn(`Failed to parse content.json in ${entry.name}:`, error)
            }
          }
        }
      }
    }
    
    // 日付順でソート（新しい順）
    return scenes.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
  } catch (error) {
    console.error('Error reading photo scenes:', error)
    return []
  }
}

export function getAllPhotos(): PhotoWithScene[] {
  const scenes = getAllPhotoScenes()
  const photos: PhotoWithScene[] = []
  
  for (const scene of scenes) {
    for (const photo of scene.photos) {
      const baseName = path.parse(photo.filename).name
      photos.push({
        ...photo,
        scene,
        fullPath: `/photos/${scene.date}/${photo.filename}`,
        smallPath: `/images/photos/${scene.date}/${baseName}_small.webp`,
        webpPath: `/images/photos/${scene.date}/${baseName}_full.webp`
      })
    }
  }
  
  return photos
}

export function getPhotosByDate(date: string): PhotoWithScene[] {
  const scenes = getAllPhotoScenes()
  const scene = scenes.find(s => s.date === date)
  
  if (!scene) {
    return []
  }
  
  return scene.photos.map(photo => {
    const baseName = path.parse(photo.filename).name
    return {
      ...photo,
      scene,
      fullPath: `/photos/${scene.date}/${photo.filename}`,
      smallPath: `/images/photos/${scene.date}/${baseName}_small.webp`,
      webpPath: `/images/photos/${scene.date}/${baseName}_full.webp`
    }
  })
}