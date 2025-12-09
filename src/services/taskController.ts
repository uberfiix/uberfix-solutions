// Bottom Bar Task Controller for UberFix
// Manages background tasks based on active tab

import { locationService } from './location.service';
import { techniciansService } from './technicians.service';
import { requestsService } from './requests.service';
import { invoicesService } from './invoices.service';
import { catalogService } from './catalog.service';
import { profileService } from './profile.service';
import { realtimeService } from './realtime.service';

type TabId = 'map' | 'quick' | 'track' | 'completed' | 'invoices' | 'profile';

interface TaskState {
  isRunning: boolean;
  cleanup: (() => void) | null;
}

class BottomBarTaskController {
  private currentTab: TabId | null = null;
  private tasks: Map<TabId, TaskState> = new Map();
  private debounceTimer: ReturnType<typeof setTimeout> | null = null;
  private readonly DEBOUNCE_MS = 300;
  private userId: string | null = null;

  setUserId(userId: string | null): void {
    this.userId = userId;
  }

  async switchTab(newTab: TabId): Promise<void> {
    // Debounce rapid tab switches
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }

    this.debounceTimer = setTimeout(async () => {
      if (this.currentTab === newTab) return;

      // Stop tasks for previous tab
      if (this.currentTab) {
        this.stopTabTasks(this.currentTab);
      }

      // Start tasks for new tab
      this.currentTab = newTab;
      await this.startTabTasks(newTab);
    }, this.DEBOUNCE_MS);
  }

  private async startTabTasks(tab: TabId): Promise<void> {
    // Prevent duplicate task starts
    if (this.tasks.get(tab)?.isRunning) return;

    const cleanupFns: (() => void)[] = [];

    switch (tab) {
      case 'map':
        await this.startMapTasks(cleanupFns);
        break;
      case 'track':
        await this.startTrackingTasks(cleanupFns);
        break;
      case 'quick':
        await this.startQuickRequestTasks(cleanupFns);
        break;
      case 'completed':
        await this.startCompletedTasks(cleanupFns);
        break;
      case 'invoices':
        await this.startInvoicesTasks(cleanupFns);
        break;
      case 'profile':
        await this.startProfileTasks(cleanupFns);
        break;
    }

    this.tasks.set(tab, {
      isRunning: true,
      cleanup: () => cleanupFns.forEach((fn) => fn()),
    });
  }

  private stopTabTasks(tab: TabId): void {
    const taskState = this.tasks.get(tab);
    if (taskState?.cleanup) {
      taskState.cleanup();
    }
    this.tasks.set(tab, { isRunning: false, cleanup: null });
  }

  // Map Tab Tasks
  private async startMapTasks(cleanupFns: (() => void)[]): Promise<void> {
    console.log('[TaskController] Starting map tasks');

    // 1. Start location watching
    locationService.startWatching();
    cleanupFns.push(() => locationService.stopWatching());

    // 2. Subscribe to nearby technicians (realtime)
    const unsubTechnicians = realtimeService.subscribeToTechnicians((payload) => {
      console.log('[TaskController] Technician update:', payload);
      techniciansService.invalidateCache();
    });
    cleanupFns.push(unsubTechnicians);

    // 3. Prefetch technician icons
    techniciansService.prefetchTechnicianIcons();

    // 4. Initial fetch of nearby technicians
    await techniciansService.fetchNearbyTechnicians();
  }

  // Order Tracking Tab Tasks
  private async startTrackingTasks(cleanupFns: (() => void)[]): Promise<void> {
    console.log('[TaskController] Starting tracking tasks');

    if (!this.userId) return;

    // 1. Prefetch active requests
    await requestsService.fetchActiveRequests(this.userId);

    // 2. Subscribe to order status updates
    const unsubOrders = realtimeService.subscribeToUserOrders(
      this.userId,
      (payload) => {
        console.log('[TaskController] Order update:', payload);
        if (this.userId) {
          requestsService.invalidateCache(this.userId);
        }
      }
    );
    cleanupFns.push(unsubOrders);
  }

  // Quick Request Tab Tasks
  private async startQuickRequestTasks(cleanupFns: (() => void)[]): Promise<void> {
    console.log('[TaskController] Starting quick request tasks');

    // 1. Warmup create request flow
    requestsService.prefetchForQuickRequest();

    // 2. Prefetch catalog for service selection
    catalogService.prefetchCatalog();

    // 3. Get current location for address suggestion
    await locationService.requestCurrentPosition();
  }

  // Completed Services Tab Tasks
  private async startCompletedTasks(cleanupFns: (() => void)[]): Promise<void> {
    console.log('[TaskController] Starting completed services tasks');

    // Prefetch service catalog for reference
    await catalogService.fetchCatalog();
  }

  // Invoices Tab Tasks
  private async startInvoicesTasks(cleanupFns: (() => void)[]): Promise<void> {
    console.log('[TaskController] Starting invoices tasks');

    if (!this.userId) return;

    // Prefetch invoices summary only (not heavy details)
    await invoicesService.fetchInvoicesSummary(this.userId);
  }

  // Profile Tab Tasks
  private async startProfileTasks(cleanupFns: (() => void)[]): Promise<void> {
    console.log('[TaskController] Starting profile tasks');

    if (!this.userId) return;

    // 1. Prefetch user profile
    await profileService.fetchUserProfile(this.userId);

    // 2. Prefetch user addresses
    await profileService.fetchUserAddresses();
  }

  // Cleanup all tasks
  cleanup(): void {
    if (this.debounceTimer) {
      clearTimeout(this.debounceTimer);
    }
    
    for (const tab of this.tasks.keys()) {
      this.stopTabTasks(tab);
    }
    
    realtimeService.unsubscribeAll();
    locationService.stopWatching();
  }

  getCurrentTab(): TabId | null {
    return this.currentTab;
  }
}

export const taskController = new BottomBarTaskController();
export type { TabId };
export default taskController;
