'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { Store } from '@/types';
import {
  MapPin,
  Star,
  Layers,
  Compass,
  Maximize2,
  Navigation,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface StoreMapProps {
  stores: Store[];
  selectedStoreId?: string | null;
  onSelectStore?: (store: Store) => void;
  onOpenRating?: (store: Store) => void;
  onOpenReviews?: (store: Store) => void;
  heightClass?: string;
  className?: string;
}

const TILE_STYLES = {
  osm: {
    name: 'OpenStreetMap',
    url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors',
  },
  light: {
    name: 'Clean Light',
    url: 'https://basemaps.cartocdn.com/rastertiles/light_all/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  },
  dark: {
    name: 'Midnight Dark',
    url: 'https://basemaps.cartocdn.com/rastertiles/dark_all/{z}/{x}/{y}.png',
    attribution: '&copy; OpenStreetMap contributors &copy; CARTO',
  },
};

const CATEGORY_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  grocery: { bg: '#059669', border: '#10b981', text: '#ecfdf5' },
  malls: { bg: '#4f46e5', border: '#6366f1', text: '#eef2ff' },
  clothes: { bg: '#db2777', border: '#ec4899', text: '#fdf2f8' },
  electronics: { bg: '#0284c7', border: '#0ea5e9', text: '#f0f9ff' },
  bakery: { bg: '#d97706', border: '#f59e0b', text: '#fffbeb' },
  default: { bg: '#6366f1', border: '#818cf8', text: '#ffffff' },
};

function getCategoryTheme(category?: string) {
  if (!category) return CATEGORY_COLORS.default;
  const key = category.toLowerCase().trim();
  return CATEGORY_COLORS[key] || CATEGORY_COLORS.default;
}

export default function StoreMap({
  stores,
  selectedStoreId,
  onSelectStore,
  onOpenRating,
  onOpenReviews,
  heightClass = 'h-[540px]',
  className = '',
}: StoreMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Map<string, { marker: maplibregl.Marker; popup: maplibregl.Popup }>>(
    new Map(),
  );
  const [currentStyle, setCurrentStyle] = useState<keyof typeof TILE_STYLES>('light');
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activeStore, setActiveStore] = useState<Store | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainer.current) return;

    // Center around average coordinates of stores or default San Francisco
    const validStores = stores.filter(
      (s) => typeof s.latitude === 'number' && typeof s.longitude === 'number' && (s.latitude !== 0 || s.longitude !== 0),
    );

    let initialLat = 37.7885;
    let initialLng = -122.4042;

    if (validStores.length > 0) {
      initialLat = validStores.reduce((acc, s) => acc + (s.latitude || 0), 0) / validStores.length;
      initialLng = validStores.reduce((acc, s) => acc + (s.longitude || 0), 0) / validStores.length;
    }

    const tileDef = TILE_STYLES[currentStyle];

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'base-tiles': {
            type: 'raster',
            tiles: [tileDef.url],
            tileSize: 256,
            attribution: tileDef.attribution,
          },
        },
        layers: [
          {
            id: 'base-tiles-layer',
            type: 'raster',
            source: 'base-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [initialLng, initialLat],
      zoom: 12.5,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(
      new maplibregl.GeolocateControl({
        positionOptions: { enableHighAccuracy: true },
        trackUserLocation: true,
      }),
      'top-right',
    );

    map.on('load', () => {
      setMapLoaded(true);
    });

    mapInstance.current = map;

    return () => {
      map.remove();
      mapInstance.current = null;
    };
  }, []);

  // Switch Tile Style
  const handleStyleChange = (styleKey: keyof typeof TILE_STYLES) => {
    if (!mapInstance.current) return;
    setCurrentStyle(styleKey);
    const tileDef = TILE_STYLES[styleKey];

    const styleObj: maplibregl.StyleSpecification = {
      version: 8,
      sources: {
        'base-tiles': {
          type: 'raster',
          tiles: [tileDef.url],
          tileSize: 256,
          attribution: tileDef.attribution,
        },
      },
      layers: [
        {
          id: 'base-tiles-layer',
          type: 'raster',
          source: 'base-tiles',
          minzoom: 0,
          maxzoom: 19,
        },
      ],
    };

    mapInstance.current.setStyle(styleObj);
  };

  // Add / Update Markers
  useEffect(() => {
    const map = mapInstance.current;
    if (!map || !mapLoaded) return;

    // Clear old markers
    markersRef.current.forEach(({ marker }) => marker.remove());
    markersRef.current.clear();

    const bounds = new maplibregl.LngLatBounds();
    let hasValidBounds = false;

    stores.forEach((store) => {
      const lat = store.latitude ?? 37.7885;
      const lng = store.longitude ?? -122.4042;

      bounds.extend([lng, lat]);
      hasValidBounds = true;

      const theme = getCategoryTheme(store.category);
      const isSelected = store.id === selectedStoreId;

      // Create Custom HTML Element for Marker
      const el = document.createElement('div');
      el.className = 'custom-map-marker group cursor-pointer transition-transform duration-150';
      el.style.zIndex = isSelected ? '50' : '10';

      const coverPhoto = store.photos && store.photos.length > 0 ? store.photos[0] : '';

      el.innerHTML = `
        <div class="relative flex items-center justify-center">
          <div class="px-2 py-1 flex items-center justify-center border font-mono font-bold text-xs ${
            isSelected
              ? 'bg-zinc-950 text-amber-400 border-amber-400'
              : 'bg-zinc-950 text-white border-zinc-800 group-hover:border-zinc-500'
          }">
            <span>★ ${store.averageRating !== null ? store.averageRating : '-'}</span>
          </div>
        </div>
      `;

      // Popup Content
      const popupHtml = `
        <div class="p-3 bg-white text-zinc-900 max-w-[250px] font-sans border border-zinc-300">
          ${
            coverPhoto
              ? `<div class="w-full h-24 mb-2 overflow-hidden relative bg-zinc-900">
                  <img src="${coverPhoto}" alt="${store.name}" class="w-full h-full object-cover" />
                 </div>`
              : ''
          }
          <div class="flex items-center gap-1.5 mb-1">
            <span class="px-1.5 py-0.5 text-[9px] font-mono uppercase font-bold tracking-wider bg-zinc-900 text-white">${store.category || 'Shop'}</span>
            <div class="flex items-center text-amber-600 text-xs font-bold font-mono ml-auto">
              ★ ${store.averageRating !== null ? store.averageRating : 'New'} 
              <span class="text-zinc-500 font-normal ml-0.5">(${store.totalRatings})</span>
            </div>
          </div>
          <h4 class="font-bold text-xs text-zinc-950 leading-snug mb-1">
            <a href="/stores/${store.id}" class="hover:underline transition">${store.name}</a>
          </h4>
          <p class="text-[11px] text-zinc-600 mb-2.5 flex items-start gap-1">
            <span class="shrink-0 text-zinc-400">📍</span>
            <span class="line-clamp-2">${store.address}</span>
          </p>
          <div class="flex items-center gap-1.5 pt-2 border-t border-zinc-200">
            <button id="map-btn-review-${store.id}" class="flex-1 text-center py-1 px-1.5 bg-zinc-100 hover:bg-zinc-200 text-zinc-900 border border-zinc-300 font-mono text-[10px] uppercase font-bold transition">
              Reviews
            </button>
            <button id="map-btn-rate-${store.id}" class="flex-1 text-center py-1 px-1.5 bg-zinc-950 hover:bg-zinc-800 text-white border border-zinc-950 font-mono text-[10px] uppercase font-bold transition">
              Rate
            </button>
          </div>
          <a href="/stores/${store.id}" class="block text-center mt-2 text-[10px] font-mono text-zinc-900 hover:underline uppercase">
            View Store Details →
          </a>
        </div>
      `;

      const popup = new maplibregl.Popup({
        offset: 15,
        closeButton: true,
        closeOnClick: false,
        className: 'flat-map-popup',
      }).setHTML(popupHtml);

      // Bind button events after popup opens
      popup.on('open', () => {
        setActiveStore(store);
        const reviewBtn = document.getElementById(`map-btn-review-${store.id}`);
        const rateBtn = document.getElementById(`map-btn-rate-${store.id}`);

        if (reviewBtn) {
          reviewBtn.onclick = (e) => {
            e.stopPropagation();
            onOpenReviews?.(store);
          };
        }
        if (rateBtn) {
          rateBtn.onclick = (e) => {
            e.stopPropagation();
            onOpenRating?.(store);
          };
        }
      });

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map);

      el.addEventListener('click', () => {
        onSelectStore?.(store);
      });

      markersRef.current.set(store.id, { marker, popup });
    });

    // If a store is selected, open its popup and flyTo
    if (selectedStoreId && markersRef.current.has(selectedStoreId)) {
      const { marker, popup } = markersRef.current.get(selectedStoreId)!;
      popup.addTo(map);
      const targetStore = stores.find((s) => s.id === selectedStoreId);
      if (targetStore) {
        map.flyTo({
          center: [targetStore.longitude ?? -122.4042, targetStore.latitude ?? 37.7885],
          zoom: 15,
          duration: 1200,
        });
      }
    }
  }, [stores, mapLoaded, selectedStoreId]);

  // Fit All Bounds Button
  const handleFitAll = () => {
    if (!mapInstance.current || stores.length === 0) return;
    const bounds = new maplibregl.LngLatBounds();
    stores.forEach((s) => {
      bounds.extend([s.longitude ?? -122.4042, s.latitude ?? 37.7885]);
    });
    mapInstance.current.fitBounds(bounds, { padding: 60, maxZoom: 15 });
  };

  return (
    <div className={`relative border border-zinc-300 dark:border-zinc-700 ${className}`}>
      {/* Map Canvas */}
      <div ref={mapContainer} className={`w-full ${heightClass}`} />

      {/* Floating Map Controls Toolbar */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap items-center gap-1.5 bg-white dark:bg-zinc-900 px-2.5 py-1.5 border border-zinc-300 dark:border-zinc-700">
        <div className="flex items-center gap-1.5 text-xs font-mono uppercase font-bold text-zinc-700 dark:text-zinc-300 mr-1">
          <Layers className="w-3.5 h-3.5 text-amber-500" />
          <span>Style:</span>
        </div>
        {(Object.keys(TILE_STYLES) as Array<keyof typeof TILE_STYLES>).map((styleKey) => (
          <button
            key={styleKey}
            type="button"
            onClick={() => handleStyleChange(styleKey)}
            className={`px-2 py-0.5 text-xs font-mono uppercase font-semibold transition ${
              currentStyle === styleKey
                ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border border-zinc-950 dark:border-white'
                : 'bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-transparent'
            }`}
          >
            {TILE_STYLES[styleKey].name}
          </button>
        ))}

        <div className="h-3.5 w-px bg-zinc-300 dark:bg-zinc-700 mx-1"></div>

        <button
          type="button"
          onClick={handleFitAll}
          title="Fit all stores into view"
          className="flex items-center gap-1 px-2 py-0.5 text-xs font-mono uppercase font-semibold bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition"
        >
          <Maximize2 className="w-3 h-3 text-zinc-500" />
          <span>Fit All</span>
        </button>
      </div>

      {/* Store Count Badge */}
      <div className="absolute bottom-3 left-3 z-10 bg-zinc-950 text-white text-[11px] font-mono uppercase px-2.5 py-1 border border-zinc-800 flex items-center gap-1.5">
        <MapPin className="w-3 h-3 text-amber-400" />
        <span><strong className="text-white">{stores.length}</strong> stores mapped</span>
      </div>
    </div>
  );
}
