import Link from 'next/link';

const footerLinks = {
  product: [
    { label: '기능', href: '/#solutions' },
    { label: '가격', href: '/#pricing' },
    { label: 'FAQ', href: '/#faq' },
    { label: '블로그', href: '/blog' },
  ],
  company: [
    { label: '소개', href: '/#hero' },
    { label: '문의하기', href: 'mailto:support@reviewhub.app' },
  ],
  legal: [
    { label: '개인정보처리방침', href: '/privacy' },
    { label: '이용약관', href: '/terms' },
    { label: '쿠키 정책', href: '/cookie' },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-[#0F2430] text-white/70">
      <div className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid grid-cols-4 gap-8 mb-12">
          <div>
            <h3 className="text-xl font-bold text-white mb-2">ReviewHub</h3>
            <p className="text-sm leading-relaxed">
              소규모 비즈니스를 위한<br />올인원 리뷰 관리 플랫폼
            </p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                {category === 'product' ? '제품' : category === 'company' ? '회사' : '법적 고지'}
              </h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-white/10 pt-8 text-center text-sm">
          &copy; {new Date().getFullYear()} ReviewHub. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
