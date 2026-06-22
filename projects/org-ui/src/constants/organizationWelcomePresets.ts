import type { WelcomeHeroFeature } from '../components/widgets/OrganizationWelcome/WelcomeHeroPanel';
import { Briefcase, Building2, CalendarDays, MapPin, Users, Wrench } from 'lucide-react';

export enum FieldFlowProduct {
  CMS = 'cms',
  TILE_DESIGN = 'tile_design',
}

export interface OrganizationWelcomePreset {
  title: string;
  subtitle: string;
  footerText: string;
  features: () => WelcomeHeroFeature[];
}

export function defaultCmsWelcomeFeatures(): WelcomeHeroFeature[] {
  return [
    {
      icon: Briefcase,
      title: 'Manage jobs',
      description:
        'Track excavation, tiling, and repair work from lead to completion in one place.',
    },
    {
      icon: Users,
      title: 'Coordinate your team',
      description:
        'Assign crews, manage roles, and keep everyone aligned on active projects.',
    },
    {
      icon: CalendarDays,
      title: 'Stay on schedule',
      description:
        'Use the calendar and dashboards to plan work and monitor progress across orgs.',
    },
  ];
}

export function defaultTileDesignWelcomeFeatures(): WelcomeHeroFeature[] {
  return [
    {
      icon: Building2,
      title: 'Create Client',
      description:
        'Add your farm or client organization to get started with your workspace.',
    },
    {
      icon: MapPin,
      title: 'Add Field',
      description:
        'Define field boundaries and locations for drainage and tile planning.',
    },
    {
      icon: Wrench,
      title: 'Design Job',
      description:
        'Create jobs, draw tile layouts, and run analytics for each project.',
    },
  ];
}

const PRESETS: Record<FieldFlowProduct, OrganizationWelcomePreset> = {
  [FieldFlowProduct.CMS]: {
    title: 'Welcome to FieldFlow360',
    subtitle:
      'Field service management for your organization. Open the organization switcher to select a workspace or create a new organization, then jump into jobs, leads, and team tools.',
    footerText: 'Select an organization to continue',
    features: defaultCmsWelcomeFeatures,
  },
  [FieldFlowProduct.TILE_DESIGN]: {
    title: 'Welcome to Tile Design',
    subtitle:
      'Professional agricultural drainage system design made simple. Use the organization switcher to open your workspace, or create a new organization—then add clients, fields, and tile design jobs.',
    footerText: 'No credit card required • Free to start',
    features: defaultTileDesignWelcomeFeatures,
  },
};

export function getOrganizationWelcomePreset(
  product: FieldFlowProduct
): OrganizationWelcomePreset {
  return PRESETS[product];
}
