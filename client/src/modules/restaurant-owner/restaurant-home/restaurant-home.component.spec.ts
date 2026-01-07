import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RestaurantHomeComponent } from './restaurant-home.component';

describe('RestaurantHomeComponent', () => {
    let component: RestaurantHomeComponent;
    let fixture: ComponentFixture<RestaurantHomeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RestaurantHomeComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(RestaurantHomeComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
