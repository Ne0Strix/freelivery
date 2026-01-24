import { NgTemplateOutlet } from '@angular/common';
import {
    ChangeDetectionStrategy,
    Component,
    computed,
    inject,
    OnInit,
    signal,
} from '@angular/core';
import {
    FormBuilder,
    FormGroup,
    ReactiveFormsModule,
    Validators,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import {
    OpeningHours,
    RestaurantOwnerService,
} from '../restaurant-owner.service';

const WEEKDAYS = [
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
    'Sunday',
];

interface SlotsByDay {
    dayOfWeek: number;
    dayName: string;
    slots: OpeningHours[];
}

@Component({
    selector: 'app-opening-hours-management',
    imports: [
        NgTemplateOutlet,
        ReactiveFormsModule,
        RouterModule,
        MatButtonModule,
        MatExpansionModule,
        MatFormFieldModule,
        MatInputModule,
        MatSnackBarModule,
        MatTabsModule,
    ],
    templateUrl: './opening-hours-management.component.html',
    styleUrl: './opening-hours-management.component.css',
    changeDetection: ChangeDetectionStrategy.OnPush,
})
export class OpeningHoursManagementComponent implements OnInit {
    private ownerService = inject(RestaurantOwnerService);
    private snackBar = inject(MatSnackBar);
    private fb = inject(FormBuilder);

    loading = signal(true);
    openingHours = signal<OpeningHours[]>([]);

    // Track which day has an active add/edit form
    editingSlotId = signal<number | null>(null);
    addingForDay = signal<number | null>(null);

    slotForm: FormGroup;

    // Group slots by day
    slotsByDay = computed<SlotsByDay[]>(() => {
        const allSlots = this.openingHours();
        return WEEKDAYS.map((dayName, index) => ({
            dayOfWeek: index,
            dayName,
            slots: allSlots
                .filter((s) => s.dayOfWeek === index)
                .sort((a, b) => a.openTime.localeCompare(b.openTime)),
        }));
    });

    constructor() {
        this.slotForm = this.fb.group({
            openTime: ['09:00', Validators.required],
            closeTime: ['17:00', Validators.required],
        });
    }

    ngOnInit(): void {
        this.loadData();
    }

    private async loadData(): Promise<void> {
        this.loading.set(true);
        try {
            const data = await this.ownerService.getOpeningHours();
            this.openingHours.set(data);
        } catch (error) {
            console.error('Failed to load opening hours', error);
        } finally {
            this.loading.set(false);
        }
    }

    // =====================
    // Add Slot
    // =====================

    startAddSlot(dayOfWeek: number): void {
        this.editingSlotId.set(null);
        this.addingForDay.set(dayOfWeek);
        this.slotForm.reset({ openTime: '09:00', closeTime: '17:00' });
    }

    cancelAdd(): void {
        this.addingForDay.set(null);
    }

    async saveNewSlot(dayOfWeek: number): Promise<void> {
        if (this.slotForm.invalid) return;

        const { openTime, closeTime } = this.slotForm.value;

        if (!this.validateTimeRange(openTime, closeTime)) {
            this.snackBar.open('Open time must be before close time', 'Close', {
                duration: 3000,
            });
            return;
        }

        if (this.hasOverlap(dayOfWeek, openTime, closeTime)) {
            this.snackBar.open(
                'Time slot overlaps with existing slot',
                'Close',
                {
                    duration: 3000,
                }
            );
            return;
        }

        try {
            const created = await this.ownerService.createOpeningHours({
                dayOfWeek,
                openTime,
                closeTime,
            });
            this.openingHours.update((slots) => [...slots, created]);
            this.addingForDay.set(null);
            this.snackBar.open('Opening hours added', 'Close', {
                duration: 3000,
            });
        } catch (error) {
            console.error('Failed to create opening hours', error);
        }
    }

    // =====================
    // Edit Slot
    // =====================

    startEditSlot(slot: OpeningHours): void {
        this.addingForDay.set(null);
        this.editingSlotId.set(slot.openingHoursId);
        this.slotForm.setValue({
            openTime: slot.openTime.substring(0, 5),
            closeTime: slot.closeTime.substring(0, 5),
        });
    }

    cancelEdit(): void {
        this.editingSlotId.set(null);
    }

    async saveEditedSlot(slot: OpeningHours): Promise<void> {
        if (this.slotForm.invalid) return;

        const { openTime, closeTime } = this.slotForm.value;

        if (!this.validateTimeRange(openTime, closeTime)) {
            this.snackBar.open('Open time must be before close time', 'Close', {
                duration: 3000,
            });
            return;
        }

        if (
            this.hasOverlap(
                slot.dayOfWeek,
                openTime,
                closeTime,
                slot.openingHoursId
            )
        ) {
            this.snackBar.open(
                'Time slot overlaps with existing slot',
                'Close',
                {
                    duration: 3000,
                }
            );
            return;
        }

        try {
            const updated = await this.ownerService.updateOpeningHours(
                slot.openingHoursId,
                { openTime, closeTime }
            );
            this.openingHours.update((slots) =>
                slots.map((s) =>
                    s.openingHoursId === updated.openingHoursId ? updated : s
                )
            );
            this.editingSlotId.set(null);
            this.snackBar.open('Opening hours updated', 'Close', {
                duration: 3000,
            });
        } catch (error) {
            console.error('Failed to update opening hours', error);
        }
    }

    // =====================
    // Delete Slot
    // =====================

    async deleteSlot(slot: OpeningHours): Promise<void> {
        if (
            !confirm(
                `Delete this time slot (${slot.openTime} - ${slot.closeTime})?`
            )
        ) {
            return;
        }

        try {
            await this.ownerService.deleteOpeningHours(slot.openingHoursId);
            this.openingHours.update((slots) =>
                slots.filter((s) => s.openingHoursId !== slot.openingHoursId)
            );
            this.snackBar.open('Opening hours deleted', 'Close', {
                duration: 3000,
            });
        } catch (error) {
            console.error('Failed to delete opening hours', error);
        }
    }

    // =====================
    // Validation Helpers
    // =====================

    private validateTimeRange(openTime: string, closeTime: string): boolean {
        return openTime < closeTime;
    }

    private hasOverlap(
        dayOfWeek: number,
        openTime: string,
        closeTime: string,
        excludeId?: number
    ): boolean {
        const existingSlots = this.openingHours().filter(
            (s) => s.dayOfWeek === dayOfWeek && s.openingHoursId !== excludeId
        );

        for (const slot of existingSlots) {
            const existingOpen = slot.openTime.substring(0, 5);
            const existingClose = slot.closeTime.substring(0, 5);

            if (openTime < existingClose && existingOpen < closeTime) {
                return true;
            }
        }

        return false;
    }

    formatTime(time: string): string {
        return time.substring(0, 5);
    }
}
