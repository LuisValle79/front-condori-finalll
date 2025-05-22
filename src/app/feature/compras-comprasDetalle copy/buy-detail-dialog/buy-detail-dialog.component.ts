import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Detail } from '../../../shared/models/BuyDetailModel';
import { MatTableModule } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { BuyDetailService } from '../../../core/service/Cdetail.service';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-buy-detail-dialog',
  templateUrl: './buy-detail-dialog.component.html',
  styleUrls: ['./buy-detail-dialog.component.scss'],
  standalone: true,
  imports: [
    MatTableModule,
    CommonModule,
    MatDialogModule
  ]
})
export class BuyDetailDialogComponent {
  displayedColumns: string[] = ['product', 'quantity', 'unitPrice', 'total'];
  details: any[] = [];

  constructor(
    public dialogRef: MatDialogRef<BuyDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { buyId: number }
  ) {}

  ngOnInit(): void {
    if (this.data && Array.isArray(this.data)) {
      this.details = this.data;
    }
  }
}