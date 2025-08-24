import { FaBriefcase, FaShieldAlt, FaEnvelope, FaFacebookF, FaTwitter, FaLinkedinIn } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 w-full shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Cột 1 - Logo & Brand */}
          <div>
            <h2 className="text-xl font-bold text-white">TopJob</h2>
            <p className="mt-2 text-sm text-gray-400">
              Nền tảng tìm việc & tuyển dụng hiện đại, kết nối ứng viên và nhà tuyển dụng dễ dàng.
            </p>
          </div>

          {/* Cột 2 - Navigation */}
          <div className="flex flex-col space-y-3">
            <a
              href="/jobs"
              className="flex items-center hover:text-blue-400 transition-colors"
            >
              <FaBriefcase className="mr-2" /> Việc làm
            </a>
            <a
              href="/policy"
              className="flex items-center hover:text-blue-400 transition-colors"
            >
              <FaShieldAlt className="mr-2" /> Chính sách
            </a>
            <a
              href="/contact"
              className="flex items-center hover:text-blue-400 transition-colors"
            >
              <FaEnvelope className="mr-2" /> Liên hệ
            </a>
          </div>

          {/* Cột 3 - Social */}
          <div>
            <h3 className="text-sm font-semibold text-white mb-3">Kết nối với chúng tôi</h3>
            <div className="flex space-x-4">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-700 hover:bg-blue-600 transition-colors"
              >
                <FaFacebookF />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-700 hover:bg-sky-500 transition-colors"
              >
                <FaTwitter />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-700 hover:bg-blue-500 transition-colors"
              >
                <FaLinkedinIn />
              </a>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-700 mt-8 pt-4 flex flex-col md:flex-row items-center justify-between text-sm text-gray-400">
          <p>© {new Date().getFullYear()} TopJob. All rights reserved.</p>
          <p className="mt-2 md:mt-0">Made with ❤️ by TopJob Team</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
