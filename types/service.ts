export type ServiceItem = {
  id: string;
  title: string;
  description: string;
  price: string;
  category: string;
  serviceType: string;
  estimatedTurnaround: string;
  includes: string[];
  featured?: boolean;
  icon: 'briefcase-outline' | 'document-text-outline' | 'home-outline' | 'shield-checkmark-outline';
};
