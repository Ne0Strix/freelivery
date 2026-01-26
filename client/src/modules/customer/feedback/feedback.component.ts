import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-feedback',
    standalone: true,
    imports: [CommonModule, FormsModule],
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

    constructor(private router: Router) {}

    get ratingMessage(): string {
        return this.ratingValues[this.ratingSelected];
    }

    setRating(rating: number): void {
        this.ratingSelected = rating;
    }

    submitFeedback(): void {
        if (this.ratingSelected === 0) return;

        console.log('Feedback:', {
            rating: this.ratingSelected,
            comment: this.comment,
        });

        this.message = 'Thank you for the feedback!';
        this.ratingSelected = 0;
        this.comment = '';
    }
    goBack(): void {
        this.router.navigate(['/customer/track', '1234']);
    }
}
