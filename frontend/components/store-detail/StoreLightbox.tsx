import React from 'react';
import { X } from 'lucide-react';

interface StoreLightboxProps {
  imageUrl: string | null;
  onClose: () => void;
}

export default function StoreLightbox({ imageUrl, onClose }: StoreLightboxProps) {
  if (!imageUrl) return null;

  return (
    <div
      onClick={onClose}
      className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4 cursor-pointer"
    >
      <div className="relative max-w-4xl max-h-[90vh]">
        <img
          src={imageUrl}
          alt="Enlarged view"
          className="max-w-full max-h-[85vh] object-contain border border-white/20"
        />
        <button
          onClick={onClose}
          className="absolute -top-10 right-0 text-white hover:text-accent font-mono text-xs uppercase flex items-center gap-1"
        >
          <X className="w-5 h-5" />
          <span>Close</span>
        </button>
      </div>
    </div>
  );
}
