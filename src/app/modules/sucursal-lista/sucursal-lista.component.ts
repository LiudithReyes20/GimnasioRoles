import { Component, OnInit, ViewChild } from '@angular/core';
import { GimnasioService } from './../../service/gimnasio.service';
import { MensajeDesactivarComponent } from '../mensaje-desactivar/mensaje-desactivar.component';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { HorarioService } from './../../service/horario.service';
import { forkJoin } from 'rxjs';
import { HorariosComponent } from '../horarios/horarios.component';
import { gimnasio } from './../../models/gimnasio';
import { HorariosVistaComponent } from '../horarios-vista/horarios-vista.component';
import { ListarSucursalesPipe } from './../../pipes/listar-sucursales.pipe';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator'; 
import { AuthService } from 'src/app/service/auth.service';
import { ArchivosComponent } from '../archivos/archivos.component';

@Component({
  selector: 'app-sucursal-lista',
  templateUrl: './sucursal-lista.component.html',
  styleUrls: ['./sucursal-lista.component.css']
})
export class SucursalListaComponent implements OnInit {
  
  gimnasio: any;
  message: string = "";
  
  idGimnasio: any;
  hayHorarios: boolean = false;
  public sucursales: any;
  public page: number = 0;
  public search: string = '';
  optionToShow: number = 0;
  currentUser: string = '';

  constructor(
    private gimnasioService: GimnasioService,
    public dialog: MatDialog,
    private auth: AuthService,
  ){}

  displayedColumns: string[] = ['estatus','nombre','direccion','telefono', 'tipo', 'actions', 'ubicacion', 'activar', 'horario', 'documentacion'];

