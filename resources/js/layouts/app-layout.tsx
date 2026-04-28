import ActionFeedbackPopup from '@/components/action-feedback-popup';
import SuccessPopup from '@/components/success-popup';
import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import type { BreadcrumbItem } from '@/types';
import type { ReactNode } from 'react';

interface AppLayoutProps {
  children: ReactNode;
  breadcrumbs?: BreadcrumbItem[];
}

export default function AppLayout({
  children,
  breadcrumbs = [],
}: AppLayoutProps) {
  return (
    <AppLayoutTemplate breadcrumbs={breadcrumbs}>
      <ActionFeedbackPopup />
      <SuccessPopup />

      {children}
    </AppLayoutTemplate>
  );
}
