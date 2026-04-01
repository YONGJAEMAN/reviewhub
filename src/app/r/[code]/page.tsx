'use client';

import { useState, useEffect } from 'react';
import { Star, ExternalLink, MessageSquare, CheckCircle } from 'lucide-react';
import { useParams } from 'next/navigation';

export default function QrLandingPage() {
  const params = useParams();
  const code = params.code as string;
  const [businessName, setBusinessName] = useState('');
  const [reviewUrl, setReviewUrl] = useState('');
  const [selectedRating, setSelectedRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [feedback, setFeedback] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/r/${code}`)
      .then((r) => r.json())
      .then((json) => {
        if (json.data) {
          setBusinessName(json.data.businessName);
          setReviewUrl(json.data.reviewUrl);
        } else {
          setError('Invalid QR code');
        }
      })
      .catch(() => setError('Something went wrong'))
      .finally(() => setLoading(false));
  }, [code]);

  const handleRatingSelect = (rating: number) => {
    setSelectedRating(rating);
    if (rating >= 4) {
      // Redirect to external review platform
      window.location.href = reviewUrl;
    }
  };

  const handleFeedbackSubmit = () => {
    setSubmitted(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
        <p className="text-gray-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
      <div className="w-full max-w-sm bg-white rounded-2xl shadow-lg p-8 text-center">
        <h1 className="text-xl font-bold text-gray-900 mb-2">
          How was your experience?
        </h1>
        <p className="text-sm text-gray-500 mb-8">{businessName}</p>

        {!selectedRating && (
          <>
            <p className="text-sm text-gray-600 mb-4">Tap a star to rate</p>
            <div className="flex justify-center gap-2 mb-6">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  onClick={() => handleRatingSelect(star)}
                  onMouseEnter={() => setHoveredRating(star)}
                  onMouseLeave={() => setHoveredRating(0)}
                  className="p-1 transition-transform hover:scale-110 active:scale-95"
                >
                  <Star
                    size={40}
                    className={
                      star <= (hoveredRating || selectedRating)
                        ? 'text-yellow-400 fill-yellow-400'
                        : 'text-gray-300'
                    }
                  />
                </button>
              ))}
            </div>
          </>
        )}

        {selectedRating > 0 && selectedRating <= 3 && !submitted && (
          <div className="text-left">
            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={24}
                  className={
                    star <= selectedRating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 mb-3 text-center">
              We&apos;re sorry to hear that. How can we improve?
            </p>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Tell us what happened..."
              className="w-full p-3 text-sm border border-gray-200 rounded-xl resize-none h-28 focus:ring-2 focus:ring-blue-200 focus:border-blue-400 outline-none"
            />
            <button
              onClick={handleFeedbackSubmit}
              className="w-full mt-3 py-3 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-800 transition-colors flex items-center justify-center gap-2"
            >
              <MessageSquare size={16} />
              Send Feedback
            </button>
            <button
              onClick={() => setSelectedRating(0)}
              className="w-full mt-2 py-2 text-sm text-gray-500 hover:text-gray-700"
            >
              Change rating
            </button>
          </div>
        )}

        {selectedRating >= 4 && (
          <div className="py-4">
            <div className="flex justify-center gap-1 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  size={24}
                  className={
                    star <= selectedRating
                      ? 'text-yellow-400 fill-yellow-400'
                      : 'text-gray-300'
                  }
                />
              ))}
            </div>
            <p className="text-sm text-gray-600 mb-4">
              Thank you! Redirecting you to leave a review...
            </p>
            <a
              href={reviewUrl}
              className="inline-flex items-center gap-2 py-3 px-6 bg-blue-600 text-white text-sm font-medium rounded-xl hover:bg-blue-700 transition-colors"
            >
              <ExternalLink size={16} />
              Leave a Review
            </a>
          </div>
        )}

        {submitted && (
          <div className="py-8">
            <CheckCircle size={48} className="text-green-500 mx-auto mb-4" />
            <p className="text-lg font-semibold text-gray-900 mb-1">Thank you!</p>
            <p className="text-sm text-gray-500">
              Your feedback has been received. We appreciate your time.
            </p>
          </div>
        )}

        <p className="text-[10px] text-gray-400 mt-8">Powered by ReviewHub</p>
      </div>
    </div>
  );
}
