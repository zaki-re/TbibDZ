import { useState } from 'react';
import { Star, ThumbsUp, ThumbsDown } from 'lucide-react';
import { useLanguage } from '../../../hooks/useLanguage';

interface Review {
  id: number;
  patientName: string;
  rating: number;
  comment: string;
  date: string;
  helpful: number;
  notHelpful: number;
}

export default function ReviewsList() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const { t } = useLanguage();

  const handleHelpful = async (reviewId: number, helpful: boolean) => {
    try {
      // API call to update review helpfulness
      // Update local state after successful API call
    } catch (error) {
      console.error('Error updating review:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">{t('doctor.reviews.title')}</h3>
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          {t('doctor.reviews.noReviews')}
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center">
                    <h4 className="font-semibold mr-2">{review.patientName}</h4>
                    <div className="flex items-center">
                      {[...Array(5)].map((_, index) => (
                        <Star
                          key={index}
                          className={`w-4 h-4 ${
                            index < review.rating ? 'text-yellow-400' : 'text-gray-300'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">{review.date}</p>
                  <p className="mt-2">{review.comment}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4 mt-4">
                <button
                  onClick={() => handleHelpful(review.id, true)}
                  className="flex items-center text-sm text-gray-500 hover:text-blue-600"
                >
                  <ThumbsUp className="w-4 h-4 mr-1" />
                  {review.helpful}
                </button>
                <button
                  onClick={() => handleHelpful(review.id, false)}
                  className="flex items-center text-sm text-gray-500 hover:text-blue-600"
                >
                  <ThumbsDown className="w-4 h-4 mr-1" />
                  {review.notHelpful}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}