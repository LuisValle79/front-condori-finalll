// purchase-form.component.ts
import { Component, OnInit } from '@angular/core';
import { Buy } from '../../../shared/models/buyModel';
import { buyEdit } from '../../../shared/models/buyModel';
import { Detail } from '../../../shared/models/BuyDetailModel';
import { MatTableModule } from '@angular/material/table';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { CommonModule } from '@angular/common';
import { BuyService } from '../../../core/service/compra.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MatOptionModule } from '@angular/material/core';
import { PurchaseDetailFormComponent } from './purchase-detail-form/purchase-detail-form.component';
import { PurchaseDetailItemComponent } from './purchase-detail-item/purchase-detail-item.component';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { SuService } from '../../../core/service/supplier.service';
import { Supplier } from '../../../shared/models/supplierModel';
import { MatSelectModule } from '@angular/material/select';
import { ApiService } from '../../../core/service/product.service';
import { BuyDetailService } from '../../../core/service/Cdetail.service';
import { DatePickerModule } from '@syncfusion/ej2-angular-calendars';
import Swal from 'sweetalert2';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-purchase-form',
  templateUrl: './purchase-form.component.html',
  styleUrls: ['./purchase-form.component.css'],
  imports: [ MatFormField, MatLabel, MatTableModule, CommonModule, MatDatepickerModule, MatNativeDateModule, PurchaseDetailFormComponent,
     ReactiveFormsModule, PurchaseDetailItemComponent,
     MatInputModule,  // <-- Añadir esto
     MatButtonModule, MatOptionModule, MatSelectModule, DatePickerModule],
})

export class PurchaseFormComponent implements OnInit {
  purchaseForm: FormGroup;
  details: Detail[] = [];
  suppliers: Supplier[] | undefined;
  isEditMode = false;
  purchaseId: number | null = null;

  constructor(
    private fb: FormBuilder,
    private BuyService: BuyService,
    private supplierService: SuService,
    private BuyDetailService: BuyDetailService,
    private route: ActivatedRoute,
    private router: Router
  ) {
    this.purchaseForm = this.fb.group({
      buysDate: ['', Validators.required],
      supplierId: ['', Validators.required],
      invoiceNumber: ['', Validators.required],
      buysPrice: [0, [Validators.required, Validators.min(0.01)]],
    });
  }

  ngOnInit(): void {
    this.loadSuppliers();
    
    // Check if we're in edit mode by looking for an ID parameter in the route
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.purchaseId = +params['id']; // Convert to number
        this.isEditMode = true;
        this.loadPurchaseData(this.purchaseId);
      }
    });
  }

  loadPurchaseData(id: number): void {
    // Show loading indicator
    Swal.fire({
      title: 'Cargando datos...',
      text: 'Por favor espera',
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    // Load the purchase data
    this.BuyService.getBuyById(id).subscribe({
      next: (purchase: Buy) => {
        // Update form with purchase data
        this.purchaseForm.patchValue({
          buysDate: purchase.date,
          supplierId: purchase.suname,
          invoiceNumber: purchase.invoiceNumber,
          buysPrice: purchase.price
        });

        // Load purchase details
        this.loadPurchaseDetails(id);
      },
      error: (error) => {
        console.error('Error loading purchase:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar los datos de la compra.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  loadPurchaseDetails(buyId: number): void {
    this.BuyDetailService.getDetailsByBuyId(buyId).subscribe({
      next: (details: Detail[]) => {
        this.details = details;
        Swal.close(); // Close loading indicator
      },
      error: (error) => {
        console.error('Error loading purchase details:', error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo cargar los detalles de la compra.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  addDetail(detail: Detail): void {
    this.details = [...this.details, detail];
    this.updateTotal();
  }

  removeDetail(index: number): void {
    this.details.splice(index, 1);
    this.details = [...this.details];
    this.updateTotal();
  }

  private updateTotal(): void {
    const buysPrice = this.details.reduce((sum, item) => sum + item.totalDetail, 0);
    this.purchaseForm.patchValue({ buysPrice });
  }

  onSubmit(): void {
    if (this.purchaseForm.valid && this.details.length > 0) {
      const purchase: Buy = {
        ...this.purchaseForm.value
      };
      const purchaseEit: buyEdit = {
        ...this.purchaseForm.value
      }

      // If in edit mode, add the ID to the purchase object
      if (this.isEditMode && this.purchaseId) {
        purchase.buysId = this.purchaseId;
      }

      // Show loading indicator
      Swal.fire({
        title: this.isEditMode ? 'Actualizando compra...' : 'Procesando compra...',
        text: 'Por favor espera',
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        }
      });

      if (this.isEditMode) {
        this.updatePurchase(purchaseEit);
      } else {
        this.createPurchase(purchase);
      }
    } else {
      Swal.fire({
        icon: 'warning',
        title: 'Formulario inválido',
        text: 'Revisa los campos e intenta nuevamente.',
        confirmButtonColor: '#f0ad4e'
      });
    }
  }

  createPurchase(purchase: Buy): void {
    this.BuyService.createBuy(purchase).subscribe({
      next: (response) => {
        const buyId = response.buysId;
        this.savePurchaseDetails(buyId, 'Compra registrada', 'La compra y sus detalles fueron guardados correctamente');
      },
      error: (error) => {
        this.handleError('Error creando compra', error);
      }
    });
  }

  updatePurchase(purchase: buyEdit): void {
    this.BuyService.updateBuy(purchase).subscribe({
      next: (response) => {
        // First delete existing details, then create new ones
        if (this.purchaseId) {
          this.BuyDetailService.deleteBuyDetailsByBuyId(this.purchaseId).subscribe({
            next: () => {
              this.savePurchaseDetails(this.purchaseId!, 'Compra actualizada', 'La compra y sus detalles fueron actualizados correctamente');
            },
            error: (error) => {
              this.handleError('Error eliminando detalles existentes', error);
            }
          });
        }
      },
      error: (error) => {
        this.handleError('Error actualizando compra', error);
      }
    });
  }

  savePurchaseDetails(buyId: number, successTitle: string, successMessage: string): void {
    const createDetails = this.details.map((detail) => {
      detail.buyId = buyId;
      return this.BuyDetailService.createBuyDetail(detail).toPromise();
    });

    // Wait for all details to be created
    Promise.all(createDetails)
      .then((results) => {
        Swal.fire({
          icon: 'success',
          title: successTitle,
          text: successMessage,
          confirmButtonColor: '#3085d6',
          confirmButtonText: 'OK'
        }).then(() => {
          // Navigate back to purchases list or another appropriate page
          this.router.navigate(['/purchases']);
        });

        console.log('Compra y detalles procesados:', { buyId, results });
      })
      .catch((error) => {
        this.handleError('Error guardando detalles', error);
      });
  }

  handleError(title: string, error: any): void {
    console.error(`${title}:`, error);
    Swal.fire({
      icon: 'error',
      title: title,
      text: 'Ocurrió un error. Inténtalo de nuevo.',
      confirmButtonColor: '#d33'
    });
  }

  loadSuppliers(): void {
    this.supplierService.getSuppliers().subscribe({
      next: (data) => {
        this.suppliers = data;
        console.log('Proveedores cargados:', this.suppliers);
      },
      error: (err) => {
        console.error('Error al cargar proveedores:', err);
        // Show error message to user
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudieron cargar los proveedores.',
          confirmButtonColor: '#d33'
        });
      }
    });
  }

  handleProducts(arg0: string, products: any) {
    throw new Error('Method not implemented.');
  }
}