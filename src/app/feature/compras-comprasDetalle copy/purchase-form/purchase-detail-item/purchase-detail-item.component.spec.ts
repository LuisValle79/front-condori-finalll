import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PurchaseDetailItemComponent } from './purchase-detail-item.component';

describe('PurchaseDetailItemComponent', () => {
  let component: PurchaseDetailItemComponent;
  let fixture: ComponentFixture<PurchaseDetailItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PurchaseDetailItemComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PurchaseDetailItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
