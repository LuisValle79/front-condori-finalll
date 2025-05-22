import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseDetailFormComponent } from './purchase-detail-form.component';

describe('PurchaseDetailFormComponent', () => {
  let component: PurchaseDetailFormComponent;
  let fixture: ComponentFixture<PurchaseDetailFormComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseDetailFormComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseDetailFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
