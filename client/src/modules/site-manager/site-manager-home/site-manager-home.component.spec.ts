import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SiteManagerHomeComponent } from './site-manager-home.component';

describe('SiteManagerHomeComponent', () => {
    let component: SiteManagerHomeComponent;
    let fixture: ComponentFixture<SiteManagerHomeComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [SiteManagerHomeComponent],
        }).compileComponents();

        fixture = TestBed.createComponent(SiteManagerHomeComponent);
        component = fixture.componentInstance;
        await fixture.whenStable();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
