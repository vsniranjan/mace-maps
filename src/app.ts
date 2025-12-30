// Main application entry point
import { CampusMap } from './components/map.js';
import { FloorPlans } from './components/floor-plans.js';
import { Search } from './components/search.js';
import { Navigation } from './components/navigation.js';
import { LocationTracker, locationTracker } from './components/location.js';
import { SearchResult, Room, CampusLocation, UserLocation } from './types.js';
import { getLocationById } from './data/locations.js';
import { getRoomById } from './data/rooms.js';

class MACECampusMap {
  private campusMap: CampusMap;
  private floorPlans: FloorPlans | null = null;
  private search: Search;
  private navigation: Navigation;
  private selectedBuilding: string | null = null;
  private isFloorPlanVisible: boolean = false;
  private nearbyBuildingId: string | null = null;

  constructor() {
    // Initialize components
    this.campusMap = new CampusMap('map-container');
    this.search = new Search('search-container');
    this.navigation = new Navigation();

    this.setupEventListeners();
    this.initializeLocationTracking();
  }

  private setupEventListeners(): void {
    // Building click handler
    this.campusMap.setOnBuildingClick((buildingId) => {
      this.handleBuildingClick(buildingId);
    });

    // Location click handler
    this.campusMap.setOnLocationClick((locationId) => {
      this.showLocationInfo(locationId);
    });

    // Search result selection
    this.search.setOnResultSelect((result) => {
      this.handleSearchResult(result);
    });

    // Navigate-to event from search
    document.addEventListener('navigate-to', ((e: CustomEvent) => {
      this.handleNavigateTo(e.detail as SearchResult);
    }) as EventListener);

    // Navigation callbacks
    this.navigation.setOnNavigationStart((route) => {
      this.showNavigationPanel(route);
      
      // Get user location for path drawing
      const userLoc = locationTracker.getCurrentLocation();
      if (userLoc) {
        this.campusMap.drawNavigationPath(userLoc.coordinates, route.destination);
      }
    });

    this.navigation.setOnNavigationEnd(() => {
      this.hideNavigationPanel();
      this.campusMap.clearNavigationPath();
    });

    this.navigation.setOnBuildingReached((buildingId, roomId) => {
      this.handleBuildingReached(buildingId, roomId);
    });

    // Close floor plan button
    const closeFloorPlanBtn = document.getElementById('close-floor-plan');
    if (closeFloorPlanBtn) {
      closeFloorPlanBtn.addEventListener('click', () => {
        this.hideFloorPlan();
      });
    }

    // Location tracking button
    const locationBtn = document.getElementById('location-btn');
    if (locationBtn) {
      locationBtn.addEventListener('click', () => {
        this.toggleLocationTracking();
      });
    }

    // Cancel navigation button
    const cancelNavBtn = document.getElementById('cancel-navigation');
    if (cancelNavBtn) {
      cancelNavBtn.addEventListener('click', () => {
        this.navigation.stopNavigation();
      });
    }

    // Floor plan popup close
    const closePopupBtn = document.getElementById('close-building-popup');
    if (closePopupBtn) {
      closePopupBtn.addEventListener('click', () => {
        this.hideBuildingPopup();
      });
    }
  }

  private initializeLocationTracking(): void {
    // Set up location update handler
    locationTracker.onLocationUpdate((location) => {
      this.handleLocationUpdate(location);
    });

    // Set up nearby building detection
    locationTracker.onNearbyBuilding((buildingId) => {
      this.handleNearbyBuilding(buildingId);
    });
  }

  private async toggleLocationTracking(): Promise<void> {
    const locationBtn = document.getElementById('location-btn');
    
    if (locationTracker.isTrackingActive()) {
      locationTracker.stopTracking();
      this.campusMap.hideUserLocation();
      if (locationBtn) {
        locationBtn.classList.remove('active');
      }
      this.showToast('Location tracking stopped');
    } else {
      try {
        if (locationBtn) {
          locationBtn.classList.add('loading');
        }
        
        await locationTracker.startTracking();
        
        if (locationBtn) {
          locationBtn.classList.remove('loading');
          locationBtn.classList.add('active');
        }
        this.showToast('Location tracking enabled');
      } catch (error) {
        if (locationBtn) {
          locationBtn.classList.remove('loading');
        }
        this.showToast((error as Error).message, 'error');
      }
    }
  }

  private handleLocationUpdate(location: UserLocation): void {
    // Update user marker on map
    this.campusMap.updateUserLocation(location);

    // Update navigation if active
    if (this.navigation.isNavigating()) {
      this.navigation.updatePosition(location.coordinates);
      this.updateNavigationPanel();
    }
  }

  private handleNearbyBuilding(buildingId: string | null): void {
    if (buildingId && buildingId !== this.nearbyBuildingId) {
      this.nearbyBuildingId = buildingId;
      
      // Show popup if building has floors
      const location = getLocationById(buildingId);
      if (location && location.floors && location.floors.length > 0) {
        this.showBuildingPopup(buildingId);
      }
    } else if (!buildingId) {
      this.nearbyBuildingId = null;
    }
  }

