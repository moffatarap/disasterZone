import { Marker } from 'react-map-gl/maplibre'
import userIcon from '../assets/media/img/mapKeys/key/user.svg'
import type { UserLocation } from '../hooks/useGeolocation'

interface UserLocationMarkerProps {
  location: UserLocation
}

// Distinct from event markers on purpose (circular compass-style icon vs.
// the teardrop hazard pins) so "where you are" never reads as another event.
export function UserLocationMarker({ location }: UserLocationMarkerProps) {
  return (
    <Marker latitude={location.lat} longitude={location.lng}>
      <img src={userIcon} alt="Your location" className="h-9 w-9 drop-shadow-md" />
    </Marker>
  )
}
