import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ReplyModal from '../ReplyModal';
import type { Review } from '@/types';

const mockFetch = jest.fn();
global.fetch = mockFetch as unknown as typeof fetch;

const baseReview: Review = {
  id: 'rev-1',
  platform: 'google',
  authorName: 'John Doe',
  authorInitials: 'JD',
  isVerified: false,
  rating: 4,
  content: 'Great service.',
  tags: ['POSITIVE'],
  status: 'action_required',
  postedAt: '2 hours ago',
};

beforeEach(() => jest.clearAllMocks());

describe('ReplyModal', () => {
  it('renders modal with author name', () => {
    render(<ReplyModal review={baseReview} onClose={jest.fn()} onSend={jest.fn()} />);
    expect(screen.getByText(/Reply to John Doe/)).toBeInTheDocument();
  });

  it('closes on Escape key', () => {
    const onClose = jest.fn();
    render(<ReplyModal review={baseReview} onClose={onClose} onSend={jest.fn()} />);
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('defaults to professional tone for high rating', () => {
    render(<ReplyModal review={baseReview} onClose={jest.fn()} onSend={jest.fn()} />);
    const professionalBtn = screen.getByText('Professional');
    expect(professionalBtn.closest('button')).toHaveClass('bg-accent-blue');
  });

  it('defaults to apologetic tone for low rating', () => {
    render(<ReplyModal review={{ ...baseReview, rating: 1 }} onClose={jest.fn()} onSend={jest.fn()} />);
    const apologeticBtn = screen.getByText('Apologetic & Sincere');
    expect(apologeticBtn.closest('button')).toHaveClass('bg-accent-blue');
  });

  it('disables send when reply is empty', () => {
    render(<ReplyModal review={baseReview} onClose={jest.fn()} onSend={jest.fn()} />);
    const sendBtn = screen.getByText(/Send Reply/);
    expect(sendBtn.closest('button')).toBeDisabled();
  });

  it('calls onSend with reply content', () => {
    const onSend = jest.fn();
    render(<ReplyModal review={baseReview} onClose={jest.fn()} onSend={onSend} />);

    const textarea = screen.getByPlaceholderText(/Write your response/);
    fireEvent.change(textarea, { target: { value: 'Thank you!' } });

    const sendBtn = screen.getByText(/Send Reply/);
    fireEvent.click(sendBtn);

    expect(onSend).toHaveBeenCalledWith('rev-1', 'Thank you!');
  });

  it('shows AI suggest button', () => {
    render(<ReplyModal review={baseReview} onClose={jest.fn()} onSend={jest.fn()} />);
    expect(screen.getByText(/AI Suggest Reply/)).toBeInTheDocument();
  });

  it('fetches AI suggestion on button click', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({
        data: { reply: 'AI generated reply', usage: { used: 1, limit: 10 } },
      }),
    });

    render(<ReplyModal review={baseReview} onClose={jest.fn()} onSend={jest.fn()} />);
    fireEvent.click(screen.getByText(/AI Suggest Reply/));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        '/api/ai/suggest-reply',
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
