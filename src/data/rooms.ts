// Room data for CS Block floors
import { Room } from '../types.js';

// Second Floor Rooms (L2XX)
export const secondFloorRooms: Room[] = [
  { id: 'l201', number: 'L201', name: 'Classroom', type: 'classroom', floor: 2, buildingId: 'cs-block' },
  { id: 'l202', number: 'L202', name: 'Electronics Workshop', type: 'lab', floor: 2, buildingId: 'cs-block' },
  { id: 'l203', number: 'L203', name: 'Network Systems Lab', type: 'lab', floor: 2, buildingId: 'cs-block' },
  { id: 'l204', number: 'L204', name: 'Classroom', type: 'classroom', floor: 2, buildingId: 'cs-block' },
  { id: 'l205', number: 'L205', name: 'Faculty Room', type: 'faculty', floor: 2, buildingId: 'cs-block' },
  { id: 'l206', number: 'L206', name: 'Computer Hardware Lab / Intelligence Lab', type: 'lab', floor: 2, buildingId: 'cs-block' },
  { id: 'l207', number: 'L207', name: 'Faculty Room', type: 'faculty', floor: 2, buildingId: 'cs-block' },
  { id: 'l208', number: 'L208', name: 'HOD Room', type: 'hod', floor: 2, buildingId: 'cs-block' },
  { id: 'l209', number: 'L209', name: 'Room L209', type: 'other', floor: 2, buildingId: 'cs-block' },
  { id: 'l210', number: 'L210', name: 'Toilet (M)', type: 'toilet', floor: 2, buildingId: 'cs-block' },
  { id: 'l211', number: 'L211', name: 'Room L211', type: 'other', floor: 2, buildingId: 'cs-block' },
  { id: 'l212', number: 'L212', name: 'Room L212', type: 'other', floor: 2, buildingId: 'cs-block' },
  { id: 'l213', number: 'L213', name: 'Toilet (F)', type: 'toilet', floor: 2, buildingId: 'cs-block' },
  { id: 'l214', number: 'L214', name: 'Research Lab / V Lab', type: 'lab', floor: 2, buildingId: 'cs-block' },
  { id: 'l215', number: 'L215', name: 'Room L215', type: 'other', floor: 2, buildingId: 'cs-block' },
  { id: 'l216', number: 'L216', name: 'Library', type: 'library', floor: 2, buildingId: 'cs-block' },
  { id: 'l217', number: 'L217', name: 'Room L217', type: 'other', floor: 2, buildingId: 'cs-block' },
  { id: 'l218', number: 'L218', name: 'Room L218', type: 'other', floor: 2, buildingId: 'cs-block' },
  { id: 'l219', number: 'L219', name: 'Room L219', type: 'other', floor: 2, buildingId: 'cs-block' }
];

// Third Floor Rooms (L3XX)
export const thirdFloorRooms: Room[] = [
  { id: 'l301', number: 'L301', name: 'Classroom', type: 'classroom', floor: 3, buildingId: 'cs-block' },
  { id: 'l302', number: 'L302', name: 'Advanced Lab for ECE', type: 'lab', floor: 3, buildingId: 'cs-block' },
  { id: 'l303', number: 'L303', name: 'Faculty Room', type: 'faculty', floor: 3, buildingId: 'cs-block' },
  { id: 'l304', number: 'L304', name: 'ECE Project Lab', type: 'lab', floor: 3, buildingId: 'cs-block' },
  { id: 'l305', number: 'L305', name: 'ECE Project Lab', type: 'lab', floor: 3, buildingId: 'cs-block' },
  { id: 'l306', number: 'L306', name: 'Room L306', type: 'other', floor: 3, buildingId: 'cs-block' },
  { id: 'l307', number: 'L307', name: 'Faculty Room', type: 'faculty', floor: 3, buildingId: 'cs-block' },
  { id: 'l308', number: 'L308', name: 'Toilet (F)', type: 'toilet', floor: 3, buildingId: 'cs-block' },
  { id: 'l309', number: 'L309', name: 'Faculty Room', type: 'faculty', floor: 3, buildingId: 'cs-block' },
  { id: 'l310', number: 'L310', name: 'Faculty Room', type: 'faculty', floor: 3, buildingId: 'cs-block' },
  { id: 'l311', number: 'L311', name: 'Toilet (M)', type: 'toilet', floor: 3, buildingId: 'cs-block' },
  { id: 'l312', number: 'L312', name: 'Data Analytics Lab', type: 'lab', floor: 3, buildingId: 'cs-block' },
  { id: 'l313', number: 'L313', name: 'Programming Lab', type: 'lab', floor: 3, buildingId: 'cs-block' },
  { id: 'l314', number: 'L314', name: 'Room L314', type: 'other', floor: 3, buildingId: 'cs-block' },
  { id: 'l315', number: 'L315', name: 'Room L315', type: 'other', floor: 3, buildingId: 'cs-block' },
  { id: 'l316', number: 'L316', name: 'Faculty Room', type: 'faculty', floor: 3, buildingId: 'cs-block' }
];

// All rooms combined
export const allRooms: Room[] = [...secondFloorRooms, ...thirdFloorRooms];

// Get rooms by floor
export function getRoomsByFloor(floor: number): Room[] {
  return allRooms.filter(room => room.floor === floor);
}

// Get room by ID
export function getRoomById(id: string): Room | undefined {
  return allRooms.find(room => room.id === id);
}

// Get room by number
export function getRoomByNumber(number: string): Room | undefined {
  return allRooms.find(room => room.number.toLowerCase() === number.toLowerCase());
}

// Search rooms by name or number
export function searchRooms(query: string): Room[] {
  const lowerQuery = query.toLowerCase();
  return allRooms.filter(room => 
    room.number.toLowerCase().includes(lowerQuery) ||
    room.name.toLowerCase().includes(lowerQuery)
  );
}

// Get rooms by type
export function getRoomsByType(type: Room['type']): Room[] {
  return allRooms.filter(room => room.type === type);
}
