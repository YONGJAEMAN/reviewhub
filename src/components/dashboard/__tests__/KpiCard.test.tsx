import { render, screen } from '@testing-library/react';
import KpiCard from '../KpiCard';
import type { KpiData } from '@/types';

describe('KpiCard', () => {
  const baseData: KpiData = {
    label: 'TOTAL REVIEWS',
    value: '1,247',
    change: '+12.5%',
    positive: true,
    icon: 'bar-chart',
  };

  it('renders label with proper casing', () => {
    render(<KpiCard data={baseData} />);
    expect(screen.getByText('Total reviews')).toBeInTheDocument();
  });

  it('renders value', () => {
    render(<KpiCard data={baseData} />);
    expect(screen.getByText('1,247')).toBeInTheDocument();
  });

  it('renders change badge', () => {
    render(<KpiCard data={baseData} />);
    expect(screen.getByText('+12.5%')).toBeInTheDocument();
  });

  it('shows /5 suffix for OVERALL RATING label', () => {
    render(<KpiCard data={{ ...baseData, label: 'OVERALL RATING', value: '4.6' }} />);
    expect(screen.getByText('/5')).toBeInTheDocument();
  });

  it('does not show suffix for other labels', () => {
    render(<KpiCard data={baseData} />);
    expect(screen.queryByText('/5')).not.toBeInTheDocument();
  });

  it('renders with different icon types', () => {
    const icons = ['star', 'trending-up', 'smile', 'bar-chart'] as const;
    icons.forEach((icon) => {
      const { container } = render(<KpiCard data={{ ...baseData, icon }} />);
      expect(container.querySelector('svg')).toBeInTheDocument();
    });
  });
});
