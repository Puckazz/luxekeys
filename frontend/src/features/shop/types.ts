export interface FeaturedProduct {
  name: string;
  subtitle: string;
  price: string;
  badge: string | null;
  image: string;
}

export interface CountdownItem {
  value: string;
  label: string;
}

export interface CommunityImage {
  image: string;
  alt: string;
  cols?: 1 | 2;
  rows?: 1 | 2;
}

export interface LabNote {
  category: string;
  title: string;
  excerpt: string;
  image: string;
}
