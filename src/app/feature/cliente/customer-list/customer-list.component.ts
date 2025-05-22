// clientes.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { CustomerService } from '../../../core/service/cliente.service';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

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
  dataSource: any[] = [];
  pageSize = 5;
  pageSizeOptions = [5, 10, 20];
  showInactiveCustomers = false;

  constructor(
    private customerService: CustomerService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadCustomers();
  }

  private originalDataSource: any[] = [];

  loadCustomers(): void {
    if (this.showInactiveCustomers) {
      this.customerService.getInactiveCustomers().subscribe({
        next: (data: any) => {
          console.log('Datos inactivos recibidos:', data);
          this.originalDataSource = data;
          this.dataSource = data;
        },
        error: (err) => console.error('Error cargando clientes inactivos:', err)
      });
    } else {
      this.customerService.getCustomers().subscribe({
        next: (data: any) => {
          console.log('Datos activos recibidos:', data);
          this.originalDataSource = data;
          this.dataSource = data;
        },
        error: (err) => console.error('Error cargando clientes activos:', err)
      });
    }
  }

  applyFilter(event: Event): void {
    const filterValue = (event.target as HTMLInputElement).value.toLowerCase().trim();
    
    if (!filterValue) {
      this.dataSource = [...this.originalDataSource];
      return;
    }

    this.dataSource = this.originalDataSource.filter(customer => 
      (customer.docNumber?.toLowerCase() || '').includes(filterValue) ||
      (customer.name?.toLowerCase() || '').includes(filterValue) ||
      (customer.lastName?.toLowerCase() || '').includes(filterValue)
    );
  }

  updateCustomerStatus(customerId: number, currentStatus: string): void {
    const newStatus = currentStatus === 'A' ? 'I' : 'A';
    
    this.customerService.updateCustomerStatus(customerId, newStatus).subscribe({
      next: () => {
        console.log(`Cliente ${customerId} actualizado a ${newStatus}`);
        this.loadCustomers();
      },
      error: (err) => console.error('Error actualizando estado:', err)
    });
  }

  toggleCustomerVisibility(): void {
    this.showInactiveCustomers = !this.showInactiveCustomers;
    console.log('Cambiando a mostrar:', this.showInactiveCustomers ? 'Inactivos' : 'Activos');
    this.loadCustomers();
  }
}