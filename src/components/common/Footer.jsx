import { Link } from "react-router-dom";
import { 
  Mail
} from "lucide-react";
import { FaGithub, FaTwitter, FaInstagram, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();
  
  const navigation = {
    main: [
      { name: "Início", href: "/" },
      { name: "Cursos", href: "/courses" },
      { name: "Comunidades", href: "/communities" },
      { name: "Sobre", href: "/about" },
      { name: "Contato", href: "/contact" },
    ],
    legal: [
      { name: "Privacidade", href: "/privacy" },
      { name: "Termos", href: "/terms" }
    ],
  };

  const socialLinks = [
    {
      name: "GitHub",
      href: "https://github.com/donza",
      icon: FaGithub,
    },
    {
      name: "Twitter",
      href: "https://twitter.com/donza",
      icon: FaTwitter,
    },
    {
      name: "Instagram",
      href: "https://instagram.com/donza",
      icon: FaInstagram,
    },
    {
      name: "LinkedIn",
      href: "https://linkedin.com/in/nordinomaviedeveloper",
      icon: FaLinkedin,
    },
    {
      name: "Email",
      href: "mailto:contato@nordinomaviedeveloper.com",
      icon: Mail,
    },
  ];

  return (
    <footer className="bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Links principais */}
        <nav className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
          {navigation.main.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-sm text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Redes sociais */}
        <div className="flex justify-center space-x-6 mb-8">
          {socialLinks.map((item) => (
            <a
              key={item.name}
              href={item.href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              aria-label={item.name}
            >
              <item.icon className="h-6 w-6" />
            </a>
          ))}
        </div>

        {/* Links legais */}
        <div className="flex justify-center space-x-6 mb-8">
          {navigation.legal.map((item) => (
            <Link
              key={item.name}
              to={item.href}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* Copyright e marca */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            &copy; {currentYear} Donza. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}