"use client"

import { useState } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, Download, Share2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"

const photos = [
  {
    id: 1,
    src: "/images/placeholder.svg?height=600&width=400",
    alt: "Portrait Photography",
    title: "Golden Hour Portrait",
    category: "Portrait",
    width: 400,
    height: 600,
    shootingDate: "2024-01-15",
    location: "Tokyo, Japan",
  },
  {
    id: 2,
    src: "/images/placeholder.svg?height=400&width=600",
    alt: "Landscape Photography",
    title: "Mountain Vista",
    category: "Landscape",
    width: 600,
    height: 400,
    shootingDate: "2024-01-15",
    location: "Mount Fuji, Japan",
  },
  {
    id: 3,
    src: "/images/placeholder.svg?height=500&width=400",
    alt: "Street Photography",
    title: "Urban Life",
    category: "Street",
    width: 400,
    height: 500,
    shootingDate: "2024-01-10",
    location: "Shibuya, Tokyo",
  },
  {
    id: 4,
    src: "/images/placeholder.svg?height=400&width=400",
    alt: "Architecture Photography",
    title: "Modern Architecture",
    category: "Architecture",
    width: 400,
    height: 400,
    shootingDate: "2024-01-10",
    location: "Roppongi, Tokyo",
  },
  {
    id: 5,
    src: "/images/placeholder.svg?height=600&width=500",
    alt: "Nature Photography",
    title: "Forest Path",
    category: "Nature",
    width: 500,
    height: 600,
    shootingDate: "2024-01-08",
    location: "Nikko, Japan",
  },
  {
    id: 6,
    src: "/images/placeholder.svg?height=400&width=600",
    alt: "Travel Photography",
    title: "Coastal Sunset",
    category: "Travel",
    width: 600,
    height: 400,
    shootingDate: "2024-01-08",
    location: "Kamakura, Japan",
  },
  {
    id: 7,
    src: "/images/placeholder.svg?height=500&width=400",
    alt: "Portrait Photography",
    title: "Creative Portrait",
    category: "Portrait",
    width: 400,
    height: 500,
    shootingDate: "2024-01-05",
    location: "Studio, Tokyo",
  },
  {
    id: 8,
    src: "/images/placeholder.svg?height=400&width=500",
    alt: "Abstract Photography",
    title: "Light & Shadow",
    category: "Abstract",
    width: 500,
    height: 400,
    shootingDate: "2024-01-05",
    location: "Ginza, Tokyo",
  },
  {
    id: 9,
    src: "/images/placeholder.svg?height=600&width=400",
    alt: "Wildlife Photography",
    title: "Bird in Flight",
    category: "Wildlife",
    width: 400,
    height: 600,
    shootingDate: "2024-01-03",
    location: "Ueno Park, Tokyo",
  },
]

const categories = [
  "All",
  "Portrait",
  "Landscape",
  "Street",
  "Architecture",
  "Nature",
  "Travel",
  "Abstract",
  "Wildlife",
]

