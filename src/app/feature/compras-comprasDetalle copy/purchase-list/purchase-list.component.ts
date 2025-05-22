import { AfterViewInit, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
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
import { Buy } from '../../../shared/models/buyModel';
import { BuyDetailDialogComponent } from '../buy-detail-dialog/buy-detail-dialog.component';
import { BuyDetailService } from '../../../core/service/Cdetail.service';


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
  ) {}
  
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
        switch(property) {
          case 'buys_date': 
            return new Date(item.date).getTime();
          case 'buys_Id':
            return item.id;
          case 'buys_price':
            return item.price;
          case 'supplierName':
            return item.suname;
          default: 
            return item[property];
        }
      };
    }
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
   * Applies filter to the table data
   */
  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    
    // Configure custom filter predicate to search in the correct fields
    this.dataSource.filterPredicate = (data, filter) => {
      return data.id.toString().includes(filter) ||
             data.price.toString().includes(filter) ||
             data.suname.toLowerCase().includes(filter) ||
             (new Date(data.date)).toLocaleDateString().includes(filter);
    };
    
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }
  
  /**
   * Returns a display-friendly header name for the column
   */
  getHeader(column: string): string {
    switch (column) {
      case 'buys_Id': return 'ID';
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