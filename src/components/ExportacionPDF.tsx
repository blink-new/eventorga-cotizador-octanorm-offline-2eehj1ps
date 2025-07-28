import React, { useState } from 'react';
import { Download, FileText, Table, Mail, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import jsPDF from 'jspdf';
import * as XLSX from 'xlsx';
import { 
  formatearEUR, 
  formatearPorcentaje,
  formatearM2,
  type ResultadoCalculo 
} from '../lib/calculator';

interface Props {
  resultado: ResultadoCalculo;
}

interface DatosCliente {
  nombre: string;
  empresa: string;
  email: string;
  telefono: string;
  evento: string;
  fechaEvento: string;
  observaciones: string;
}

export function ExportacionPDF({ resultado }: Props) {
  const [datosCliente, setDatosCliente] = useState<DatosCliente>({
    nombre: '',
    empresa: '',
    email: '',
    telefono: '',
    evento: '',
    fechaEvento: '',
    observaciones: ''
  });

  const [exportando, setExportando] = useState(false);

  const { paquete, configuracion, datosProyecto, calculos, desglose } = resultado;

  const generarPDF = async () => {
    setExportando(true);
    
    try {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      const margin = 20;
      let yPosition = margin;

      // Header
      doc.setFontSize(20);
      doc.setFont('helvetica', 'bold');
      doc.text('EVENTORGA - PRESUPUESTO OCTANORM', margin, yPosition);
      yPosition += 15;

      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      doc.text(`Fecha: ${new Date().toLocaleDateString('es-ES')}`, margin, yPosition);
      doc.text(`Paquete: ${paquete.nombre}`, pageWidth - margin - 80, yPosition);
      yPosition += 8;
      doc.text(`Superficie: ${formatearM2(datosProyecto.metrosCuadrados)}`, margin, yPosition);
      doc.text(`PAR: ${formatearEUR(calculos.par)}`, pageWidth - margin - 80, yPosition);
      yPosition += 15;

      // Datos del Cliente
      if (datosCliente.nombre || datosCliente.empresa) {
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text('DATOS DEL CLIENTE', margin, yPosition);
        yPosition += 10;

        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        
        if (datosCliente.nombre) {
          doc.text(`Nombre: ${datosCliente.nombre}`, margin, yPosition);
          yPosition += 6;
        }
        if (datosCliente.empresa) {
          doc.text(`Empresa: ${datosCliente.empresa}`, margin, yPosition);
          yPosition += 6;
        }
        if (datosCliente.email) {
          doc.text(`Email: ${datosCliente.email}`, margin, yPosition);
          yPosition += 6;
        }
        if (datosCliente.telefono) {
          doc.text(`Teléfono: ${datosCliente.telefono}`, margin, yPosition);
          yPosition += 6;
        }
        if (datosCliente.evento) {
          doc.text(`Evento: ${datosCliente.evento}`, margin, yPosition);
          yPosition += 6;
        }
        if (datosCliente.fechaEvento) {
          doc.text(`Fecha Evento: ${datosCliente.fechaEvento}`, margin, yPosition);
          yPosition += 6;
        }
        yPosition += 10;
      }

      // Resumen Ejecutivo
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('RESUMEN EJECUTIVO', margin, yPosition);
      yPosition += 10;

      // Tabla de resumen
      const resumenData = [
        ['Superficie del stand', formatearM2(datosProyecto.metrosCuadrados)],
        ['CTP (Coste Total Proyecto)', formatearEUR(calculos.ctp)],
        ['PAR (Precio Alquiler Recomendado)', formatearEUR(calculos.par)],
        ['PAR + IVA (21%)', formatearEUR(calculos.parConIva)],
        ['Coste por m²', formatearEUR(calculos.costePorM2)],
        ['Margen Bruto', formatearEUR(calculos.par - calculos.ctp)]
      ];

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      resumenData.forEach(([label, value]) => {
        doc.text(label, margin, yPosition);
        doc.setFont('helvetica', 'bold');
        doc.text(value, pageWidth - margin - 40, yPosition);
        doc.setFont('helvetica', 'normal');
        yPosition += 8;
      });
      yPosition += 10;

      // Desglose de Costes
      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('DESGLOSE DE COSTES', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');

      const costesData = [
        ['Amortizado por evento', formatearEUR(calculos.costeAmortizadoEvento)],
        ['Reposición', formatearEUR(calculos.costeReposicion)],
        ['Gráfica', formatearEUR(desglose.costesAdicionales.grafica)],
        ['Logística', formatearEUR(desglose.costesAdicionales.logistica)],
        ['Instalación', formatearEUR(desglose.costesAdicionales.instalacion)]
      ];

      if (desglose.costesAdicionales.tarima) {
        costesData.push(['Tarima', formatearEUR(desglose.costesAdicionales.tarima)]);
      }

      costesData.push(
        ['', ''],
        ['Subtotal Costes Directos', formatearEUR(calculos.costesDirectos)],
        [`Overhead (${formatearPorcentaje(configuracion.overhead)})`, formatearEUR(calculos.overhead)],
        ['', ''],
        ['CTP TOTAL', formatearEUR(calculos.ctp)]
      );

      costesData.forEach(([label, value]) => {
        if (label === '') {
          yPosition += 4;
          return;
        }
        
        if (label === 'CTP TOTAL') {
          doc.setFont('helvetica', 'bold');
        }
        
        doc.text(label, margin, yPosition);
        doc.text(value, pageWidth - margin - 40, yPosition);
        
        if (label === 'CTP TOTAL') {
          doc.setFont('helvetica', 'normal');
        }
        
        yPosition += 6;
      });
      yPosition += 15;

      // Componentes
      if (yPosition > 200) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFontSize(14);
      doc.setFont('helvetica', 'bold');
      doc.text('COMPONENTES OCTANORM', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');

      // Headers de tabla
      doc.text('Componente', margin, yPosition);
      doc.text('Cant.', margin + 70, yPosition);
      doc.text('Unit.', margin + 90, yPosition);
      doc.text('Total', margin + 110, yPosition);
      doc.text('Por m²', margin + 130, yPosition);
      yPosition += 8;

      // Línea separadora
      doc.line(margin, yPosition - 2, pageWidth - margin, yPosition - 2);
      yPosition += 2;

      desglose.componentes.forEach((comp) => {
        doc.text(comp.nombre, margin, yPosition);
        doc.text(comp.cantidad.toString(), margin + 70, yPosition);
        doc.text(formatearEUR(comp.costeCompra), margin + 90, yPosition);
        doc.text(formatearEUR(comp.costeTotal), margin + 110, yPosition);
        doc.text(formatearEUR(comp.costePorM2), margin + 130, yPosition);
        yPosition += 6;
      });

      yPosition += 15;

      // Condiciones Comerciales
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('CONDICIONES COMERCIALES', margin, yPosition);
      yPosition += 10;

      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      const condiciones = [
        '• Anticipo: 80% al confirmar pedido',
        '• Resto: 20% a la entrega',
        '• IVA: 21% incluido en precios finales',
        '• Validez presupuesto: 30 días',
        `• Vida útil estimada: ${configuracion.vidaUtilAnios} años`,
        `• Frecuencia uso: ${configuracion.frecuenciaUsoAnual} eventos/año`
      ];

      condiciones.forEach((condicion) => {
        doc.text(condicion, margin, yPosition);
        yPosition += 6;
      });

      if (datosCliente.observaciones) {
        yPosition += 10;
        doc.setFont('helvetica', 'bold');
        doc.text('OBSERVACIONES:', margin, yPosition);
        yPosition += 8;
        doc.setFont('helvetica', 'normal');
        
        const observacionesLines = doc.splitTextToSize(datosCliente.observaciones, pageWidth - 2 * margin);
        doc.text(observacionesLines, margin, yPosition);
      }

      // Footer
      const footerY = doc.internal.pageSize.height - 20;
      doc.setFontSize(8);
      doc.setFont('helvetica', 'italic');
      doc.text('Generado por Eventorga Cotizador Octanorm - Offline', margin, footerY);
      doc.text(`Página 1 de 1`, pageWidth - margin - 30, footerY);

      // Guardar PDF
      const nombreArchivo = `presupuesto_${paquete.id}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(nombreArchivo);

    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('Error al generar el PDF. Por favor, inténtalo de nuevo.');
    } finally {
      setExportando(false);
    }
  };

  const generarExcel = () => {
    setExportando(true);

    try {
      const wb = XLSX.utils.book_new();

      // Hoja 1: Resumen
      const resumenData = [
        ['EVENTORGA - PRESUPUESTO OCTANORM'],
        [''],
        ['Fecha:', new Date().toLocaleDateString('es-ES')],
        ['Paquete:', paquete.nombre],
        ['Descripción:', paquete.descripcion],
        ['Superficie:', `${datosProyecto.metrosCuadrados} m²`],
        [''],
        ['DATOS DEL PROYECTO'],
        ['Cliente:', datosProyecto.nombreCliente || datosCliente.nombre],
        ['Proyecto:', datosProyecto.nombreProyecto],
        ['Fecha Cotización:', datosProyecto.fechaCotizacion],
        ['Observaciones:', datosProyecto.observaciones],
        [''],
        ['DATOS DEL CLIENTE (ADICIONALES)'],
        ['Nombre:', datosCliente.nombre],
        ['Empresa:', datosCliente.empresa],
        ['Email:', datosCliente.email],
        ['Teléfono:', datosCliente.telefono],
        ['Evento:', datosCliente.evento],
        ['Fecha Evento:', datosCliente.fechaEvento],
        [''],
        ['RESUMEN EJECUTIVO'],
        ['Superficie del stand (m²)', datosProyecto.metrosCuadrados],
        ['CTP (Coste Total Proyecto)', calculos.ctp],
        ['PAR (Precio Alquiler Recomendado)', calculos.par],
        ['PAR + IVA (21%)', calculos.parConIva],
        ['Coste por m²', calculos.costePorM2],
        ['Margen Bruto', calculos.par - calculos.ctp]
      ];

      const wsResumen = XLSX.utils.aoa_to_sheet(resumenData);
      XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen');

      // Hoja 2: Desglose de Costes
      const desgloseData = [
        ['DESGLOSE DE COSTES'],
        [''],
        ['Concepto', 'Importe (EUR)'],
        ['Amortizado por evento', calculos.costeAmortizadoEvento],
        ['Reposición', calculos.costeReposicion],
        ['Gráfica', desglose.costesAdicionales.grafica],
        ['Logística', desglose.costesAdicionales.logistica],
        ['Instalación', desglose.costesAdicionales.instalacion]
      ];

      if (desglose.costesAdicionales.tarima) {
        desgloseData.push(['Tarima', desglose.costesAdicionales.tarima]);
      }

      desgloseData.push(
        [''],
        ['Subtotal Costes Directos', calculos.costesDirectos],
        [`Overhead (${formatearPorcentaje(configuracion.overhead)})`, calculos.overhead],
        [''],
        ['CTP TOTAL', calculos.ctp]
      );

      const wsDesglose = XLSX.utils.aoa_to_sheet(desgloseData);
      XLSX.utils.book_append_sheet(wb, wsDesglose, 'Desglose Costes');

      // Hoja 3: Componentes
      const componentesData = [
        ['COMPONENTES OCTANORM'],
        [''],
        ['Componente', 'Cantidad', 'Coste Unitario (EUR)', 'Coste Total (EUR)', 'Coste por m² (EUR)', 'Amortizado/Evento (EUR)', 'Reposición/Evento (EUR)']
      ];

      desglose.componentes.forEach((comp) => {
        componentesData.push([
          comp.nombre,
          comp.cantidad,
          comp.costeCompra,
          comp.costeTotal,
          comp.costePorM2,
          comp.amortizadoEvento,
          comp.reposicion
        ]);
      });

      const wsComponentes = XLSX.utils.aoa_to_sheet(componentesData);
      XLSX.utils.book_append_sheet(wb, wsComponentes, 'Componentes');

      // Hoja 4: Parámetros
      const parametrosData = [
        ['PARÁMETROS DE CÁLCULO'],
        [''],
        ['Parámetro', 'Valor'],
        ['Vida Útil (años)', configuracion.vidaUtilAnios],
        ['Frecuencia Uso (eventos/año)', configuracion.frecuenciaUsoAnual],
        ['Tasa Rotura (%)', configuracion.tasaRotura * 100],
        ['Overhead (%)', configuracion.overhead * 100],
        ['Margen (%)', configuracion.margen * 100],
        ['IVA (%)', configuracion.iva * 100]
      ];

      const wsParametros = XLSX.utils.aoa_to_sheet(parametrosData);
      XLSX.utils.book_append_sheet(wb, wsParametros, 'Parámetros');

      // Guardar Excel
      const nombreArchivo = `presupuesto_${paquete.id}_${new Date().toISOString().split('T')[0]}.xlsx`;
      XLSX.writeFile(wb, nombreArchivo);

    } catch (error) {
      console.error('Error generando Excel:', error);
      alert('Error al generar el archivo Excel. Por favor, inténtalo de nuevo.');
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <Download className="h-6 w-6 mr-2 text-green-600" />
            Exportación de Presupuesto
          </CardTitle>
          <CardDescription className="text-lg">
            Genera documentos profesionales en PDF y Excel con todos los cálculos detallados
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <Badge variant="outline" className="mb-2">Paquete</Badge>
              <p className="font-bold text-lg">{paquete.nombre}</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="mb-2">Superficie</Badge>
              <p className="font-bold text-lg text-blue-600">{formatearM2(datosProyecto.metrosCuadrados)}</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="mb-2">PAR Final</Badge>
              <p className="font-bold text-lg text-green-600">{formatearEUR(calculos.parConIva)}</p>
            </div>
            <div className="text-center">
              <Badge variant="outline" className="mb-2">Por m²</Badge>
              <p className="font-bold text-lg text-purple-600">{formatearEUR(calculos.costePorM2)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Formulario de Datos del Cliente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <User className="h-5 w-5 mr-2 text-blue-600" />
            Datos del Cliente (Opcional)
          </CardTitle>
          <CardDescription>
            Completa estos datos para personalizar el presupuesto
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre del Cliente</Label>
              <Input
                id="nombre"
                value={datosCliente.nombre}
                onChange={(e) => setDatosCliente({...datosCliente, nombre: e.target.value})}
                placeholder="Juan Pérez"
              />
            </div>
            
            <div>
              <Label htmlFor="empresa">Empresa</Label>
              <Input
                id="empresa"
                value={datosCliente.empresa}
                onChange={(e) => setDatosCliente({...datosCliente, empresa: e.target.value})}
                placeholder="Empresa S.L."
              />
            </div>
            
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={datosCliente.email}
                onChange={(e) => setDatosCliente({...datosCliente, email: e.target.value})}
                placeholder="cliente@empresa.com"
              />
            </div>
            
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={datosCliente.telefono}
                onChange={(e) => setDatosCliente({...datosCliente, telefono: e.target.value})}
                placeholder="+34 600 000 000"
              />
            </div>
            
            <div>
              <Label htmlFor="evento">Nombre del Evento</Label>
              <Input
                id="evento"
                value={datosCliente.evento}
                onChange={(e) => setDatosCliente({...datosCliente, evento: e.target.value})}
                placeholder="Feria Internacional 2024"
              />
            </div>
            
            <div>
              <Label htmlFor="fechaEvento">Fecha del Evento</Label>
              <Input
                id="fechaEvento"
                type="date"
                value={datosCliente.fechaEvento}
                onChange={(e) => setDatosCliente({...datosCliente, fechaEvento: e.target.value})}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={datosCliente.observaciones}
              onChange={(e) => setDatosCliente({...datosCliente, observaciones: e.target.value})}
              placeholder="Notas adicionales, requisitos especiales, etc."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Botones de Exportación */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-red-600" />
              Exportar PDF
            </CardTitle>
            <CardDescription>
              Presupuesto profesional con todos los cálculos y fórmulas detalladas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={generarPDF}
              disabled={exportando}
              className="w-full"
              size="lg"
            >
              <FileText className="h-5 w-5 mr-2" />
              {exportando ? 'Generando PDF...' : 'Descargar PDF'}
            </Button>
            
            <div className="mt-4 text-sm text-slate-600">
              <p><strong>Incluye:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Resumen ejecutivo con PAR final</li>
                <li>Desglose completo de costes</li>
                <li>Listado de componentes Octanorm</li>
                <li>Condiciones comerciales</li>
                <li>Datos del cliente (si se completan)</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Table className="h-5 w-5 mr-2 text-green-600" />
              Exportar Excel
            </CardTitle>
            <CardDescription>
              Hoja de cálculo con datos estructurados para análisis adicional
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={generarExcel}
              disabled={exportando}
              className="w-full"
              size="lg"
              variant="outline"
            >
              <Table className="h-5 w-5 mr-2" />
              {exportando ? 'Generando Excel...' : 'Descargar Excel'}
            </Button>
            
            <div className="mt-4 text-sm text-slate-600">
              <p><strong>Incluye 4 hojas:</strong></p>
              <ul className="list-disc list-inside space-y-1 mt-2">
                <li>Resumen: Datos generales y totales</li>
                <li>Desglose: Costes detallados</li>
                <li>Componentes: Análisis por elemento</li>
                <li>Parámetros: Configuración utilizada</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Información Adicional */}
      <div className="text-center text-sm text-slate-600">
        <p>
          Los archivos se descargan directamente en tu dispositivo. 
          Esta aplicación funciona completamente offline y no envía datos a ningún servidor.
        </p>
      </div>
    </div>
  );
}