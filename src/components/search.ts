// Search component for rooms and locations
import { SearchResult, CampusLocation, Room } from '../types.js';
import { campusLocations, getLocationById } from '../data/locations.js';
import { allRooms, getRoomById, searchRooms } from '../data/rooms.js';

export class Search {
  private container: HTMLElement;
  private searchInput: HTMLInputElement;
  private resultsContainer: HTMLElement;
  private onResultSelect: ((result: SearchResult) => void) | null = null;
  private isOpen: boolean = false;

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container element '${containerId}' not found`);
    }
    this.container = container;
    this.searchInput = this.createSearchInput();
    this.resultsContainer = this.createResultsContainer();
    this.render();
  }

  private createSearchInput(): HTMLInputElement {
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Search for rooms, buildings, or places...';
    input.className = 'search-input';
    input.autocomplete = 'off';
    
    input.addEventListener('input', () => this.handleSearch());
    input.addEventListener('focus', () => this.showResults());
    input.addEventListener('keydown', (e) => this.handleKeydown(e));
    
    return input;
  }

  private createResultsContainer(): HTMLElement {
    const container = document.createElement('div');
    container.className = 'search-results';
    container.style.display = 'none';
    return container;
  }

  private render(): void {
    this.container.innerHTML = '';
    
    const wrapper = document.createElement('div');
    wrapper.className = 'search-wrapper';

    // Search icon
    const icon = document.createElement('span');
    icon.className = 'search-icon';
    icon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>`;

    // Clear button
    const clearBtn = document.createElement('button');
    clearBtn.className = 'search-clear';
    clearBtn.innerHTML = '×';
    clearBtn.style.display = 'none';
    clearBtn.addEventListener('click', () => this.clearSearch());

    wrapper.appendChild(icon);
    wrapper.appendChild(this.searchInput);
    wrapper.appendChild(clearBtn);
    wrapper.appendChild(this.resultsContainer);

    this.container.appendChild(wrapper);

