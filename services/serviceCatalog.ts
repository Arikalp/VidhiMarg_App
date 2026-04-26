import type { ServiceItem } from '@/types/service';

export const serviceCatalog: ServiceItem[] = [
  {
    id: 'registry',
    title: 'Registry',
    description: 'Property registration, title verification, and document drafting support.',
    price: '₹4,999',
    icon: 'document-text-outline',
  },
  {
    id: 'property-mutation',
    title: 'Property Mutation',
    description: 'Ownership transfer and mutation workflow support with legal review.',
    price: '₹6,499',
    icon: 'home-outline',
  },
  {
    id: 'consultation',
    title: 'Consultation',
    description: 'Personalized legal consultation sessions with practice-area specialists.',
    price: '₹4,499',
    icon: 'briefcase-outline',
  },
  {
    id: 'fir-igrs-complaint',
    title: 'FIR or IGRS Complaint',
    description: 'Legal guidance for complaint filing, documentation, and response strategy.',
    price: '₹5,499',
    icon: 'shield-checkmark-outline',
  },
];