export default function Component() {
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [selectedPhoto, setSelectedPhoto] = useState<(typeof photos)[0] | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const filteredPhotos =
    selectedCategory === "All" ? photos : photos.filter((photo) => photo.category === selectedCategory)

  // Group photos by shooting date
  const groupedPhotos = filteredPhotos.reduce(
    (groups, photo) => {
      const date = photo.shootingDate
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(photo)
      return groups
    },
    {} as Record<string, typeof photos>,
  )

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(groupedPhotos).sort((a, b) => new Date(b).getTime() - new Date(a).getTime())

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("ja-JP", {
      year: "numeric",
      month: "long",
      day: "numeric",
      weekday: "long",
    })
  }

  const openModal = (photo: (typeof photos)[0]) => {
    setSelectedPhoto(photo)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedPhoto(null)
  }

  const navigatePhoto = (direction: "prev" | "next") => {
    if (!selectedPhoto) return

    const currentIndex = filteredPhotos.findIndex((photo) => photo.id === selectedPhoto.id)
    let newIndex

    if (direction === "prev") {
      newIndex = currentIndex > 0 ? currentIndex - 1 : filteredPhotos.length - 1
    } else {
      newIndex = currentIndex < filteredPhotos.length - 1 ? currentIndex + 1 : 0
    }

    setSelectedPhoto(filteredPhotos[newIndex])
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-40">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Photography Portfolio</h1>
              <p className="text-muted-foreground mt-1">Capturing moments, creating memories</p>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button size="sm">Contact</Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8 justify-center">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="rounded-full"
            >
              {category}
            </Button>
          ))}
        </div>

        {/* Photo Sections by Date */}
        <div className="space-y-12">
          {sortedDates.map((date) => (
            <section key={date} className="space-y-6">
              {/* Date Header */}
              <div className="border-b pb-4">
                <h2 className="text-2xl font-bold text-foreground">{formatDate(date)}</h2>
                <p className="text-muted-foreground mt-1">{groupedPhotos[date].length} 枚の写真</p>
              </div>

              {/* Photo Grid for this date */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[200px]">
                {groupedPhotos[date].map((photo, index) => (
                  <div
                    key={photo.id}
                    className={`relative group cursor-pointer overflow-hidden rounded-lg bg-muted transition-all duration-300 hover:scale-[1.02] ${
                      index % 7 === 0
                        ? "sm:col-span-2 sm:row-span-2"
                        : index % 5 === 0
                          ? "lg:row-span-2"
                          : index % 3 === 0
                            ? "sm:col-span-2"
                            : ""
                    }`}
                    onClick={() => openModal(photo)}
                  >
                    <Image
                      src={photo.src || "/images/placeholder.svg"}
                      alt={photo.alt}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-110"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, (max-width: 1280px) 33vw, 25vv"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300" />
                    <div className="absolute inset-0 flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      <div className="text-white">
                        <h3 className="font-semibold text-sm mb-1">{photo.title}</h3>
                        <p className="text-xs text-white/80 mb-2">{photo.location}</p>
                        <Badge variant="secondary" className="text-xs">
                          {photo.category}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>

        {sortedDates.length === 0 && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">このカテゴリーには写真がありません。</p>
          </div>
        )}
      </main>

      {/* Lightbox Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-7xl w-full h-full max-h-[90vh] p-0 bg-black/95 border-0">
          {selectedPhoto && (
            <div className="relative w-full h-full flex items-center justify-center">
              {/* Close Button */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-4 right-4 z-50 text-white hover:bg-white/20"
                onClick={closeModal}
              >
                <X className="w-6 h-6" />
              </Button>

              {/* Navigation Buttons */}
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                onClick={() => navigatePhoto("prev")}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20"
                onClick={() => navigatePhoto("next")}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>

              {/* Image */}
              <div className="relative w-full h-full flex items-center justify-center p-8">
                <Image
                  src={selectedPhoto.src || "/images/placeholder.svg"}
                  alt={selectedPhoto.alt}
                  width={selectedPhoto.width}
                  height={selectedPhoto.height}
                  className="max-w-full max-h-full object-contain"
                  priority
                />
              </div>

              {/* Photo Info */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
                <div className="flex items-center justify-between text-white">
                  <div>
                    <h2 className="text-xl font-semibold mb-1">{selectedPhoto.title}</h2>
                    <p className="text-sm text-white/80 mb-2">
                      {formatDate(selectedPhoto.shootingDate)} • {selectedPhoto.location}
                    </p>
                    <Badge variant="secondary" className="text-sm">
                      {selectedPhoto.category}
                    </Badge>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <Download className="w-4 h-4 mr-2" />
                      ダウンロード
                    </Button>
                    <Button variant="ghost" size="sm" className="text-white hover:bg-white/20">
                      <Share2 className="w-4 h-4 mr-2" />
                      シェア
                    </Button>
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
