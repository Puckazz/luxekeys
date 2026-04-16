export const PRODUCT_TYPES = [
  'keyboard',
  'switch',
  'keycap',
  'accessory',
] as const;

export const PRODUCT_SWITCH_KINDS = [
  'linear',
  'tactile',
  'clicky',
  'magnetic',
] as const;

export const KEYBOARD_SOFTWARES = ['QMK', 'VIA', 'Driver'] as const;

export const KEYBOARD_MOUNT_STYLES = ['gasket', 'tray', 'top'] as const;

export const KEYCAP_MATERIALS = ['PBT', 'ABS'] as const;

export const KEYCAP_LEGENDS = ['dye-sub', 'double-shot', 'laser'] as const;

export const ACCESSORY_KINDS = [
  'cable',
  'wrist-rest',
  'deskmat',
  'stabilizer',
  'other',
] as const;

export const SWITCH_PINS = [3, 5] as const;