  private handleBuildingClick(buildingId: string): void {
    this.selectedBuilding = buildingId;
    const location = getLocationById(buildingId);
    
    if (location) {
      // Check if building has floor plans
      if (location.floors && location.floors.length > 0) {
        this.showFloorPlan(buildingId);
      } else {
        this.showLocationInfo(buildingId);
      }
    }
  }

  private showFloorPlan(buildingId: string): void {
    const floorPlanContainer = document.getElementById('floor-plan-container');
    const floorPlanOverlay = document.getElementById('floor-plan-overlay');
    
    if (!floorPlanContainer || !floorPlanOverlay) return;

    // Initialize floor plans if not already done
    if (!this.floorPlans) {
      this.floorPlans = new FloorPlans('floor-plan-content');
      
      // Set up room click handler
      this.floorPlans.setOnRoomClick((room) => {
        this.showRoomInfo(room);
      });
    }

    // Show the floor plan
    this.floorPlans.showFloor(2);
    
    floorPlanOverlay.classList.add('visible');
    this.isFloorPlanVisible = true;

    // Update building name in header
    const location = getLocationById(buildingId);
    const buildingTitle = document.getElementById('floor-plan-building-name');
    if (buildingTitle && location) {
      buildingTitle.textContent = location.name;
    }

    // Pause location tracking while viewing floor plan
    if (locationTracker.isTrackingActive()) {
      locationTracker.pauseTracking();
    }
  }

  private hideFloorPlan(): void {
    const floorPlanOverlay = document.getElementById('floor-plan-overlay');
    if (floorPlanOverlay) {
      floorPlanOverlay.classList.remove('visible');
    }
    
    this.isFloorPlanVisible = false;
    this.campusMap.clearSelection();

    // Resume location tracking
    if (locationTracker.getTrackingStatus() === 'paused') {
      locationTracker.resumeTracking();
    }
  }

  private showBuildingPopup(buildingId: string): void {
    const popup = document.getElementById('building-popup');
    const location = getLocationById(buildingId);
    
    if (!popup || !location) return;

    const popupTitle = popup.querySelector('.popup-title');
    const popupSubtitle = popup.querySelector('.popup-subtitle');
    const viewFloorsBtn = popup.querySelector('.view-floors-btn');
    
    if (popupTitle) popupTitle.textContent = location.name;
    if (popupSubtitle) popupSubtitle.textContent = 'You are near this building';
    
    if (viewFloorsBtn) {
      viewFloorsBtn.addEventListener('click', () => {
        this.hideBuildingPopup();
        this.showFloorPlan(buildingId);
      }, { once: true });
    }

    popup.classList.add('visible');
  }

  private hideBuildingPopup(): void {
    const popup = document.getElementById('building-popup');
    if (popup) {
      popup.classList.remove('visible');
    }
  }

  private showLocationInfo(locationId: string): void {
    const location = getLocationById(locationId);
    if (!location) return;

    const infoPanel = document.getElementById('info-panel');
    if (!infoPanel) return;

    infoPanel.innerHTML = `
      <div class="info-panel-content">
        <h3>${location.name}</h3>
        <p class="location-type">${this.getLocationTypeLabel(location.type)}</p>
        ${location.description ? `<p class="location-description">${location.description}</p>` : ''}
        <div class="info-actions">
          <button class="navigate-btn" onclick="window.app.navigateToLocation('${locationId}')">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>
            Navigate
          </button>
          ${location.floors ? `
            <button class="floors-btn" onclick="window.app.showFloorPlan('${locationId}')">
              View Floors
            </button>
          ` : ''}
        </div>
      </div>
    `;

    infoPanel.classList.add('visible');
  }

  private showRoomInfo(room: Room): void {
    const infoPanel = document.getElementById('room-info-panel');
    if (!infoPanel) return;

    infoPanel.innerHTML = `
      <div class="room-info-content">
        <h4>${room.number}</h4>
        <p class="room-name">${room.name}</p>
        <p class="room-floor">Floor ${room.floor}</p>
        <span class="room-type-badge ${room.type}">${this.getRoomTypeLabel(room.type)}</span>
      </div>
    `;

    infoPanel.classList.add('visible');
  }

  private handleSearchResult(result: SearchResult): void {
    if (result.type === 'location') {
      const location = result.item as CampusLocation;
      this.campusMap.selectBuilding(location.id);
      
      if (location.type === 'building' && location.floors && location.floors.length > 0) {
        this.showFloorPlan(location.id);
      } else {
        this.showLocationInfo(location.id);
      }
    } else {
      const room = result.item as Room;
      this.showFloorPlan(room.buildingId);
      
      // Highlight the room after floor plan is shown
      setTimeout(() => {
        if (this.floorPlans) {
          this.floorPlans.highlightRoom(room.number);
          this.showRoomInfo(room);
        }
      }, 200);
    }
  }

