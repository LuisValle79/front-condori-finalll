import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule } from '@angular/material/dialog';
import { SaleDetail } from '../../../shared/models/saleDetailModel';

@Component({
  selector: 'app-sale-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatDialogModule
  ],
  template: `
    <h2 mat-dialog-title>Detalles de la Venta</h2>
    
    <mat-dialog-content>
      <table mat-table [dataSource]="details">
        <ng-container matColumnDef="product">
          <th mat-header-cell *matHeaderCellDef> Producto </th>
          <td mat-cell *matCellDef="let detail"> {{detail.product?.comercialName || 'N/A'}} </td>
        </ng-container>

        <ng-container matColumnDef="quantity">
          <th mat-header-cell *matHeaderCellDef> Cantidad </th>
          <td mat-cell *matCellDef="let detail"> {{detail.quantity}} </td>
        </ng-container>

        <ng-container matColumnDef="salePrice">
          <th mat-header-cell *matHeaderCellDef> Precio Unitario </th>
          <td mat-cell *matCellDef="let detail"> {{detail.salePrice | currency:'PEN':'S/.'}} </td>
        </ng-container>

        <ng-container matColumnDef="amountDetail">
          <th mat-header-cell *matHeaderCellDef> Subtotal </th>
          <td mat-cell *matCellDef="let detail"> {{detail.amountDetail | currency:'PEN':'S/.'}} </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </mat-dialog-content>
    
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cerrar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    table {
      width: 100%;
    }
    .mat-column-product {
      flex: 2;
    }
    .mat-column-quantity,
    .mat-column-salePrice,
    .mat-column-amountDetail {
      flex: 1;
    }
  `]
})
export class SaleDetailDialogComponent {
  displayedColumns: string[] = ['product', 'quantity', 'salePrice', 'amountDetail'];
  details: SaleDetail[] = [];

  constructor(
    public dialogRef: MatDialogRef<SaleDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SaleDetail[]
  ) {
    if (data && Array.isArray(data)) {
      this.details = data;
    }
    console.log(this.details);
  }
}