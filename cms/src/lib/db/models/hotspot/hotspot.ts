import fs from 'fs';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'data', 'hotspot.json');

interface BlockStyles {
  blockBackground: string;
  titleColor: string;
  descriptionColor: string;
  buttonBackground: string;
  buttonTextColor: string;
}

interface Block {
  id: string;
  image: string | null;
  title: string;
  description: string;
  buttonText: string;
  buttonLink: string;
}

interface BlockSet {
  id: string;
  styles: BlockStyles;
  blocks: Block[];
}

interface FooterIcon {
  id?: string;
  icon?: string;
  link?: string;
}

interface FooterStyles {
  footerBackground: string;
  iconColor: string;
  textColor: string;
}

interface Footer {
  icons: FooterIcon[];
  styles: FooterStyles;
}

interface EditorsPick {
  id?: string;
  image?: string;
  title?: string;
  link?: string;
}

interface DiscoveryPlace {
  id?: string;
  image?: string;
  title?: string;
  subtitle?: string;
  link?: string;
}

interface PlayAndWin {
  bannerImage: string | null;
  titleBosnian: string;
  titleEnglish: string;
  subtitleBosnian: string;
  subtitleEnglish: string;
  link: string;
}

interface Utilities {
  cityName: string;
  baseCurrency: string;
  timezone: string;
  latitude: string;
  longitude: string;
  targetCurrencies: string;
}

interface HotspotData {
  blockSets: BlockSet[];
  footer: Footer;
  editorsPicks: EditorsPick[];
  discovery: DiscoveryPlace[];
  playAndWin: PlayAndWin;
  utilities: Utilities;
}

function getDefaultData(): HotspotData {
  return {
    blockSets: [],
    footer: {
      icons: [],
      styles: {
        footerBackground: 'rgba(33, 37, 41, 1)',
        iconColor: 'rgba(0, 0, 0, 0)',
        textColor: 'rgba(0, 0, 0, 0)'
      }
    },
    editorsPicks: [],
    discovery: [],
    playAndWin: {
      bannerImage: null,
      titleBosnian: '',
      titleEnglish: '',
      subtitleBosnian: '',
      subtitleEnglish: '',
      link: ''
    },
    utilities: {
      cityName: '',
      baseCurrency: '',
      timezone: '',
      latitude: '',
      longitude: '',
      targetCurrencies: ''
    }
  };
}

function ensureDataFile(): void {
  const dir = path.dirname(DATA_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify(getDefaultData(), null, 2));
  }
}

function readData(): HotspotData {
  ensureDataFile();
  try {
    const raw = fs.readFileSync(DATA_FILE, 'utf-8');
    const parsed = JSON.parse(raw);
    return { ...getDefaultData(), ...parsed };
  } catch {
    return getDefaultData();
  }
}

function writeData(data: HotspotData): void {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
}

export function getBlockSets(): BlockSet[] {
  return readData().blockSets || [];
}

export function saveBlockSets(sets: BlockSet[]): BlockSet[] {
  const data = readData();
  const sanitized = Array.isArray(sets) ? sets.map(set => ({
    id: set.id || Date.now().toString(),
    styles: {
      blockBackground: set.styles?.blockBackground || 'rgba(31, 31, 31, 1)',
      titleColor: set.styles?.titleColor || 'rgba(255, 255, 255, 1)',
      descriptionColor: set.styles?.descriptionColor || 'rgba(196, 196, 196, 1)',
      buttonBackground: set.styles?.buttonBackground || 'rgba(122, 73, 240, 1)',
      buttonTextColor: set.styles?.buttonTextColor || 'rgba(255, 255, 255, 1)'
    },
    blocks: Array.isArray(set.blocks) ? set.blocks.map(b => ({
      id: b.id || Math.random().toString(36).slice(2),
      image: b.image || null,
      title: b.title || '',
      description: b.description || '',
      buttonText: b.buttonText || '',
      buttonLink: b.buttonLink || ''
    })) : []
  })) : [];
  data.blockSets = sanitized;
  writeData(data);
  return sanitized;
}

export function getFooter(): Footer {
  return readData().footer || getDefaultData().footer;
}

export function saveFooter(footer: Footer): Footer {
  const data = readData();
  data.footer = footer;
  writeData(data);
  return footer;
}

export function getEditorsPicks(): EditorsPick[] {
  return readData().editorsPicks || [];
}

export function saveEditorsPicks(picks: EditorsPick[]): EditorsPick[] {
  const data = readData();
  data.editorsPicks = picks;
  writeData(data);
  return picks;
}

export function getDiscovery(): DiscoveryPlace[] {
  return readData().discovery || [];
}

export function saveDiscovery(discovery: DiscoveryPlace[]): DiscoveryPlace[] {
  const data = readData();
  data.discovery = discovery;
  writeData(data);
  return discovery;
}

export function getPlayAndWin(): PlayAndWin {
  return readData().playAndWin || getDefaultData().playAndWin;
}

export function savePlayAndWin(playAndWin: PlayAndWin): PlayAndWin {
  const data = readData();
  data.playAndWin = playAndWin;
  writeData(data);
  return playAndWin;
}

export function getUtilities(): Utilities {
  return readData().utilities || getDefaultData().utilities;
}

export function saveUtilities(utilities: Utilities): Utilities {
  const data = readData();
  data.utilities = utilities;
  writeData(data);
  return utilities;
}

// Export hotspotModel object for API routes
export const hotspotModel = {
  getConfig: (): HotspotData => readData(),
  saveConfig: (config: HotspotData): void => writeData(config),
  getBlockSets,
  saveBlockSets,
  getFooter,
  saveFooter,
  getEditorsPicks,
  saveEditorsPicks,
  getDiscovery,
  saveDiscovery,
  getPlayAndWin,
  savePlayAndWin,
  getUtilities,
  saveUtilities
};
