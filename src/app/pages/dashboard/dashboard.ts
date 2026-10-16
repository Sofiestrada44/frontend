import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild, computed, signal } from '@angular/core';
import { Chart, registerables } from 'chart.js';
import { Subscription, catchError, forkJoin, of, switchMap, timer } from 'rxjs';
import { Estadisticas, GreenhouseService } from '../../core/services/greenhouse.service';

Chart.register(...registerables);

@Component({
  imports: [],
  selector: 'app-dashboard',
  templateUrl: './dashboard.html',
})
export class Dashboard implements AfterViewInit, OnDestroy {
  @ViewChild('lienzo') lienzo!: ElementRef<HTMLCanvasElement>;
  stats = signal<Estadisticas | null>(null);
  sinDatos = signal(false);
  private chart?: Chart;
  private sub?: Subscription;

  // Las 3 tarjetas se arman a partir de lo que devuelve /api/estadisticas
  tarjetas = computed(() => {
    const s = this.stats();
    return [
      { titulo: 'Temperatura', unidad: '°C', mm: s?.temperatura },
      { titulo: 'Humedad ambiente', unidad: '%', mm: s?.humedad_ambiente },
      { titulo: 'Humedad del suelo', unidad: '%', mm: s?.humedad_suelo },
    ];
  });

  constructor(private api: GreenhouseService) {}

  ngAfterViewInit(): void {
    this.chart = new Chart(this.lienzo.nativeElement, {
      type: 'line',
      data: {
        labels: [],
        datasets: [{ label: 'Temperatura (°C)', data: [], borderColor: '#2E7D4F', backgroundColor: '#2E7D4F', tension: 0.3, pointRadius: 0 }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        scales: { y: { title: { display: true, text: '°C' } }, x: { title: { display: true, text: 'Hora' } } },
      },
    });

    // Cada 5 s pide estadísticas y serie al mismo tiempo y actualiza tarjetas y gráfico
    this.sub = timer(0, 5000)
      .pipe(
        switchMap(() =>
          forkJoin({
            stats: this.api.estadisticas().pipe(catchError(() => of(null))),
            serie: this.api.serie(5).pipe(catchError(() => of(null))),
          })
        )
      )
      .subscribe(({ stats, serie }) => {
        if (stats) this.stats.set(stats);
        if (serie && this.chart) {
          this.sinDatos.set(serie.length === 0);
          this.chart.data.labels = serie.map((p) => new Date(p.ts.replace(' ', 'T')).toLocaleTimeString());
          this.chart.data.datasets[0].data = serie.map((p) => p.temperatura);
          this.chart.update();
        }
      });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
    this.chart?.destroy();
  }

  fmt(v: number | null | undefined): string {
    return v == null ? '—' : v.toFixed(1);
  }
}