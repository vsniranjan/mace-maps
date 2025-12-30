// Floor plans component for CS Block
import { Room } from '../types.js';
import { secondFloorRooms, thirdFloorRooms, getRoomsByFloor } from '../data/rooms.js';

export class FloorPlans {
  private container: HTMLElement;
  private currentFloor: number = 2;
  private selectedRoom: string | null = null;
  private onRoomClick: ((room: Room) => void) | null = null;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element '${containerId}' not found`);
    }
    this.container = container;
  }

  // Show floor plan for a specific floor
  showFloor(floor: number): void {
    this.currentFloor = floor;
    this.render();
  }

  // Render the current floor plan
  render(): void {
    this.container.innerHTML = '';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'floor-plan-wrapper';

    // Floor selector tabs
    const tabs = this.createFloorTabs();
    wrapper.appendChild(tabs);

    // Floor plan SVG
    const svg = this.createFloorPlanSVG();
    wrapper.appendChild(svg);

    // Room legend
    const legend = this.createLegend();
    wrapper.appendChild(legend);

    this.container.appendChild(wrapper);
  }

  private createFloorTabs(): HTMLElement {
    const tabs = document.createElement('div');
    tabs.className = 'floor-tabs';

    [2, 3].forEach(floor => {
      const tab = document.createElement('button');
      tab.className = `floor-tab ${floor === this.currentFloor ? 'active' : ''}`;
      tab.textContent = `Floor ${floor}`;
      tab.addEventListener('click', () => this.showFloor(floor));
      tabs.appendChild(tab);
    });

    return tabs;
  }

  private createFloorPlanSVG(): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 800 600');
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.classList.add('floor-plan-svg');

    // Background
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('width', '800');
    bg.setAttribute('height', '600');
    bg.setAttribute('fill', '#f5f5dc');
    bg.setAttribute('rx', '8');
    svg.appendChild(bg);

    // Render rooms based on current floor
    if (this.currentFloor === 2) {
      this.renderSecondFloor(svg);
    } else {
      this.renderThirdFloor(svg);
    }

    // Add staircase
    this.renderStaircase(svg);

    return svg;
  }

  private renderSecondFloor(svg: SVGSVGElement): void {
    // Room layout based on uploaded floor plan image
    const roomLayouts: Record<string, { x: number; y: number; w: number; h: number }> = {
      'L201': { x: 20, y: 450, w: 100, h: 100 },
      'L202': { x: 20, y: 200, w: 100, h: 240 },
      'L203': { x: 20, y: 80, w: 100, h: 110 },
      'L204': { x: 20, y: 20, w: 80, h: 50 },
      'L205': { x: 110, y: 20, w: 60, h: 50 },
      'L206': { x: 180, y: 20, w: 80, h: 80 },
      'L207': { x: 180, y: 110, w: 80, h: 60 },
      'L208': { x: 180, y: 180, w: 80, h: 60 },
      'L209': { x: 180, y: 250, w: 80, h: 60 },
      'L210': { x: 130, y: 500, w: 40, h: 50 },
      'L211': { x: 130, y: 450, w: 50, h: 40 },
      'L212': { x: 130, y: 410, w: 50, h: 30 },
      'L213': { x: 300, y: 20, w: 100, h: 80 },
      'L214': { x: 410, y: 20, w: 100, h: 80 },
      'L215': { x: 520, y: 20, w: 120, h: 80 },
      'L216': { x: 650, y: 20, w: 130, h: 100 },
      'L217': { x: 650, y: 450, w: 130, h: 100 },
      'L218': { x: 480, y: 450, w: 160, h: 100 },
      'L219': { x: 340, y: 450, w: 130, h: 100 },
    };

    this.renderRooms(svg, secondFloorRooms, roomLayouts);
  }

  private renderThirdFloor(svg: SVGSVGElement): void {
    // Room layout based on uploaded floor plan image (3rd floor)
    const roomLayouts: Record<string, { x: number; y: number; w: number; h: number }> = {
      'L301': { x: 20, y: 450, w: 100, h: 100 },
      'L302': { x: 20, y: 200, w: 100, h: 240 },
      'L303': { x: 20, y: 20, w: 100, h: 170 },
      'L304': { x: 180, y: 20, w: 80, h: 80 },
      'L305': { x: 180, y: 110, w: 80, h: 70 },
      'L306': { x: 180, y: 190, w: 80, h: 70 },
      'L307': { x: 180, y: 270, w: 80, h: 50 },
      'L308': { x: 200, y: 500, w: 30, h: 50 },
      'L309': { x: 130, y: 450, w: 60, h: 40 },
      'L310': { x: 130, y: 400, w: 60, h: 40 },
      'L311': { x: 300, y: 20, w: 100, h: 80 },
      'L312': { x: 410, y: 20, w: 140, h: 80 },
      'L313': { x: 560, y: 20, w: 220, h: 100 },
      'L314': { x: 650, y: 450, w: 130, h: 100 },
      'L315': { x: 450, y: 450, w: 190, h: 100 },
      'L316': { x: 300, y: 450, w: 140, h: 100 },
    };

    this.renderRooms(svg, thirdFloorRooms, roomLayouts);
  }

  private renderRooms(
    svg: SVGSVGElement,
    rooms: Room[],
    layouts: Record<string, { x: number; y: number; w: number; h: number }>
  ): void {
    rooms.forEach(room => {
      const layout = layouts[room.number];
      if (!layout) return;

      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.classList.add('room');
      group.setAttribute('data-room-id', room.id);

      // Room rectangle
      const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rect.setAttribute('x', String(layout.x));
      rect.setAttribute('y', String(layout.y));
      rect.setAttribute('width', String(layout.w));
      rect.setAttribute('height', String(layout.h));
      rect.setAttribute('fill', this.getRoomColor(room.type));
      rect.setAttribute('stroke', '#374151');
      rect.setAttribute('stroke-width', '2');
      rect.setAttribute('rx', '2');
      group.appendChild(rect);

      // Room number label
      const numberLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      numberLabel.setAttribute('x', String(layout.x + layout.w / 2));
      numberLabel.setAttribute('y', String(layout.y + layout.h / 2 - 5));
      numberLabel.setAttribute('text-anchor', 'middle');
      numberLabel.setAttribute('font-size', '12');
      numberLabel.setAttribute('font-weight', 'bold');
      numberLabel.setAttribute('fill', '#1f2937');
      numberLabel.textContent = room.number;
      group.appendChild(numberLabel);

      // Room name label (smaller, below number)
      if (layout.w > 60 && layout.h > 40) {
        const nameLabel = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        nameLabel.setAttribute('x', String(layout.x + layout.w / 2));
        nameLabel.setAttribute('y', String(layout.y + layout.h / 2 + 10));
        nameLabel.setAttribute('text-anchor', 'middle');
        nameLabel.setAttribute('font-size', '9');
        nameLabel.setAttribute('fill', '#4b5563');
        // Truncate long names
        const displayName = room.name.length > 15 ? room.name.substring(0, 15) + '...' : room.name;
        nameLabel.textContent = displayName;
        group.appendChild(nameLabel);
      }

      // Click handler
      group.addEventListener('click', () => {
        this.selectRoom(room.id);
        if (this.onRoomClick) {
          this.onRoomClick(room);
        }
      });

      // Hover effects
      group.addEventListener('mouseenter', () => {
        rect.setAttribute('stroke-width', '3');
        rect.setAttribute('filter', 'url(#room-shadow)');
      });

      group.addEventListener('mouseleave', () => {
        rect.setAttribute('stroke-width', '2');
        rect.removeAttribute('filter');
      });

      svg.appendChild(group);
    });

    // Add shadow filter
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <filter id="room-shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="1" dy="1" stdDeviation="2" flood-opacity="0.3"/>
      </filter>
    `;
    svg.appendChild(defs);
  }

  private renderStaircase(svg: SVGSVGElement): void {
    const staircase = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    staircase.classList.add('staircase');

    // Staircase outline
    const stairRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    stairRect.setAttribute('x', '450');
    stairRect.setAttribute('y', '200');
    stairRect.setAttribute('width', '100');
    stairRect.setAttribute('height', '150');
    stairRect.setAttribute('fill', 'none');
    stairRect.setAttribute('stroke', '#6b7280');
    stairRect.setAttribute('stroke-width', '2');
    stairRect.setAttribute('stroke-dasharray', '5,5');
    staircase.appendChild(stairRect);

    // Stair lines
    for (let i = 0; i < 8; i++) {
      const stairLine = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      stairLine.setAttribute('x1', '460');
      stairLine.setAttribute('y1', String(210 + i * 17));
      stairLine.setAttribute('x2', '540');
      stairLine.setAttribute('y2', String(210 + i * 17));
      stairLine.setAttribute('stroke', '#9ca3af');
      stairLine.setAttribute('stroke-width', '1');
      staircase.appendChild(stairLine);
    }

    // X mark (indicating staircase)
    const x1 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    x1.setAttribute('x1', '550');
    x1.setAttribute('y1', '200');
    x1.setAttribute('x2', '650');
    x1.setAttribute('y2', '350');
    x1.setAttribute('stroke', '#9ca3af');
    x1.setAttribute('stroke-width', '1');
    staircase.appendChild(x1);

    const x2 = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    x2.setAttribute('x1', '650');
    x2.setAttribute('y1', '200');
    x2.setAttribute('x2', '550');
    x2.setAttribute('y2', '350');
    x2.setAttribute('stroke', '#9ca3af');
    x2.setAttribute('stroke-width', '1');
    staircase.appendChild(x2);

    svg.appendChild(staircase);
  }

  private getRoomColor(type: Room['type']): string {
    const colors: Record<Room['type'], string> = {
      'lab': '#bfdbfe',
      'faculty': '#fef3c7',
      'hod': '#fed7aa',
      'toilet': '#e5e7eb',
      'library': '#bbf7d0',
      'classroom': '#f5f5dc',
      'other': '#f3f4f6',
    };
    return colors[type] || '#f3f4f6';
  }

  private createLegend(): HTMLElement {
    const legend = document.createElement('div');
    legend.className = 'floor-plan-legend';

    const types: { type: Room['type']; label: string }[] = [
      { type: 'lab', label: 'Lab' },
      { type: 'faculty', label: 'Faculty Room' },
      { type: 'hod', label: 'HOD Room' },
      { type: 'library', label: 'Library' },
      { type: 'classroom', label: 'Classroom' },
      { type: 'toilet', label: 'Toilet' },
    ];

    types.forEach(({ type, label }) => {
      const item = document.createElement('div');
      item.className = 'legend-item';
      
      const colorBox = document.createElement('span');
      colorBox.className = 'legend-color';
      colorBox.style.backgroundColor = this.getRoomColor(type);
      
      const labelSpan = document.createElement('span');
      labelSpan.className = 'legend-label';
      labelSpan.textContent = label;
      
      item.appendChild(colorBox);
      item.appendChild(labelSpan);
      legend.appendChild(item);
    });

    return legend;
  }

  // Select a room
  selectRoom(roomId: string): void {
    // Remove previous selection
    const previousSelected = this.container.querySelector('.room.selected');
    if (previousSelected) {
      previousSelected.classList.remove('selected');
    }

    // Add selection to new room
    const room = this.container.querySelector(`.room[data-room-id="${roomId}"]`);
    if (room) {
      room.classList.add('selected');
      this.selectedRoom = roomId;
    }
  }

  // Clear room selection
  clearSelection(): void {
    const selected = this.container.querySelector('.room.selected');
    if (selected) {
      selected.classList.remove('selected');
    }
    this.selectedRoom = null;
  }

  // Set room click callback
  setOnRoomClick(callback: (room: Room) => void): void {
    this.onRoomClick = callback;
  }

  // Get current floor
  getCurrentFloor(): number {
    return this.currentFloor;
  }

  // Get selected room
  getSelectedRoom(): string | null {
    return this.selectedRoom;
  }

  // Highlight a specific room (for search results)
  highlightRoom(roomNumber: string): void {
    const rooms = getRoomsByFloor(this.currentFloor);
    const room = rooms.find(r => r.number === roomNumber);
    
    if (room) {
      this.selectRoom(room.id);
    } else {
      // Room is on different floor, switch floors
      const allRooms = [...secondFloorRooms, ...thirdFloorRooms];
      const targetRoom = allRooms.find(r => r.number === roomNumber);
      if (targetRoom) {
        this.showFloor(targetRoom.floor);
        setTimeout(() => this.selectRoom(targetRoom.id), 100);
      }
    }
  }
}
