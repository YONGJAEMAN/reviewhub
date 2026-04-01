'use client';

import { useState, useEffect, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export default function DeleteAccountModal({ onClose }: Props) {
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [onClose]);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  const handleDelete = async () => {
    if (!password || !confirmed) return;
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/account/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'Failed to request account deletion');
        return;
      }
      setSuccess(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4"
    >
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-[480px] p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
              <AlertTriangle size={20} className="text-danger" />
            </div>
            <h2 className="text-lg font-bold text-text-primary">계정 삭제</h2>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-text-secondary hover:bg-background">
            <X size={18} />
          </button>
        </div>

        {success ? (
          <div>
            <p className="text-sm text-text-secondary mb-4">
              계정 삭제가 요청되었습니다. <strong>30일 후</strong> 모든 데이터가 영구 삭제됩니다.
              이 기간 내에 Settings에서 삭제를 취소할 수 있습니다.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-navy text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-navy-dark transition-colors"
            >
              확인
            </button>
          </div>
        ) : (
          <div>
            <div className="bg-danger/5 border border-danger/20 rounded-lg p-4 mb-6">
              <p className="text-sm text-danger font-medium mb-1">주의: 이 작업은 되돌릴 수 없습니다.</p>
              <ul className="text-xs text-text-secondary space-y-1 list-disc list-inside">
                <li>모든 비즈니스 데이터, 리뷰, 설정이 삭제됩니다</li>
                <li>활성 구독은 자동으로 해지됩니다</li>
                <li>30일의 유예 기간 후 영구 삭제됩니다</li>
              </ul>
            </div>

            {error && (
              <div className="bg-danger/10 border border-danger/20 rounded-lg px-4 py-3 mb-4">
                <p className="text-sm text-danger">{error}</p>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-text-primary mb-2">
                비밀번호 확인
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="현재 비밀번호를 입력하세요"
                className="w-full px-4 py-2.5 bg-surface text-text-primary border border-border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-danger"
              />
            </div>

            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-border text-danger focus:ring-danger"
              />
              <span className="text-sm text-text-secondary">
                30일 후 모든 데이터가 영구 삭제됨을 이해합니다.
              </span>
            </label>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                className="flex-1 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors px-4 py-2.5 border border-border rounded-lg"
              >
                취소
              </button>
              <button
                onClick={handleDelete}
                disabled={!password || !confirmed || loading}
                className="flex-1 bg-danger text-white rounded-lg px-5 py-2.5 text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? '처리 중...' : '계정 삭제 요청'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
