import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from '../layout/navbar/navbar.component';

@Component({
    selector: 'app-root',
    imports: [RouterOutlet, NavbarComponent],

    templateUrl: './app.html',
    styleUrl: './app.css',
})
export class App implements OnInit {
    protected readonly title = signal('freelivery');
    protected readonly testMessage = signal<string>('');
    private http = inject(HttpClient);

    ngOnInit(): void {
        // Call the /api/test endpoint using promise chaining
        const promise = new Promise<{
            message: string;
            timestamp: string;
            environment: string;
        }>((resolve, reject) => {
            this.http
                .get<{
                    message: string;
                    timestamp: string;
                    environment: string;
                }>('http://localhost:3000/api/test')
                .subscribe({
                    next: (response) => resolve(response),
                    error: (error) => reject(error),
                });
        });

        promise
            .then((response) => {
                this.testMessage.set(response.message);
                console.log('Test endpoint response:', response);
            })
            .catch((error) => {
                console.error('Error fetching from test endpoint:', error);
                this.testMessage.set('Error connecting to server');
            });
    }

    testMethod(): string {
        return 'some streuiaeing';
    }
}
