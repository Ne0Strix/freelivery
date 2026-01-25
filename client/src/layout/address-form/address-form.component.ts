import {
    ChangeDetectionStrategy,
    Component,
    EventEmitter,
    Input,
    OnInit,
    Output,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {
    Address,
    CreateAddress,
    GRID_MAX,
    GRID_MIN,
} from '../../commons/services/address.service';

@Component({
    selector: 'app-address-form',
    imports: [
        ReactiveFormsModule,
        MatButtonModule,
        MatFormFieldModule,
        MatInputModule,
    ],
    templateUrl: './address-form.component.html',
    styleUrl: './address-form.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AddressFormComponent implements OnInit {
    /** Existing address to edit (null for creating new) */
    @Input() address: Address | null = null;

    /** Whether to show the label field (customers need it, restaurant doesn't) */
    @Input() showLabel = true;

    /** Emits when user saves the form */
    @Output() save = new EventEmitter<CreateAddress>();

    /** Emits when user cancels */
    @Output() cancel = new EventEmitter<void>();

    form!: FormGroup;

    readonly GRID_MIN = GRID_MIN;
    readonly GRID_MAX = GRID_MAX;

    constructor(private fb: FormBuilder) {}

    ngOnInit() {
        this.form = this.fb.group({
            label: [this.address?.label ?? ''],
            streetName: [this.address?.streetName ?? '', Validators.required],
            houseNumber: [this.address?.houseNumber ?? '', Validators.required],
            additionalInfo: [this.address?.additionalInfo ?? ''],
            cityName: [this.address?.cityName ?? '', Validators.required],
            zipCode: [this.address?.zipCode ?? '', Validators.required],
            country: [this.address?.country ?? 'Austria', Validators.required],
            gridX: [
                this.address?.gridX ?? 0,
                [
                    Validators.required,
                    Validators.min(GRID_MIN),
                    Validators.max(GRID_MAX),
                ],
            ],
            gridY: [
                this.address?.gridY ?? 0,
                [
                    Validators.required,
                    Validators.min(GRID_MIN),
                    Validators.max(GRID_MAX),
                ],
            ],
        });
    }

    onSubmit() {
        if (this.form.invalid) {
            return;
        }

        const formValue = this.form.value;
        const data: CreateAddress = {
            label: formValue.label || undefined,
            streetName: formValue.streetName,
            houseNumber: formValue.houseNumber,
            additionalInfo: formValue.additionalInfo || undefined,
            cityName: formValue.cityName,
            zipCode: formValue.zipCode,
            country: formValue.country,
            gridX: formValue.gridX,
            gridY: formValue.gridY,
        };

        this.save.emit(data);
    }

    onCancel() {
        this.cancel.emit();
    }

    get isEdit(): boolean {
        return this.address !== null;
    }
}
