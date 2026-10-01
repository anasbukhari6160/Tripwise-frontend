import { useEffect, useState } from "react";

import { getDestinationPhotos } from "../../services/photo.service";

function DestinationPhoto({ city, country }) {
  const [photo, setPhoto] = useState(null);

  const [loading, setLoading] = useState(true);

  const [imageLoaded, setImageLoaded] = useState(false);

  const [imageFailed, setImageFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function loadPhoto() {
      if (!city) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setPhoto(null);
        setImageLoaded(false);
        setImageFailed(false);

        const photos = await getDestinationPhotos(city, country);

        if (cancelled) {
          return;
        }

        setPhoto(photos.length > 0 ? photos[0] : null);
      } catch (error) {
        if (cancelled) {
          return;
        }

        if (import.meta.env.DEV) console.error(`Unable to load photo for ${city}:`, error);

        setPhoto(null);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadPhoto();

    return () => {
      cancelled = true;
    };
  }, [city, country]);

  if (loading) {
    return (
      <div className="trip-destination-photo trip-destination-photo-loading">
        <div className="trip-photo-skeleton" />

        <span>Loading destination...</span>
      </div>
    );
  }

  if (!photo || !photo.imageUrl || imageFailed) {
    return (
      <div className="trip-destination-photo trip-destination-photo-fallback">
        <div>
          <span>DESTINATION</span>

          <strong>{city}</strong>

          {country && <p>{country}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className="trip-destination-photo">
      {!imageLoaded && <div className="trip-photo-skeleton" />}

      <img
        src={photo.landscapeUrl || photo.imageUrl}
        alt={`${city}, ${country || ""}`}
        loading="lazy"
        onLoad={() => setImageLoaded(true)}
        onError={() => setImageFailed(true)}
        className={
          imageLoaded
            ? "trip-destination-image loaded"
            : "trip-destination-image"
        }
      />

      <div className="trip-photo-overlay" />

      <div className="trip-photo-location">
        <span>DESTINATION</span>

        <strong>{city}</strong>

        {country && <p>{country}</p>}
      </div>

      <div className="trip-photo-credit">
        {photo.photographerUrl ? (
          <a href={photo.photographerUrl} target="_blank" rel="noreferrer">
            Photo by {photo.photographer}
          </a>
        ) : (
          <span>Photo by {photo.photographer}</span>
        )}

        {photo.pexelsUrl && (
          <>
            <span>•</span>

            <a href={photo.pexelsUrl} target="_blank" rel="noreferrer">
              Pexels
            </a>
          </>
        )}
      </div>
    </div>
  );
}

export default DestinationPhoto;
