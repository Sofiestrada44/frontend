import { Component, OnDestroy, OnInit, signal } from '@angular/core';
import { EMPTY, Subscription, catchError, switchMap, timer } from 'rxjs';
import { GreenhouseService, Ultima } from '../../core/services/greenhouse.service';

@Component({
  imports: [],
  selector: 'app-monitoreo',
  templateUrl: './monitoreo.html',
})
export class Monitoreo implements OnInit, OnDestroy {
  datos = signal<Ultima | null>(null);
  error = signal('');
  private sub?: Subscription;

  constructor(private api: GreenhouseService) {}

  ngOnInit(): void {
    // Cada 2 s pide /api/ultima. Si una petición falla, el catchError evita que se detenga el ciclo.
    this.sub = timer(0, 2000)
      .pipe(
        switchMap(() =>
          this.api.ultima().pipe(
            catchError(() => {
              this.error.set('No hay conexión con el servidor');
              return EMPTY;
            })
          )
        )
      )
      .subscribe((d) => {
        this.datos.set(d);
        this.error.set('');
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe(); // al salir de la pantalla se deja de consultar
  }

  encendido(d: Ultima): boolean {
    return d.sistema === 'ON';
  }
}