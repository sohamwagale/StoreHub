'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
  MapPin,
  Navigation,
  Search,
  Loader2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Check,
  Compass,
} from 'lucide-react';

if (typeof window !== 'undefined') {
  maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
}

interface LocationPickerMapProps {
  latitude: number;
  longitude: number;
  onChangeLocation: (lat: number, lng: number, addressSuggestion?: string) => void;
  heightClass?: string;
}

const CITY_PRESETS = [
  { label: 'New York', lat: 40.7128, lng: -74.006 },
  { label: 'Seattle', lat: 47.6062, lng: -122.3321 },
  { label: 'San Francisco', lat: 37.7749, lng: -122.4194 },
  { label: 'Chicago', lat: 41.8781, lng: -87.6298 },
  { label: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
];

export default function LocationPickerMap({
  latitude,
  longitude,
  onChangeLocation,
  heightClass = 'h-[360px]',
}: LocationPickerMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<maplibregl.Map | null>(null);
  const markerInstance = useRef<maplibregl.Marker | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [statusNotice, setStatusNotice] = useState<string | null>(null);

  // Initialize MapLibre
  useEffect(() => {
    if (!mapContainer.current || mapInstance.current) return;

    const initialLng = typeof longitude === 'number' && !isNaN(longitude) ? longitude : -74.006;
    const initialLat = typeof latitude === 'number' && !isNaN(latitude) ? latitude : 40.7128;

    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: {
        version: 8,
        sources: {
          'osm-tiles': {
            type: 'raster',
            tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
            tileSize: 256,
            attribution: '&copy; OpenStreetMap contributors',
          },
        },
        layers: [
          {
            id: 'osm-layer',
            type: 'raster',
            source: 'osm-tiles',
            minzoom: 0,
            maxzoom: 19,
          },
        ],
      },
      center: [initialLng, initialLat],
      zoom: 14,
    });

    // Custom Draggable Pin Element
    const pinEl = document.createElement('div');
    pinEl.className = 'group cursor-grab active:cursor-grabbing flex flex-col items-center select-none';
    pinEl.innerHTML = `
      <div class="px-2 py-0.5 bg-black text-amber-400 border border-amber-400 text-[10px] font-mono font-bold uppercase tracking-wider shadow-lg mb-1 whitespace-nowrap pointer-events-none">
        Store Pin
      </div>
      <div class="w-9 h-9 bg-amber-500 text-white rounded-[4px] border-2 border-white flex items-center justify-center shadow-lg transition-transform group-hover:scale-110">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
          <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
          <circle cx="12" cy="10" r="3"/>
        </svg>
      </div>
      <div class="w-2.5 h-2.5 bg-amber-600 rotate-45 -mt-1.5 border-r border-b border-white"></div>
    `;

    const marker = new maplibregl.Marker({
      element: pinEl,
      draggable: true,
      anchor: 'bottom',
    })
      .setLngLat([initialLng, initialLat])
      .addTo(map);

    // Marker drag handler
    marker.on('dragend', () => {
      const lngLat = marker.getLngLat();
      const newLat = parseFloat(lngLat.lat.toFixed(6));
      const newLng = parseFloat(lngLat.lng.toFixed(6));
      onChangeLocation(newLat, newLng);
      setStatusNotice(`Pin updated to ${newLat}, ${newLng}`);
    });

    // Map click handler (drop pin on click)
    map.on('click', (e) => {
      const newLat = parseFloat(e.lngLat.lat.toFixed(6));
      const newLng = parseFloat(e.lngLat.lng.toFixed(6));
      marker.setLngLat([e.lngLat.lng, e.lngLat.lat]);
      map.easeTo({ center: [e.lngLat.lng, e.lngLat.lat], duration: 300 });
      onChangeLocation(newLat, newLng);
      setStatusNotice(`Pin moved to ${newLat}, ${newLng}`);
    });

    mapInstance.current = map;
    markerInstance.current = marker;

    return () => {
      marker.remove();
      map.remove();
      mapInstance.current = null;
      markerInstance.current = null;
    };
  }, []);

  // Update marker position when props change externally
  useEffect(() => {
    if (!markerInstance.current || !mapInstance.current) return;
    if (typeof latitude !== 'number' || typeof longitude !== 'number') return;

    const currentLngLat = markerInstance.current.getLngLat();
    const isDifferent =
      Math.abs(currentLngLat.lat - latitude) > 0.0001 ||
      Math.abs(currentLngLat.lng - longitude) > 0.0001;

    if (isDifferent) {
      markerInstance.current.setLngLat([longitude, latitude]);
      mapInstance.current.easeTo({ center: [longitude, latitude], duration: 400 });
    }
  }, [latitude, longitude]);

  // Search Address / Place via OpenStreetMap Nominatim
  const handleSearchPlace = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setStatusNotice(null);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          searchQuery.trim()
        )}&limit=1`,
        { headers: { 'Accept-Language': 'en' } }
      );
      const results = await res.json();
      if (results && results.length > 0) {
        const item = results[0];
        const newLat = parseFloat(parseFloat(item.lat).toFixed(6));
        const newLng = parseFloat(parseFloat(item.lon).toFixed(6));

        if (markerInstance.current && mapInstance.current) {
          markerInstance.current.setLngLat([newLng, newLat]);
          mapInstance.current.flyTo({ center: [newLng, newLat], zoom: 16 });
        }
        onChangeLocation(newLat, newLng, item.display_name);
        setStatusNotice(`Found: ${item.display_name.split(',').slice(0, 3).join(',')}`);
      } else {
        setStatusNotice('No locations found for this query. Try a different city or street.');
      }
    } catch (err: any) {
      setStatusNotice('Place search failed. Please click directly on the map to set pin.');
    } finally {
      setIsSearching(false);
    }
  };

  // Browser Geolocation
  const handleDetectGPS = () => {
    if (!navigator.geolocation) {
      setStatusNotice('Geolocation is not supported by your browser.');
      return;
    }

    setIsLocating(true);
    setStatusNotice(null);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const newLat = parseFloat(pos.coords.latitude.toFixed(6));
        const newLng = parseFloat(pos.coords.longitude.toFixed(6));

        if (markerInstance.current && mapInstance.current) {
          markerInstance.current.setLngLat([newLng, newLat]);
          mapInstance.current.flyTo({ center: [newLng, newLat], zoom: 16 });
        }
        onChangeLocation(newLat, newLng);
        setStatusNotice('Pin placed at your current device GPS location.');
        setIsLocating(false);
      },
      (err) => {
        setStatusNotice(`GPS detection failed (${err.message}). Click on map to place pin.`);
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectCityPreset = (preset: { label: string; lat: number; lng: number }) => {
    if (markerInstance.current && mapInstance.current) {
      markerInstance.current.setLngLat([preset.lng, preset.lat]);
      mapInstance.current.flyTo({ center: [preset.lng, preset.lat], zoom: 14 });
    }
    onChangeLocation(preset.lat, preset.lng);
    setStatusNotice(`Centered on ${preset.label}`);
  };

  return (
    <div className="space-y-3">
      {/* Search and Helper Toolbar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="flex-1 relative flex items-center">
          <Search className="w-3.5 h-3.5 text-muted absolute left-3 pointer-events-none" />
          <input
            type="text"
            placeholder="Search city, neighborhood or landmark..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                e.stopPropagation();
                handleSearchPlace();
              }
            }}
            className="w-full pl-9 pr-20 py-2 bg-surface border border-border text-xs text-foreground placeholder-muted focus:outline-none focus:border-accent font-sans"
          />
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              handleSearchPlace();
            }}
            disabled={isSearching || !searchQuery.trim()}
            className="absolute right-1 px-3 py-1 bg-foreground text-background text-[11px] font-mono uppercase font-bold border border-foreground hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {isSearching ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Search'}
          </button>
        </div>

        <button
          type="button"
          onClick={handleDetectGPS}
          disabled={isLocating}
          className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-muted-fill border border-border text-xs font-mono uppercase font-bold text-foreground hover:bg-muted-fill transition-colors shrink-0"
        >
          <Navigation className={`w-3.5 h-3.5 text-accent ${isLocating ? 'animate-spin' : ''}`} />
          <span>{isLocating ? 'Locating...' : '📍 Auto GPS'}</span>
        </button>
      </div>

      {/* City Presets */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[10px] font-mono uppercase text-muted font-bold">Quick Jump:</span>
        {CITY_PRESETS.map((p) => (
          <button
            key={p.label}
            type="button"
            onClick={() => handleSelectCityPreset(p)}
            className="px-2 py-0.5 text-[10px] font-mono uppercase bg-muted-fill border border-border text-foreground hover:border-foreground transition-colors"
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* Map Container */}
      <div className="relative border border-border overflow-hidden bg-muted-fill">
        <div ref={mapContainer} className={`w-full ${heightClass}`} />

        {/* Top-Right Map Controls */}
        <div className="absolute top-3 right-3 z-10 flex flex-col gap-1">
          <button
            type="button"
            onClick={() => mapInstance.current?.zoomIn()}
            title="Zoom In"
            className="w-7 h-7 bg-surface border border-border hover:border-foreground text-foreground flex items-center justify-center shadow-sm"
          >
            <ZoomIn className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => mapInstance.current?.zoomOut()}
            title="Zoom Out"
            className="w-7 h-7 bg-surface border border-border hover:border-foreground text-foreground flex items-center justify-center shadow-sm"
          >
            <ZoomOut className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            onClick={() => {
              if (mapInstance.current) {
                mapInstance.current.flyTo({ center: [longitude, latitude], zoom: 15 });
              }
            }}
            title="Center on Pin"
            className="w-7 h-7 bg-surface border border-border hover:border-foreground text-foreground flex items-center justify-center shadow-sm"
          >
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
          </button>
        </div>

        {/* Floating Instruction Overlay */}
        <div className="absolute bottom-3 left-3 right-3 sm:right-auto z-10 bg-black/85 text-white border border-white/20 px-3 py-1.5 text-[11px] font-mono flex items-center gap-2 shadow-md">
          <div className="w-2 h-2 rounded-[4px] bg-amber-400 animate-pulse shrink-0" />
          <span className="truncate">Click map or drag the amber pin to set exact entrance</span>
        </div>
      </div>

      {/* Status or Coordinates Notice */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 bg-muted-fill border border-border text-xs font-mono">
        <div className="flex items-center gap-2 text-foreground font-bold">
          <span className="text-amber-600 dark:text-amber-400">Selected Pin:</span>
          <span className="bg-surface px-2 py-0.5 border border-border">
            {latitude.toFixed(6)}°, {longitude.toFixed(6)}°
          </span>
        </div>
        {statusNotice ? (
          <span className="text-[11px] text-muted truncate max-w-sm" title={statusNotice}>
            {statusNotice}
          </span>
        ) : (
          <span className="text-[10px] text-muted">Ready for store coordinates</span>
        )}
      </div>
    </div>
  );
}
