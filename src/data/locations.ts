// Campus location data for Mar Athanasius College of Engineering
import { CampusLocation } from '../types.js';

// Helper function to convert DMS to decimal degrees
function dmsToDecimal(degrees: number, minutes: number, seconds: number): number {
  return degrees + minutes / 60 + seconds / 3600;
}

export const campusLocations: CampusLocation[] = [
  {
    id: 'main-entrance',
    name: 'Main Entrance',
    type: 'entrance',
    coordinates: { lat: dmsToDecimal(10, 3, 18.6), lng: dmsToDecimal(76, 37, 9.0) }
  },
  {
    id: 'main-block',
    name: 'Main Block',
    shortName: 'Principal\'s Office',
    type: 'building',
    coordinates: { lat: 10.0538, lng: 76.6192 },
    description: 'Principal\'s Office and Administration'
  },
  {
    id: 'ece-block',
    name: 'ECE Block',
    shortName: 'ECE',
    type: 'building',
    coordinates: { lat: 10.0540, lng: 76.6190 }
  },
  {
    id: 'cs-block',
    name: 'CS Block',
    shortName: 'CS',
    type: 'building',
    coordinates: { lat: dmsToDecimal(10, 3, 8.8), lng: dmsToDecimal(76, 37, 7.1) },
    floors: [
      { id: 'cs-floor-2', level: 2, name: 'Second Floor', rooms: [] },
      { id: 'cs-floor-3', level: 3, name: 'Third Floor', rooms: [] }
    ]
  },
  {
    id: 'mech-block',
    name: 'Mechanical Engineering Block',
    shortName: 'MECH',
    type: 'building',
    coordinates: { lat: 10.0540, lng: 76.6200 }
  },
  {
    id: 'civil-block',
    name: 'Civil Engineering Block',
    shortName: 'CIVIL',
    type: 'building',
    coordinates: { lat: 10.0532, lng: 76.6185 }
  },
  {
    id: 'mca-block',
    name: 'MCA Block',
    shortName: 'MCA',
    type: 'building',
    coordinates: { lat: 10.0550, lng: 76.6198 }
  },
  {
    id: 'oat-stage',
    name: 'OAT Stage',
    type: 'landmark',
    coordinates: { lat: 10.0541, lng: 76.6183 }
  },
  {
    id: 'oat',
    name: 'Open Air Theatre',
    shortName: 'OAT',
    type: 'landmark',
    coordinates: { lat: 10.0544, lng: 76.6181 }
  },
  {
    id: 'canteen',
    name: 'Canteen',
    type: 'facility',
    coordinates: { lat: 10.0528, lng: 76.6198 }
  },
  {
    id: 'central-library',
    name: 'Central Library',
    type: 'facility',
    coordinates: { lat: dmsToDecimal(10, 3, 13.2), lng: dmsToDecimal(76, 37, 10.9) }
  },
  {
    id: 'foundry-smithy',
    name: 'Foundry and Smithy',
    type: 'facility',
    coordinates: { lat: dmsToDecimal(10, 3, 12.1), lng: dmsToDecimal(76, 37, 11.3) }
  },
  {
    id: 'machine-shops',
    name: 'Machine Shops',
    type: 'facility',
    coordinates: { lat: dmsToDecimal(10, 3, 10.8), lng: dmsToDecimal(76, 37, 11.3) }
  },
  {
    id: 'hydraulics-lab',
    name: 'Hydraulics Lab',
    type: 'facility',
    coordinates: { lat: dmsToDecimal(10, 3, 9.6), lng: dmsToDecimal(76, 37, 10.7) }
  },
  {
    id: 'heat-engines-lab',
    name: 'Heat Engines Lab',
    type: 'facility',
    coordinates: { lat: dmsToDecimal(10, 3, 9.3), lng: dmsToDecimal(76, 37, 9.7) }
  },
  {
    id: 'eee-workshop',
    name: 'EEE Workshop',
    type: 'facility',
    coordinates: { lat: dmsToDecimal(10, 3, 9.1), lng: dmsToDecimal(76, 37, 8.0) }
  },
  {
    id: 'pg-block',
    name: 'PG Block',
    type: 'building',
    coordinates: { lat: dmsToDecimal(10, 3, 7.6), lng: dmsToDecimal(76, 37, 10.2) }
  },
  {
    id: 'mech-corner',
    name: 'Mech Corner',
    type: 'landmark',
    coordinates: { lat: dmsToDecimal(10, 3, 10.2), lng: dmsToDecimal(76, 37, 9.1) }
  },
  {
    id: 'civil-corner',
    name: 'Civil Corner',
    type: 'landmark',
    coordinates: { lat: dmsToDecimal(10, 3, 9.4), lng: dmsToDecimal(76, 37, 11.8) }
  },
  {
    id: 'nss-park',
    name: 'NSS Park',
    type: 'landmark',
    coordinates: { lat: dmsToDecimal(10, 3, 12.6), lng: dmsToDecimal(76, 37, 8.1) }
  }
];

// Campus center coordinates (for initial map view)
export const campusCenter = { lat: 10.0538, lng: 76.6192 };

// Campus bounds for map constraints
export const campusBounds = {
  north: 10.0560,
  south: 10.0510,
  east: 76.6220,
  west: 76.6170
};

// Get location by ID
export function getLocationById(id: string): CampusLocation | undefined {
  return campusLocations.find(loc => loc.id === id);
}

// Get all buildings
export function getBuildings(): CampusLocation[] {
  return campusLocations.filter(loc => loc.type === 'building');
}

// Get all landmarks
export function getLandmarks(): CampusLocation[] {
  return campusLocations.filter(loc => loc.type === 'landmark');
}

// Get all facilities
export function getFacilities(): CampusLocation[] {
  return campusLocations.filter(loc => loc.type === 'facility');
}
