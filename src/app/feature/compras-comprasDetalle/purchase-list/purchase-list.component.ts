import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { MatTableDataSource, MatTableModule } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject, takeUntil } from 'rxjs';

import { BuyService } from '../../../core/service/compra.service';
import { RouterLink } from '@angular/router';
import { BuyDetailDialogComponent } from '../buy-detail-dialog/buy-detail-dialog.component';
import { BuyDetailService } from '../../../core/service/Cdetail.service';

import flatpickr from 'flatpickr';


@Component({
  selector: 'app-purchase-list',
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatDialogModule,
    MatTooltipModule,
    MatCardModule,
    MatSnackBarModule,
    RouterLink
  ],
  templateUrl: './purchase-list.component.html',
  styleUrls: ['./purchase-list.component.css']
})
export class PurchaseListComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('fechaInput') fechaInput!: ElementRef;
  filterText: string = '';
  filterDate: string = ''; // formato YYYY-MM-DD
  // Table configuration
  displayedColumns: string[] = [
    'buys_Id',
    'buys_price',
    'supplierName',
    'buys_date',
    'actions'
  ];
  dataSource = new MatTableDataSource<any>([]);

  // State variables
  isLoading = false;

  // RxJS unsubscribe subject
  private destroy$ = new Subject<void>();

  // ViewChild references
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(
    private buyService: BuyService,
    private cdr: ChangeDetectorRef,
    private dialog: MatDialog,
    private router: Router,
    private snackBar: MatSnackBar,
    private buyDetailService: BuyDetailService // Inject the service for detail retrieval
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadBuys();
  }

  ngAfterViewInit(): void {
    
    // Initialize paginator and sort when they're available
    if (this.paginator && this.sort) {
      this.dataSource.paginator = this.paginator;
      this.dataSource.sort = this.sort;

      // Custom sorting for date fields
      this.dataSource.sortingDataAccessor = (item, property) => {
        switch (property) {
          case 'buys_date':
            return new Date(item.buysDate).getTime();
          case 'buys_Id':
            return item.buysId;
          case 'buys_price':
            return item.buysPrice;
          case 'supplierName':
            return item.supplier.id;
          default:
            return item[property];
        }
      };
    }
    flatpickr(this.fechaInput.nativeElement, {
      dateFormat: 'Y-m-d',
      onChange: (selectedDates, dateStr, instance) => {
        this.filterDate = dateStr;
        const fakeEvent = new Event('input');
        this.applyFilter(fakeEvent); // usamos applyFilter con un Event
      }
    });
  }

  ngOnDestroy(): void {
    // Clean up subscriptions
    this.destroy$.next();
    this.destroy$.complete();
  }

  /**
   * Loads purchase data from the service
   */
  loadBuys(): void {
    this.isLoading = true;

    this.buyService.getBuys()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          console.log('Raw data received:', data);

          // Assign data to table datasource
          this.dataSource.data = data;

          // Update UI state
          this.isLoading = false;
          this.cdr.detectChanges();

          // Log for debugging
          if (data.length === 0) {
            console.log('No purchase data received');
          } else {
            console.log(`Loaded ${data.length} purchases`);
            console.log('Sample item:', data[0]);
          }
        },
        error: (err) => {
          console.error('Error loading purchases:', err);
          this.isLoading = false;
          this.showErrorMessage('Error al cargar las compras');
        }
      });
  }

  /**
  * Aplica un filtro a la tabla basado en el valor del input
  * Reinicia el filtro si el campo de búsqueda está vacío
  * Maneja correctamente valores undefined o nulos
  * @param event Evento del input de búsqueda
  */
applyFilter(event: Event): void {
  const filterValue = (event.target as HTMLInputElement).value.trim();

  if ((event.target as HTMLInputElement).id === 'fechaFiltro') {
    this.filterDate = filterValue; // formato yyyy-mm-dd
  }

  // Crear filtro combinado (texto y fecha)
  const combinedFilter = JSON.stringify({
    text: this.filterText ? this.filterText.toLowerCase() : '',
    date: this.filterDate || ''
  });

  // Actualiza el filtro de texto cuando escribes en el input normal
  if ((event.target as HTMLInputElement).id !== 'fechaFiltro') {
    this.filterText = filterValue.toLowerCase();
  }

  this.dataSource.filterPredicate = (data, filter) => {
    const filterObj = JSON.parse(filter);
    const filterText = filterObj.text;
    const filterDate = filterObj.date;

    if (!filterText && !filterDate) return true;

    const invoiceMatch = data.invoiceNumber?.toString().toLowerCase().includes(filterText) || false;
    const priceMatch = data.buysPrice?.toString().toLowerCase().includes(filterText) || false;
    const nameMatch = data.supplier.name?.toString().toLowerCase().includes(filterText) || false;

    let dateMatch = true;
    if (filterDate && data.buysDate) {
      const [year, month, day] = filterDate.split('-');
      const formattedFilterDate = `${day}/${month}/${year}`.trim();
      dateMatch = data.buysDate.trim() === formattedFilterDate;
    }

    return (invoiceMatch || priceMatch || nameMatch) && dateMatch;
  };

  this.dataSource.filter = combinedFilter;

  if (this.dataSource.paginator) {
    this.dataSource.paginator.firstPage();
  }
}


  /**
   * Returns a display-friendly header name for the column
   */
  getHeader(column: string): string {
    switch (column) {
      case 'buys_Id': return 'N. Factura';
      case 'buys_price': return 'Precio';
      case 'supplierName': return 'Proveedor';
      case 'buys_date': return 'Fecha';
      case 'actions': return 'Acciones';
      default: return column;
    }
  }

  /**
   * Opens a dialog with purchase details
   */
  viewDetails(buyId: number): void {
    this.buyDetailService.getDetailsByBuyId(buyId).subscribe({

      next: (details) => {
        this.dialog.open(BuyDetailDialogComponent, {
          width: '800px',
          data: details, // Enviamos directamente la lista de detalles
          panelClass: 'custom-dialog-container'
        });
        console.log('Detalles de compra:', details);
      },

      error: (err) => {
        console.error('Error al obtener detalles:', err);
      }
    });
  }




  createNewPurchase(): void {
    this.router.navigate(['/purchases/new']);
  }

  /**
   * Refreshes the data in the table
   */
  refreshData(): void {
    this.loadBuys();
  }

  /**
   * Shows an error message to the user
   */
  private showErrorMessage(message: string): void {
    this.snackBar.open(message, 'Cerrar', {
      duration: 5000,
      horizontalPosition: 'center',
      verticalPosition: 'bottom'
    });
  }
}