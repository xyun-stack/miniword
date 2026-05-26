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
  },
  {
    id: "streamdock-15",
    label: "StreamDock 15",
    hint: "15-key · 128 × 128",
    width: 128,
    height: 128,
    aspect: "1 / 1"
  },
  {
    id: "streamdock-32",
    label: "StreamDock N3",
    hint: "32-key · 96 × 96",
    width: 96,
    height: 96,
    aspect: "1 / 1"
  }
];

export const DEFAULT_DEVICE = DEVICES[0];

export function findDevice(id?: string | null): DevicePreset {
  if (!id) return DEFAULT_DEVICE;
  return DEVICES.find((d) => d.id === id) ?? DEFAULT_DEVICE;
}
