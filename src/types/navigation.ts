import { type ReactNode } from 'react';

export interface NavItem {
  label: string;
  icon: ReactNode;
  path: string;
}