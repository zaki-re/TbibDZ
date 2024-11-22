export default function AboutPage() {
  return (
    <div className="pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">À Propos de TabibDZ</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Votre passerelle vers des soins de santé de qualité en Algérie
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Notre Mission</h2>
            <p className="text-gray-600 mb-6">
              TabibDZ a été créé avec une mission claire : faciliter l'accès aux soins de santé 
              pour tous les Algériens. Nous croyons que chaque personne mérite un accès simple 
              et rapide à des soins médicaux de qualité.
            </p>
            <p className="text-gray-600">
              Notre plateforme connecte les patients avec des médecins qualifiés, permettant 
              une prise de rendez-vous simple et une gestion efficace des consultations médicales.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Nos Valeurs</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">•</span>
                <div>
                  <h3 className="font-semibold">Excellence</h3>
                  <p className="text-gray-600">Nous nous engageons à fournir un service de la plus haute qualité.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">•</span>
                <div>
                  <h3 className="font-semibold">Accessibilité</h3>
                  <p className="text-gray-600">Nous rendons les soins de santé accessibles à tous.</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-blue-600 font-bold mr-2">•</span>
                <div>
                  <h3 className="font-semibold">Innovation</h3>
                  <p className="text-gray-600">Nous utilisons la technologie pour améliorer l'expérience de santé.</p>
                </div>
              </li>
            </ul>
          </div>
        </div>

        <div className="bg-gray-50 rounded-xl p-8 mb-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Nos Chiffres</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">1000+</div>
              <div className="text-gray-600">Médecins Certifiés</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">50000+</div>
              <div className="text-gray-600">Patients Satisfaits</div>
            </div>
            <div className="text-center">
              <div className="text-4xl font-bold text-blue-600 mb-2">48</div>
              <div className="text-gray-600">Wilayas Couvertes</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}