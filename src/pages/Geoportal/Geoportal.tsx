import { FC } from 'react';

import { DashboardLayout } from 'components';

export const Geoportal: FC<{ title: string }> = ({ title }) => {
  return <DashboardLayout title='Геопортал'>{title}</DashboardLayout>;
};
