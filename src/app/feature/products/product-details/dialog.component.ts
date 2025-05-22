import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Product } from '../../../shared/models/productModel';
import { MatTabsModule } from '@angular/material/tabs';
import { RouterModule } from '@angular/router';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-product-details-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.scss'],
  standalone: true,
  imports: [MatTabsModule, MatDialogModule, RouterModule, MatIconModule],
})
export class ProductDetailsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: { product: Product }) {}
}

