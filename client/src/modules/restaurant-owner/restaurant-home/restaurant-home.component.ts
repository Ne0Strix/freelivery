import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-restaurant-home',
    imports: [RouterLink, MatCardModule, MatButtonModule],
    templateUrl: './restaurant-home.component.html',
    styleUrl: './restaurant-home.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RestaurantHomeComponent {}
