import { CommonModule } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    inject,
    OnInit,
    signal,
} from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import {
    MatDialog,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { Router, RouterLink } from '@angular/router';
import { Restaurant } from '../customer.model';
import { CustomerService } from '../customer.service';

@Component({
    selector: 'app-no-order-dialog',
    standalone: true,
    imports: [CommonModule, MatDialogModule, MatButtonModule],
    template: `
        <div class="dialog-container">
            <h2 mat-dialog-title>No Active Order</h2>
            <mat-dialog-content>
                <p>
                    There are no active orders to track. Please, place an order
                    to track first!
                </p>
            </mat-dialog-content>
            <mat-dialog-actions align="end">
                <button mat-button (click)="onCancel()">Cancel</button>
                <button
                    mat-raised-button
                    color="primary"
                    (click)="onPlaceOrder()"
                >
                    Place an Order
                </button>
            </mat-dialog-actions>
        </div>
    `,
    styles: [
        `
            .dialog-container {
                padding: 20px;
                min-width: 350px;
            }

            .dialog-container h2 {
                font-weight: 600;
                font-size: 1.1rem;
            }
            .mat-dialog-container {
                padding: 20px;
            }
            mat-dialog-content p {
                margin-bottom: 10px;
            }

            mat-dialog-actions {
                padding-top: 20px;
                gap: 10px;
            }

            mat-dialog-actions button {
                border: 2px solid;
                border-radius: 8px;
                padding: 8px;
                font-weight: 600;
            }

            mat-dialog-actions button:hover {
                background: lightgray;
            }
        `,
    ],
})
export class NoOrderDialogComponent {
    constructor(private dialogRef: MatDialogRef<NoOrderDialogComponent>) {}

    onCancel(): void {
        this.dialogRef.close(false);
    }

    onPlaceOrder(): void {
        this.dialogRef.close(true);
    }
}
@Component({
    selector: 'app-customer-home',
    standalone: true,
    imports: [
        RouterLink,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatIconModule,
        MatDialogModule,
    ],
    templateUrl: './customer-home.component.html',
    styleUrl: './customer-home.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CustomerHomeComponent implements OnInit {
    private customerService = inject(CustomerService);
    private router = inject(Router);
    private dialog = inject(MatDialog);

    restaurants = signal<Restaurant[]>([]);
    filteredRestaurants = signal<Restaurant[]>([]);
    loading = signal(true);
    searchTerm = signal('');
    selectedCuisine = signal<string>('all');

    ngOnInit(): void {
        this.loadRestaurants();
    }

    private async loadRestaurants(): Promise<void> {
        this.loading.set(true);
        try {
            const restaurants = await this.customerService.getRestaurants();
            this.restaurants.set(restaurants);
            this.filteredRestaurants.set(restaurants);
        } catch (error) {
            console.error('Failed to load restaurants', error);
        } finally {
            this.loading.set(false);
        }
    }

    filterRestaurants(): void {
        let filtered = this.restaurants();

        if (this.selectedCuisine() !== 'all') {
            filtered = filtered.filter(
                (r) => r.cuisineType == this.selectedCuisine()
            );
        }

        const search = this.searchTerm().toLowerCase();
        if (search) {
            filtered = filtered.filter((r) =>
                r.name.toLowerCase().includes(search)
            );
        }

        this.filteredRestaurants.set(filtered);
    }

    onSearchChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        this.searchTerm.set(input.value);
        this.filterRestaurants();
    }

    onCuisineChange(event: MatSelectChange): void {
        this.selectedCuisine.set(event.value);
        this.filterRestaurants();
    }

    getCuisineTypes(): string[] {
        const cuisines = new Set(this.restaurants().map((r) => r.cuisineType));
        return Array.from(cuisines);
    }

    navigateToTracking(): void {
        const orderId = Object.keys(localStorage).filter((key) =>
            key.startsWith('order_')
        );

        if (orderId.length === 0) {
            const dialogRef = this.dialog.open(NoOrderDialogComponent, {
                width: '450px',
                disableClose: false,
                panelClass: 'custom-dialog',
            });

            dialogRef.afterClosed().subscribe((result) => {
                if (result === true) {
                    this.router.navigate(['/customer/restaurants']);
                }
            });
            return;
        }

        orderId.sort().reverse();

        const mostRecentOrderId = orderId[0];

        if (mostRecentOrderId) {
            const order = mostRecentOrderId.replace('order_', '');

            console.log('Redirecting to order tracking:', order);
            this.router.navigate(['/customer/tracking', order]);
        }
    }
}
