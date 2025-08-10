import { FaQuestionCircle, FaShieldAlt, FaEnvelope } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-2 fixed bottom-0 left-0 w-full z-[9999]">
            <div className="flex flex-col md:flex-row justify-between items-center max-w-full mx-0 px-4">
                <p className="mb-2 md:mb-0 text-sm font-semibold">
                    Copyright © {new Date().getFullYear()}
                </p>
                <ul className="flex flex-row space-x-6 mb-2 md:mb-0 text-sm font-semibold">
                    <li>
                        <a href="/" className="flex items-center text-white hover:text-blue-400 px-2 py-1 no-underline font-semibold">
                            <FaQuestionCircle className="mr-2" /> Support
                        </a>
                    </li>
                    <li>
                        <a href="/" className="flex items-center text-white hover:text-blue-400 px-2 py-1 no-underline font-semibold">
                            <FaShieldAlt className="mr-2" /> Policy
                        </a>
                    </li>
                    <li>
                        <a href="/" className="flex items-center text-white hover:text-blue-400 px-2 py-1 no-underline font-semibold">
                            <FaEnvelope className="mr-2" /> Contact
                        </a>
                    </li>
                </ul>
            </div>
        </footer>
    );
};

export default Footer;
