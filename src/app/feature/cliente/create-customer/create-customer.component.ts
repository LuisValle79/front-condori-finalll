import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CustomerService } from '../../../core/service/cliente.service';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';
import { MatCard, MatCardModule } from '@angular/material/card';

@Component({
  selector: 'app-create-customer',
  imports: [ReactiveFormsModule, CommonModule,MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    ReactiveFormsModule,
  RouterLink ,
MatIcon,
MatCardModule,
],
  templateUrl: './create-customer.component.html',
  styleUrls: ['./create-customer.component.css']
})
export class CreateCustomerComponent implements OnInit {
  customerForm: FormGroup;
  isEditMode: boolean = false;
  customerId: number | null = null;
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private customerService: CustomerService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.customerForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ][a-zA-ZáéíóúÁÉÍÓÚñÑ]+(?:\\s[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)*$'),
        Validators.minLength(2)
      ]],
      lastName: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ][a-zA-ZáéíóúÁÉÍÓÚñÑ]+(?:\\s[a-zA-ZáéíóúÁÉÍÓÚñÑ]+)*$'),
        Validators.minLength(2)
      ]],
      email: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$')
      ]],
      phone: ['', [
        Validators.required,
        Validators.pattern('^9\\d{8}$')
      ]],
      address: ['', [
        Validators.required,
        Validators.pattern('^[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9][a-zA-ZáéíóúÁÉÍÓÚñÑ0-9]+(?:\\s[a-zA-ZáéíóúÁÉÍÓÚñÑ0-9]+)*$'),
        Validators.minLength(5)
      ]],
      documentType: ['DNI', Validators.required],
      docNumber: ['', [Validators.required]],
      status: ['A'] // Estado por defecto activo pero oculto
    });

    // Suscribirse a los cambios en el tipo de documento
    this.customerForm.get('documentType')?.valueChanges.subscribe(docType => {
      const docNumberControl = this.customerForm.get('docNumber');
      if (docType === 'DNI') {
        docNumberControl?.setValidators([
          Validators.required,
          Validators.pattern('^[0-9]{8}$')
        ]);
      } else {
        docNumberControl?.setValidators([
          Validators.required,
          Validators.pattern('^[0-9]{1,20}$')
        ]);
      }
      docNumberControl?.updateValueAndValidity();
    });
  }

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const id = params.get('id');
      if (id) {
        this.isEditMode = true;
        this.customerId = +id;
        this.getCustomerDetails(this.customerId);
      }
    });
  }

  getCustomerDetails(id: number): void {
    this.isLoading = true;
    this.customerService.getCustomerById(id).subscribe({
      next: (customer) => {
        this.customerForm.patchValue(customer);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error fetching customer details:', error);
        this.snackBar.open('Error al cargar los datos del cliente', 'Cerrar', {
          duration: 3000
        });
        this.isLoading = false;
      }
    });
  }

  submitForm(): void {
    if (this.customerForm.invalid) {
      this.customerForm.markAllAsTouched();
      return;
    }

    const formData = {
      ...this.customerForm.value,
      status: 'A'
    };

    if (this.isEditMode && this.customerId) {
      const updateData = {
        ...formData,
        customerId: this.customerId // Agregamos el ID del cliente
      };

      this.customerService.updateCustomer(this.customerId, updateData).subscribe({
        next: () => {
          this.snackBar.open('Cliente actualizado exitosamente', 'Cerrar', {
            duration: 3000
          });
          this.router.navigate(['/clientes']);
        },
        error: (error) => {
          console.error('Error updating customer:', error);
          this.snackBar.open('Error al actualizar el cliente', 'Cerrar', {
            duration: 3000
          });
        }
      });
    } else {
      this.customerService.createCustomer(formData).subscribe({
        next: () => {
          this.snackBar.open('Cliente creado exitosamente', 'Cerrar', {
            duration: 3000
          });
          this.router.navigate(['/clientes']);
        },
        error: (error) => {
          console.error('Error creating customer:', error);
          this.snackBar.open('Error al crear el cliente', 'Cerrar', {
            duration: 3000
          });
        }
      });
    }
  }
}