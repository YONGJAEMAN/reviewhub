import { render, screen, fireEvent } from '@testing-library/react';
import ReviewCard from '../ReviewCard';
import type { Review } from '@/types';

const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}));

const baseReview: Review = {
  id: 'rev-1',
  platform: 'google',
  authorName: 'John Doe',
  authorInitials: 'JD',
  isVerified: false,
  rating: 4,
  content: 'Great service and friendly staff.',
  tags: ['POSITIVE'],
  status: 'action_required',
  postedAt: '2 hours ago',
};

beforeEach(() => jest.clearAllMocks());

describe('ReviewCard', () => {
  it('renders Action Required badge', () => {
    render(<ReviewCard review={baseReview} />);
    expect(screen.getByText('Action Required')).toBeInTheDocument();
  });

  it('renders High Priority badge', () => {
    render(<ReviewCard review={{ ...baseReview, status: 'high_priority' }} />);
    expect(screen.getByText('High Priority')).toBeInTheDocument();
  });

  it('renders Replied badge', () => {
    render(<ReviewCard review={{ ...baseReview, status: 'replied' }} />);
    expect(screen.getByText('Replied')).toBeInTheDocument();
  });

  it('shows initials when no avatar', () => {
    render(<ReviewCard review={baseReview} />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('shows avatar img when authorAvatar provided', () => {
    render(<ReviewCard review={{ ...baseReview, authorAvatar: 'https://example.com/avatar.jpg' }} />);
    const img = screen.getByAltText('John Doe');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', 'https://example.com/avatar.jpg');
  });

  it('renders author name', () => {
    render(<ReviewCard review={baseReview} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders review content', () => {
    render(<ReviewCard review={baseReview} />);
    expect(screen.getByText('Great service and friendly staff.')).toBeInTheDocument();
  });

  it('navigates on card click', () => {
    render(<ReviewCard review={baseReview} />);
    const content = screen.getByText('Great service and friendly staff.');
    fireEvent.click(content);
    expect(mockPush).toHaveBeenCalledWith('/reviews/rev-1');
  });

  it('calls onReply when reply button clicked', () => {
    const onReply = jest.fn();
    render(<ReviewCard review={baseReview} onReply={onReply} />);
    const replyBtn = screen.getByText(/Reply to John/);
    fireEvent.click(replyBtn);
    expect(onReply).toHaveBeenCalledWith(baseReview);
  });

  it('applies highlight styling', () => {
    const { container } = render(<ReviewCard review={baseReview} highlight />);
    // The highlight class is on the inner card div (second child of wrapper)
    const innerCard = container.querySelector('.ring-2');
    expect(innerCard).toBeInTheDocument();
  });

  it('shows Open in Yelp for yelp reviews', () => {
    render(<ReviewCard review={{ ...baseReview, platform: 'yelp', status: 'action_required' }} />);
    expect(screen.getByText('Open in Yelp')).toBeInTheDocument();
  });

  it('shows reply block when review has reply', () => {
    render(<ReviewCard review={{
      ...baseReview,
      status: 'replied',
      reply: { content: 'Thanks for feedback!', repliedAt: '1 day ago' },
    }} />);
    expect(screen.getByText(/Thanks for feedback/)).toBeInTheDocument();
    expect(screen.getByText('Your Reply')).toBeInTheDocument();
  });

  it('renders tags', () => {
    render(<ReviewCard review={{ ...baseReview, tags: ['CUSTOMER SERVICE', 'QUALITY'] }} />);
    expect(screen.getByText('CUSTOMER SERVICE')).toBeInTheDocument();
    expect(screen.getByText('QUALITY')).toBeInTheDocument();
  });
});
