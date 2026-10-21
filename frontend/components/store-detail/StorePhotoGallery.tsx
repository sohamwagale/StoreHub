import React from 'react';
import { Camera } from 'lucide-react';
import { Store } from '@/types';

interface StorePhotoGalleryProps {
  store: Store;
  allPhotos: string[];
  isUploadingPhoto: boolean;
  onUploadPhotos: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onOpenLightbox: (imageUrl: string) => void;
}

export default function StorePhotoGallery({
  store,
  allPhotos,
  isUploadingPhoto,
  onUploadPhotos,
  onOpenLightbox,
}: StorePhotoGalleryProps) {
  return (
    <div className="bg-surface border border-border p-6 space-y-4">
      <div className="flex items-center justify-between pb-2 border-b border-border">
        <h3 className="text-xs font-extrabold uppercase tracking-wider text-foreground font-mono flex items-center gap-1.5">
          <Camera className="w-3.5 h-3.5 text-accent" />
          <span>Store Photos ({allPhotos.length})</span>
        </h3>

        <label className="cursor-pointer text-xs font-mono uppercase font-bold text-foreground underline hover:no-underline">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={onUploadPhotos}
            disabled={isUploadingPhoto}
            className="hidden"
          />
          <span>{isUploadingPhoto ? 'Uploading...' : 'Upload Photos'}</span>
        </label>
      </div>

      {allPhotos.length === 0 ? (
        <div className="p-8 text-center text-xs font-mono text-muted bg-muted-fill border border-dashed border-border">
          No photos uploaded yet. Be the first customer to upload!
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {allPhotos.slice(0, 4).map((img, idx) => (
            <div
              key={idx}
              onClick={() => onOpenLightbox(img)}
              className="relative aspect-square cursor-pointer overflow-hidden border border-border group"
            >
              <img
                src={img}
                alt={`${store.name} photo ${idx + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
              />
              <span className="absolute bottom-1 left-1 px-1.5 py-0.5 bg-black/80 text-white text-[9px] font-mono uppercase font-bold">
                {idx === 0 ? 'Showroom' : idx === 1 ? 'Display' : idx === 2 ? 'Entrance' : `+${allPhotos.length - 3} more`}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
