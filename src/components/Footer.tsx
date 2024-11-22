import { Facebook, Twitter, Instagram, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* About Section */}
          <div className="col-span-1 md:col-span-2">
            <h3 className="text-2xl font-bold text-white mb-4">TabibDZ</h3>
            <p className="mb-4">
              TabibDZ est la première plateforme médicale en Algérie qui connecte les patients 
              avec les médecins. Notre mission est de faciliter l'accès aux soins de santé 
              pour tous les Algériens.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-white transition-colors">
                <Facebook className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Twitter className="w-6 h-6" />
              </a>
              <a href="#" className="hover:text-white transition-colors">
                <Instagram className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Liens Rapides</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="hover:text-white transition-colors">À Propos</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Trouver un Médecin</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">Comment ça marche</a>
              </li>
              <li>
                <a href="#" className="hover:text-white transition-colors">FAQ</a>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-4">Contact</h4>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Mail className="w-5 h-5 mr-2" />
                contact@tabibdz.com
              </li>
              <li className="flex items-center">
                <Phone className="w-5 h-5 mr-2" />
                +213 555 123 456
              </li>
              <li className="flex items-center">
                <MapPin className="w-5 h-5 mr-2" />
                Alger, Algérie
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-sm text-center">
          <p>&copy; {new Date().getFullYear()} TabibDZ. Tous droits réservés.</p>
        </div>
      </div>
    </footer>
  );
}