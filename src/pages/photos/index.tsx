import { ArrowRight, ChevronLeft, ChevronRight, Home, Share2, X } from "lucide-react"
import { GetStaticProps } from "next"
import Link from "next/link"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { getAllPhotoScenes, PhotoWithScene,SceneData } from "@/lib/photos"

interface PhotosPageProps {
  scenes: SceneData[]
}

export default function PhotosPage({ scenes }: PhotosPageProps) {
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithScene | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // すべての写真を1つの配列に変換（クライアントサイドで生成）
  const allPhotos: PhotoWithScene[] = scenes.flatMap(scene =>
    scene.photos.map(photo => {
      const baseName = photo.filename.split('.')[0]
      const dirName = scene.directoryName || scene.date
      return {
        ...photo,
        scene,
        fullPath: `/photos/${dirName}/${photo.filename}`,
        smallPath: `/images/photos/${dirName}/${baseName}_small.webp`,
        webpPath: `/images/photos/${dirName}/${baseName}_full.webp`
      }
    })
  )

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const openModal = (photo: PhotoWithScene) => {
    setSelectedPhoto(photo)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedPhoto(null)
  }

  const navigatePhoto = (direction: "prev" | "next") => {
    if (!selectedPhoto) return

    const currentIndex = allPhotos.findIndex((photo) => 
      photo.scene.date === selectedPhoto.scene.date && 
      photo.filename === selectedPhoto.filename
    )
    let newIndex

    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : allPhotos.length - 1
    } else {
      newIndex = currentIndex < allPhotos.length - 1 ? currentIndex + 1 : 0
    }

    setSelectedPhoto(allPhotos[newIndex])
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">/photos</h1>
              <p className="text-muted-foreground mt-1">Capturing moments, creating memories</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" asChild>
                <a href="https://horimisli.me/" target="_blank" rel="noopener noreferrer">
                  <Home className="w-4 h-4 mr-2" />
                  Home
                </a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/photos-feed.xml" target="_blank" rel="noopener noreferrer">
                  <Share2 className="w-4 h-4 mr-2" />
                  Feed
                </a>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Photo Sections by Date */}
        <div className="space-y-12">
          {scenes.map((scene) => (
            <section key={scene.date} className="space-y-6">
              {/* Date Header */}
              <div className="border-b pb-4">
                <div className="flex items-center justify-between">
                  <div>
                    {scene.title ? (
                      <>
                        <h2 className="text-2xl font-bold text-foreground">{scene.title}</h2>
                        <p className="text-muted-foreground mt-1">{formatDate(scene.date)}</p> 
                      </>
                    ) : (
                      <h2 className="text-2xl font-bold text-foreground">{formatDate(scene.date)}</h2>
                    )}
                    <p className="text-muted-foreground mt-1">{scene.photos.length} 枚の写真</p>
                  </div>
                  <Link href={`/photos/${scene.directoryName}`}>
                    <Button variant="outline" size="sm">
                      詳細を見る
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Photo Grid for this date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[200px]">
                {scene.photos.map((photo, index) => {
                  const baseName = photo.filename.split('.')[0]
                  const dirName = scene.directoryName || scene.date
                  const photoWithScene: PhotoWithScene = {
                    ...photo,
                    scene,
                    fullPath: `/photos/${dirName}/${photo.filename}`,
                    smallPath: `/images/photos/${dirName}/${baseName}_small.webp`,
                    webpPath: `/images/photos/${dirName}/${baseName}_full.webp`
                  }
                  
                  return (
                    <div
                      key={`${scene.date}-${photo.filename}`}
                      className={`relative group cursor-pointer overflow-hidden rounded-lg bg-muted transition-all duration-300 hover:scale-[1.02] ${
                        index % 7 === 0
                          ? "sm:col-span-2 sm:row-span-2"
                          : index % 5 === 0
                            ? "lg:row-span-2"
                            : index % 3 === 0
                              ? "sm:col-span-2"
                              : ""
                      }`}
                      onClick={() => openModal(photoWithScene)}
                    >
                      <img
                        src={photoWithScene.smallPath}
                        alt={photo.filename}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
                      <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="text-white">
                          {photo.camera && (
                            <p className="text-xs text-white/80 mb-1">{photo.camera}</p>
                          )}
                          {photo.lens && (
                            <p className="text-xs text-white/60">{photo.lens}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </section>
          ))}
        </div>

        {scenes.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">写真がまだありません。</p>
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-[95vh] p-0 bg-black/95 border-0 overflow-hidden">
          {selectedPhoto && (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 bg-black/40 rounded-full"
                onClick={closeModal}
              >
                <X className="w-6 h-6" />
              </Button>

              {/* Navigation Buttons */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 bg-black/40 rounded-full"
                onClick={() => navigatePhoto("prev")}
              >
                <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 bg-black/40 rounded-full"
                onClick={() => navigatePhoto("next")}
              >
                <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
              </Button>

              {/* Image */}
              <div className="relative w-full h-full flex items-center justify-center px-4 sm:px-20 py-16 pb-32">
                <div className="w-full h-full flex items-center justify-center">
                  <img
                    src={selectedPhoto.webpPath}
                    alt={selectedPhoto.filename}
                    className="max-w-full object-contain"
                    style={{ 
                      maxHeight: 'calc(95vh - 12rem)',
                      height: 'auto',
                      width: 'auto'
                    }}
                  />
                </div>
              </div>

              {/* Photo Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex items-center justify-between text-white">
                  <div>
                    {/* <p className="text-sm text-white/80 mb-2">
                      {formatDate(selectedPhoto.scene.date)}
                      {selectedPhoto.scene.title && ` • ${selectedPhoto.scene.title}`}
                    </p> */}
                    {selectedPhoto.scene.title && (
                      <p className="text-sm text-white/80 mb-2">{selectedPhoto.scene.title}</p>
                    )}
                    {selectedPhoto.camera && (
                      <p className="text-sm text-white/70 mb-1">{selectedPhoto.camera}</p>
                    )}
                    {selectedPhoto.lens && (
                      <p className="text-sm text-white/70">{selectedPhoto.lens}</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

export const getStaticProps: GetStaticProps<PhotosPageProps> = async () => {
  const scenes = getAllPhotoScenes()
  
  return {
    props: {
      scenes
    }
  }
}
