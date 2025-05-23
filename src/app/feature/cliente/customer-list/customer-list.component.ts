// clientes.component.ts
import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { CustomerService } from '../../../core/service/cliente.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatSnackBar } from '@angular/material/snack-bar';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-clientes',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatPaginatorModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSortModule,
    MatDialogModule,
  ],
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class ClientesComponent implements OnInit {
  displayedColumns: string[] = [
    'name', 
    'lastName', 
    'address', 
    'phone', 
    'email', 
    'docNumber', 
    'status', 
    'documentType', 
    'actions'
  ];
  dataSource = new MatTableDataSource<any>([]);
  pageSize = 5;
  pageSizeOptions = [5, 10, 20];
  showInactiveCustomers = false;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private originalDataSource: any[] = [];

  constructor(
    private customerService: CustomerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  ngAfterViewInit() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  loadCustomers(): void {
    const serviceCall = this.showInactiveCustomers ? 
      this.customerService.getInactiveCustomers() : 
      this.customerService.getCustomers();

    serviceCall.subscribe({
      next: (data: any) => {
        console.log('Datos recibidos:', data);
        // Aseguramos que los datos estén ordenados correctamente
        const sortedData = this.sortCustomersDescending([...data]);
        this.originalDataSource = sortedData;
        this.dataSource.data = sortedData;
        
        // Configuración del ordenamiento
        if (this.sort) {
          this.dataSource.sort = this.sort;
          this.sort.active = 'customerId'; // Cambiado de 'id' a 'customerId'
          this.sort.direction = 'desc';
          this.sort.sortChange.emit({
            active: 'customerId', // Cambiado de 'id' a 'customerId'
            direction: 'desc'
          });
        }
        
        if (this.paginator) {
          this.dataSource.paginator = this.paginator;
          this.paginator.firstPage();
        }
      },
      error: (err) => console.error('Error cargando clientes:', err)
    });
  }

  private sortCustomersDescending(customers: any[]): any[] {
    return customers.sort((a, b) => {
      // Asegurarse de que estamos comparando números
      const idA = typeof a.customerId === 'string' ? parseInt(a.customerId, 10) : a.customerId;
      const idB = typeof b.customerId === 'string' ? parseInt(b.customerId, 10) : b.customerId;
      return idB - idA;  // Ordenamiento descendente
    });
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase().trim();
    this.dataSource.filter = filterValue;

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  updateCustomerStatus(customerId: number, currentStatus: string): void {
    const action = currentStatus === 'A' ? 'desactivar' : 'restaurar';
    
    Swal.fire({
      title: '¿Está seguro?',
      text: `¿Desea ${action} este cliente?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: `Sí, ${action}`,
      cancelButtonText: 'Cancelar'
    }).then((result) => {
      if (result.isConfirmed) {
        const newStatus = currentStatus === 'A' ? 'I' : 'A';
        
        this.customerService.updateCustomerStatus(customerId, newStatus).subscribe({
          next: () => {
            Swal.fire(
              '¡Completado!',
              `El cliente ha sido ${currentStatus === 'A' ? 'desactivado' : 'restaurado'} exitosamente.`,
              'success'
            );
            this.loadCustomers();
          },
          error: (err) => {
            console.error('Error actualizando estado:', err);
            Swal.fire(
              'Error',
              'Hubo un problema al actualizar el estado del cliente.',
              'error'
            );
          }
        });
      }
    });
  }

  toggleCustomerVisibility(): void {
    this.showInactiveCustomers = !this.showInactiveCustomers;
    console.log('Cambiando a mostrar:', this.showInactiveCustomers ? 'Inactivos' : 'Activos');
    this.loadCustomers();
  }
}