import { Star, MapPin, Utensils } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export default function RestaurantCard({ restaurant }) {
  const { t } = useTranslation();
  const { profile } = restaurant;
  const imageUrl = profile.image?.[0] || 'https://images.unsplash.com/photo-1517248135467-4c7ed9d42c7b?auto=format&fit=crop&q=80&w=400';

  return (
    <div className="res-card glass-card">
      <div className="res-card__image">
        <img src={imageUrl} alt={profile.name} loading="lazy" />
        <div className="res-card__badge">
          <Star size={12} fill="currentColor" />
          <span>{profile.globalRating || '4.5'}</span>
        </div>
      </div>
      <div className="res-card__content">
        <h3 className="res-card__title">{profile.name}</h3>
        <p className="res-card__desc">{profile.description}</p>
        <div className="res-card__footer">
          <span className="res-card__tag">
            <Utensils size={12} />
            {profile.category?.[0] || t("components.restaurantCard.defaultCategory")}
          </span>
          <span className="res-card__location">
            <MapPin size={12} />
            {profile.location?.city || t("components.restaurantCard.defaultCity")}
          </span>
        </div>
      </div>
    </div>
  );
}
