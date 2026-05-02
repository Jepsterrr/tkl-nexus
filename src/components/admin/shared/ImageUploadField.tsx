'use client';

import { useState } from 'react';
import { Upload, Link, Loader2, X } from 'lucide-react';
import { getCloudinarySecrets } from '@/lib/services/secrets';
import { uploadToCloudinary } from '@/lib/services/cloudinary';
import { inputCls, labelCls, errorCls } from '@/components/admin/shared/formStyles';

const MAX_FILE_SIZE = 1024 * 1024; // 1 MB
const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];
const ACCEPT_ATTR = ACCEPTED_TYPES.join(',');

interface ImageUploadFieldProps {
  value: string;
  onChange: (url: string, publicId?: string) => void;
  label: string;
}

export function ImageUploadField({ value, onChange, label }: ImageUploadFieldProps) {
  const [mode, setMode] = useState<'url' | 'upload'>('url');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const uploadFile = async (file: File, previewUrl: string) => {
    setUploading(true);
    setUploadError(null);
    try {
      const secrets = await getCloudinarySecrets();
      const { url, publicId } = await uploadToCloudinary(file, secrets);
      onChange(url, publicId);
      URL.revokeObjectURL(previewUrl);
      setPreview(null);
      setSelectedFile(null);
    } catch {
      setUploadError('Uppladdningen misslyckades. Försök igen.');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    setUploadError(null);
    if (preview) URL.revokeObjectURL(preview);
    setSelectedFile(null);
    setPreview(null);

    if (!ACCEPTED_TYPES.includes(file.type)) {
      setUploadError('Filtypen stöds inte. Använd PNG, JPG, WebP eller SVG.');
      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      setUploadError('Filen är för stor. Max 1 MB.');
      return;
    }

    const previewUrl = URL.createObjectURL(file);
    setSelectedFile(file);
    setPreview(previewUrl);
    await uploadFile(file, previewUrl);
  };

  const handleRetry = async () => {
    if (!selectedFile || !preview) return;
    await uploadFile(selectedFile, preview);
  };

  const handleClearSelected = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setSelectedFile(null);
    setUploadError(null);
  };

  const handleClear = () => {
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setSelectedFile(null);
    setUploadError(null);
    onChange('', undefined);
  };

  const switchMode = (next: 'url' | 'upload') => {
    setMode(next);
    setUploadError(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setSelectedFile(null);
  };

  const urlInputId = `image-upload-field-url-${label.replace(/\s+/g, '-').toLowerCase()}`;

  return (
    <div>
      <label htmlFor={urlInputId} className={labelCls}>{label}</label>

      {/* Visar befintlig bild */}
      {value && (
        <div className="flex items-center gap-3 mb-3 p-2 rounded-lg bg-[oklch(20%_0.015_265)] border border-[oklch(30%_0.02_265)]">
          <img
            src={value}
            alt=""
            className="w-10 h-10 object-contain rounded"
          />
          <span className="text-xs text-[oklch(55%_0.02_265)] truncate flex-1 min-w-0">{value}</span>
          <button
            type="button"
            onClick={handleClear}
            className="shrink-0 p-3 text-[oklch(50%_0.02_265)] hover:text-[oklch(70%_0.02_265)] transition-colors"
            aria-label="Ta bort bild"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Mode-toggle och input — döljs när ett värde redan finns */}
      {!value && (
        <>
          <div className="flex rounded-lg overflow-hidden border border-[oklch(30%_0.02_265)] mb-3 w-fit">
            <button
              type="button"
              aria-pressed={mode === 'url'}
              onClick={() => switchMode('url')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === 'url'
                  ? 'bg-[oklch(30%_0.02_265)] text-[oklch(85%_0.01_265)]'
                  : 'text-[oklch(50%_0.02_265)] hover:text-[oklch(70%_0.02_265)]'
              }`}
            >
              <Link className="w-3.5 h-3.5" />
              Länk
            </button>
            <button
              type="button"
              aria-pressed={mode === 'upload'}
              onClick={() => switchMode('upload')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                mode === 'upload'
                  ? 'bg-[oklch(30%_0.02_265)] text-[oklch(85%_0.01_265)]'
                  : 'text-[oklch(50%_0.02_265)] hover:text-[oklch(70%_0.02_265)]'
              }`}
            >
              <Upload className="w-3.5 h-3.5" />
              Ladda upp
            </button>
          </div>

          {/* URL-läge */}
          {mode === 'url' && (
            <input
              id={urlInputId}
              type="url"
              value={value}
              onChange={e => onChange(e.target.value, undefined)}
              placeholder="https://"
              className={inputCls}
            />
          )}

          {/* Upload-läge */}
          {mode === 'upload' && (
            <div className="space-y-2">
              {!selectedFile ? (
                <label className="flex items-center justify-center gap-2 w-full py-3 px-4 rounded-lg border border-dashed border-[oklch(35%_0.02_265)] text-xs text-[oklch(55%_0.02_265)] hover:border-[oklch(50%_0.02_265)] hover:text-[oklch(70%_0.02_265)] transition-colors cursor-pointer">
                  <Upload className="w-4 h-4" />
                  Välj fil (PNG, JPG, WebP, SVG — max 1 MB)
                  <input
                    type="file"
                    accept={ACCEPT_ATTR}
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </label>
              ) : (
                <div className="flex items-center gap-3">
                  {preview && (
                    <img
                      src={preview}
                      alt=""
                      className="w-10 h-10 object-contain rounded border border-[oklch(30%_0.02_265)]"
                    />
                  )}
                  <span className="text-xs text-[oklch(60%_0.02_265)] truncate flex-1 min-w-0">
                    {selectedFile.name}
                  </span>
                  {uploading ? (
                    <Loader2 className="w-4 h-4 animate-spin shrink-0 text-[oklch(55%_0.02_265)]" />
                  ) : (
                    <>
                      <button
                        type="button"
                        onClick={handleRetry}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-[oklch(30%_0.02_265)] text-[oklch(85%_0.01_265)] hover:bg-[oklch(35%_0.02_265)] transition-colors shrink-0"
                      >
                        <Upload className="w-3.5 h-3.5" /> Försök igen
                      </button>
                      <button
                        type="button"
                        onClick={handleClearSelected}
                        className="shrink-0 p-3 text-[oklch(50%_0.02_265)] hover:text-[oklch(70%_0.02_265)] transition-colors"
                        aria-label="Avbryt"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <p className={`${errorCls} mt-1`} aria-live="polite">{uploadError ?? ''}</p>
    </div>
  );
}
