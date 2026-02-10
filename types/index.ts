// === Media Types ===

export interface CloudinaryImage {
  readonly publicId: string;
  readonly alt: string;
  readonly width: number;
  readonly height: number;
}

export interface VideoEmbed {
  readonly platform: "youtube" | "vimeo";
  readonly videoId: string;
  readonly title: string;
}

export interface BackgroundMedia {
  readonly type: "image" | "video";
  readonly src: string;
  readonly overlayOpacity?: number;
}

// === Content Types ===

export interface ShowreelItem {
  readonly id: string;
  readonly title: string;
  readonly year: number;
  readonly thumbnail: CloudinaryImage;
  readonly video: VideoEmbed;
  readonly description?: string;
}

export interface ArchiveItem {
  readonly id: string;
  readonly city: string;
  readonly year: string;
  readonly thumbnail: CloudinaryImage;
  readonly photos: ReadonlyArray<CloudinaryImage>;
  readonly description?: string;
}

export interface PhotographyItem {
  readonly id: string;
  readonly title: string;
  readonly client: string;
  readonly thumbnail: CloudinaryImage;
  readonly photos: ReadonlyArray<CloudinaryImage>;
  readonly description?: string;
}

export interface PersonalWorkItem {
  readonly id: string;
  readonly title: string;
  readonly thumbnail: CloudinaryImage;
  readonly media: ReadonlyArray<CloudinaryImage | VideoEmbed>;
  readonly description?: string;
}

// === Navigation Types ===

export interface SocialLink {
  readonly platform: string;
  readonly url: string;
  readonly label: string;
}

export interface NavItem {
  readonly label: string;
  readonly href: string;
}

// === Component Props ===

export interface ThumbnailGridProps {
  readonly items: ReadonlyArray<{
    readonly id: string;
    readonly title: string;
    readonly thumbnail: CloudinaryImage;
  }>;
  readonly basePath: string;
  readonly columns?: 2 | 3 | 4;
  readonly onHover?: (id: string | null) => void;
}

export interface HorizontalSliderProps {
  readonly items: ReadonlyArray<{
    readonly id: string;
    readonly title: string;
    readonly thumbnail: CloudinaryImage;
  }>;
  readonly basePath: string;
}

export interface LightboxProps {
  readonly images: ReadonlyArray<CloudinaryImage>;
  readonly initialIndex: number;
  readonly onClose: () => void;
}

export interface VideoPlayerProps {
  readonly video: VideoEmbed;
  readonly autoPlay?: boolean;
}
