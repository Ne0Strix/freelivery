import {
    ChangeDetectionStrategy,
    Component,
    inject,
    OnInit,
    signal,
} from '@angular/core';
import { ActiveRestaurant } from '../../../commons/model/restaurant.model';
import { RestaurantService } from '../../../commons/services/restaurant.service';
import { DashboardStatistics, PendingRestaurant } from '../site-manager.models';
import { SiteManagerService } from '../site-manager.service';

@Component({
    selector: 'app-site-manager-home',
    imports: [],
    templateUrl: './site-manager-home.component.html',
    styleUrl: './site-manager-home.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteManagerHomeComponent implements OnInit {
    private siteManagerService = inject(SiteManagerService);
    private restaurantService = inject(RestaurantService);

    activeTab = signal<'restaurants' | 'pending'>('restaurants');
    statistics = signal<DashboardStatistics | null>(null);
    activeRestaurants = signal<ActiveRestaurant[]>([]);
    pendingRestaurants = signal<PendingRestaurant[]>([]);
    loading = signal(true);

    ngOnInit(): void {
        this.loadData();
    }

    setActiveTab(tab: 'restaurants' | 'pending'): void {
        this.activeTab.set(tab);
    }

    private async loadData(): Promise<void> {
        this.loading.set(true);

        const [statistics, activeRestaurants, pendingRestaurants] =
            await Promise.all([
                this.siteManagerService.getStatistics(),
                this.restaurantService.getActiveRestaurants(),
                this.siteManagerService.getPendingRestaurants(),
            ]);

        this.statistics.set(statistics);
        this.activeRestaurants.set(activeRestaurants);
        this.pendingRestaurants.set(pendingRestaurants);
        this.loading.set(false);
    }

    async approveRestaurant(restaurantId: number): Promise<void> {
        await this.siteManagerService.approveRestaurant(restaurantId);
        await this.loadData();
    }

    async rejectRestaurant(restaurantId: number): Promise<void> {
        await this.siteManagerService.rejectRestaurant(restaurantId);
        await this.loadData();
    }
}
