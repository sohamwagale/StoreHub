'use client';

import React, { useState, useEffect, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { StoreHighlight } from '@/types';
import {
  Store as StoreIcon,
  MapPin,
  Camera,
  Upload,
  AlertCircle,
  Loader2,
  ArrowRight,
  Shield,
  Navigation,
  X,
  Phone,
  Globe,
  Mail,
  Clock,
  Sparkles,
  CheckCircle2,
  Car,
  FileText,
} from 'lucide-react';
import { OnboardingSkeleton } from '@/components/Skeleton';

const CATEGORIES = [
  'Grocery',
  'Malls',
  'Clothes',
  'Electronics',
  'Bakery',
  'Bookstore',
  'Restaurant',
  'Fitness & Health',
  'General',
];

const PRESET_COORDINATES = [
  { label: 'New York', lat: 40.7128, lng: -74.006 },
  { label: 'Seattle', lat: 47.6062, lng: -122.3321 },
  { label: 'San Francisco', lat: 37.7749, lng: -122.4194 },
  { label: 'Chicago', lat: 41.8781, lng: -87.6298 },
  { label: 'Los Angeles', lat: 34.0522, lng: -118.2437 },
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const LocationPickerMap = dynamic(() => import('@/components/LocationPickerMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[360px] bg-muted-fill border border-border flex items-center justify-center text-muted font-mono text-xs uppercase">
      Loading interactive pin map...
    </div>
  ),
});

const DEFAULT_SCHEDULE: Record<string, string> = {
  Monday: '9:00 AM – 9:00 PM',
  Tuesday: '9:00 AM – 9:00 PM',
  Wednesday: '9:00 AM – 9:00 PM',
  Thursday: '9:00 AM – 9:00 PM',
  Friday: '9:00 AM – 9:00 PM',
  Saturday: '10:00 AM – 9:00 PM',
  Sunday: '10:00 AM – 8:00 PM',
};

const DEFAULT_HIGHLIGHTS: StoreHighlight[] = [
  { title: 'Authentic Inventory', description: 'Verified stocks' },
  { title: 'Instant Support', description: 'On-premise desk' },
  { title: 'Accessible', description: 'Wheelchair ramp' },
  { title: 'Fair Pricing', description: 'Zero markup' },
];

function OwnerOnboardingForm() {
  const { user, isLoading: isAuthLoading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const editStoreId = searchParams.get('edit');
  const isEditMode = Boolean(editStoreId);

  // Form State
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Grocery');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number>(40.7128);
  const [longitude, setLongitude] = useState<number>(-74.006);
  const [description, setDescription] = useState('');
  const [phone, setPhone] = useState('');
  const [website, setWebsite] = useState('');
  const [supportEmail, setSupportEmail] = useState('');
  const [openingHours, setOpeningHours] = useState('Mon-Sat: 9:00 AM – 9:00 PM');
  const [schedule, setSchedule] = useState<Record<string, string>>(DEFAULT_SCHEDULE);
  const [highlights, setHighlights] = useState<StoreHighlight[]>(DEFAULT_HIGHLIGHTS);
  const [parkingInfo, setParkingInfo] = useState('Free 2-hour parking available on premises');
  const [merchantNotice, setMerchantNotice] = useState(
    'Verified Merchant Account on StoreRank platform with direct customer dispute resolution.'
  );
  const [uploadedPhotos, setUploadedPhotos] = useState<string[]>([]);

  // UI States
  const [showManualCoords, setShowManualCoords] = useState<boolean>(false);
  const [isFetchingStore, setIsFetchingStore] = useState<boolean>(isEditMode);
  const [isLocating, setIsLocating] = useState<boolean>(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isAuthLoading) {
      if (!user) {
        router.push('/login');
      } else if (user.role !== 'OWNER') {
        router.push('/dashboard');
      }
    }
  }, [user, isAuthLoading, router]);

  // Load existing store for edit mode
  useEffect(() => {
    if (!editStoreId) return;

    let isMounted = true;
    setIsFetchingStore(true);
    api.stores
      .getById(editStoreId)
      .then((data) => {
        if (!isMounted) return;
        setName(data.name || '');
        setCategory(data.category || 'Grocery');
        setAddress(data.address || '');
        setLatitude(data.latitude ?? 40.7128);
        setLongitude(data.longitude ?? -74.006);
        setDescription(data.description || '');
        setPhone(data.phone || '');
        setWebsite(data.website || '');
        setSupportEmail(data.supportEmail || '');
        setOpeningHours(data.openingHours || '');
        if (data.schedule && Object.keys(data.schedule).length > 0) {
          setSchedule(data.schedule);
        }
        if (data.highlights && data.highlights.length > 0) {
          setHighlights(data.highlights);
        }
        if (data.parkingInfo) {
          setParkingInfo(data.parkingInfo);
        }
        if (data.merchantNotice) {
          setMerchantNotice(data.merchantNotice);
        }
        if (Array.isArray(data.photos)) {
          setUploadedPhotos(data.photos);
        }
      })
      .catch((err) => {
        if (!isMounted) return;
        setError(err?.message || 'Failed to load existing store details.');
      })
      .finally(() => {
        if (isMounted) setIsFetchingStore(false);
      });

    return () => {
      isMounted = false;
    };
  }, [editStoreId]);

  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      return;
    }
    setIsLocating(true);
    setError(null);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(parseFloat(position.coords.latitude.toFixed(6)));
        setLongitude(parseFloat(position.coords.longitude.toFixed(6)));
        setIsLocating(false);
      },
      (err) => {
        setError(`Location detection failed: ${err.message}. You can manually type coordinates.`);
        setIsLocating(false);
      },
      { timeout: 10000, enableHighAccuracy: true },
    );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploadingPhoto(true);
    setError(null);
    try {
      const fileList = Array.from(files);
      const res = await api.uploads.uploadFiles(fileList);
      setUploadedPhotos((prev) => [...prev, ...res.urls]);
    } catch (err: any) {
      setError(err?.message || 'Failed to upload photo. Please try again.');
    } finally {
      setIsUploadingPhoto(false);
      e.target.value = '';
    }
  };

  const handleRemovePhoto = (index: number) => {
    setUploadedPhotos((prev) => prev.filter((_, i) => i !== index));
  };

  const handleScheduleChange = (day: string, value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [day]: value,
    }));
  };

  const handleApplyMondayToAll = () => {
    const mondayHours = schedule['Monday'] || '9:00 AM – 9:00 PM';
    const updated: Record<string, string> = {};
    DAYS_OF_WEEK.forEach((d) => {
      updated[d] = mondayHours;
    });
    setSchedule(updated);
  };

  const handleHighlightChange = (index: number, field: 'title' | 'description', value: string) => {
    setHighlights((prev) => {
      const updated = [...prev];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (name.trim().length < 2) {
      setError('Store name must be at least 2 characters.');
      return;
    }
    if (name.trim().length > 100) {
      setError('Store name cannot exceed 100 characters.');
      return;
    }
    if (address.trim().length < 5) {
      setError('Please provide a valid physical store address (min 5 characters).');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const payload: any = {
        name: name.trim(),
        category,
        address: address.trim(),
        description: description.trim(),
        phone: phone.trim(),
        website: website.trim(),
        supportEmail: supportEmail.trim(),
        openingHours: openingHours.trim(),
        schedule,
        highlights: highlights.filter((h) => h.title.trim() !== ''),
        parkingInfo: parkingInfo.trim(),
        merchantNotice: merchantNotice.trim(),
      };

      if (typeof latitude === 'number' && !isNaN(latitude)) {
        payload.latitude = latitude;
      }
      if (typeof longitude === 'number' && !isNaN(longitude)) {
        payload.longitude = longitude;
      }
      if (uploadedPhotos && uploadedPhotos.length > 0) {
        payload.photos = uploadedPhotos;
      }

      if (isEditMode && editStoreId) {
        await api.stores.update(editStoreId, payload);
        router.push('/owner?updated=true');
      } else {
        await api.stores.create(payload);
        router.push('/owner?onboarded=true');
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to save store profile. Please try again.');
      setIsSubmitting(false);
    }
  };

  if (isAuthLoading || isFetchingStore) {
    return <OnboardingSkeleton />;
  }

  return (
    <div className="flex-1 max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Onboarding Header */}
      <div className="text-center max-w-2xl mx-auto mb-8">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-muted-fill text-foreground border border-border text-[11px] font-mono uppercase font-bold tracking-widest mb-3">
          <Shield className="w-3.5 h-3.5 text-accent" />
          <span>{isEditMode ? 'Store Administration' : 'Store Owner Onboarding'}</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-foreground tracking-tight">
          {isEditMode ? 'Edit Store Profile' : 'Register & Configure Your Store'}
        </h1>
        <p className="text-xs text-muted mt-1">
          {isEditMode
            ? 'Update your store details, operating hours, highlights, and contact information displayed across StoreRank.'
            : 'Configure your complete store profile including hours, story, highlights, contact info, and photos so shoppers receive verified, authentic details.'}
        </p>
      </div>

      {error && (
        <div className="mb-6 p-3 bg-muted-fill border-l-2 border-red-500 flex items-start gap-3 text-foreground text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <p>{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column (7 cols) */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          {/* Section 1: Basic Identity & Category */}
          <div className="p-5 bg-surface border border-border space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <StoreIcon className="w-3.5 h-3.5 text-accent" />
              <span>1. Store Identity &amp; Category</span>
            </h3>

            {/* Store Name */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                Store Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Green Basket Organic Grocery"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:border-accent transition-colors font-sans"
              />
            </div>

            {/* Category Dropdown */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                Store Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border text-xs font-mono uppercase font-semibold text-foreground focus:outline-none focus:border-accent cursor-pointer"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Store Description */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                About &amp; Store Story (Description)
              </label>
              <textarea
                rows={3}
                placeholder="Describe what your store offers, specialty inventory, community history, or customer guarantees..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:border-accent transition-colors font-sans leading-relaxed"
              />
              <span className="text-[10px] text-muted font-mono">
                Displayed in the "About" section on your store page.
              </span>
            </div>
          </div>

          {/* Section 2: Contact, Online Presence & Parking */}
          <div className="p-5 bg-surface border border-border space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Phone className="w-3.5 h-3.5 text-accent" />
              <span>2. Contact, Web Presence &amp; Parking</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Phone */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                  Customer Phone
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-muted absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. +1 (555) 234-5678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-surface border border-border text-xs font-mono text-foreground focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Website */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                  Store Website URL
                </label>
                <div className="relative">
                  <Globe className="w-3.5 h-3.5 text-muted absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. https://greenbasket.com"
                    value={website}
                    onChange={(e) => setWebsite(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-surface border border-border text-xs font-mono text-foreground focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Support Email */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                  Direct Support Email
                </label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-muted absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="email"
                    placeholder="e.g. support@greenbasket.com"
                    value={supportEmail}
                    onChange={(e) => setSupportEmail(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-surface border border-border text-xs font-mono text-foreground focus:outline-none focus:border-accent"
                  />
                </div>
              </div>

              {/* Parking Info */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                  Parking &amp; Access Note
                </label>
                <div className="relative">
                  <Car className="w-3.5 h-3.5 text-muted absolute left-3 top-3 pointer-events-none" />
                  <input
                    type="text"
                    placeholder="e.g. Free 2-hour parking in rear lot"
                    value={parkingInfo}
                    onChange={(e) => setParkingInfo(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-surface border border-border text-xs font-mono text-foreground focus:outline-none focus:border-accent"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Operating Hours & Weekly Schedule */}
          <div className="p-5 bg-surface border border-border space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-border">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <Clock className="w-3.5 h-3.5 text-accent" />
                <span>3. Operating Hours &amp; Weekly Schedule</span>
              </h3>
              <button
                type="button"
                onClick={handleApplyMondayToAll}
                className="text-[10px] font-mono uppercase text-accent hover:underline font-bold self-start sm:self-auto"
              >
                Copy Monday hours to all days
              </button>
            </div>

            {/* General Headline Hours */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                Summary Hours (Headline on hero banner)
              </label>
              <input
                type="text"
                placeholder="e.g. Mon-Sat: 9:00 AM – 9:00 PM · Sun: 10:00 AM – 8:00 PM"
                value={openingHours}
                onChange={(e) => setOpeningHours(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border text-xs font-mono text-foreground focus:outline-none focus:border-accent"
              />
            </div>

            {/* Daily Hours Inputs */}
            <div className="space-y-2 pt-1">
              <span className="text-[11px] font-mono uppercase tracking-wider text-muted font-bold block">
                Daily Hours of Operation
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DAYS_OF_WEEK.map((day) => (
                  <div key={day} className="flex items-center gap-2 p-2 bg-muted-fill border border-border">
                    <span className="w-24 text-[11px] font-mono font-bold text-foreground">
                      {day}
                    </span>
                    <input
                      type="text"
                      value={schedule[day] || ''}
                      placeholder="e.g. 9:00 AM – 9:00 PM or Closed"
                      onChange={(e) => handleScheduleChange(day, e.target.value)}
                      className="flex-1 px-2 py-1 text-xs font-mono bg-surface border border-border text-foreground focus:outline-none focus:border-accent"
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Section 4: Highlights & Badges */}
          <div className="p-5 bg-surface border border-border space-y-4">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 text-accent" />
              <span>4. Store Highlights &amp; Badges (4 Features)</span>
            </h3>
            <p className="text-xs text-muted">
              These 4 key value propositions will be featured directly under your store's "About" section.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {highlights.map((h, idx) => (
                <div key={idx} className="p-3 bg-muted-fill border border-border space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-foreground">
                    <CheckCircle2 className="w-3.5 h-3.5 text-accent" />
                    <span>Highlight #{idx + 1}</span>
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Title (e.g. Authentic Inventory)"
                      value={h.title}
                      onChange={(e) => handleHighlightChange(idx, 'title', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono font-bold bg-surface border border-border text-foreground focus:outline-none focus:border-accent mb-1.5"
                    />
                    <input
                      type="text"
                      placeholder="Description (e.g. Verified stock)"
                      value={h.description}
                      onChange={(e) => handleHighlightChange(idx, 'description', e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-surface border border-border text-muted focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5: Store Location & Interactive Pin Placement */}
          <div className="p-5 bg-surface border border-border space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-border">
              <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-accent" />
                <span>5. Store Location &amp; Pin On Map</span>
              </h3>
              <span className="text-[10px] font-mono uppercase bg-amber-500/10 text-amber-700 dark:text-amber-400 px-2 py-0.5 border border-amber-500/30 font-bold">
                Interactive Pin Map
              </span>
            </div>

            {/* Physical Address */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                Full Physical Address *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. 542 Pine St, Suite 10, Seattle, WA"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 bg-surface border border-border text-xs sm:text-sm text-foreground focus:outline-none focus:border-accent transition-colors font-sans"
              />
            </div>

            {/* Interactive Pin-Picker Map */}
            <div className="space-y-2 pt-1">
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted">
                Pinpoint Storefront on Map (Click or Drag Pin)
              </label>
              <LocationPickerMap
                latitude={latitude}
                longitude={longitude}
                onChangeLocation={(newLat, newLng, addressHint) => {
                  setLatitude(newLat);
                  setLongitude(newLng);
                  if (addressHint && !address.trim()) {
                    setAddress(addressHint);
                  }
                }}
                heightClass="h-[360px]"
              />
            </div>

            {/* Collapsible Fine-Tune Manual Coordinates Accordion */}
            <div className="pt-2 border-t border-border">
              <button
                type="button"
                onClick={() => setShowManualCoords(!showManualCoords)}
                className="text-[11px] font-mono uppercase text-muted hover:text-foreground font-bold flex items-center gap-1.5"
              >
                <span>{showManualCoords ? '▾ Hide exact coordinates' : '▸ Fine-tune coordinates manually'}</span>
              </button>

              {showManualCoords && (
                <div className="grid grid-cols-2 gap-2.5 pt-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={latitude}
                      onChange={(e) => setLatitude(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-surface border border-border text-xs font-mono text-foreground focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="0.000001"
                      value={longitude}
                      onChange={(e) => setLongitude(parseFloat(e.target.value) || 0)}
                      className="w-full px-3 py-2 bg-surface border border-border text-xs font-mono text-foreground focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 6: Verified Merchant Notice */}
          <div className="p-5 bg-surface border border-border space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <FileText className="w-3.5 h-3.5 text-accent" />
              <span>6. Merchant Guarantee &amp; Customer Notice</span>
            </h3>
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-muted mb-1">
                Merchant Notice / Dispute Resolution Statement
              </label>
              <textarea
                rows={2}
                value={merchantNotice}
                onChange={(e) => setMerchantNotice(e.target.value)}
                placeholder="Verified Merchant Account on StoreRank platform with direct customer dispute resolution."
                className="w-full px-3 py-2 bg-surface border border-border text-xs text-foreground focus:outline-none focus:border-accent font-sans"
              />
            </div>
          </div>

          {/* Section 7: Photos Showcase */}
          <div className="p-5 bg-surface border border-border space-y-3">
            <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-foreground flex items-center gap-2">
              <Camera className="w-3.5 h-3.5 text-accent" />
              <span>7. Store Photos &amp; Visuals</span>
            </h3>
            <p className="text-xs text-muted">
              Upload photos of your storefront or interior to authenticate your store profile.
            </p>

            {/* Photo Previews */}
            {uploadedPhotos.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {uploadedPhotos.map((url, idx) => (
                  <div
                    key={idx}
                    className="relative aspect-video overflow-hidden border border-border group bg-muted-fill"
                  >
                    <img src={url} alt={`Upload ${idx + 1}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(idx)}
                      className="absolute top-1 right-1 p-1 bg-black/70 text-white hover:bg-black transition-opacity opacity-0 group-hover:opacity-100"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Upload Button */}
            <label className="flex items-center justify-center gap-2 p-4 border border-dashed border-border hover:border-foreground cursor-pointer bg-muted-fill transition-colors">
              <Upload className="w-4 h-4 text-muted" />
              <span className="text-xs font-mono uppercase font-semibold text-muted">
                {isUploadingPhoto ? 'Uploading...' : 'Click to Upload Store Photos'}
              </span>
              <input
                type="file"
                multiple
                accept="image/*"
                onChange={handlePhotoUpload}
                disabled={isUploadingPhoto}
                className="hidden"
              />
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 font-mono font-bold uppercase tracking-wider text-xs text-background bg-foreground hover:bg-accent-hover border border-foreground transition-colors flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>{isEditMode ? 'Saving Changes...' : 'Publishing Store...'}</span>
              </>
            ) : (
              <>
                <span>{isEditMode ? 'Save & Update Store Profile' : 'Publish Store Profile & Open Portal'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Live Preview Column (5 cols) */}
        <div className="lg:col-span-5 lg:sticky lg:top-20 space-y-4">
          <div className="text-[10px] font-mono font-bold uppercase tracking-widest text-muted">
            Live Customer Storefront Preview
          </div>

          {/* Store Card Preview */}
          <div className="bg-surface border border-border overflow-hidden">
            <div className="relative w-full h-44 bg-black overflow-hidden">
              {uploadedPhotos.length > 0 ? (
                <img
                  src={uploadedPhotos[0]}
                  alt="Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-black text-muted">
                  <Camera className="w-7 h-7 opacity-40 mb-1" />
                  <span className="text-[10px] font-mono uppercase opacity-60">Store Photo Preview</span>
                </div>
              )}
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-mono uppercase font-bold tracking-wider bg-foreground text-background border border-white/20">
                {category}
              </div>
              <div className="absolute top-2.5 right-2.5 px-2 py-0.5 text-xs font-mono font-bold bg-black text-rating border border-rating/40">
                ★ New
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h4 className="text-base font-bold text-foreground">
                  {name.trim() || 'Store Name Here'}
                </h4>
                <p className="text-xs text-muted flex items-start gap-1 mt-1">
                  <MapPin className="w-3.5 h-3.5 text-muted shrink-0 mt-0.5" />
                  <span>{address.trim() || 'Store physical address...'}</span>
                </p>
              </div>

              {phone && (
                <div className="text-xs font-mono text-muted flex items-center gap-1.5">
                  <Phone className="w-3 h-3 text-muted" />
                  <span>{phone}</span>
                </div>
              )}

              {description && (
                <p className="text-xs text-muted line-clamp-2 font-sans border-t border-border pt-2">
                  {description}
                </p>
              )}

              {/* Highlights Preview */}
              <div className="grid grid-cols-2 gap-1.5 pt-1">
                {highlights.slice(0, 2).map((h, idx) => (
                  <div key={idx} className="p-1.5 bg-muted-fill border border-border text-[10px] font-mono truncate">
                    <span className="font-bold text-foreground block truncate">{h.title || 'Feature'}</span>
                    <span className="text-muted block truncate">{h.description || 'Verified'}</span>
                  </div>
                ))}
              </div>

              {/* Hours Preview */}
              <div className="p-2.5 bg-muted-fill border border-border text-[10px] font-mono text-muted flex items-center justify-between">
                <span className="font-bold text-foreground flex items-center gap-1">
                  <Clock className="w-3 h-3 text-accent" />
                  <span>Hours:</span>
                </span>
                <span className="truncate max-w-[200px]">{openingHours || 'Open Daily'}</span>
              </div>

              {/* Parking Preview */}
              {parkingInfo && (
                <div className="text-[10px] font-mono text-muted flex items-center gap-1">
                  <Car className="w-3 h-3 text-muted shrink-0" />
                  <span className="truncate">{parkingInfo}</span>
                </div>
              )}

              <div className="pt-2 border-t border-border flex items-center justify-between text-xs font-mono text-muted">
                <span>0 Reviews</span>
                <span className="text-foreground font-bold">Ready for Community Ratings</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OwnerOnboardingPage() {
  return (
    <Suspense fallback={<OnboardingSkeleton />}>
      <OwnerOnboardingForm />
    </Suspense>
  );
}