  private handleNavigateTo(result: SearchResult): void {
    const userLocation = locationTracker.getCurrentLocation();
    
    if (!userLocation) {
      this.showToast('Please enable location tracking first', 'warning');
      return;
    }

    let route;
    if (result.type === 'location') {
      const location = result.item as CampusLocation;
      route = this.navigation.calculateRoute(
        userLocation.coordinates,
        'location',
        location.id
      );
    } else {
      const room = result.item as Room;
      route = this.navigation.calculateRoute(
        userLocation.coordinates,
        'room',
        room.id
      );
    }

    if (route) {
      this.navigation.startNavigation(route);
    }
  }

  private handleBuildingReached(buildingId: string, roomId?: string): void {
    const location = getLocationById(buildingId);
    
    if (location && location.floors && location.floors.length > 0) {
      // Pause navigation and show floor plan
      this.navigation.stopNavigation();
      this.showFloorPlan(buildingId);
      
      if (roomId) {
        const room = getRoomById(roomId);
        if (room && this.floorPlans) {
          setTimeout(() => {
            this.floorPlans!.highlightRoom(room.number);
            this.showToast(`Go to Floor ${room.floor}, Room ${room.number}`);
          }, 300);
        }
      }
    }
  }

  private showNavigationPanel(route: any): void {
    const navPanel = document.getElementById('navigation-panel');
    if (!navPanel) return;

    const destInfo = this.navigation.getDestinationInfo();
    if (!destInfo) return;

    navPanel.innerHTML = `
      <div class="nav-panel-content">
        <div class="nav-destination">
          <h4>Navigating to</h4>
          <p class="nav-dest-name">${destInfo.name}</p>
          ${destInfo.floor ? `<span class="nav-floor-badge">Floor ${destInfo.floor}</span>` : ''}
        </div>
        <div class="nav-info">
          <div class="nav-distance">
            <span class="nav-value">${this.navigation.formatDistance(route.distance)}</span>
            <span class="nav-label">Distance</span>
          </div>
          <div class="nav-time">
            <span class="nav-value">${this.navigation.getWalkingTime(route.distance)}</span>
            <span class="nav-label">Walking</span>
          </div>
          <div class="nav-direction">
            <span class="nav-value">${this.navigation.getDirectionText(route.bearing)}</span>
            <span class="nav-label">Direction</span>
          </div>
        </div>
        <button id="cancel-navigation" class="cancel-nav-btn">Cancel</button>
      </div>
    `;

    // Re-attach cancel button listener
    const cancelBtn = document.getElementById('cancel-navigation');
    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.navigation.stopNavigation();
      });
    }

    navPanel.classList.add('visible');
  }

  private updateNavigationPanel(): void {
    const route = this.navigation.getCurrentRoute();
    if (!route) return;

    const distanceEl = document.querySelector('.nav-distance .nav-value');
    const timeEl = document.querySelector('.nav-time .nav-value');
    const directionEl = document.querySelector('.nav-direction .nav-value');

    if (distanceEl) distanceEl.textContent = this.navigation.formatDistance(route.distance);
    if (timeEl) timeEl.textContent = this.navigation.getWalkingTime(route.distance);
    if (directionEl) directionEl.textContent = this.navigation.getDirectionText(route.bearing);
  }

  private hideNavigationPanel(): void {
    const navPanel = document.getElementById('navigation-panel');
    if (navPanel) {
      navPanel.classList.remove('visible');
    }
  }

  private getLocationTypeLabel(type: CampusLocation['type']): string {
    const labels: Record<CampusLocation['type'], string> = {
      'building': 'Building',
      'landmark': 'Landmark',
      'facility': 'Facility',
      'entrance': 'Entrance',
    };
    return labels[type] || 'Location';
  }

  private getRoomTypeLabel(type: Room['type']): string {
    const labels: Record<Room['type'], string> = {
      'lab': 'Laboratory',
      'faculty': 'Faculty Room',
      'hod': 'HOD Room',
      'toilet': 'Restroom',
      'library': 'Library',
      'classroom': 'Classroom',
      'other': 'Room',
    };
    return labels[type] || 'Room';
  }

  private showToast(message: string, type: 'success' | 'error' | 'warning' = 'success'): void {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    const container = document.getElementById('toast-container');
    if (container) {
      container.appendChild(toast);
      
      // Animate in
      setTimeout(() => toast.classList.add('visible'), 10);
      
      // Remove after 3 seconds
      setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 300);
      }, 3000);
    }
  }

  // Public methods for use in HTML
  public navigateToLocation(locationId: string): void {
    const userLocation = locationTracker.getCurrentLocation();
    if (!userLocation) {
      this.showToast('Please enable location tracking first', 'warning');
      return;
    }

    const route = this.navigation.calculateRoute(
      userLocation.coordinates,
      'location',
      locationId
    );

    if (route) {
      // Hide info panel
      const infoPanel = document.getElementById('info-panel');
      if (infoPanel) infoPanel.classList.remove('visible');
      
      this.navigation.startNavigation(route);
    }
  }

  public showFloorPlanPublic(buildingId: string): void {
    this.showFloorPlan(buildingId);
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  (window as any).app = new MACECampusMap();
});

export { MACECampusMap };