  /*onToggle(event: Event, idGimnasio: any) {

    let gimnasio = this.gimnasio.find((g: { idGimnasio: any }) => g.idGimnasio === idGimnasio);
  // Verificar si encontramos la sucursal
  if (!gimnasio) {
    console.error('No se encontró la sucursal con id: ', idGimnasio);
    return;
  }

    let mensaje = gimnasio.estatus === 1 ? '¿Deseas desactivar esta sucursal?' : '¿Deseas activar esta sucursal?';
    console.log("ID de la sucursal: ", idGimnasio);
    const dialogRef = this.dialog.open(MensajeEliminarComponent,{
      data: {mensaje: mensaje, idGimnasio: idGimnasio},
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.gimnasioService.botonEstado.next({respuesta: true, idGimnasio: idGimnasio});
      } else {
        this.gimnasioService.botonEstado.next({respuesta: false, idGimnasio: idGimnasio});
      }
    });
  }*/
  /*onToggle(event: Event, idGimnasio: any) {
    let gimnasio = this.gimnasio.find((g: { idGimnasio: any }) => g.idGimnasio === idGimnasio);
    if (!gimnasio) {
      console.error('No se encontró la sucursal con id: ', idGimnasio);
      return;
    }
  
    let mensaje = gimnasio.estatus === 1 ? '¿Deseas desactivar esta sucursal?' : '¿Deseas activar esta sucursal?';
    console.log("ID de la sucursal: ", idGimnasio);
    const dialogRef = this.dialog.open(MensajeEliminarComponent,{
      data: {mensaje: mensaje, idGimnasio: idGimnasio},
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if(result) {
        this.gimnasioService.botonEstado.next({respuesta: true, idGimnasio: idGimnasio});
        // Actualizar this.gimnasio
        this.gimnasioService.obternerPlan().subscribe((data) => {
          this.gimnasio = data;
        });
      } else {
        this.gimnasioService.botonEstado.next({respuesta: false, idGimnasio: idGimnasio});
      }
    });
  }*/
  onToggle(event: Event, idGimnasio: any) {
    let gimnasio = this.gimnasio.find((g: { idGimnasio: any }) => g.idGimnasio === idGimnasio);
  
    if (!gimnasio) {
      console.error('No se encontró la sucursal con id: ', idGimnasio);
      return;
    }
  
    let mensaje = gimnasio.estatus == 1 ? '¿Deseas desactivar esta sucursal?' : '¿Deseas activar esta sucursal?';
  
    const dialogRef = this.dialog.open(MensajeDesactivarComponent, {
      data: { mensaje: mensaje, idGimnasio: idGimnasio },
    });
  
    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        // Invertir el valor del estatus
        const nuevoEstatus = gimnasio.estatus == 1 ? 0 : 1;
        
        console.log(nuevoEstatus, "nuevoEstatus");
        // Actualizar la base de datos y refrescar los datos
        this.gimnasioService.actualizarEstatus(idGimnasio, nuevoEstatus).subscribe(
          (response) => {
            if (response && response.success === 1) {
              gimnasio.estatus = nuevoEstatus;
            } else if (response) {
              console.error('Error al actualizar el estatus: ', response.error);
            } else {
              console.error('Error: la respuesta es null');
            }
          },
          (error) => {
            console.error('Error en la petición: ', error);
          }
        );
  
      } else {
      }
    });
  }
  



 /* ngOnInit(): void {

    this.gimnasioService.obternerPlan().subscribe((data) => {
      this.gimnasio = data;
    });

    this.gimnasioService.botonEstado.subscribe((data) => {
      if(data.respuesta){
        console.log("HAS DADO EN ACEPTAR");
        console.log("estatus actual:", this.gimnasio.estatus);

        // Buscar la sucursal correcta
    let gimnasio = this.gimnasio.find((g: { idGimnasio: any }) => g.idGimnasio === data.idGimnasio);

    // Verificar si encontramos la sucursal
    if (!gimnasio) {
      console.error('No se encontró la sucursal con id: ', data.idGimnasio);
      return;
    }
    console.log('Estatus actual: ', gimnasio.estatus);  // Agrega esta línea

        let datosPlan = {
         // estatus: 0
         estatus: gimnasio.estatus === 1 ? 0 : 1

        };
        this.gimnasioService.actualizarEstatus(data.idGimnasio, datosPlan.estatus).subscribe(
          (response) => {
            if (response && response.success === 1) {
              // ...
              this.gimnasioService.obternerPlan().subscribe((data) => {
                this.gimnasio = data;
              });
            } else if (response) {
              console.error('Error al actualizar el estatus: ', response.error);
            } else {
              console.error('Error: la respuesta es null');
            }
          },
          (error) => {
            console.error('Error en la petición: ', error);
          }
        );
      }else if(!data.respuesta){
        console.log("HAS DADO EN CANCELAR");
      }
    });
  }*/

  dataSource = new MatTableDataSource<any>();
  @ViewChild(MatPaginator, { static: true }) paginator!: MatPaginator;

  ngOnInit(): void {
   
    this.gimnasioService.obternerPlan().subscribe((data) => {
      this.gimnasio = data;
      this.dataSource = new MatTableDataSource(this.gimnasio);
      this.dataSource.paginator = this.paginator;
      this.cargarCategorias();
    });

    this.gimnasioService.botonEstado.subscribe((data) => {
      if(data.respuesta){
        // Buscar la sucursal correcta
        let gimnasio = this.gimnasio.find((g: { idGimnasio: any }) => g.idGimnasio === data.idGimnasio);
        // Verificar si encontramos la sucursal
        if (!gimnasio) {
          console.error('No se encontró la sucursal con id: ', data.idGimnasio);
          return;
        }
        let datosPlan = {
          estatus: gimnasio.estatus === 1 ? 0 : 1,
        };
        this.gimnasioService.actualizarEstatus(data.idGimnasio, datosPlan.estatus).subscribe(
          (response) => {
            if (response && response.success === 1) {
              // Actualizar el estado de la sucursal en el cliente
              gimnasio.estatus = datosPlan.estatus;
              this.gimnasioService.obternerPlan().subscribe((data) => {
                this.gimnasio = data;
              });
            } else if (response) {
              console.error('Error al actualizar el estatus: ', response.error);
            } else {
              console.error('Error: la respuesta es null');
            }
          },
          (error) => {
            console.error('Error en la petición: ', error);
          }
        );
      }else if(!data.respuesta){
      }
    });
  }

  private cargarCategorias() {
    this.gimnasioService.obternerPlan().subscribe(
      (data) => {
        this.gimnasio = data;
        this.dataSource = new MatTableDataSource(this.gimnasio);
        this.dataSource.paginator = this.paginator;
      },
      (error) => {
        console.error('Error al cargar categorías:', error);
      }
    );
  }
  
  
  private actualizarTabla() {
    if (!this.dataSource) {
      // Asegúrate de que this.dataSource esté definido antes de actualizar
      this.cargarCategorias();
    } else {
      this.gimnasioService.obternerPlan().subscribe(
        (data) => {
          this.gimnasio = data;
          this.dataSource.data = this.gimnasio;
        },
        (error) => {
          console.error('Error al actualizar categorías:', error);
        }
      );
    }
  }
  
  borrarSucursal(idGimnasio: any) {
    this.dialog.open(MensajeDesactivarComponent,{
      data: `¿Deseas desactivar esta sucursal?`,
    })
    .afterClosed()
    .subscribe((confirmado: boolean) => {
      if (confirmado) {
        this.gimnasioService.borrarSucursal(idGimnasio).subscribe(
          (respuesta) => {
            window.location.reload();
          },
          (error) => {
            this.message = "¡Error al eliminar!, Restricción en la base de datos";
          }
        );
      } else {
      }
    });
  }

 verHorario(idGimnasio: string): void {
  this.gimnasioService.optionSelected.next(1);
  this.gimnasioService.optionSelected.subscribe((data) => {
    if(data) {
      this.optionToShow = data;
      if(this.optionToShow === 1) {
      }
    }
  });
    const dialogRef = this.dialog.open(HorariosVistaComponent, {
      width: '70%',
      height: '90%',
      data: { idGimnasio: idGimnasio },
    });
  }

  agregarSucursal(): void {
    this.gimnasioService.optionSelected.next(2);
    this.gimnasioService.optionSelected.subscribe((data) => {
      if (data) {
        this.optionToShow = data;
        if (this.optionToShow === 2) {
        }
      }
    });
  
    const dialogRef = this.dialog.open(HorariosVistaComponent, {
      width: '70%',
      height: '90%',
      data: { idGimnasio: this.idGimnasio },
      disableClose: true // Bloquea el cierre del diálogo haciendo clic fuera de él o presionando Escape
    });
  
    dialogRef.afterClosed().subscribe(() => {
      this.actualizarTabla();
    });
  }

  editarSucursal(idGimnasio: number) {
    this.gimnasioService.gimnasioSeleccionado.next(idGimnasio);
    this.gimnasioService.optionSelected.next(3);
    this.gimnasioService.optionSelected.subscribe((data) => {
      if(data){
        this.optionToShow = data;
        if(this.optionToShow === 3){
        }
      }
    });
    
    const dialogRef = this.dialog.open(HorariosVistaComponent, {
      width: '70%',
      height: '90%',
      data: { idGimnasio: this.idGimnasio },
      disableClose: true // Bloquea el cierre del diálogo haciendo clic fuera de él o presionando Escape
    });
  
    dialogRef.afterClosed().subscribe(() => {
      this.actualizarTabla();
    });
  }


  agregarHorario(idGimnasio: string): void {
    const dialogRef = this.dialog.open(HorariosComponent, {
      width: '60%',
      height: '90%',
      data: { idGimnasio: idGimnasio },
    });
  }


  agregarDocumentos(idGimnasio: string, nombreGym: string): void {
    const dialogRef = this.dialog.open(ArchivosComponent, {
      width: '60%',
      height: '60%',
      data: { idGimnasio: idGimnasio, nombreGym: nombreGym},
      disableClose: true
    });
  }

  nextPage() {
    this.page += 5;
  }

  prevPage() {
    if ( this.page > 0 )
      this.page -= 5;
  }

  onSearchPokemon( search: Event ) {
    const filterValue = (search.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  pageNumber = 0; // Valor inicial de la página
searchString = ''; // Valor inicial para la búsqueda

// Método para cambiar la página
changePage(newPage: number) {
  this.pageNumber = newPage;
}

// Método para cambiar la cadena de búsqueda
changeSearchString(newSearchString: string) {
  this.searchString = newSearchString;
}

verUbicacion(item: any) {
  const direccion = `${item.calle}+${item.numExt}+${item.colonia}+${item.codigoPostal}+${item.ciudad}+${item.estado}`;
  window.open(`https://www.google.com/maps/search/?api=1&query=${direccion}`, '_blank');
}

/*onToggle(event: Event, idGimnasio: any) {
  console.log("ID de la sucursal: ", idGimnasio);
  this.dialog.open(MensajeEliminarComponent,{
    data: `¿Deseas desactivar esta sucursal?`,
  })
  // Aquí puedes agregar el código para actualizar el estado en tu base de datos
}*/

}
