'use client';

import { useEffect, useRef, useState } from 'react';
import { Loader2, RotateCcw } from 'lucide-react';
import { getCloudinarySecrets } from '@/lib/services/secrets';
import { deleteFromCloudinary } from '@/lib/services/cloudinary';
import {
  getHeroImagesSettings,
  saveHeroImagesSettings,
  getAboutSettings,
  saveAboutSettings,
} from '@/lib/services/settings';
import type { HeroImagesSettings } from '@/lib/schemas/settings';
import { ImageUploadField } from '@/components/admin/shared/ImageUploadField';
import { sectionHdCls } from '@/components/admin/shared/formStyles';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';
type RevertStatus = 'idle' | 'reverting' | 'error';
type ImgState = { url: string; cloudinaryId: string };
type HeroKey = 'home' | 'students' | 'corporate' | 'events' | 'career' | 'about';

const DEFAULT_IMG: ImgState = { url: '', cloudinaryId: '' };

const HERO_FIELDS: Array<{ key: HeroKey; label: string }> = [
  { key: 'home',      label: 'Hem (/)' },
  { key: 'students',  label: 'Studenter (/students)' },
  { key: 'corporate', label: 'Företag (/corporate)' },
  { key: 'events',    label: 'Events (/events)' },
  { key: 'career',    label: 'Karriär (/career)' },
  { key: 'about',     label: 'Om oss (/about)' },
];

type HeroStateMap = Record<HeroKey, ImgState>;

function toHeroSettings(state: HeroStateMap): HeroImagesSettings {
  return {
    homeUrl:               state.home.url      || undefined,
    homeCloudinaryId:      state.home.cloudinaryId      || undefined,
    studentsUrl:           state.students.url  || undefined,
    studentsCloudinaryId:  state.students.cloudinaryId  || undefined,
    corporateUrl:          state.corporate.url || undefined,
    corporateCloudinaryId: state.corporate.cloudinaryId || undefined,
    eventsUrl:             state.events.url    || undefined,
    eventsCloudinaryId:    state.events.cloudinaryId    || undefined,
    careerUrl:             state.career.url    || undefined,
    careerCloudinaryId:    state.career.cloudinaryId    || undefined,
    aboutUrl:              state.about.url     || undefined,
    aboutCloudinaryId:     state.about.cloudinaryId     || undefined,
  };
}

