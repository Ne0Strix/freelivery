import { CommonModule } from '@angular/common';
import { ChangeDetectorRef, Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

@Component({
    selector: 'app-feedback',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCardModule,
        MatSnackBarModule,
        MatFormFieldModule,
        MatInputModule,
        MatIconModule,
    ],
    templateUrl: './feedback.component.html',
    styleUrls: ['./feedback.component.css'],
})
export class FeedbackComponent {
    ratingSelected: number = 0;
    comment: string = '';
    showSuccessMessage: boolean = false;

    ratingEmojis = ['😡', '😣', '🙂', '😃', '🤩'];

    ratingValues = [
        'Select rating',
        'Very Bad',
        'Bad',
        'Good!',
        'Very Good!!',
        'Excellent!!!',
    ];

    ngOnInit() {
        console.log('FeedbackComponent initialized');
    }
    constructor(
        private router: Router,
        private snackBar: MatSnackBar,
        private cdr: ChangeDetectorRef
    ) {}

    getRatingText(): string {
        return this.ratingValues[this.ratingSelected];
    }

    setRating(rating: number): void {
        this.ratingSelected = rating;
    }

    submitFeedback(): void {
        if (this.ratingSelected === 0) {
            this.snackBar.open('Select a rating', 'Close', {
                duration: 3000,
                panelClass: ['snackbar-error'],
            });
            return;
        }
        console.log('Feedback:', {
            rating: this.ratingSelected,
            comment: this.comment,
            timestamp: new Date().toISOString(),
        });

        this.showSuccessMessage = true;

        setTimeout(() => {
            this.resetFeedback();
            this.cdr.detectChanges();
            console.log('Reset everything;', {
                rating: this.ratingSelected,
                comment: this.comment,
                showSuccessMessage: this.showSuccessMessage,
            });
        }, 2500);
    }

    resetFeedback(): void {
        this.ratingSelected = 0;
        this.comment = '';
        this.showSuccessMessage = false;
    }
    goBack(): void {
        this.router.navigate(['/customer']);
    }
}
