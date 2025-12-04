import { Component, ChangeDetectionStrategy, AfterViewInit, ViewChild, ElementRef, OnDestroy, inject, signal, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ScrollAnimateDirective } from '../../animations/scroll-animate.directive';
import { GeminiService } from '../../services/gemini.service';

declare var d3: any;

interface GoldPriceData {
  date: Date;
  price: number;
}

@Component({
  selector: 'app-market-watch',
  standalone: true,
  imports: [CommonModule, ScrollAnimateDirective],
  templateUrl: './market-watch.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MarketWatchComponent implements AfterViewInit, OnDestroy {
  @ViewChild('chartContainer') private chartContainer!: ElementRef;
  private platformId = inject(PLATFORM_ID);
  private geminiService = inject(GeminiService);
  
  isLoadingAnalysis = signal(false);
  analysis = signal<string | null>(null);

  private data: GoldPriceData[] = [];
  private svg: any;
  private resizeObserver!: ResizeObserver;

  ngAfterViewInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      this.generateData();
      this.createChart();
      this.getAnalysis();
      
      this.resizeObserver = new ResizeObserver(() => {
        this.createChart(); // Redraw chart on resize
      });
      this.resizeObserver.observe(this.chartContainer.nativeElement);
    }
  }

  ngOnDestroy(): void {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  private generateData(): void {
    this.data = [];
    let price = 65 + Math.random() * 10;
    const now = new Date();
    for (let i = 60; i >= 0; i--) {
      this.data.push({
        date: new Date(now.getTime() - i * 24 * 60 * 60 * 1000),
        price: price
      });
      price += (Math.random() - 0.5) * 2;
      price = Math.max(60, Math.min(80, price)); // Clamp price
    }
  }

  private createChart(): void {
    d3.select(this.chartContainer.nativeElement).select('svg').remove();

    const element = this.chartContainer.nativeElement;
    const margin = { top: 20, right: 30, bottom: 40, left: 50 };
    const width = element.offsetWidth - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    this.svg = d3.select(element).append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
      
    const x = d3.scaleTime()
      .domain(d3.extent(this.data, (d: GoldPriceData) => d.date))
      .range([0, width]);

    const y = d3.scaleLinear()
      .domain([d3.min(this.data, (d: GoldPriceData) => d.price) * 0.98, d3.max(this.data, (d: GoldPriceData) => d.price) * 1.02])
      .range([height, 0]);

    this.svg.append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x).ticks(5))
      .selectAll("text")
        .style("fill", "#e1dcd0");

    this.svg.append('g')
      .call(d3.axisLeft(y))
      .selectAll("text")
        .style("fill", "#e1dcd0");

    // Gradient for the line
    const gradient = this.svg.append("defs").append("linearGradient")
      .attr("id", "line-gradient")
      .attr("gradientUnits", "userSpaceOnUse")
      .attr("x1", 0).attr("y1", y(0))
      .attr("x2", 0).attr("y2", y(d3.max(this.data, (d: GoldPriceData) => d.price)));
    gradient.append("stop").attr("offset", "0%").attr("stop-color", "#B8860B");
    gradient.append("stop").attr("offset", "100%").attr("stop-color", "#FFFDE4");

    const line = d3.line()
      .x((d: any) => x(d.date))
      .y((d: any) => y(d.price))
      .curve(d3.curveMonotoneX);

    const path = this.svg.append('path')
      .datum(this.data)
      .attr('fill', 'none')
      .attr('stroke', 'url(#line-gradient)')
      .attr('stroke-width', 2.5)
      .attr('d', line);
      
    const totalLength = path.node().getTotalLength();

    path
      .attr("stroke-dasharray", totalLength + " " + totalLength)
      .attr("stroke-dashoffset", totalLength)
      .transition()
      .duration(2000)
      .ease(d3.easeLinear)
      .attr("stroke-dashoffset", 0);
  }

  getAnalysis(): void {
      this.isLoadingAnalysis.set(true);
      this.geminiService.getMarketAnalysis(this.data).then(result => {
          this.analysis.set(result);
          this.isLoadingAnalysis.set(false);
      });
  }
}
