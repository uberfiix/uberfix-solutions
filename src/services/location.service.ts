// Location Service for UberFix
// Handles user location tracking and geolocation

export interface UserLocation {
  latitude: number;
  longitude: number;
  accuracy?: number;
  timestamp: number;
}

type LocationCallback = (location: UserLocation) => void;

class LocationService {
  private watchId: number | null = null;
  private currentLocation: UserLocation | null = null;
  private callbacks: Set<LocationCallback> = new Set();
  private isWatching = false;

  // Default location (Cairo center)
  private readonly DEFAULT_LOCATION: UserLocation = {
    latitude: 30.0444,
    longitude: 31.2357,
    accuracy: 0,
    timestamp: Date.now(),
  };

  getCurrentLocation(): UserLocation {
    return this.currentLocation || this.DEFAULT_LOCATION;
  }

  async requestCurrentPosition(): Promise<UserLocation> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        console.warn('Geolocation not supported, using default');
        resolve(this.DEFAULT_LOCATION);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location: UserLocation = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: Date.now(),
          };
          this.currentLocation = location;
          resolve(location);
        },
        (error) => {
          console.warn('Geolocation error:', error.message);
          resolve(this.DEFAULT_LOCATION);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 30000,
        }
      );
    });
  }

  startWatching(): void {
    if (this.isWatching || !navigator.geolocation) return;

    this.isWatching = true;
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location: UserLocation = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: Date.now(),
        };
        this.currentLocation = location;
        this.notifyCallbacks(location);
      },
      (error) => {
        console.warn('Location watch error:', error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 10000,
      }
    );
  }

  stopWatching(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isWatching = false;
  }

  subscribe(callback: LocationCallback): () => void {
    this.callbacks.add(callback);
    // Immediately notify with current location if available
    if (this.currentLocation) {
      callback(this.currentLocation);
    }
    return () => {
      this.callbacks.delete(callback);
    };
  }

  private notifyCallbacks(location: UserLocation): void {
    this.callbacks.forEach((callback) => callback(location));
  }

  // Calculate distance between two points in km (Haversine formula)
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371; // Earth's radius in km
    const dLat = this.toRad(lat2 - lat1);
    const dLon = this.toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRad(lat1)) *
        Math.cos(this.toRad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private toRad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const locationService = new LocationService();
export default locationService;
