import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthenticationService } from '../../core/services/authentication.service';

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

    signOut(): void {
        this.authService.logout();
        this.router.navigate(['/']);
    }
}
