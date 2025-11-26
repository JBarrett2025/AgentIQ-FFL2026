
export interface Link {
  name: string;
  url: string;
}

export interface Resource {
  name: string;
  url: string;
}

export interface InternalLink {
  id: string;
  name: string;
  targetTileId: string;
}

export interface Workflow {
  nextTileId?: string;
}

export interface TrainingVideo {
  url: string;
  thumbnailUrl: string;
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

export interface TileProperties {
  name: string;
  description: string;
  color: string;
  font: string;
  logoUrl: string;
  useLogoAsBackground: boolean;
  overviewVideo: string;
  thumbnailUrl: string;
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
  name: string;
  properties: Partial<TileProperties>;
}

export interface SiteData {
  siteName: string;
  headerContent: string;
  footerContent: string;
  tiles: Tile[];
  templates: Template[];
  helpTileId?: string;
}