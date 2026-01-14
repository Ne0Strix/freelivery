import { DatePipe } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    OnInit,
    signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatChipsModule } from '@angular/material/chips';
import { ActiveRestaurant } from '../../../commons/model/restaurant.model';
import { RoleLabelPipe } from '../../../commons/pipes/role-label.pipe';
import { AuthenticationService } from '../../../commons/services/authentication.service';
import { RestaurantService } from '../../../commons/services/restaurant.service';
import {
    DashboardStatistics,
    PendingRestaurant,
    UserListItem,
} from '../site-manager.models';
import { SiteManagerService } from '../site-manager.service';

@Component({
    selector: 'app-site-manager-home',
    imports: [DatePipe, FormsModule, MatChipsModule, RoleLabelPipe],
    templateUrl: './site-manager-home.component.html',
    styleUrl: './site-manager-home.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class SiteManagerHomeComponent implements OnInit {
    private siteManagerService = inject(SiteManagerService);
    private restaurantService = inject(RestaurantService);
    private authService = inject(AuthenticationService);

    activeTab = signal<'restaurants' | 'pending' | 'users'>('restaurants');
    statistics = signal<DashboardStatistics | null>(null);
    activeRestaurants = signal<ActiveRestaurant[]>([]);
    pendingRestaurants = signal<PendingRestaurant[]>([]);
    users = signal<UserListItem[]>([]);
    userFilter = signal('');
    loading = signal(true);

    currentUserId = computed(() => this.authService.userId());

    filteredUsers = computed(() => {
        const filter = this.userFilter().toLowerCase();
        if (!filter) return this.users();
        return this.users().filter(
            (user) =>
                user.username.toLowerCase().includes(filter) ||
                user.email.toLowerCase().includes(filter)
        );
    });

    ngOnInit(): void {
        this.loadData();
    }

    setActiveTab(tab: 'restaurants' | 'pending' | 'users'): void {
        this.activeTab.set(tab);
    }

    onUserFilterChange(value: string): void {
        this.userFilter.set(value);
    }

    private async loadData(): Promise<void> {
        this.loading.set(true);

        const [statistics, activeRestaurants, pendingRestaurants, users] =
            await Promise.all([
                this.siteManagerService.getStatistics(),
                this.restaurantService.getActiveRestaurants(),
                this.siteManagerService.getPendingRestaurants(),
                this.siteManagerService.getUsers(),
            ]);

        this.statistics.set(statistics);
        this.activeRestaurants.set(activeRestaurants);
        this.pendingRestaurants.set(pendingRestaurants);
        this.users.set(users);
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

    async toggleUserStatus(user: UserListItem): Promise<void> {
        await this.siteManagerService.updateUser(user.user_id, {
            isActive: !user.is_active,
        });
        await this.loadData();
    }
}
