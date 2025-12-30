// Type definitions for MACE Campus Map

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface CampusLocation {
  id: string;
  name: string;
  shortName?: string;
  type: 'building' | 'landmark' | 'facility' | 'entrance';
  coordinates: Coordinates;
  floors?: Floor[];
  description?: string;
}

export interface Floor {
  id: string;
  level: number;
  name: string;
  rooms: Room[];
}

export interface Room {
  id: string;
  number: string;
  name: string;
  type: 'lab' | 'faculty' | 'hod' | 'toilet' | 'library' | 'classroom' | 'other';
  floor: number;
  buildingId: string;
}

export interface SearchResult {
  type: 'location' | 'room';
  item: CampusLocation | Room;
  matchScore: number;
}

export interface UserLocation {
  coordinates: Coordinates;
  accuracy: number;
  timestamp: number;
  nearbyBuilding?: string;
}

export interface NavigationRoute {
  origin: Coordinates;
  destination: Coordinates;
  destinationType: 'location' | 'room';
  destinationId: string;
  distance: number;
  bearing: number;
}

export interface MapState {
  center: Coordinates;
  zoom: number;
  selectedBuilding: string | null;
  selectedFloor: number | null;
  isNavigating: boolean;
  showUserLocation: boolean;
}
