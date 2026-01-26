import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
    selector: 'app-feedback',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCardModule,
        MatFormFieldModule,
        MatInputModule,
    ],
    templateUrl: './feedback.component.html',
    styleUrls: ['./feedback.component.css'],
})
export class FeedbackComponent {
    ratingSelected: number = 0;
    comment: string = '';
    message: string = '';

    ratingValues = [
        'Select rating',
        'Poor',
        'Fair',
        'Good',
        'Very Good',
        'Excellent',
    ];

    constructor(
        private router: Router,
        private snackBar: MatSnackBar
    ) {}

    get ratingMessage(): string {
        return this.ratingValues[this.ratingSelected];
    }

    setRating(rating: number): void {
        this.ratingSelected = rating;
    }

    submitFeedback(): void {
        if (this.ratingSelected === 0) {
            this.snackBar.open('Select a rating', 'Close', { duration: 3000 });
            return;
        }

        console.log('Feedback:', {
            rating: this.ratingSelected,
            comment: this.comment,
        });

        this.snackBar.open('Thank you for the feedback!', 'Close', {
            duration: 3000,
        });
        this.message = 'Thank you for the feedback!';

        this.ratingSelected = 0;
        this.comment = '';
    }
    goBack(): void {
        this.router.navigate(['/customer/tracking']);
    }
}
