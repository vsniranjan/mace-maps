// Location tracking component with GPS and Firebase integration
import { Coordinates, UserLocation } from '../types.js';
import { campusLocations } from '../data/locations.js';

// Firebase configuration
// On Vercel: Uses environment variables
// Locally: Uses config file (create src/config/firebase.config.local.ts from the example)
const firebaseConfig = {
  apiKey: (window as any).FIREBASE_API_KEY || "",
  authDomain: (window as any).FIREBASE_AUTH_DOMAIN || "",
  projectId: (window as any).FIREBASE_PROJECT_ID || "",
  storageBucket: (window as any).FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: (window as any).FIREBASE_MESSAGING_SENDER_ID || "",
  appId: (window as any).FIREBASE_APP_ID || "",
  measurementId: (window as any).FIREBASE_MEASUREMENT_ID || "",
  databaseURL: (window as any).FIREBASE_DATABASE_URL || ""
};

// Firebase will be initialized dynamically
let firebaseApp: any = null;
let database: any = null;

// Initialize Firebase dynamically
async function initFirebase(): Promise<void> {
  if (firebaseApp) return;
  
  try {
    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-app.js' as any);
    const { getDatabase } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js' as any);
    
    firebaseApp = initializeApp(firebaseConfig);
    database = getDatabase(firebaseApp);
  } catch (error) {
    console.warn('Firebase initialization failed, location will not be saved to cloud:', error);
  }
}

// Location tracking class
export class LocationTracker {
  private watchId: number | null = null;
  private currentLocation: UserLocation | null = null;
  private locationCallback: ((location: UserLocation) => void) | null = null;
  private nearbyBuildingCallback: ((buildingId: string | null) => void) | null = null;
  private userId: string;
  private isTracking: boolean = false;

  constructor() {
    // Generate or retrieve user ID
    this.userId = this.getOrCreateUserId();
  }

  private getOrCreateUserId(): string {
    let userId = localStorage.getItem('mace-maps-user-id');
    if (!userId) {
      userId = 'user-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
      localStorage.setItem('mace-maps-user-id', userId);
    }
    return userId;
  }

  // Start tracking user location
  startTracking(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by this browser'));
        return;
      }

      if (this.isTracking) {
        resolve();
        return;
      }

      // Get initial position
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.handlePositionUpdate(position);
          this.isTracking = true;
          resolve();
        },
        (error) => {
          reject(this.handleGeolocationError(error));
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );

      // Watch for position changes
      this.watchId = navigator.geolocation.watchPosition(
        (position) => this.handlePositionUpdate(position),
        (error) => console.error('Location watch error:', error),
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 5000
        }
      );
    });
  }

  // Stop tracking
  stopTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
    this.isTracking = false;
  }

  // Pause tracking (for indoor use)
  pauseTracking(): void {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId);
      this.watchId = null;
    }
  }

  // Resume tracking
  resumeTracking(): void {
    if (!this.isTracking || this.watchId !== null) return;
    
    this.watchId = navigator.geolocation.watchPosition(
      (position) => this.handlePositionUpdate(position),
      (error) => console.error('Location watch error:', error),
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    );
  }

  private handlePositionUpdate(position: GeolocationPosition): void {
    const userLocation: UserLocation = {
      coordinates: {
        lat: position.coords.latitude,
        lng: position.coords.longitude
      },
      accuracy: position.coords.accuracy,
      timestamp: position.timestamp,
      nearbyBuilding: this.findNearbyBuilding({
        lat: position.coords.latitude,
        lng: position.coords.longitude
      })
    };

    this.currentLocation = userLocation;

    // Save to Firebase
    this.saveLocationToFirebase(userLocation);

    // Notify callbacks
    if (this.locationCallback) {
      this.locationCallback(userLocation);
    }

    // Check for nearby building
    if (this.nearbyBuildingCallback) {
      this.nearbyBuildingCallback(userLocation.nearbyBuilding || null);
    }
  }

  private handleGeolocationError(error: GeolocationPositionError): Error {
    switch (error.code) {
      case error.PERMISSION_DENIED:
        return new Error('Location permission denied. Please enable location access.');
      case error.POSITION_UNAVAILABLE:
        return new Error('Location information is unavailable.');
      case error.TIMEOUT:
        return new Error('Location request timed out.');
      default:
        return new Error('An unknown error occurred.');
    }
  }

  // Find nearby building (within ~20 meters)
  private findNearbyBuilding(coords: Coordinates): string | undefined {
    const PROXIMITY_THRESHOLD = 0.0002; // Approximately 20 meters

    for (const location of campusLocations) {
      if (location.type === 'building') {
        const distance = this.calculateDistance(coords, location.coordinates);
        if (distance < PROXIMITY_THRESHOLD) {
          return location.id;
        }
      }
    }
    return undefined;
  }

  // Calculate simple distance between two coordinates
  private calculateDistance(coord1: Coordinates, coord2: Coordinates): number {
    const latDiff = Math.abs(coord1.lat - coord2.lat);
    const lngDiff = Math.abs(coord1.lng - coord2.lng);
    return Math.sqrt(latDiff * latDiff + lngDiff * lngDiff);
  }

  // Save location to Firebase
  private async saveLocationToFirebase(location: UserLocation): Promise<void> {
    // Initialize Firebase if not already done
    await initFirebase();
    
    if (!database) {
      console.warn('Firebase not available, skipping location save');
      return;
    }
    
    try {
      const { ref, set } = await import('https://www.gstatic.com/firebasejs/10.7.0/firebase-database.js' as any);
      const locationRef = ref(database, `users/${this.userId}/location`);
      await set(locationRef, {
        lat: location.coordinates.lat,
        lng: location.coordinates.lng,
        accuracy: location.accuracy,
        timestamp: location.timestamp,
        nearbyBuilding: location.nearbyBuilding || null
      });
    } catch (error) {
      console.error('Error saving location to Firebase:', error);
    }
  }

  // Get current location
  getCurrentLocation(): UserLocation | null {
    return this.currentLocation;
  }

  // Set callback for location updates
  onLocationUpdate(callback: (location: UserLocation) => void): void {
    this.locationCallback = callback;
  }

  // Set callback for nearby building detection
  onNearbyBuilding(callback: (buildingId: string | null) => void): void {
    this.nearbyBuildingCallback = callback;
  }

  // Check if tracking is active
  isTrackingActive(): boolean {
    return this.isTracking && this.watchId !== null;
  }

  // Get tracking status
  getTrackingStatus(): 'active' | 'paused' | 'stopped' {
    if (!this.isTracking) return 'stopped';
    return this.watchId !== null ? 'active' : 'paused';
  }
}

// Export singleton instance
export const locationTracker = new LocationTracker();
