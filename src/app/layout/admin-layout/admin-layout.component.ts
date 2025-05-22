import { Component } from '@angular/core';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { BehaviorSubject, Observable } from 'rxjs';
import { map, shareReplay } from 'rxjs/operators';
import { RouterOutlet} from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';



@Component({
  selector: 'app-admin-layout',
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.css',
  standalone: true,
  imports: [
   
    RouterOutlet,
   
    ReactiveFormsModule,
   
  ]
})
export class AdminLayoutComponent {
  searchControl = new FormControl('');
  isCollapsed$ = new BehaviorSubject<boolean>(false);
  isHandset$: Observable<boolean>;

  // NUEVO: Manejo de tema
  themeMode = new BehaviorSubject<'light' | 'dark'>('light');

  constructor(private breakpointObserver: BreakpointObserver) {
    this.isHandset$ = this.breakpointObserver.observe([
      Breakpoints.Handset,
      Breakpoints.TabletPortrait
    ]).pipe(
      map(result => result.matches),
      shareReplay()
    );

    // Cargar tema guardado al iniciar
    const savedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (savedTheme) {
      this.setTheme(savedTheme);
    } else {
      this.setTheme('light');
    }
  }

  toggleCollapse(): void {
    this.isCollapsed$.next(!this.isCollapsed$.value);
  }

  logout(): void {
    console.log('Cerrando sesión...');
    // Implementa tu lógica de cierre de sesión aquí
  }

  performSearch(): void {
    const searchTerm = this.searchControl.value;
    console.log('Buscando:', searchTerm);
    // Implementa tu lógica de búsqueda aquí
  }

  clearSearch(): void {
    this.searchControl.reset();
  }

  /** NUEVO: Alternar tema claro/oscuro */
  toggleTheme(): void {
    const newTheme = this.themeMode.value === 'light' ? 'dark' : 'light';
    this.setTheme(newTheme);
  }

  /** NUEVO: Aplicar un tema */
  setTheme(mode: 'light' | 'dark'): void {
    this.themeMode.next(mode);
    const body = document.body;
    body.classList.remove('light-theme', 'dark-theme');
    body.classList.add(`${mode}-theme`);
    localStorage.setItem('theme', mode);
  }

  
}
