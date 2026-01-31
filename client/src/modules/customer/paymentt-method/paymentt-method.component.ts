import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatRadioModule } from '@angular/material/radio';

export interface PaymentMethodOption {
    id: string;
    name: string;
    icon: string;
    description: string;
}

@Component({
    selector: 'app-paymentt-method',
    standalone: true,
    imports: [
        CommonModule,
        FormsModule,
        MatButtonModule,
        MatCardModule,
        MatIconModule,
        MatRadioModule,
    ],
    templateUrl: './paymentt-method.component.html',
    styleUrls: ['./paymentt-method.component.css'],
})
export class PaymentMethodComponent {
    @Input() selectedMethod: string = 'card';
    @Output() methodChange = new EventEmitter<string>();

    paymentMethods: PaymentMethodOption[] = [
        {
            id: 'card',
            name: 'Credit/Debit Card',
            icon: 'fa-solid fa-credit-card',
            description: 'Pay with credit card',
        },
        {
            id: 'cash',
            name: 'Cash on Delivery',
            icon: 'fa-solid fa-money-bill',
            description: 'Pay with cash when the delivery driver arrives',
        },
    ];

    selectPaymentMethod(methodId: string): void {
        this.selectedMethod = methodId;
        this.methodChange.emit(methodId);
    }
}
