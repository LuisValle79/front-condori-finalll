// custom-date-adapter.ts
import { Injectable } from '@angular/core';
import { NativeDateAdapter } from '@angular/material/core';

@Injectable()
export class CustomDateAdapter extends NativeDateAdapter {
  override parse(value: any): Date | null {
    // Parsear entrada en formato MM/DD/YYYY
    if (typeof value === 'string' && value.indexOf('/') > -1) {
      const [month, day, year] = value.split('/').map(Number);
      return new Date(year, month - 1, day);
    }
    return super.parse(value);
  }

  override format(date: Date, displayFormat: Object): string {
    // Formato MM/DD/YYYY para visualización
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const year = date.getFullYear();
    
    return `${day}/${month}/${year}`;
  }

  override getFirstDayOfWeek(): number {
    // Primero día de la semana (0=Domingo, 1=Lunes)
    return 0; // Cambia a 1 si prefieres que sea Lunes
  }

  override getMonthNames(style: 'long' | 'short' | 'narrow'): string[] {
    // Nombres de meses en español
    return style === 'long' ? 
      ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 
       'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'] :
      ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 
       'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
  }
}