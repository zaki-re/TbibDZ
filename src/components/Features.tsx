import { Calendar, Shield, Award, Video } from 'lucide-react';

export default function Features() {
  const features = [
    {
      icon: <Calendar className="w-8 h-8 text-blue-600" />,
      title: "Rendez-vous Facile",
      description: "Prenez rendez-vous en ligne 24/7 avec votre médecin en quelques clics"
    },
    {
      icon: <Shield className="w-8 h-8 text-blue-600" />,
      title: "Données Sécurisées",
      description: "Vos informations médicales sont protégées et cryptées"
    },
    {
      icon: <Award className="w-8 h-8 text-blue-600" />,
      title: "Médecins Vérifiés",
      description: "Tous nos médecins sont certifiés et vérifiés"
    },
    {
      icon: <Video className="w-8 h-8 text-blue-600" />,
      title: "Téléconsultation",
      description: "Consultez votre médecin à distance en toute sécurité"
    }
  ];

  return (
    <div className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Pourquoi Choisir TabibDZ?
          </h2>
          <p className="text-lg text-gray-600">
            La plateforme médicale la plus complète en Algérie
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow"
            >
              <div className="flex flex-col items-center text-center">
                <div className="mb-4 p-3 bg-blue-50 rounded-full">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}