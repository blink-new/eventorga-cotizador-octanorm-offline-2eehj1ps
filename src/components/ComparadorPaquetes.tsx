import React, { useState } from 'react';
import { Scale, Package, Calculator, ArrowRight, Check, X } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { 
  PAQUETES_OCTANORM, 
  CONFIGURACION_DEFAULT, 
  calcularCotizacion, 
  formatearEUR,
  formatearM2,
  type PaqueteOctanorm,
  type ConfiguracionBase,
  type DatosProyecto 
} from '../lib/calculator';

interface Props {
  paquetes: PaqueteOctanorm[];
  datosProyecto: DatosProyecto;
  configuracion: ConfiguracionBase;
  onSeleccionarPaquete: (paquete: PaqueteOctanorm) => void;
}

export function ComparadorPaquetes({ paquetes, datosProyecto: datosProyectoInicial, configuracion: configuracionInicial, onSeleccionarPaquete }: Props) {
  const [metrosCuadrados, setMetrosCuadrados] = useState(datosProyectoInicial.metrosCuadrados);
  const [configuracion] = useState<ConfiguracionBase>(configuracionInicial);
  const [paquetesSeleccionados, setPaquetesSeleccionados] = useState<string[]>(
    paquetes.slice(0, 3).map(p => p.id)
  );

  const datosProyecto: DatosProyecto = {
    ...datosProyectoInicial,
    metrosCuadrados,
    nombreCliente: 'Comparación',
    nombreProyecto: 'Análisis de paquetes',
  };

  const paquetesAComparar = paquetes.filter(p => paquetesSeleccionados.includes(p.id));
  const resultados = paquetesAComparar.map(paquete => ({
    paquete,
    resultado: calcularCotizacion(paquete, datosProyecto, configuracion)
  }));

  const togglePaquete = (paqueteId: string) => {
    setPaquetesSeleccionados(prev => 
      prev.includes(paqueteId) 
        ? prev.filter(id => id !== paqueteId)
        : [...prev, paqueteId]
    );
  };

  const mejorOpcion = resultados.reduce((mejor, actual) => 
    actual.resultado.calculos.par < mejor.resultado.calculos.par ? actual : mejor
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Scale className="h-5 w-5 mr-2 text-purple-600" />
            Comparador de Paquetes Octanorm
          </CardTitle>
          <CardDescription>
            Compare diferentes paquetes lado a lado para encontrar la mejor opción para su proyecto
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <Label htmlFor="metrosComparar" className="text-sm font-medium">
                Metros cuadrados del stand
              </Label>
              <Input
                id="metrosComparar"
                type="number"
                step="0.1"
                min="1"
                value={metrosCuadrados}
                onChange={(e) => setMetrosCuadrados(Number(e.target.value))}
                className="mt-1"
              />
            </div>
            
            <div className="flex-1">
              <Label className="text-sm font-medium">Paquetes a comparar</Label>
              <div className="flex flex-wrap gap-2 mt-1">
                {paquetes.map(paquete => (
                  <Button
                    key={paquete.id}
                    variant={paquetesSeleccionados.includes(paquete.id) ? "default" : "outline"}
                    size="sm"
                    onClick={() => togglePaquete(paquete.id)}
                  >
                    {paquete.nombre}
                  </Button>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabla de Comparación */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {resultados.map(({ paquete, resultado }) => {
          const esMejorOpcion = paquete.id === mejorOpcion.paquete.id;
          const metrosAdicionales = Math.max(0, metrosCuadrados - (paquete.metrosCuadradosBase || 0));
          
          return (
            <Card 
              key={paquete.id}
              className={`relative ${esMejorOpcion ? 'ring-2 ring-green-500 bg-green-50' : ''}`}
            >
              {esMejorOpcion && (
                <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                  <Badge className="bg-green-500 text-white">
                    <Check className="h-3 w-3 mr-1" />
                    Mejor Opción
                  </Badge>
                </div>
              )}
              
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{paquete.nombre}</span>
                  <Badge variant={
                    paquete.id === 'essential' ? 'secondary' : 
                    paquete.id === 'impact' ? 'default' : 'destructive'
                  }>
                    {paquete.id === 'essential' ? 'Básico' : 
                     paquete.id === 'impact' ? 'Intermedio' : 'Premium'}
                  </Badge>
                </CardTitle>
                <CardDescription>{paquete.descripcion}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Precios Principales */}
                <div className="text-center space-y-2">
                  <div>
                    <p className="text-sm text-slate-600">PAR (sin IVA)</p>
                    <p className="text-2xl font-bold text-slate-900">
                      {formatearEUR(resultado.calculos.par)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-600">PAR (con IVA 21%)</p>
                    <p className="text-lg font-semibold text-blue-600">
                      {formatearEUR(resultado.calculos.parConIva)}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-slate-500">
                      {formatearEUR(resultado.calculos.costePorM2)}/m²
                    </p>
                  </div>
                </div>
                
                <Separator />
                
                {/* Detalles de Superficie */}
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900">Superficie</h4>
                  <div className="text-sm space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Total del proyecto:</span>
                      <span className="font-medium">{formatearM2(metrosCuadrados)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-green-600">Base incluida:</span>
                      <span className="font-medium text-green-600">
                        {formatearM2(paquete.metrosCuadradosBase || 0)}
                      </span>
                    </div>
                    {metrosAdicionales > 0 && (
                      <div className="flex justify-between">
                        <span className="text-orange-600">Superficie adicional:</span>
                        <span className="font-medium text-orange-600">
                          {formatearM2(metrosAdicionales)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                {/* Componentes Principales */}
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900">Componentes</h4>
                  <div className="text-xs space-y-1">
                    {paquete.componentes.slice(0, 4).map((comp, idx) => (
                      <div key={idx} className="flex justify-between">
                        <span className="text-slate-600">{comp.nombre}</span>
                        <span>{comp.cantidad} uds</span>
                      </div>
                    ))}
                    {paquete.componentes.length > 4 && (
                      <p className="text-slate-500 text-center">
                        ... y {paquete.componentes.length - 4} componentes más
                      </p>
                    )}
                  </div>
                </div>
                
                <Separator />
                
                {/* Desglose de Costes */}
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900">Desglose</h4>
                  <div className="text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-600">CTP:</span>
                      <span className="font-medium">{formatearEUR(resultado.calculos.ctp)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Amortización:</span>
                      <span>{formatearEUR(resultado.calculos.costeAmortizadoEvento)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Reposición:</span>
                      <span>{formatearEUR(resultado.calculos.costeReposicion)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-600">Overhead:</span>
                      <span>{formatearEUR(resultado.calculos.overhead)}</span>
                    </div>
                  </div>
                </div>
                
                {/* Ventajas/Desventajas */}
                <div className="space-y-2">
                  <h4 className="font-medium text-slate-900">Características</h4>
                  <div className="text-xs space-y-1">
                    {paquete.id === 'essential' && (
                      <>
                        <div className="flex items-center text-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          <span>Más económico</span>
                        </div>
                        <div className="flex items-center text-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          <span>Rápida instalación</span>
                        </div>
                        <div className="flex items-center text-red-600">
                          <X className="h-3 w-3 mr-1" />
                          <span>Limitado para stands grandes</span>
                        </div>
                      </>
                    )}
                    {paquete.id === 'impact' && (
                      <>
                        <div className="flex items-center text-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          <span>Equilibrio precio/prestaciones</span>
                        </div>
                        <div className="flex items-center text-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          <span>Versatilidad de diseño</span>
                        </div>
                        <div className="flex items-center text-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          <span>Escalable hasta 50m²</span>
                        </div>
                      </>
                    )}
                    {paquete.id === 'premium' && (
                      <>
                        <div className="flex items-center text-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          <span>Máxima flexibilidad</span>
                        </div>
                        <div className="flex items-center text-green-600">
                          <Check className="h-3 w-3 mr-1" />
                          <span>Componentes especiales</span>
                        </div>
                        <div className="flex items-center text-red-600">
                          <X className="h-3 w-3 mr-1" />
                          <span>Mayor inversión inicial</span>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                
                {/* Botón de Selección */}
                <Button 
                  className="w-full mt-4"
                  onClick={() => onSeleccionarPaquete(paquete)}
                  variant={esMejorOpcion ? "default" : "outline"}
                >
                  <Calculator className="h-4 w-4 mr-2" />
                  Seleccionar {paquete.nombre}
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
      
      {/* Resumen de Comparación */}
      <Card>
        <CardHeader>
          <CardTitle>Resumen de Comparación</CardTitle>
          <CardDescription>
            Análisis comparativo para {formatearM2(metrosCuadrados)} de stand
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 font-medium">Opción más económica</p>
              <p className="text-lg font-bold text-green-800">
                {mejorOpcion.paquete.nombre}
              </p>
              <p className="text-sm text-green-600">
                {formatearEUR(mejorOpcion.resultado.calculos.parConIva)}
              </p>
            </div>
            
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 font-medium">Diferencia de precio</p>
              <p className="text-lg font-bold text-blue-800">
                {formatearEUR(
                  Math.max(...resultados.map(r => r.resultado.calculos.parConIva)) - 
                  Math.min(...resultados.map(r => r.resultado.calculos.parConIva))
                )}
              </p>
              <p className="text-sm text-blue-600">Entre opciones</p>
            </div>
            
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-purple-700 font-medium">Coste promedio por m²</p>
              <p className="text-lg font-bold text-purple-800">
                {formatearEUR(
                  resultados.reduce((sum, r) => sum + r.resultado.calculos.costePorM2, 0) / resultados.length
                )}
              </p>
              <p className="text-sm text-purple-600">Media de opciones</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}