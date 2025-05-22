import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Product } from '../../../../shared/models/productModel';
import { Detail } from '../../../../shared/models/BuyDetailModel';
import { ApiService } from '../../../../core/service/product.service';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';

import {
  MatFormFieldModule,
  MatLabel,
  MatError
} from '@angular/material/form-field';
import { MatOption, MatSelectModule } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { CommonModule, NgIf } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-purchase-detail-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatLabel,
    MatError,
    MatOption,
    MatSelectModule,
    MatIcon,
    MatInputModule,
    NgIf,
    CommonModule,
    MatDatepickerModule,
    MatNativeDateModule
  ],
  templateUrl: './purchase-detail-form.component.html',
  styleUrl: './purchase-detail-form.component.css'
})
export class PurchaseDetailFormComponent implements OnInit {
  @Output() detailAdded = new EventEmitter<Detail>();

  products: Product[] = [];
  detailForm: FormGroup;
  selected: any;

  constructor(
    private fb: FormBuilder,
    private ApiService: ApiService
  ) {
    this.detailForm = this.fb.group({
      id: [0],
      productId: ['', Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitPrice: [0, [Validators.required, Validators.min(0.01)]],
      totalDetail: [0],
      batch: [''],
      expireDate: [''],
      presentation: [''],
      healthRecord: [''],
    
    });
  }

  ngOnInit(): void {
    this.loadProducts();

    this.detailForm.valueChanges.subscribe(val => {
      const total = val.quantity * val.unitPrice;
      this.detailForm.patchValue(
        {
          total: total,
          totalDetail: total
        },
        { emitEvent: false }
      );
    });
  }

  loadProducts(): void {
    this.ApiService.getProducts().subscribe({
      next: (data) => {
        this.products = data;
        console.log('Productos cargados:', this.products);
      },
      error: (err) => {
        console.error('Error al cargar productos:', err);
      }
    });
  }

  onProductSelect(productId: number): void {
    const selected = this.products.find(p => p.id === productId);
    this.selected = selected;
    
   

    if (selected) {
      this.detailForm.patchValue({
        product_id: selected.id,
        productName: '',
        batch:  '',
        expireDate: '',
        presentation: '',
        healthRecord:'',
        product: selected
      });
    }
  }

  addDetail(): void {
    if (this.detailForm.valid) {
      
      const detail: Detail = this.detailForm.value;
      console.log("productos", detail)
      this.detailAdded.emit(detail);
      this.detailForm.reset({
        id: 0,
        productId: '',
        product_id: '',
        quantity: 1,
        unitPrice: 0,
        totalDetail: 0,
        batch: '',
        expireDate: '',
        presentation: '',
        healthRecord: '',
        product: undefined
      });
    }
  
  }

  onSubmit(): void {
    this.addDetail();
  }
}
