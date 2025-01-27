
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpParams } from '@angular/common/http';
//import { InstruccionHuella } from './InstruccionHuella';
import { HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class HuellaService {

  URLServices: string = "http://192.168.1.212/prueba";  //http://192.168.100.43/json     http://192.168.100.37  //http://localhost/plan/huella.php     //https://olympus.arvispace.com/puntoDeVenta/conf/huella.php
  service: string= "https://olympus.arvispace.com/gimnasioRoles/configuracion/recepcion/huella.php";    
  constructor(private clienteHttp:HttpClient) { }

  /*private headers = new HttpHeaders({
    'Content-Type': 'application/json',
    
  }); */ 

  httpHeaders = new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' });

  registroHuella(id:any):Observable<any>{
    return this.clienteHttp.get(this.URLServices+"?NewHuella="+id);
  } 
  
  accesoID(id:any):Observable<any>{
    return this.clienteHttp.get(this.service+"?busquedaAcceso="+id);
  }

  ultimoAcceso(){
    return this.clienteHttp.get(this.service);
  }

  insertarInstruccion(dato: any):Observable<any>{
    return this.clienteHttp.post(this.URLServices,dato, { headers: this.httpHeaders });
                                                /*+"?insertar=1" <- Nota: Colocarlo al cambiarlo a un servicio de php*/
  }
}