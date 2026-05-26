export type UploadDevice = "xpad-mini" | "streamdock-15";

/** Server-side upload record stored as JSON in Vercel Blob. */
export type UploadRecord = {
  id: string;
  nickname: string;
  idHandle: string;
  pwHash: string;
  pwSalt: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  width: number;
  height: number;
  device: UploadDevice;
  /** Browser-facing URL. With a private store this points at /api/media/[id]. */
  blobUrl: string;
  /** Underlying private Vercel Blob pathname. Used server-side only. */
  blobPathname: string;
  createdAt: number;
};

/** Client-facing slim representation. Strips the credential hash + salt. */
export type PublicUpload = Omit<UploadRecord, "pwHash" | "pwSalt">;

export function toPublic(record: UploadRecord): PublicUpload {
  const { pwHash: _pwHash, pwSalt: _pwSalt, ...rest } = record;
  return rest;
}
