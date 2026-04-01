import { render, screen, fireEvent } from '@testing-library/react';
import ReviewFilters, { type FilterState, type SortOption } from '../ReviewFilters';

const defaultFilters: FilterState = {
  platform: 'all',
  rating: 'all',
  status: 'all',
};

const setup = (overrides?: Partial<{ filters: FilterState; sort: SortOption }>) => {
  const onChange = jest.fn();
  const onSortChange = jest.fn();
  const result = render(
    <ReviewFilters
      filters={overrides?.filters ?? defaultFilters}
      sort={overrides?.sort ?? 'newest'}
      onChange={onChange}
      onSortChange={onSortChange}
    />
  );
  return { ...result, onChange, onSortChange };
};

describe('ReviewFilters', () => {
  it('renders platform dropdown with options', () => {
    setup();
    expect(screen.getByDisplayValue('All Platforms')).toBeInTheDocument();
  });

  it('renders rating dropdown with options', () => {
    setup();
    expect(screen.getByDisplayValue('All Ratings')).toBeInTheDocument();
  });

  it('renders status dropdown with options', () => {
    setup();
    expect(screen.getByDisplayValue('All Status')).toBeInTheDocument();
  });

  it('renders sort dropdown', () => {
    setup();
    expect(screen.getByDisplayValue('Newest First')).toBeInTheDocument();
  });

  it('calls onChange when platform changes', () => {
    const { onChange } = setup();
    const select = screen.getByDisplayValue('All Platforms');
    fireEvent.change(select, { target: { value: 'google' } });
    expect(onChange).toHaveBeenCalledWith({ ...defaultFilters, platform: 'google' });
  });

  it('calls onSortChange when sort changes', () => {
    const { onSortChange } = setup();
    const select = screen.getByDisplayValue('Newest First');
    fireEvent.change(select, { target: { value: 'highest' } });
    expect(onSortChange).toHaveBeenCalledWith('highest');
  });

  it('hides Clear all when no filters active', () => {
    setup();
    expect(screen.queryByText('Clear all')).not.toBeInTheDocument();
  });

  it('shows Clear all when filters are active', () => {
    setup({ filters: { platform: 'google', rating: 'all', status: 'all' } });
    expect(screen.getByText('Clear all')).toBeInTheDocument();
  });

  it('clicking Clear all resets all filters', () => {
    const { onChange } = setup({ filters: { platform: 'google', rating: '5', status: 'replied' } });
    fireEvent.click(screen.getByText('Clear all'));
    expect(onChange).toHaveBeenCalledWith({ platform: 'all', rating: 'all', status: 'all' });
  });
});
