import { Component, ElementRef, ViewChild, Inject} from '@angular/core';
import * as pako from 'pako';
import * as JSZip from 'jszip';
import { FormGroup, FormBuilder, Validators, FormControl, FormArray } from '@angular/forms';
import { ArchivoService } from '../../service/archivos.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import { NgxSpinnerService } from "ngx-spinner";
import { MensajeEmergentesComponent } from '../mensaje-emergentes/mensaje-emergentes.component';
import { GimnasioService } from '../../service/gimnasio.service';
import { OnInit } from '@angular/core';
import { Router } from '@angular/router';
@Component({
  selector: 'app-archivos',
  templateUrl: './archivos.component.html',
  styleUrls: ['./archivos.component.css']
})
export class ArchivosComponent implements OnInit{
  archivosSeleccionados: File[] = [];
  @ViewChild('archivoInput') archivoInput!: ElementRef;
  formularioArchivo: FormGroup;
  idGimnasio : any;
  nombreGym : any;
  mostrarBoton: boolean = false;
  archivos: any[] = [];

  constructor(
    public dialogo: MatDialogRef<ArchivosComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,

    public form: FormBuilder,
    private archivoService: ArchivoService,
    private spinner: NgxSpinnerService,
    public dialog: MatDialog, 
    private gimnasio: GimnasioService,
    private router: Router
  ) {
    this.idGimnasio = data.idGimnasio;
    this.nombreGym = data.nombreGym;
    this.formularioArchivo = this.form.group({
      nombreArchivo: ['', Validators.required],
      tipoArchivo: ['', Validators.required],
      contenidoArchivo: [''],
      Gimnasio_idGimnasio: ['2', Validators.required],
      base64textString: [''],
    });
   }

   ngOnInit(): void {
    this.gimnasio.consultarArchivos(this.idGimnasio).subscribe(
      (archivos) => {
        this.archivos = archivos;
      },
      (error) => {
        console.error('Error al consultar archivos:', error);
      }
    );
  }
  
  openURL(url: string): void {
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'http://' + url;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  }
  
  descargarArchivo(url: string, nombreArchivo: string): void {
  const enlaceTemporal = document.createElement('a');
  enlaceTemporal.href = url;
}

   seleccionarArchivo(event: any) {
    const archivos: FileList = event.target.files;
  
    // Agregar cada archivo al arreglo
    for (let i = 0; i < archivos.length; i++) {
      this.archivosSeleccionados.push(archivos[i]);
    }
  
    if (archivos && archivos.length > 0) {
      const lector = new FileReader();
  
      lector.onload = (e) => {
        // Obtén la representación en base64 del archivo
        const base64textString = lector.result as string;
  
        // Asigna la representación en base64 al campo del formulario
        this.formularioArchivo.patchValue({
          base64textString: base64textString,
        });
      };
  
      // Lee el contenido del primer archivo como una URL de datos
      lector.readAsDataURL(archivos[0]);
    }
  }

  archivo = {
    nombreArchivo: '',
    base64textString: ''
  }
  
  _handleReaderLoaded(readerEvent: any) {
    var binaryString = readerEvent.target.result;
    this.archivo.base64textString = btoa(binaryString);
    
    this.formularioArchivo.patchValue({
      base64textString: this.archivo.base64textString, // Corrección aquí
    });
  }
    

  onArchivoSeleccionado(event: any): void {
    const archivos: FileList = event.target.files;
    // Agregar cada archivo al arreglo
    for (let i = 0; i < archivos.length; i++) {
      this.archivosSeleccionados.push(archivos[i]);
    }
  }

 /* subirArchivo(){
    if (this.archivosSeleccionados.length > 0) {
      // Obtén el primer archivo de la lista (puedes ajustar esto según tus necesidades)
      const primerArchivo = this.archivosSeleccionados[0];

      // Asigna los valores al formulario
      this.formularioArchivo.patchValue({
        nombreArchivo: primerArchivo.name,
        tipoArchivo: primerArchivo.type,
      });

      console.log(this.formularioArchivo.value,"formulario");
      this.archivoService.guardarArchivos(this.formularioArchivo.value).subscribe(
        (respuesta) => {
          // Maneja la respuesta exitosa, si es necesario
          console.log('Carga exitosa:', respuesta);
        },
        (error) => {
          // Maneja el error, si es necesario
          console.error('Error al cargar archivos:', error);
        }
      );
    }

  }*/

  subirArchivo = async () => {
    this.spinner.show();
    if (this.archivosSeleccionados.length > 0) {
      try {
        const formData = new FormData();
        const zip = new JSZip();
  
        // Comprimir cada archivo antes de agregarlo al ZIP
        await Promise.all(this.archivosSeleccionados.map(async (archivo) => {
          const arrayBuffer = await this.leerArchivoComoArrayBuffer(archivo);
          const compressedArchivo = pako.gzip(new Uint8Array(arrayBuffer));
  
          // Agregar el archivo comprimido al ZIP
          zip.file(archivo.name, compressedArchivo);
        }));
  
        // Generar el archivo ZIP
        const zipBlob = await zip.generateAsync({ type: 'blob' });
  
        // Agregar el archivo ZIP al FormData
        formData.append('archivos', zipBlob, 'archivos.zip');

        const fechaActual = new Date();
        // Formatea la fecha como YYYY-MM-DD
        const fechaFormateada = `${fechaActual.getFullYear()}-${(fechaActual.getMonth() + 1).toString().padStart(2, '0')}-${fechaActual.getDate().toString().padStart(2, '0')}`;
        const nombreArchivo = this.nombreGym + '_' + fechaFormateada + '_archivos.zip';
  
        // Agregar tipoArchivo y Gimnasio_idGimnasio al FormData
        formData.append('nombreArchivo', nombreArchivo);
        formData.append('tipoArchivo', 'application/zip'); 
        formData.append('Gimnasio_idGimnasio', this.idGimnasio); 
  
        this.archivoService.guardarArchivos(formData).subscribe(
          (respuesta) => {
            this.spinner.hide();
            const dialogRefConfirm = this.dialog.open(MensajeEmergentesComponent, {
              data: `Documentos guardados exitosamente`,
            });
            dialogRefConfirm.afterClosed().subscribe((result) => {
              this.dialogo.close();
            
            });
          },
          (error) => {
            console.error('Error al guardar archivo comprimido:', error);
          }
        );
  
        // Limpiar la lista de archivos seleccionados
        this.archivosSeleccionados = [];
      } catch (error) {
        console.error('Error al comprimir archivos:', error);
        // Maneja el error, si es necesario
      }
    }
  }
  
  cancelar(): void {
    this.dialogo.close();
  }
  

 
  private leerArchivoComoArrayBuffer(archivo: File): Promise<ArrayBuffer> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
  
      reader.onload = (event) => {
        resolve(event.target?.result as ArrayBuffer);
      };
  
      reader.onerror = (error) => {
        reject(error);
      };
  
      reader.readAsArrayBuffer(archivo);
    });
  }

  quitarArchivo(index: number): void {
    this.archivosSeleccionados.splice(index, 1);
  }
  

}
