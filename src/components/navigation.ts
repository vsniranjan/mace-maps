// Navigation component for routing and directions
import { Coordinates, NavigationRoute, CampusLocation, Room } from '../types.js';
import { campusLocations, getLocationById } from '../data/locations.js';
import { getRoomById } from '../data/rooms.js';

export class Navigation {
  private currentRoute: NavigationRoute | null = null;
  private onNavigationStart: ((route: NavigationRoute) => void) | null = null;
  private onNavigationEnd: (() => void) | null = null;
  private onBuildingReached: ((buildingId: string, roomId?: string) => void) | null = null;

  constructor() {}

  // Calculate route from current position to destination
  calculateRoute(
    origin: Coordinates,
    destinationType: 'location' | 'room',
    destinationId: string
  ): NavigationRoute | null {
    let destination: Coordinates;

    if (destinationType === 'location') {
      const location = getLocationById(destinationId);
      if (!location) return null;
      destination = location.coordinates;
    } else {
      // For rooms, navigate to the building (CS Block)
      const room = getRoomById(destinationId);
      if (!room) return null;
      const building = getLocationById(room.buildingId);
      if (!building) return null;
      destination = building.coordinates;
    }

    const distance = this.calculateDistance(origin, destination);
    const bearing = this.calculateBearing(origin, destination);

    const route: NavigationRoute = {
      origin,
      destination,
      destinationType,
      destinationId,
      distance,
      bearing
    };

    this.currentRoute = route;
    return route;
  }

  // Start navigation
  startNavigation(route: NavigationRoute): void {
    this.currentRoute = route;
    if (this.onNavigationStart) {
      this.onNavigationStart(route);
    }
  }

  // Stop navigation
  stopNavigation(): void {
    this.currentRoute = null;
    if (this.onNavigationEnd) {
      this.onNavigationEnd();
    }
  }

  // Update navigation with new position
  updatePosition(position: Coordinates): void {
    if (!this.currentRoute) return;

    // Recalculate distance and bearing
    const distance = this.calculateDistance(position, this.currentRoute.destination);
    const bearing = this.calculateBearing(position, this.currentRoute.destination);

    this.currentRoute = {
      ...this.currentRoute,
      origin: position,
      distance,
      bearing
    };

    // Check if destination reached (within ~15 meters)
    if (distance < 15) {
      this.handleDestinationReached();
    }
  }

  private handleDestinationReached(): void {
    if (!this.currentRoute) return;

    if (this.currentRoute.destinationType === 'room') {
      const room = getRoomById(this.currentRoute.destinationId);
      if (room && this.onBuildingReached) {
        this.onBuildingReached(room.buildingId, room.id);
      }
    } else {
      const location = getLocationById(this.currentRoute.destinationId);
      if (location && location.type === 'building' && this.onBuildingReached) {
        this.onBuildingReached(location.id);
      }
    }
  }

  // Calculate distance between two points in meters
  calculateDistance(from: Coordinates, to: Coordinates): number {
    const R = 6371000; // Earth's radius in meters
    const φ1 = this.toRadians(from.lat);
    const φ2 = this.toRadians(to.lat);
    const Δφ = this.toRadians(to.lat - from.lat);
    const Δλ = this.toRadians(to.lng - from.lng);

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  }

  // Calculate bearing between two points in degrees
  calculateBearing(from: Coordinates, to: Coordinates): number {
    const φ1 = this.toRadians(from.lat);
    const φ2 = this.toRadians(to.lat);
    const Δλ = this.toRadians(to.lng - from.lng);

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) -
              Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    
    let θ = Math.atan2(y, x);
    θ = this.toDegrees(θ);
    return (θ + 360) % 360;
  }

  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  private toDegrees(radians: number): number {
    return radians * (180 / Math.PI);
  }

  // Get direction text from bearing
  getDirectionText(bearing: number): string {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    const index = Math.round(bearing / 45) % 8;
    return directions[index];
  }

  // Get human-readable direction
  getDirectionLabel(bearing: number): string {
    if (bearing >= 337.5 || bearing < 22.5) return 'Head north';
    if (bearing >= 22.5 && bearing < 67.5) return 'Head northeast';
    if (bearing >= 67.5 && bearing < 112.5) return 'Head east';
    if (bearing >= 112.5 && bearing < 157.5) return 'Head southeast';
    if (bearing >= 157.5 && bearing < 202.5) return 'Head south';
    if (bearing >= 202.5 && bearing < 247.5) return 'Head southwest';
    if (bearing >= 247.5 && bearing < 292.5) return 'Head west';
    return 'Head northwest';
  }

  // Format distance for display
  formatDistance(meters: number): string {
    if (meters < 1000) {
      return `${Math.round(meters)} m`;
    }
    return `${(meters / 1000).toFixed(1)} km`;
  }

  // Get estimated walking time
  getWalkingTime(meters: number): string {
    // Average walking speed: 5 km/h = 83.33 m/min
    const minutes = Math.round(meters / 83.33);
    if (minutes < 1) return 'Less than 1 min';
    if (minutes === 1) return '1 min';
    return `${minutes} mins`;
  }

  // Get current route
  getCurrentRoute(): NavigationRoute | null {
    return this.currentRoute;
  }

  // Check if navigating
  isNavigating(): boolean {
    return this.currentRoute !== null;
  }

  // Set callbacks
  setOnNavigationStart(callback: (route: NavigationRoute) => void): void {
    this.onNavigationStart = callback;
  }

  setOnNavigationEnd(callback: () => void): void {
    this.onNavigationEnd = callback;
  }

  setOnBuildingReached(callback: (buildingId: string, roomId?: string) => void): void {
    this.onBuildingReached = callback;
  }

  // Get destination info
  getDestinationInfo(): { name: string; floor?: number } | null {
    if (!this.currentRoute) return null;

    if (this.currentRoute.destinationType === 'location') {
      const location = getLocationById(this.currentRoute.destinationId);
      return location ? { name: location.name } : null;
    } else {
      const room = getRoomById(this.currentRoute.destinationId);
      return room ? { name: `${room.number} - ${room.name}`, floor: room.floor } : null;
    }
  }
}
