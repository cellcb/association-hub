import { Mail, Phone, MapPin } from 'lucide-react';
import { useSiteConfig } from '@/contexts/SiteConfigContext';

export function Footer() {
  const { config } = useSiteConfig();

  // Get config values with fallbacks
  const contactInfo = config?.contact_info || {
    phone: '010-12345678',
    email: 'info@association.org',
    address: '北京市朝阳区某某路某某号',
  };

  const companyInfo = config?.company_info || {
    name: '技术专委会',
    description: '专注于行业技术交流与创新发展，为会员提供专业的技术服务和交流平台，推动行业技术进步与产业升级。',
    copyright: '© 2024 技术专委会数字化平台. All rights reserved.',
  };

  const quickLinks = config?.quick_links || [
    { label: '关于我们', link: '#' },
    { label: '入会指南', link: '#' },
    { label: '会员权益', link: '#' },
    { label: '联系我们', link: '#' },
  ];

  return (
    <footer className="bg-gray-900 text-gray-300 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center">
                <span className="text-white text-sm">协会</span>
              </div>
              <span className="text-white">{companyInfo.name}</span>
            </div>
            <p className="text-sm leading-relaxed">
              {companyInfo.description}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white mb-4">快速链接</h3>
            <ul className="space-y-2 text-sm">
              {quickLinks.map((link, index) => (
                <li key={index}>
                  <a href={link.link} className="hover:text-white transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white mb-4">联系方式</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4" />
                <span>{contactInfo.phone}</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4" />
                <span>{contactInfo.email}</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5" />
                <span>{contactInfo.address}</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>{companyInfo.copyright}</p>
        </div>
      </div>
    </footer>
  );
}
