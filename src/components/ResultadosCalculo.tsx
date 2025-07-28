import React from 'react';
import { Calculator, TrendingUp, FileText, Info, Ruler, User } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { 
  formatearEUR, 
  formatearPorcentaje,
  formatearM2,
  type ResultadoCalculo 
} from '../lib/calculator';

interface Props {
  resultado: ResultadoCalculo;
}

export function ResultadosCalculo({ resultado }: Props) {
  const { paquete, configuracion, datosProyecto, calculos, desglose } = resultado;

  return (
    <div className="space-y-8">
      {/* Header con Información del Proyecto */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <CardTitle className="text-2xl flex items-center">
                <Calculator className="h-6 w-6 mr-2 text-blue-600" />
                Resultados del Cálculo
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Paquete {paquete.nombre} - {formatearM2(datosProyecto.metrosCuadrados)}
              </CardDescription>
              {datosProyecto.nombreCliente && (
                <div className="flex items-center mt-2 text-sm text-slate-600">
                  <User className="h-4 w-4 mr-1" />
                  {datosProyecto.nombreCliente}
                  {datosProyecto.nombreProyecto && ` - ${datosProyecto.nombreProyecto}`}
                </div>
              )}
            </div>
            <div className="text-right">
              <Badge variant="default" className="text-lg px-4 py-2 mb-2">
                PAR: {formatearEUR(calculos.par)}
              </Badge>
              <div className="text-sm text-slate-600">
                {formatearEUR(calculos.costePorM2)}/m²
              </div>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="text-center">
              <p className="text-sm text-slate-600">Superficie</p>
              <p className="text-xl font-bold text-blue-600">{formatearM2(datosProyecto.metrosCuadrados)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600">CTP (sin margen)</p>
              <p className="text-xl font-bold text-slate-900">{formatearEUR(calculos.ctp)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600">PAR (con margen 35%)</p>
              <p className="text-xl font-bold text-blue-600">{formatearEUR(calculos.par)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600">PAR + IVA (21%)</p>
              <p className="text-xl font-bold text-green-600">{formatearEUR(calculos.parConIva)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-slate-600">Margen Bruto</p>
              <p className="text-xl font-bold text-orange-600">{formatearEUR(calculos.par - calculos.ctp)}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Análisis por Metro Cuadrado */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Ruler className="h-5 w-5 mr-2 text-purple-600" />
            Análisis por Metro Cuadrado
          </CardTitle>
          <CardDescription>
            Desglose de costes escalables según la superficie del stand
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Configuración del Paquete</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Superficie base incluida:</span>
                  <span className="font-medium">{formatearM2(paquete.metrosCuadradosBase || 0)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Superficie del proyecto:</span>
                  <span className="font-medium text-blue-600">{formatearM2(datosProyecto.metrosCuadrados)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Superficie adicional:</span>
                  <span className="font-medium text-orange-600">
                    {formatearM2(Math.max(0, datosProyecto.metrosCuadrados - (paquete.metrosCuadradosBase || 0)))}
                  </span>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold text-slate-900 mb-3">Costes por m²</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Coste adicional por m²:</span>
                  <span className="font-medium">{formatearEUR(calculos.costeAdicionalPorM2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>CTP por m²:</span>
                  <span className="font-medium">{formatearEUR(calculos.ctp / datosProyecto.metrosCuadrados)}</span>
                </div>
                <div className="flex justify-between">
                  <span>PAR por m²:</span>
                  <span className="font-medium text-blue-600">{formatearEUR(calculos.costePorM2)}</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Fórmulas y Cálculos Detallados */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Cálculos de Amortización */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
              Cálculos de Amortización
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Coste Total de Compra</span>
                <span className="font-bold">{formatearEUR(calculos.costeCompraFinal)}</span>
              </div>
              <p className="text-xs text-slate-500">
                Componentes base + escalado por {formatearM2(Math.max(0, datosProyecto.metrosCuadrados - (paquete.metrosCuadradosBase || 0)))}
              </p>
            </div>

            <Separator />

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Amortización Anual</span>
                <span className="font-bold">{formatearEUR(calculos.amortizacionAnual)}</span>
              </div>
              <p className="text-xs text-slate-500 mb-1">
                Fórmula: Coste Compra ÷ Vida Útil ({configuracion.vidaUtilAnios} años)
              </p>
              <p className="text-xs text-slate-400">
                {formatearEUR(calculos.costeCompraFinal)} ÷ {configuracion.vidaUtilAnios} = {formatearEUR(calculos.amortizacionAnual)}
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Amortización por Uso</span>
                <span className="font-bold">{formatearEUR(calculos.amortizacionPorUso)}</span>
              </div>
              <p className="text-xs text-slate-500 mb-1">
                Fórmula: Coste Compra ÷ Vida Útil en Usos ({configuracion.vidaUtilAnios * configuracion.frecuenciaUsoAnual} usos)
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Coste Amortizado por Evento</span>
                <span className="font-bold text-blue-600">{formatearEUR(calculos.costeAmortizadoEvento)}</span>
              </div>
              <p className="text-xs text-slate-500 mb-1">
                Fórmula: Amortización Anual ÷ Frecuencia Uso ({configuracion.frecuenciaUsoAnual} eventos/año)
              </p>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium text-slate-700">Coste Reposición</span>
                <span className="font-bold text-orange-600">{formatearEUR(calculos.costeReposicion)}</span>
              </div>
              <p className="text-xs text-slate-500 mb-1">
                Fórmula: (Coste Compra × Tasa Rotura {formatearPorcentaje(configuracion.tasaRotura)}) ÷ Frecuencia Uso
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Desglose de Costes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <FileText className="h-5 w-5 mr-2 text-purple-600" />
              Desglose de Costes
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-semibold text-slate-900 mb-2">Costes Directos</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Amortizado por evento</span>
                  <span>{formatearEUR(calculos.costeAmortizadoEvento)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Reposición</span>
                  <span>{formatearEUR(calculos.costeReposicion)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gráfica</span>
                  <span>{formatearEUR(desglose.costesAdicionales.grafica)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Logística</span>
                  <span>{formatearEUR(desglose.costesAdicionales.logistica)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Instalación</span>
                  <span>{formatearEUR(desglose.costesAdicionales.instalacion)}</span>
                </div>
                {desglose.costesAdicionales.tarima && (
                  <div className="flex justify-between">
                    <span>Tarima</span>
                    <span>{formatearEUR(desglose.costesAdicionales.tarima)}</span>
                  </div>
                )}
              </div>
            </div>

            <Separator />

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Subtotal Costes Directos</span>
                <span className="font-bold">{formatearEUR(calculos.costesDirectos)}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium">Overhead ({formatearPorcentaje(configuracion.overhead)})</span>
                <span className="font-bold">{formatearEUR(calculos.overhead)}</span>
              </div>
              <p className="text-xs text-slate-500">
                Fórmula: Costes Directos × {formatearPorcentaje(configuracion.overhead)}
              </p>
            </div>

            <Separator />

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg">CTP (Coste Total Proyecto)</span>
                <span className="font-bold text-lg text-blue-600">{formatearEUR(calculos.ctp)}</span>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-lg">PAR (con margen {formatearPorcentaje(configuracion.margen)})</span>
                <span className="font-bold text-lg text-green-600">{formatearEUR(calculos.par)}</span>
              </div>
              <p className="text-xs text-slate-500">
                Fórmula: CTP ÷ (1 - {formatearPorcentaje(configuracion.margen)})
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Desglose por Componentes */}
      <Card>
        <CardHeader>
          <CardTitle>Desglose por Componentes</CardTitle>
          <CardDescription>
            Análisis detallado de amortización y escalado por metros cuadrados
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2">Componente</th>
                  <th className="text-right py-2">Cantidad</th>
                  <th className="text-right py-2">Coste Unitario</th>
                  <th className="text-right py-2">Coste Total</th>
                  <th className="text-right py-2">Por m²</th>
                  <th className="text-right py-2">Amortizado/Evento</th>
                  <th className="text-right py-2">Reposición/Evento</th>
                </tr>
              </thead>
              <tbody>
                {desglose.componentes.map((comp, idx) => (
                  <tr key={idx} className="border-b">
                    <td className="py-2 font-medium">{comp.nombre}</td>
                    <td className="text-right py-2">{comp.cantidad}</td>
                    <td className="text-right py-2">{formatearEUR(comp.costeCompra)}</td>
                    <td className="text-right py-2">{formatearEUR(comp.costeTotal)}</td>
                    <td className="text-right py-2 text-purple-600">{formatearEUR(comp.costePorM2)}</td>
                    <td className="text-right py-2 text-blue-600">{formatearEUR(comp.amortizadoEvento)}</td>
                    <td className="text-right py-2 text-orange-600">{formatearEUR(comp.reposicion)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Información del Proyecto */}
      {(datosProyecto.observaciones || datosProyecto.fechaCotizacion) && (
        <Card>
          <CardHeader>
            <CardTitle>Información del Proyecto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {datosProyecto.fechaCotizacion && (
                <div>
                  <span className="text-sm font-medium text-slate-700">Fecha de cotización:</span>
                  <p className="text-slate-900">{new Date(datosProyecto.fechaCotizacion).toLocaleDateString('es-ES')}</p>
                </div>
              )}
              {datosProyecto.observaciones && (
                <div>
                  <span className="text-sm font-medium text-slate-700">Observaciones:</span>
                  <p className="text-slate-900">{datosProyecto.observaciones}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Información Adicional */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Política Comercial:</strong> 80% anticipo al confirmar pedido, 20% restante a la entrega. 
          Todos los precios incluyen IVA del 21%. El PAR mostrado ({formatearEUR(calculos.par)}) es el precio 
          recomendado de alquiler para {formatearM2(datosProyecto.metrosCuadrados)} que garantiza la rentabilidad 
          según los parámetros de amortización configurados.
        </AlertDescription>
      </Alert>
    </div>
  );
}