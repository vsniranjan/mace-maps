// Campus map component - SVG-based interactive map
import { CampusLocation, Coordinates, MapState, UserLocation } from '../types.js';
import { campusLocations, campusCenter, campusBounds } from '../data/locations.js';

export class CampusMap {
  private container: HTMLElement;
  private svg: SVGSVGElement;
  private mapState: MapState;
  private userMarker: SVGGElement | null = null;
  private onBuildingClick: ((buildingId: string) => void) | null = null;
  private onLocationClick: ((locationId: string) => void) | null = null;

  // SVG viewBox dimensions (virtual coordinates)
  private readonly VIEW_WIDTH = 1000;
  private readonly VIEW_HEIGHT = 1400;

  // Map geographic bounds to SVG coordinates
  private readonly mapBounds = {
    minLat: 10.0510,
    maxLat: 10.0560,
    minLng: 76.6170,
    maxLng: 76.6220
  };

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element '${containerId}' not found`);
    }
    this.container = container;
    
    this.mapState = {
      center: campusCenter,
      zoom: 1,
      selectedBuilding: null,
      selectedFloor: null,
      isNavigating: false,
      showUserLocation: true
    };

    this.svg = this.createSVG();
    this.container.appendChild(this.svg);
    this.render();
  }

  private createSVG(): SVGSVGElement {
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', `0 0 ${this.VIEW_WIDTH} ${this.VIEW_HEIGHT}`);
    svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
    svg.classList.add('campus-map-svg');
    return svg;
  }

  // Convert geographic coordinates to SVG coordinates
  private geoToSvg(coords: Coordinates): { x: number; y: number } {
    const x = ((coords.lng - this.mapBounds.minLng) / (this.mapBounds.maxLng - this.mapBounds.minLng)) * this.VIEW_WIDTH;
    // Invert Y because SVG Y increases downward, but latitude increases upward
    const y = this.VIEW_HEIGHT - ((coords.lat - this.mapBounds.minLat) / (this.mapBounds.maxLat - this.mapBounds.minLat)) * this.VIEW_HEIGHT;
    return { x, y };
  }

  // Convert SVG coordinates to geographic coordinates
  private svgToGeo(x: number, y: number): Coordinates {
    const lng = (x / this.VIEW_WIDTH) * (this.mapBounds.maxLng - this.mapBounds.minLng) + this.mapBounds.minLng;
    const lat = ((this.VIEW_HEIGHT - y) / this.VIEW_HEIGHT) * (this.mapBounds.maxLat - this.mapBounds.minLat) + this.mapBounds.minLat;
    return { lat, lng };
  }

  render(): void {
    this.svg.innerHTML = '';
    
    // Add background
    this.renderBackground();
    
    // Add roads/paths
    this.renderRoads();
    
    // Add green spaces
    this.renderGreenSpaces();
    
    // Add buildings
    this.renderBuildings();
    
    // Add landmarks and facilities
    this.renderLandmarks();
    
    // Add labels
    this.renderLabels();
  }

  private renderBackground(): void {
    const bg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    bg.setAttribute('x', '0');
    bg.setAttribute('y', '0');
    bg.setAttribute('width', String(this.VIEW_WIDTH));
    bg.setAttribute('height', String(this.VIEW_HEIGHT));
    bg.setAttribute('fill', '#e8f4e8');
    this.svg.appendChild(bg);
  }

  private renderRoads(): void {
    const roads = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    roads.classList.add('roads');

    // Main road path (simplified based on campus layout)
    const mainRoad = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    
    // Create road path connecting main areas
    const entrance = this.geoToSvg({ lat: 10.0552, lng: 76.6192 });
    const mainBlock = this.geoToSvg({ lat: 10.0538, lng: 76.6192 });
    const csBlock = this.geoToSvg({ lat: 10.0524, lng: 76.6186 });
    const canteen = this.geoToSvg({ lat: 10.0528, lng: 76.6198 });
    
    mainRoad.setAttribute('d', `
      M ${entrance.x} ${entrance.y}
      L ${mainBlock.x} ${mainBlock.y}
      L ${mainBlock.x + 50} ${mainBlock.y + 50}
      L ${canteen.x} ${canteen.y}
      M ${mainBlock.x} ${mainBlock.y}
      L ${mainBlock.x - 30} ${mainBlock.y + 100}
      L ${csBlock.x} ${csBlock.y}
    `);
    mainRoad.setAttribute('stroke', '#ffffff');
    mainRoad.setAttribute('stroke-width', '20');
    mainRoad.setAttribute('fill', 'none');
    mainRoad.setAttribute('stroke-linecap', 'round');
    mainRoad.setAttribute('stroke-linejoin', 'round');
    roads.appendChild(mainRoad);

    // Road border
    const roadBorder = mainRoad.cloneNode() as SVGPathElement;
    roadBorder.setAttribute('stroke', '#d1d5db');
    roadBorder.setAttribute('stroke-width', '22');
    roads.insertBefore(roadBorder, mainRoad);

    // Dashed center line
    const centerLine = mainRoad.cloneNode() as SVGPathElement;
    centerLine.setAttribute('stroke', '#9ca3af');
    centerLine.setAttribute('stroke-width', '2');
    centerLine.setAttribute('stroke-dasharray', '10,10');
    roads.appendChild(centerLine);

    this.svg.appendChild(roads);
  }

  private renderGreenSpaces(): void {
    const greenSpaces = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    greenSpaces.classList.add('green-spaces');

    // NSS Park
    const nssPark = this.geoToSvg({ lat: 10.0535, lng: 76.6189 });
    const park = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
    park.setAttribute('cx', String(nssPark.x));
    park.setAttribute('cy', String(nssPark.y));
    park.setAttribute('rx', '40');
    park.setAttribute('ry', '30');
    park.setAttribute('fill', '#86efac');
    park.setAttribute('opacity', '0.7');
    greenSpaces.appendChild(park);

    // Add some trees (decorative circles)
    const treePositions = [
      { lat: 10.0550, lng: 76.6185 },
      { lat: 10.0545, lng: 76.6195 },
      { lat: 10.0530, lng: 76.6180 },
      { lat: 10.0525, lng: 76.6205 },
    ];

    treePositions.forEach(pos => {
      const treePos = this.geoToSvg(pos);
      const tree = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      tree.setAttribute('cx', String(treePos.x));
      tree.setAttribute('cy', String(treePos.y));
      tree.setAttribute('r', '15');
      tree.setAttribute('fill', '#22c55e');
      tree.setAttribute('opacity', '0.6');
      greenSpaces.appendChild(tree);
    });

    this.svg.appendChild(greenSpaces);
  }

  private renderBuildings(): void {
    const buildings = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    buildings.classList.add('buildings');

    const buildingLocations = campusLocations.filter(loc => loc.type === 'building');

    buildingLocations.forEach(location => {
      const pos = this.geoToSvg(location.coordinates);
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.classList.add('building');
      group.setAttribute('data-id', location.id);

      // Building shape
      const building = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      const width = location.id === 'main-block' ? 80 : 60;
      const height = location.id === 'main-block' ? 50 : 40;
      
      building.setAttribute('x', String(pos.x - width / 2));
      building.setAttribute('y', String(pos.y - height / 2));
      building.setAttribute('width', String(width));
      building.setAttribute('height', String(height));
      building.setAttribute('rx', '4');
      building.setAttribute('fill', this.getBuildingColor(location.id));
      building.setAttribute('stroke', '#374151');
      building.setAttribute('stroke-width', '2');
      building.classList.add('building-shape');

      // Building roof effect
      const roof = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      const roofPoints = `
        ${pos.x - width / 2 + 5},${pos.y - height / 2 + 5}
        ${pos.x + width / 2 - 5},${pos.y - height / 2 + 5}
        ${pos.x + width / 2 - 10},${pos.y - height / 2}
        ${pos.x - width / 2 + 10},${pos.y - height / 2}
      `;
      roof.setAttribute('points', roofPoints);
      roof.setAttribute('fill', this.getBuildingColor(location.id));
      roof.setAttribute('opacity', '0.7');

      group.appendChild(building);
      group.appendChild(roof);

      // Click handler
      group.addEventListener('click', () => {
        this.selectBuilding(location.id);
        if (this.onBuildingClick) {
          this.onBuildingClick(location.id);
        }
      });

      // Hover effect
      group.addEventListener('mouseenter', () => {
        building.setAttribute('stroke-width', '3');
        building.setAttribute('filter', 'url(#shadow)');
      });

      group.addEventListener('mouseleave', () => {
        building.setAttribute('stroke-width', '2');
        building.removeAttribute('filter');
      });

      buildings.appendChild(group);
    });

    // Add shadow filter
    const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
    defs.innerHTML = `
      <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="2" dy="2" stdDeviation="3" flood-opacity="0.3"/>
      </filter>
    `;
    this.svg.appendChild(defs);
    this.svg.appendChild(buildings);
  }

  private getBuildingColor(buildingId: string): string {
    const colors: Record<string, string> = {
      'main-block': '#94a3b8',
      'cs-block': '#93c5fd',
      'ece-block': '#93c5fd',
      'mech-block': '#a5b4fc',
      'civil-block': '#c4b5fd',
      'mca-block': '#f0abfc',
      'pg-block': '#fda4af',
    };
    return colors[buildingId] || '#cbd5e1';
  }

  private renderLandmarks(): void {
    const landmarks = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    landmarks.classList.add('landmarks');

    const landmarkLocations = campusLocations.filter(
      loc => loc.type === 'landmark' || loc.type === 'facility'
    );

    landmarkLocations.forEach(location => {
      const pos = this.geoToSvg(location.coordinates);
      const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      group.classList.add('landmark');
      group.setAttribute('data-id', location.id);

      // Landmark marker
      const marker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      marker.setAttribute('cx', String(pos.x));
      marker.setAttribute('cy', String(pos.y));
      marker.setAttribute('r', '12');
      marker.setAttribute('fill', location.type === 'facility' ? '#fbbf24' : '#34d399');
      marker.setAttribute('stroke', '#ffffff');
      marker.setAttribute('stroke-width', '2');

      // Icon inside marker
      const icon = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      icon.setAttribute('x', String(pos.x));
      icon.setAttribute('y', String(pos.y + 4));
      icon.setAttribute('text-anchor', 'middle');
      icon.setAttribute('font-size', '10');
      icon.setAttribute('fill', '#ffffff');
      icon.textContent = this.getLandmarkIcon(location.id);

      group.appendChild(marker);
      group.appendChild(icon);

      // Click handler
      group.addEventListener('click', () => {
        if (this.onLocationClick) {
          this.onLocationClick(location.id);
        }
      });

      landmarks.appendChild(group);
    });

    this.svg.appendChild(landmarks);
  }

  private getLandmarkIcon(locationId: string): string {
    const icons: Record<string, string> = {
      'canteen': '🍽',
      'central-library': '📚',
      'oat': '🎭',
      'oat-stage': '🎤',
      'nss-park': '🌳',
    };
    return icons[locationId] || '📍';
  }

  private renderLabels(): void {
    const labels = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    labels.classList.add('labels');

    campusLocations.forEach(location => {
      const pos = this.geoToSvg(location.coordinates);
      
      // Label background
      const labelBg = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      const labelText = location.shortName || location.name;
      const textWidth = labelText.length * 6 + 10;
      
      labelBg.setAttribute('x', String(pos.x - textWidth / 2));
      labelBg.setAttribute('y', String(pos.y + (location.type === 'building' ? 25 : 15)));
      labelBg.setAttribute('width', String(textWidth));
      labelBg.setAttribute('height', '18');
      labelBg.setAttribute('rx', '3');
      labelBg.setAttribute('fill', 'rgba(255, 255, 255, 0.9)');
      labelBg.setAttribute('stroke', '#e5e7eb');
      labelBg.setAttribute('stroke-width', '1');
      
      // Label text
      const label = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      label.setAttribute('x', String(pos.x));
      label.setAttribute('y', String(pos.y + (location.type === 'building' ? 38 : 28)));
      label.setAttribute('text-anchor', 'middle');
      label.setAttribute('font-size', '11');
      label.setAttribute('font-family', 'Roboto, sans-serif');
      label.setAttribute('font-weight', '500');
      label.setAttribute('fill', '#374151');
      label.textContent = labelText;

      labels.appendChild(labelBg);
      labels.appendChild(label);
    });

    this.svg.appendChild(labels);
  }

  // Update user location marker
  updateUserLocation(location: UserLocation): void {
    const pos = this.geoToSvg(location.coordinates);

    if (!this.userMarker) {
      this.userMarker = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      this.userMarker.classList.add('user-marker');

      // Accuracy circle
      const accuracy = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      accuracy.classList.add('accuracy-circle');
      accuracy.setAttribute('fill', 'rgba(66, 133, 244, 0.15)');
      accuracy.setAttribute('stroke', 'rgba(66, 133, 244, 0.3)');
      accuracy.setAttribute('stroke-width', '1');

      // Outer pulse ring
      const pulse = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      pulse.classList.add('pulse-ring');
      pulse.setAttribute('r', '20');
      pulse.setAttribute('fill', 'none');
      pulse.setAttribute('stroke', '#4285f4');
      pulse.setAttribute('stroke-width', '2');

      // User dot
      const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      dot.classList.add('user-dot');
      dot.setAttribute('r', '8');
      dot.setAttribute('fill', '#4285f4');
      dot.setAttribute('stroke', '#ffffff');
      dot.setAttribute('stroke-width', '3');

      // Direction indicator
      const direction = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      direction.classList.add('direction-indicator');
      direction.setAttribute('fill', '#4285f4');

      this.userMarker.appendChild(accuracy);
      this.userMarker.appendChild(pulse);
      this.userMarker.appendChild(dot);
      this.userMarker.appendChild(direction);
      this.svg.appendChild(this.userMarker);
    }

    // Update position
    this.userMarker.setAttribute('transform', `translate(${pos.x}, ${pos.y})`);

    // Update accuracy circle size (convert meters to SVG units approximately)
    const accuracyRadius = Math.min(location.accuracy * 2, 50);
    const accuracyCircle = this.userMarker.querySelector('.accuracy-circle');
    if (accuracyCircle) {
      accuracyCircle.setAttribute('r', String(accuracyRadius));
    }
  }

  // Hide user location marker
  hideUserLocation(): void {
    if (this.userMarker) {
      this.userMarker.remove();
      this.userMarker = null;
    }
  }

  // Select a building
  selectBuilding(buildingId: string): void {
    // Remove previous selection
    const previousSelected = this.svg.querySelector('.building.selected');
    if (previousSelected) {
      previousSelected.classList.remove('selected');
    }

    // Add selection to new building
    const building = this.svg.querySelector(`.building[data-id="${buildingId}"]`);
    if (building) {
      building.classList.add('selected');
      this.mapState.selectedBuilding = buildingId;
    }
  }

  // Clear building selection
  clearSelection(): void {
    const selected = this.svg.querySelector('.building.selected');
    if (selected) {
      selected.classList.remove('selected');
    }
    this.mapState.selectedBuilding = null;
    this.mapState.selectedFloor = null;
  }

  // Draw navigation path
  drawNavigationPath(from: Coordinates, to: Coordinates): void {
    const fromPos = this.geoToSvg(from);
    const toPos = this.geoToSvg(to);

    // Remove existing path
    const existingPath = this.svg.querySelector('.navigation-path');
    if (existingPath) {
      existingPath.remove();
    }

    const pathGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    pathGroup.classList.add('navigation-path');

    // Path line
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    path.setAttribute('x1', String(fromPos.x));
    path.setAttribute('y1', String(fromPos.y));
    path.setAttribute('x2', String(toPos.x));
    path.setAttribute('y2', String(toPos.y));
    path.setAttribute('stroke', '#4285f4');
    path.setAttribute('stroke-width', '4');
    path.setAttribute('stroke-dasharray', '10,5');
    path.setAttribute('stroke-linecap', 'round');

    // Destination marker
    const destMarker = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    destMarker.setAttribute('cx', String(toPos.x));
    destMarker.setAttribute('cy', String(toPos.y));
    destMarker.setAttribute('r', '10');
    destMarker.setAttribute('fill', '#ea4335');
    destMarker.setAttribute('stroke', '#ffffff');
    destMarker.setAttribute('stroke-width', '2');

    pathGroup.appendChild(path);
    pathGroup.appendChild(destMarker);
    this.svg.appendChild(pathGroup);

    this.mapState.isNavigating = true;
  }

  // Clear navigation path
  clearNavigationPath(): void {
    const path = this.svg.querySelector('.navigation-path');
    if (path) {
      path.remove();
    }
    this.mapState.isNavigating = false;
  }

  // Set building click callback
  setOnBuildingClick(callback: (buildingId: string) => void): void {
    this.onBuildingClick = callback;
  }

  // Set location click callback
  setOnLocationClick(callback: (locationId: string) => void): void {
    this.onLocationClick = callback;
  }

  // Get current map state
  getMapState(): MapState {
    return { ...this.mapState };
  }
}
