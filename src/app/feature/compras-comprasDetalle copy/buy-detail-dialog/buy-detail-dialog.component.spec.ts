import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyDetailDialogComponent } from './buy-detail-dialog.component';

describe('BuyDetailDialogComponent', () => {
  let component: BuyDetailDialogComponent;
  let fixture: ComponentFixture<BuyDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuyDetailDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuyDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
