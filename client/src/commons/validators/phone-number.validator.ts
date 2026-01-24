import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Phone number pattern:
 * Sourced from [regex101](https://regex101.com/r/wZ4uU6/1)
 *
 */
const PHONE_PATTERN =
    /^\+?\d{1,4}?[-.\s]?\(?\d{1,3}?\)?[-.\s]?\d{1,4}[-.\s]?\d{1,4}[-.\s]?\d{1,9}$/;

/**
 * Validator for phone numbers.
 * Returns `null` if valid or empty, otherwise returns `{ phoneNumber: true }`
 */
export function phoneNumberValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
        const value = control.value;

        // Allow empty values (use Validators.required separately if needed)
        if (!value) {
            return null;
        }

        const isValid = PHONE_PATTERN.test(value);
        return isValid ? null : { phoneNumber: true };
    };
}
