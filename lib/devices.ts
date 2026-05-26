export type DevicePreset = {
  id: string;
  label: string;
  hint: string;
  width: number;
  height: number;
  aspect: string;
};

export const DEVICES: DevicePreset[] = [
  {
    id: "xpad-mini",
    label: "xpad mini",
    hint: "3-key · 240 × 135",
    width: 240,
    height: 135,
    aspect: "240 / 135"
  }
];

export const DEFAULT_DEVICE = DEVICES[0];

export function findDevice(id?: string | null): DevicePreset {
  if (!id) return DEFAULT_DEVICE;
  return DEVICES.find((d) => d.id === id) ?? DEFAULT_DEVICE;
}
