import {
    ChangeDetectionStrategy,
    Component,
    inject,
    OnInit,
    signal,
} from '@angular/core';
import { SiteManagerService } from '../site-manager.service';
import {
    ActiveRestaurant,
    DashboardStatistics,
    PendingRestaurant,
} from '../site-manager.models';

@Component({
    selector: 'app-site-manager-home',
    imports: [],
    templateUrl: './site-manager-home.component.html',
    styleUrl: './site-manager-home.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteManagerHomeComponent implements OnInit {
    private siteManagerService = inject(SiteManagerService);

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
                this.siteManagerService.getActiveRestaurants(),
                this.siteManagerService.getPendingRestaurants(),
            ]);

        this.statistics.set(statistics);
        this.activeRestaurants.set(activeRestaurants);
        this.pendingRestaurants.set(pendingRestaurants);
        this.loading.set(false);
    }
}
