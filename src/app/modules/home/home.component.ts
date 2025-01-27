import { Component } from '@angular/core';
import { OnInit } from '@angular/core';
import { VentasComponent } from '../ventas/ventas.component';
import { MatDialog } from "@angular/material/dialog";
import { EntradasComponent } from '../entradas/entradas.component';
import { AuthService } from 'src/app/service/auth.service';
import { Router } from '@angular/router';
import { JoinDetalleVentaService } from "../../service/JoinDetalleVenta";
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from "@angular/forms";
import { format } from "date-fns";
import { ToastrService } from "ngx-toastr";
import { ChartOptions, ChartType, ChartDataset } from "chart.js";
import { HomeService } from '../../service/home.service';
import { convertToObject } from 'typescript';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit{


  public barChartDataArray: { data: number[]; label: string }[] = [];
  barChartLabels: string[] = [];
  public barChartOptions: ChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
  };
  public barChartType: ChartType = "bar";
  public barChartLegend = true;
  public barChartData: ChartDataset[] = [];
  public coloresPersonalizados: string[] = ['#FF5733', '#33FF57', '#5733FF'];
  datosGraficosPorGimnasio: { [key: string]: { chartLabels: string[], chartData: any[] } } = {};
  // Almacenar el usuario en sesion
  currentUser: string = '';
  detallesCaja: any[] = [];
  fechaFiltro: string = "";
  idGym: number = 0;
  fechaActual: Date = new Date();
  totalVentas: number = 0;
  totalProductosVendidos: number = 0;
  datosProductosVendidos: any;
  datosRecientesVentas: any;
  datosClientesActivos: any;
  clientesActivos: any;
  homeCard: any;
  tablaHTML: SafeHtml | null = null;
  tablaHTMLVentas: SafeHtml | null = null;
  
  constructor(private homeService: HomeService, private sanitizer: DomSanitizer,
    private auth: AuthService, public dialog: MatDialog, private router: Router, private joinDetalleVentaService: JoinDetalleVentaService, ) {
  }

  ngOnInit(): void {
    this.currentUser = this.auth.getCurrentUser();
    if(this.currentUser){
      this.getSSdata(JSON.stringify(this.currentUser));
    }
    
    this.auth.idGym.subscribe((data) => {
      if(data) {
        this.idGym = data;
        this.listaTablas();
      }
    });
  }

  getSSdata(data: any){
    this.auth.dataUser(data).subscribe({
      next: (resultData) => {
        this.auth.loggedIn.next(true);
          this.auth.role.next(resultData.rolUser);
          this.auth.userId.next(resultData.id);
          this.auth.idGym.next(resultData.idGym);
          this.auth.nombreGym.next(resultData.nombreGym);
          this.auth.email.next(resultData.email);
          this.auth.encryptedMail.next(resultData.encryptedMail);
      }, error: (error) => { console.log(error); }
    });
  }

  isAdmin(): boolean {
    return this.auth.isAdmin();
  }
  
  isSupadmin(): boolean {
    return this.auth.isSupadmin();
  }

  isRecep(): boolean {
    return this.auth.isRecepcion();
  }

  ventas(): void {
    const dialogRef = this.dialog.open(VentasComponent, {
      width: '80%',
      height: '90%',
      
    });
  }

  entradas(): void {
    const dialogRef = this.dialog.open(EntradasComponent, {
      width: '75%',
      height: '90%',
      disableClose: true,
    });
  }

  private obtenerFechaActual(): Date {
    return new Date();
  }

  listaTablas() {
    this.homeService.consultarHome(this.idGym).subscribe(respuesta => {
      this.homeCard = respuesta
    });

    this.homeService.getAnalyticsData(this.idGym).subscribe((data) => {
      console.log(data, "data1");
    this.tablaHTML = this.sanitizer.bypassSecurityTrustHtml(`<table class="mi-tabla">${data.tablaHTML}</table>`);
      // Resto del código...
    });
    
    this.homeService.getARecientesVentas(this.idGym).subscribe((data) => {
      
      //this.datosRecientesVentas = data;
      this.tablaHTMLVentas = this.sanitizer.bypassSecurityTrustHtml(`<table class="mi-tabla">${data.tablaHTMLVentas}</table>`);
      console.log(this.tablaHTMLVentas, "data2");
    });
}

}
