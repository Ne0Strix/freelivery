import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    signal,
} from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthenticationService } from '../../commons/services/authentication.service';

@Component({
    selector: 'app-navbar',
    imports: [RouterLink, RouterLinkActive],
    templateUrl: './navbar.component.html',
    styleUrl: './navbar.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class NavbarComponent {
    private authService = inject(AuthenticationService);
    private router = inject(Router);

    isLoggedIn = this.authService.isLoggedIn;
    isAdmin = computed(() => this.authService.hasAnyRole(['admin']));
    isRestaurantOwner = computed(() =>
        this.authService.hasAnyRole(['restaurant_owner'])
    );
    isCustomer = computed(() => this.authService.hasAnyRole(['customer']));
    menuOpen = signal(false);

    toggleMenu(): void {
        this.menuOpen.update((open) => !open);
    }

    closeMenu(): void {
        this.menuOpen.set(false);
    }

    signOut(): void {
        this.authService.logout();
        this.router.navigate(['/']);
    }
}
