import {
    ChangeDetectionStrategy,
    Component,
    Inject,
    signal,
} from '@angular/core';
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
import { MatSelectModule } from '@angular/material/select';
import { Category, Dish } from '../../../commons/model/restaurant.model';

export interface DishFormData {
    dish: Dish | null;
    categories: Category[];
}

export interface DishFormResult {
    categoryId: number;
    name: string;
    description?: string;
    price: number;
    photo?: File;
    removeImage?: boolean;
}

@Component({
    selector: 'app-dish-form',
    imports: [
        ReactiveFormsModule,
        MatDialogModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule,
        MatButtonModule,
    ],
    templateUrl: './dish-form.component.html',
    styleUrl: './dish-form.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DishFormComponent {
    form: FormGroup;
    isEditMode: boolean;
    categories: Category[];

    // Image preview
    imagePreview = signal<string | null>(null);
    selectedFile = signal<File | null>(null);
    removeExistingImage = signal(false);

    readonly placeholderImage =
        'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23e0e0e0" width="100" height="100"/%3E%3Ctext x="50" y="55" text-anchor="middle" fill="%239e9e9e" font-size="12"%3ENo Image%3C/text%3E%3C/svg%3E';

    constructor(
        private fb: FormBuilder,
        private dialogRef: MatDialogRef<DishFormComponent>,
        @Inject(MAT_DIALOG_DATA) public data: DishFormData
    ) {
        this.isEditMode = !!data.dish;
        this.categories = data.categories;

        // Set initial image preview if editing
        if (data.dish?.imageUrl) {
            this.imagePreview.set(data.dish.imageUrl);
        }

        this.form = this.fb.group({
            categoryId: [data.dish?.categoryId ?? '', Validators.required],
            name: [
                data.dish?.name ?? '',
                [Validators.required, Validators.maxLength(255)],
            ],
            description: [
                data.dish?.description ?? '',
                Validators.maxLength(500),
            ],
            price: [
                data.dish?.price ?? '',
                [Validators.required, Validators.min(0)],
            ],
        });
    }

    onFileSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files && input.files[0]) {
            const file = input.files[0];

            // Validate file type
            if (
                !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
            ) {
                return;
            }

            // Validate file size (5MB)
            if (file.size > 5 * 1024 * 1024) {
                return;
            }

            this.selectedFile.set(file);
            this.removeExistingImage.set(false);

            // Create preview
            const reader = new FileReader();
            reader.onload = () => {
                this.imagePreview.set(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    onRemoveImage(): void {
        this.selectedFile.set(null);
        this.imagePreview.set(null);
        this.removeExistingImage.set(true);
    }

    onSubmit(): void {
        if (this.form.invalid) return;

        const result: DishFormResult = {
            categoryId: this.form.value.categoryId,
            name: this.form.value.name.trim(),
            description: this.form.value.description?.trim() || undefined,
            price: Number(this.form.value.price),
        };

        const file = this.selectedFile();
        if (file) {
            result.photo = file;
        }

        if (this.removeExistingImage() && this.isEditMode) {
            result.removeImage = true;
        }

        this.dialogRef.close(result);
    }

    onCancel(): void {
        this.dialogRef.close();
    }
}