    // Close results when clicking outside
    document.addEventListener('click', (e) => {
      if (!this.container.contains(e.target as Node)) {
        this.hideResults();
      }
    });
  }

  private handleSearch(): void {
    const query = this.searchInput.value.trim();
    const clearBtn = this.container.querySelector('.search-clear') as HTMLElement;
    
    if (query.length === 0) {
      clearBtn.style.display = 'none';
      this.hideResults();
      return;
    }

    clearBtn.style.display = 'block';
    
    if (query.length < 2) {
      this.hideResults();
      return;
    }

    const results = this.search(query);
    this.displayResults(results);
  }

  private search(query: string): SearchResult[] {
    const results: SearchResult[] = [];
    const lowerQuery = query.toLowerCase();

    // Search locations
    campusLocations.forEach(location => {
      const nameMatch = location.name.toLowerCase().includes(lowerQuery);
      const shortNameMatch = location.shortName?.toLowerCase().includes(lowerQuery);
      
      if (nameMatch || shortNameMatch) {
        const matchScore = nameMatch ? 
          (location.name.toLowerCase().startsWith(lowerQuery) ? 100 : 80) :
          (shortNameMatch ? 70 : 50);
        
        results.push({
          type: 'location',
          item: location,
          matchScore
        });
      }
    });

    // Search rooms
    allRooms.forEach(room => {
      const numberMatch = room.number.toLowerCase().includes(lowerQuery);
      const nameMatch = room.name.toLowerCase().includes(lowerQuery);
      
      if (numberMatch || nameMatch) {
        const matchScore = numberMatch ?
          (room.number.toLowerCase() === lowerQuery ? 100 : 85) :
          (room.name.toLowerCase().startsWith(lowerQuery) ? 75 : 60);
        
        results.push({
          type: 'room',
          item: room,
          matchScore
        });
      }
    });

    // Sort by match score
    results.sort((a, b) => b.matchScore - a.matchScore);

    // Limit results
    return results.slice(0, 10);
  }

  private displayResults(results: SearchResult[]): void {
    this.resultsContainer.innerHTML = '';

    if (results.length === 0) {
      const noResults = document.createElement('div');
      noResults.className = 'search-no-results';
      noResults.textContent = 'No results found';
      this.resultsContainer.appendChild(noResults);
    } else {
      results.forEach((result, index) => {
        const item = this.createResultItem(result, index);
        this.resultsContainer.appendChild(item);
      });
    }

    this.showResults();
  }

  private createResultItem(result: SearchResult, index: number): HTMLElement {
    const item = document.createElement('div');
    item.className = 'search-result-item';
    item.setAttribute('data-index', String(index));

    const icon = document.createElement('span');
    icon.className = 'result-icon';

    const info = document.createElement('div');
    info.className = 'result-info';

    const title = document.createElement('div');
    title.className = 'result-title';

    const subtitle = document.createElement('div');
    subtitle.className = 'result-subtitle';

    if (result.type === 'location') {
      const location = result.item as CampusLocation;
      icon.innerHTML = this.getLocationIcon(location.type);
      title.textContent = location.name;
      subtitle.textContent = this.getLocationTypeLabel(location.type);
    } else {
      const room = result.item as Room;
      icon.innerHTML = this.getRoomIcon(room.type);
      title.textContent = `${room.number} - ${room.name}`;
      subtitle.textContent = `CS Block, Floor ${room.floor}`;
    }

    info.appendChild(title);
    info.appendChild(subtitle);

    // Navigate button
    const navBtn = document.createElement('button');
    navBtn.className = 'result-navigate-btn';
    navBtn.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="3 11 22 2 13 21 11 13 3 11"></polygon></svg>`;
    navBtn.title = 'Navigate';
    navBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this.selectResult(result, true);
    });

    item.appendChild(icon);
    item.appendChild(info);
    item.appendChild(navBtn);

    item.addEventListener('click', () => this.selectResult(result, false));

    return item;
  }

  private getLocationIcon(type: CampusLocation['type']): string {
    const icons: Record<CampusLocation['type'], string> = {
      'building': '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><line x1="9" y1="22" x2="9" y2="2"></line><line x1="15" y1="22" x2="15" y2="2"></line></svg>',
      'landmark': '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="10" r="3"></circle><path d="M12 21.7C17.3 17 20 13 20 10a8 8 0 1 0-16 0c0 3 2.7 7 8 11.7z"></path></svg>',
      'facility': '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path></svg>',
      'entrance': '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"></path><polyline points="10 17 15 12 10 7"></polyline><line x1="15" y1="12" x2="3" y2="12"></line></svg>',
    };
    return icons[type] || icons['landmark'];
  }

  private getRoomIcon(type: Room['type']): string {
    const icons: Record<Room['type'], string> = {
      'lab': '🔬',
      'faculty': '👨‍🏫',
      'hod': '👔',
      'toilet': '🚻',
      'library': '📚',
      'classroom': '🏫',
      'other': '📍',
    };
    return `<span class="room-emoji">${icons[type] || icons['other']}</span>`;
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

  private selectResult(result: SearchResult, navigate: boolean): void {
    this.searchInput.value = '';
    this.hideResults();
    
    if (this.onResultSelect) {
      this.onResultSelect(result);
    }

    // Dispatch custom event for navigation
    if (navigate) {
      const event = new CustomEvent('navigate-to', {
        detail: result,
        bubbles: true
      });
      this.container.dispatchEvent(event);
    }
  }

  private handleKeydown(e: KeyboardEvent): void {
    const items = this.resultsContainer.querySelectorAll('.search-result-item');
    const activeItem = this.resultsContainer.querySelector('.search-result-item.active');
    let activeIndex = activeItem ? parseInt(activeItem.getAttribute('data-index') || '0') : -1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        activeIndex = Math.min(activeIndex + 1, items.length - 1);
        this.setActiveItem(activeIndex);
        break;
      case 'ArrowUp':
        e.preventDefault();
        activeIndex = Math.max(activeIndex - 1, 0);
        this.setActiveItem(activeIndex);
        break;
      case 'Enter':
        e.preventDefault();
        if (activeItem) {
          (activeItem as HTMLElement).click();
        }
        break;
      case 'Escape':
        this.hideResults();
        this.searchInput.blur();
        break;
    }
  }

  private setActiveItem(index: number): void {
    const items = this.resultsContainer.querySelectorAll('.search-result-item');
    items.forEach((item, i) => {
      item.classList.toggle('active', i === index);
    });
  }

  private showResults(): void {
    if (this.resultsContainer.children.length > 0) {
      this.resultsContainer.style.display = 'block';
      this.isOpen = true;
    }
  }

  private hideResults(): void {
    this.resultsContainer.style.display = 'none';
    this.isOpen = false;
  }

  private clearSearch(): void {
    this.searchInput.value = '';
    const clearBtn = this.container.querySelector('.search-clear') as HTMLElement;
    clearBtn.style.display = 'none';
    this.hideResults();
    this.searchInput.focus();
  }

  // Set callback for result selection
  setOnResultSelect(callback: (result: SearchResult) => void): void {
    this.onResultSelect = callback;
  }

  // Focus the search input
  focus(): void {
    this.searchInput.focus();
  }

  // Get search input value
  getValue(): string {
    return this.searchInput.value;
  }

  // Set search input value
  setValue(value: string): void {
    this.searchInput.value = value;
  }
}
