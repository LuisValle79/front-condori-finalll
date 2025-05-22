// principal.component.ts
import { Component, OnInit, AfterViewInit, ViewChild, ElementRef } from '@angular/core';
import { Chart, ChartConfiguration } from 'chart.js';
import { CommonModule } from '@angular/common';

// Angular Material Imports
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMenuModule } from '@angular/material/menu';
import { MatToolbarModule } from '@angular/material/toolbar';

// Define interfaces for better type safety
interface CardData {
  title: string;
  value: string;
  icon: string;
  color: string;
}

interface Product {
  name: string;
  sales: number;
}

interface Notification {
  message: string;
  date: string;
  icon: string;
}

interface CategoryOrSupplier {
  name: string;
  percentage: number;
}

@Component({
  selector: 'app-dashboard',
  templateUrl: './principal.component.html',
  styleUrls: ['./principal.component.css'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    MatDividerModule,
    MatProgressBarModule,
    MatTabsModule,
    MatBadgeModule,
    MatTooltipModule,
    MatMenuModule,
    MatToolbarModule
  ]
})
export class PrincipalComponent implements OnInit, AfterViewInit {
  @ViewChild('salesChart') salesChartRef!: ElementRef<HTMLCanvasElement>;
  
  salesChart: Chart | null = null;
  
  // Data with proper typing
  cardData: CardData[] = [
    { title: 'Ventas Totales', value: '$120,000', icon: 'attach_money', color: '#4caf50' },
    { title: 'Inventario', value: '1,250', icon: 'inventory_2', color: '#2196f3' },
    { title: 'Clientes', value: '350', icon: 'people', color: '#ff9800' },
    { title: 'Pedidos', value: '120', icon: 'shopping_cart', color: '#e91e63' },
  ];

  topProducts: Product[] = [
    { name: 'Producto A', sales: 300 },
    { name: 'Producto B', sales: 250 },
    { name: 'Producto C', sales: 200 },
  ];

  notifications: Notification[] = [
    { message: 'Nuevo pedido recibido', date: 'Hoy', icon: 'notifications' },
    { message: 'Stock bajo en Producto B', date: 'Ayer', icon: 'warning' },
    { message: 'Nuevo cliente registrado', date: 'Hace 2 días', icon: 'person_add' },
  ];

  categories: CategoryOrSupplier[] = [
    { name: 'Fertilizantes', percentage: 70 },
    { name: 'Herbicidas', percentage: 55 },
    { name: 'Fungicidas', percentage: 45 },
  ];

  suppliers: CategoryOrSupplier[] = [
    { name: 'Agrofer S.A.', percentage: 80 },
    { name: 'Campo Verde', percentage: 65 },
  ];

  // Chart data
  chartLabels: string[] = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun'];
  chartData: number[] = [12000, 15000, 14000, 18000, 22000, 20000];

  constructor() {}

  ngOnInit(): void {
    // Initialize component - no error thrown
    this.loadDashboardData();
  }

  ngAfterViewInit(): void {
    // Initialize chart after view is ready
    setTimeout(() => {
      this.initSalesChart();
    }, 0);
  }

  /**
   * Load dashboard data - could be from an API in a real application
   */
  private loadDashboardData(): void {
    // In a real application, you would fetch data from a service
    console.log('Dashboard data loaded');
  }

  /**
   * Initialize the sales chart with proper error handling
   */
  private initSalesChart(): void {
    try {
      const chartElement = document.getElementById('salesChart') as HTMLCanvasElement;
      
      if (!chartElement) {
        console.error('Chart element not found');
        return;
      }

      // Destroy existing chart if it exists
      if (this.salesChart) {
        this.salesChart.destroy();
      }

      const chartConfig: ChartConfiguration = {
        type: 'line',
        data: {
          labels: this.chartLabels,
          datasets: [
            {
              label: 'Ventas',
              data: this.chartData,
              borderColor: '#42a5f5',
              backgroundColor: 'rgba(66, 165, 245, 0.2)',
              fill: true,
              tension: 0.4,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              mode: 'index',
              intersect: false,
              callbacks: {
                label: (context) => {
                  return `Ventas: $${context.raw}`;
                }
              }
            }
          },
          scales: {
            y: { 
              beginAtZero: true,
              ticks: {
                callback: (value) => {
                  return `$${value}`;
                }
              }
            },
          },
          interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
          }
        },
      };

      this.salesChart = new Chart(chartElement, chartConfig);
    } catch (error) {
      console.error('Error initializing chart:', error);
    }
  }

  /**
   * Refresh dashboard data
   */
  refreshData(): void {
    // Simulate data refresh
    this.chartData = this.chartData.map(value => value * (0.9 + Math.random() * 0.2));
    
    if (this.salesChart) {
      this.salesChart.data.datasets[0].data = this.chartData;
      this.salesChart.update();
    }
    
    console.log('Dashboard data refreshed');
  }

  /**
   * View all products
   */
  viewAllProducts(): void {
    console.log('Viewing all products');
    // In a real application, you would navigate to the products page
  }

  /**
   * View all notifications
   */
  viewAllNotifications(): void {
    console.log('Viewing all notifications');
    // In a real application, you would navigate to the notifications page
  }
}