export function MediaForm() {
  const [heroState, setHeroState] = useState<HeroStateMap>({
    home:      { ...DEFAULT_IMG },
    students:  { ...DEFAULT_IMG },
    corporate: { ...DEFAULT_IMG },
    events:    { ...DEFAULT_IMG },
    career:    { ...DEFAULT_IMG },
    about:     { ...DEFAULT_IMG },
  });
  const [campusState, setCampusState] = useState<ImgState>({ ...DEFAULT_IMG });

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [fetchKey, setFetchKey] = useState(0);
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  const [heroRevert, setHeroRevert] = useState<Record<HeroKey, RevertStatus>>({
    home: 'idle', students: 'idle', corporate: 'idle',
    events: 'idle', career: 'idle', about: 'idle',
  });
  const [campusRevert, setCampusRevert] = useState<RevertStatus>('idle');

  const savedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => () => { if (savedTimerRef.current) clearTimeout(savedTimerRef.current); }, []);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setLoadError(false);

    Promise.all([getHeroImagesSettings(), getAboutSettings()])
      .then(([hero, about]) => {
        if (cancelled) return;
        if (hero) {
          setHeroState({
            home:      { url: hero.homeUrl ?? '',      cloudinaryId: hero.homeCloudinaryId ?? '' },
            students:  { url: hero.studentsUrl ?? '',  cloudinaryId: hero.studentsCloudinaryId ?? '' },
            corporate: { url: hero.corporateUrl ?? '', cloudinaryId: hero.corporateCloudinaryId ?? '' },
            events:    { url: hero.eventsUrl ?? '',    cloudinaryId: hero.eventsCloudinaryId ?? '' },
            career:    { url: hero.careerUrl ?? '',    cloudinaryId: hero.careerCloudinaryId ?? '' },
            about:     { url: hero.aboutUrl ?? '',     cloudinaryId: hero.aboutCloudinaryId ?? '' },
          });
        }
        if (about) {
          setCampusState({
            url: about.campusPhotoUrl ?? '',
            cloudinaryId: about.campusPhotoCloudinaryId ?? '',
          });
        }
        setLoading(false);
      })
      .catch(() => {
        if (!cancelled) {
          setLoadError(true);
          setLoading(false);
        }
      });

    return () => { cancelled = true; };
  }, [fetchKey]);

  const handleHeroChange = (key: HeroKey) => (url: string, publicId?: string) => {
    setHeroState(prev => ({
      ...prev,
      [key]: {
        url,
        cloudinaryId: publicId !== undefined ? publicId : (url === '' ? '' : prev[key].cloudinaryId),
      },
    }));
  };

  const handleCampusChange = (url: string, publicId?: string) => {
    setCampusState({
      url,
      cloudinaryId: publicId !== undefined ? publicId : (url === '' ? '' : campusState.cloudinaryId),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);
    setSaveStatus('saving');
    try {
      await Promise.all([
        saveHeroImagesSettings(toHeroSettings(heroState)),
        saveAboutSettings({
          campusPhotoUrl:          campusState.url          || undefined,
          campusPhotoCloudinaryId: campusState.cloudinaryId || undefined,
        }),
      ]);
      setSaveStatus('saved');
      if (savedTimerRef.current) clearTimeout(savedTimerRef.current);
      savedTimerRef.current = setTimeout(() => setSaveStatus('idle'), 2000);
    } catch {
      setSaveStatus('error');
      setSaveError('Något gick fel. Försök igen.');
    }
  };

  const handleHeroRevert = async (key: HeroKey, cloudinaryId: string) => {
    setHeroRevert(prev => ({ ...prev, [key]: 'reverting' }));
    try {
      const secrets = await getCloudinarySecrets();
      await deleteFromCloudinary(cloudinaryId, secrets);
      const cleared = toHeroSettings({ ...heroState, [key]: { url: '', cloudinaryId: '' } });
      await saveHeroImagesSettings(cleared);
      setHeroState(prev => ({ ...prev, [key]: { url: '', cloudinaryId: '' } }));
      setHeroRevert(prev => ({ ...prev, [key]: 'idle' }));
    } catch {
      setHeroRevert(prev => ({ ...prev, [key]: 'error' }));
    }
  };

  const handleCampusRevert = async (cloudinaryId: string) => {
    setCampusRevert('reverting');
    try {
      const secrets = await getCloudinarySecrets();
      await deleteFromCloudinary(cloudinaryId, secrets);
      await saveAboutSettings({ campusPhotoUrl: '', campusPhotoCloudinaryId: '' });
      setCampusState({ url: '', cloudinaryId: '' });
      setCampusRevert('idle');
    } catch {
      setCampusRevert('error');
    }
  };

  if (loading) {
    return (
      <div className="p-6 sm:p-8 max-w-2xl animate-pulse space-y-4">
        <div className="h-3 w-32 rounded bg-[oklch(18%_0.012_265)]" />
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-10 rounded bg-[oklch(18%_0.012_265)]" />
        ))}
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="p-6 sm:p-8">
        <p className="text-sm text-[oklch(65%_0.2_25)] mb-3">Kunde inte hämta inställningar.</p>
        <button
          type="button"
          onClick={() => setFetchKey(k => k + 1)}
          className="text-xs text-[oklch(55%_0.12_265)] hover:text-[oklch(70%_0.12_265)] transition-colors"
        >
          Försök igen
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="p-6 sm:p-8 max-w-2xl space-y-10">

      {/* Hero-bilder */}
      <section>
        <h2 className={sectionHdCls}>
          Hero-bilder
        </h2>
        <div className="space-y-6">
          {HERO_FIELDS.map(({ key, label }) => {
            const img = heroState[key];
            const revertSt = heroRevert[key];
            return (
              <div key={key}>
                <ImageUploadField
                  label={label}
                  value={img.url}
                  onChange={handleHeroChange(key)}
                />
                {img.cloudinaryId && (
                  <button
                    type="button"
                    disabled={revertSt === 'reverting'}
                    onClick={() => handleHeroRevert(key, img.cloudinaryId)}
                    className="mt-1.5 flex items-center gap-1.5 text-xs text-[oklch(55%_0.02_265)] hover:text-[oklch(70%_0.02_265)] disabled:opacity-50 transition-colors"
                  >
                    {revertSt === 'reverting'
                      ? <Loader2 className="w-3 h-3 animate-spin" />
                      : <RotateCcw className="w-3 h-3" />}
                    {revertSt === 'error' ? 'Fel — försök igen' : 'Återställ till standard'}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Campus-foto */}
      <section>
        <h2 className={sectionHdCls}>
          Campus-foto (Om oss-sidan)
        </h2>
        <ImageUploadField
          label="Campus-foto"
          value={campusState.url}
          onChange={handleCampusChange}
        />
        {campusState.cloudinaryId && (
          <button
            type="button"
            disabled={campusRevert === 'reverting'}
            onClick={() => handleCampusRevert(campusState.cloudinaryId)}
            className="mt-1.5 flex items-center gap-1.5 text-xs text-[oklch(55%_0.02_265)] hover:text-[oklch(70%_0.02_265)] disabled:opacity-50 transition-colors"
          >
            {campusRevert === 'reverting'
              ? <Loader2 className="w-3 h-3 animate-spin" />
              : <RotateCcw className="w-3 h-3" />}
            {campusRevert === 'error' ? 'Fel — försök igen' : 'Återställ till standard'}
          </button>
        )}
      </section>

      {/* Spara */}
      <div className="flex items-center justify-between pt-4 border-t border-[oklch(28%_0.015_265)]">
        <div>
          {saveError && (
            <p className="text-xs text-[oklch(65%_0.2_25)]" role="alert">{saveError}</p>
          )}
          <span className="sr-only" aria-live="polite">
            {saveStatus === 'saved' ? 'Sparat' : ''}
          </span>
        </div>
        <button
          type="submit"
          disabled={saveStatus === 'saving'}
          className="px-5 py-2.5 text-sm font-semibold rounded-lg bg-[oklch(40%_0.14_265)] text-white hover:bg-[oklch(45%_0.14_265)] disabled:opacity-50 transition-colors"
        >
          {saveStatus === 'saving' ? 'Sparar…' : saveStatus === 'saved' ? 'Sparat ✓' : 'Spara inställningar'}
        </button>
      </div>
    </form>
  );
}
