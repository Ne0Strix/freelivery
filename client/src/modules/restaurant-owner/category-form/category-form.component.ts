import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
    MAT_DIALOG_DATA,
    MatDialogModule,
    MatDialogRef,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Category } from '../../../commons/model/restaurant.model';

export interface CategoryFormData {
    category: Category | null;
}

export interface CategoryFormResult {
    name: string;
    description?: string;
}

@Component({
    selector: 'app-category-form',
    imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
    ],
    templateUrl: './category-form.component.html',
    styleUrl: './category-form.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryFormComponent {
    form: FormGroup;
    isEditMode: boolean;

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<CategoryFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: CategoryFormData
    ) {
        this.isEditMode = !!data.category;
        this.form = this.fb.group({
            name: [
                data.category?.name ?? '',
                [Validators.required, Validators.maxLength(255)],
            ],
            description: [
                data.category?.description ?? '',
                Validators.maxLength(500),
            ],
        });
    }

    onSubmit(): void {
        if (this.form.invalid) return;

        const result: CategoryFormResult = {
            name: this.form.value.name.trim(),
            description: this.form.value.description?.trim() || undefined,
        };

        this.dialogRef.close(result);
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
