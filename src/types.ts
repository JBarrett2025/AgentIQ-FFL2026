
export interface Link {
  name?: string; // Legacy field for migration logic
  nameKey: string;
  url: string;
  urlEs?: string;
}

export interface Resource {
  name?: string; // Legacy field for migration logic
  nameKey: string;
  url: string;
  urlEs?: string;
}

export interface InternalLink {
  id: string;
  name?: string; // Legacy field for migration logic
  nameKey: string;
  targetTileId: string;
}

export interface Workflow {
  nextTileId?: string;
}

export interface TrainingVideo {
  url: string;
  urlEs?: string;
  thumbnailUrl: string;
  thumbnailUrlEs?: string;
}

export interface TileVisibility {
  name: boolean;
  logo: boolean;
  description: boolean;
  color: boolean;
  font: boolean;
  overviewVideo: boolean;
  trainingVideos: boolean;
  documentation: boolean;
  links: boolean;
  resources: boolean;
  internalLinks: boolean;
  workflow: boolean;
}

export interface TranslationDictionary {
  [key: string]: {
    en: string;
    es: string;
  };
}

export interface TileProperties {
  nameKey: string;
  internalName?: string; // Admin-facing name, especially useful when useLogoAsBackground is true
  descriptionKey: string;
  color: string;
  font: string;
  logoUrl: string;
  logoUrlEs?: string;
  useLogoAsBackground: boolean;
  overviewVideo: string;
  overviewVideoEs?: string;
  thumbnailUrl: string;
  thumbnailUrlEs?: string;
  trainingVideos: TrainingVideo[];
  documentation: string;
  links: Link[];
  resources: Resource[];
  internalLinks: InternalLink[];
  workflow?: Workflow;
  accessTags: string[];
  isVisible: TileVisibility;
}

export interface Tile extends TileProperties {
  id: string;
  children: Tile[];
}

export interface Template {
  templateId: string;
  name: string; // Internal template UI name doesn't typically need translation
  properties: Partial<TileProperties>;
}

export interface SiteData {
  siteNameKey: string;
  headerContentKey: string;
  footerContentKey: string;
  translations: TranslationDictionary;
  tiles: Tile[];
  templates: Template[];
  helpTileId?: string;
}

export interface ProjectDocument {
  id?: string;
  projectName: string;
  ownerId: string;
  collaboratorIds: string[];
  siteData: SiteData | null;
  createdAt: any;
  updatedAt: any;
}