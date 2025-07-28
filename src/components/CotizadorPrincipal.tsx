import React, { useState } from 'react';
import { Calculator, Package, Settings, ArrowRight, Edit, Plus, Ruler } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { EditorPaquete } from './EditorPaquete';
import { 
  PAQUETES_OCTANORM, 
  CONFIGURACION_DEFAULT, 
  calcularCotizacion, 
  formatearEUR,
  formatearM2,
  crearPaquetePersonalizado,
  type PaqueteOctanorm,
  type ConfiguracionBase,
  type ResultadoCalculo,
  type DatosProyecto 
} from '../lib/calculator';

interface Props {
  onCalculoCompleto: (resultado: ResultadoCalculo) => void;
}

export function CotizadorPrincipal({ onCalculoCompleto }: Props) {
  const [paquetes, setPaquetes] = useState<PaqueteOctanorm[]>(PAQUETES_OCTANORM);
  const [paqueteSeleccionado, setPaqueteSeleccionado] = useState<PaqueteOctanorm | null>(null);
  const [configuracion, setConfiguracion] = useState<ConfiguracionBase>(CONFIGURACION_DEFAULT);
  const [datosProyecto, setDatosProyecto] = useState<DatosProyecto>({
    metrosCuadrados: 25,
    nombreCliente: '',
    nombreProyecto: '',
    fechaCotizacion: new Date().toISOString().split('T')[0],
    observaciones: ''
  });
  const [mostrarConfiguracion, setMostrarConfiguracion] = useState(false);
  const [mostrarEditor, setMostrarEditor] = useState(false);
  const [paqueteEnEdicion, setPaqueteEnEdicion] = useState<PaqueteOctanorm | null>(null);

  const handleSeleccionarPaquete = (paquete: PaqueteOctanorm) => {
    setPaqueteSeleccionado(paquete);
  };

  const handleCalcular = () => {
    if (!paqueteSeleccionado) return;
    
    const resultado = calcularCotizacion(paqueteSeleccionado, datosProyecto, configuracion);
    onCalculoCompleto(resultado);
  };

  const handleCrearPaquetePersonalizado = () => {
    const nuevoPaquete = crearPaquetePersonalizado();
    setPaqueteEnEdicion(nuevoPaquete);
    setMostrarEditor(true);
  };

  const handleEditarPaquete = (paquete: PaqueteOctanorm) => {
    setPaqueteEnEdicion({ ...paquete });
    setMostrarEditor(true);
  };

  const handleGuardarPaquete = (paquete: PaqueteOctanorm) => {
    if (paquete.id === 'personalizado' || !paquetes.find(p => p.id === paquete.id)) {
      // Nuevo paquete personalizado
      const nuevoPaquete = {
        ...paquete,
        id: `personalizado_${Date.now()}`
      };
      setPaquetes([...paquetes, nuevoPaquete]);
      setPaqueteSeleccionado(nuevoPaquete);
    } else {
      // Editar paquete existente
      setPaquetes(paquetes.map(p => p.id === paquete.id ? paquete : p));
      if (paqueteSeleccionado?.id === paquete.id) {
        setPaqueteSeleccionado(paquete);
      }
    }
    setMostrarEditor(false);
    setPaqueteEnEdicion(null);
  };

  const handleCancelarEditor = () => {
    setMostrarEditor(false);
    setPaqueteEnEdicion(null);
  };

  const calcularCosteEstimado = (paquete: PaqueteOctanorm, metros: number) => {
    const metrosBase = paquete.metrosCuadradosBase || 0;
    const metrosAdicionales = Math.max(0, metros - metrosBase);
    
    const costeComponentes = paquete.componentes.reduce(
      (total, comp) => total + (comp.costeCompra * comp.cantidad) + (comp.costePorM2 || 0) * metrosAdicionales, 0
    );
    
    const costeAdicionales = 
      paquete.costesAdicionales.grafica + (paquete.costesAdicionales.graficaPorM2 || 0) * metrosAdicionales +
      paquete.costesAdicionales.logistica + (paquete.costesAdicionales.logisticaPorM2 || 0) * metrosAdicionales +
      paquete.costesAdicionales.instalacion + (paquete.costesAdicionales.instalacionPorM2 || 0) * metrosAdicionales +
      (paquete.costesAdicionales.tarima || 0) + (paquete.costesAdicionales.tarimaPorM2 || 0) * metrosAdicionales;
    
    return costeComponentes + costeAdicionales;
  };

  if (mostrarEditor && paqueteEnEdicion) {
    return (
      <EditorPaquete
        paquete={paqueteEnEdicion}
        onGuardar={handleGuardarPaquete}
        onCancelar={handleCancelarEditor}
        modoEdicion={paqueteEnEdicion.id !== 'personalizado'}
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* Datos del Proyecto */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Ruler className="h-5 w-5 mr-2 text-blue-600" />
            Configuración del Proyecto
          </CardTitle>
          <CardDescription>
            Configure los metros cuadrados y detalles específicos de su stand
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="md:col-span-2 lg:col-span-1">
              <Label htmlFor="metrosCuadrados" className="text-base font-semibold">
                Metros Cuadrados del Stand *
              </Label>
              <div className="relative">
                <Input
                  id="metrosCuadrados"
                  type="number"
                  step="0.1"
                  min="1"
                  value={datosProyecto.metrosCuadrados}
                  onChange={(e) => setDatosProyecto({
                    ...datosProyecto,
                    metrosCuadrados: Number(e.target.value)
                  })}
                  placeholder="25.0"
                  className="text-2xl font-bold text-blue-600 pr-12 h-14 border-2 border-blue-200 focus:border-blue-400"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-slate-500">
                  m²
                </span>
              </div>
              <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-700 font-medium flex items-center">
                  📐 Superficie total a diseñar y construir
                </p>
                <p className="text-xs text-blue-600 mt-1">
                  Los costes se escalarán automáticamente según esta superficie
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  💡 Cada paquete tiene una superficie base incluida + coste variable por m² adicional
                </p>
              </div>
            </div>
            
            <div>
              <Label htmlFor="nombreCliente">Cliente</Label>
              <Input
                id="nombreCliente"
                value={datosProyecto.nombreCliente}
                onChange={(e) => setDatosProyecto({
                  ...datosProyecto,
                  nombreCliente: e.target.value
                })}
                placeholder="Nombre del cliente"
              />
            </div>
            
            <div>
              <Label htmlFor="nombreProyecto">Proyecto</Label>
              <Input
                id="nombreProyecto"
                value={datosProyecto.nombreProyecto}
                onChange={(e) => setDatosProyecto({
                  ...datosProyecto,
                  nombreProyecto: e.target.value
                })}
                placeholder="Nombre del proyecto"
              />
            </div>
            
            <div>
              <Label htmlFor="fechaCotizacion">Fecha</Label>
              <Input
                id="fechaCotizacion"
                type="date"
                value={datosProyecto.fechaCotizacion}
                onChange={(e) => setDatosProyecto({
                  ...datosProyecto,
                  fechaCotizacion: e.target.value
                })}
              />
            </div>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="observaciones">Observaciones</Label>
            <Textarea
              id="observaciones"
              value={datosProyecto.observaciones}
              onChange={(e) => setDatosProyecto({
                ...datosProyecto,
                observaciones: e.target.value
              })}
              placeholder="Notas adicionales sobre el proyecto..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Selector de Paquetes */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-2xl font-bold text-slate-900 flex items-center">
            <Package className="h-6 w-6 mr-2 text-blue-600" />
            Selecciona tu Paquete Octanorm
          </h3>
          <Button onClick={handleCrearPaquetePersonalizado} variant="outline">
            <Plus className="h-4 w-4 mr-2" />
            Crear Personalizado
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {paquetes.map((paquete) => {
            const costeEstimado = calcularCosteEstimado(paquete, datosProyecto.metrosCuadrados);
            const esPersonalizado = paquete.id.startsWith('personalizado');
            
            return (
              <Card 
                key={paquete.id}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  paqueteSeleccionado?.id === paquete.id 
                    ? 'ring-2 ring-blue-500 bg-blue-50' 
                    : 'hover:bg-slate-50'
                }`}
                onClick={() => handleSeleccionarPaquete(paquete)}
              >
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <CardTitle className="text-xl flex items-center">
                        {paquete.nombre}
                        {esPersonalizado && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditarPaquete(paquete);
                            }}
                            className="ml-2 h-6 w-6 p-0"
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                        )}
                      </CardTitle>
                      <CardDescription>{paquete.descripcion}</CardDescription>
                    </div>
                    <Badge variant={
                      paquete.id === 'essential' ? 'secondary' : 
                      paquete.id === 'impact' ? 'default' : 
                      paquete.id === 'premium' ? 'destructive' : 'outline'
                    }>
                      {paquete.id === 'essential' ? 'Básico' : 
                       paquete.id === 'impact' ? 'Intermedio' : 
                       paquete.id === 'premium' ? 'Premium' : 'Personalizado'}
                    </Badge>
                  </div>
                </CardHeader>
                
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <p className="text-sm font-medium text-slate-700 mb-2">Componentes principales:</p>
                      <ul className="text-sm text-slate-600 space-y-1">
                        {paquete.componentes.slice(0, 3).map((comp, idx) => (
                          <li key={idx}>• {comp.nombre} ({comp.cantidad} uds)</li>
                        ))}
                        {paquete.componentes.length > 3 && (
                          <li className="text-slate-500">... y {paquete.componentes.length - 3} más</li>
                        )}
                      </ul>
                    </div>
                    
                    <Separator />
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-700">Superficie del stand:</span>
                        <span className="text-sm font-bold text-blue-600">
                          {formatearM2(datosProyecto.metrosCuadrados)}
                        </span>
                      </div>
                      
                      <div className="bg-slate-50 p-3 rounded-lg border">
                        <div className="text-xs space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-slate-600">Superficie base incluida:</span>
                            <span className="font-medium text-green-600">
                              {formatearM2(paquete.metrosCuadradosBase || 0)}
                            </span>
                          </div>
                          
                          {paquete.metrosCuadradosBase && datosProyecto.metrosCuadrados > paquete.metrosCuadradosBase && (
                            <div className="flex justify-between items-center">
                              <span className="text-orange-600">Superficie adicional:</span>
                              <span className="font-medium text-orange-600">
                                {formatearM2(datosProyecto.metrosCuadrados - paquete.metrosCuadradosBase)}
                              </span>
                            </div>
                          )}
                          
                          <div className="pt-2 border-t border-slate-200">
                            <div className="flex justify-between items-center">
                              <span className="text-slate-700 font-medium">Total del proyecto:</span>
                              <span className="font-bold text-blue-600">
                                {formatearM2(datosProyecto.metrosCuadrados)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-slate-700">Coste total estimado:</span>
                        <span className="text-lg font-bold text-slate-900">
                          {formatearEUR(costeEstimado)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-500">Coste por m²:</span>
                        <span className="text-xs font-medium text-slate-600">
                          {formatearEUR(costeEstimado / datosProyecto.metrosCuadrados)}/m²
                        </span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Detalles del Paquete Seleccionado */}
      {paqueteSeleccionado && (
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center">
                <Package className="h-5 w-5 mr-2 text-blue-600" />
                Detalles del Paquete {paqueteSeleccionado.nombre}
              </CardTitle>
              {paqueteSeleccionado.id.startsWith('personalizado') && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditarPaquete(paqueteSeleccionado)}
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Componentes */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Componentes Octanorm</h4>
                <div className="space-y-2">
                  {paqueteSeleccionado.componentes.map((comp, idx) => {
                    const metrosAdicionales = Math.max(0, datosProyecto.metrosCuadrados - (paqueteSeleccionado.metrosCuadradosBase || 0));
                    const costeBase = comp.costeCompra * comp.cantidad;
                    const costeAdicional = (comp.costePorM2 || 0) * metrosAdicionales;
                    const costeTotal = costeBase + costeAdicional;
                    
                    return (
                      <div key={idx} className="border-l-2 border-blue-200 pl-3 py-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-700 font-medium">
                            {comp.nombre}
                          </span>
                          <span className="font-bold">{formatearEUR(costeTotal)}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-2 space-y-1 bg-slate-50 p-2 rounded">
                          <div className="flex justify-between">
                            <span className="text-slate-600">
                              Base: {comp.cantidad} uds × {formatearEUR(comp.costeCompra)}
                            </span>
                            <span className="font-medium">{formatearEUR(costeBase)}</span>
                          </div>
                          {costeAdicional > 0 && (
                            <div className="flex justify-between text-orange-600">
                              <span>
                                Extra: {formatearM2(metrosAdicionales)} × {formatearEUR(comp.costePorM2 || 0)}/m²
                              </span>
                              <span className="font-medium">+{formatearEUR(costeAdicional)}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-1 border-t border-slate-200">
                            <span className="text-slate-700 font-medium">Total componente:</span>
                            <span className="font-bold text-blue-600">{formatearEUR(costeTotal)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Costes Adicionales */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-3">Costes Adicionales</h4>
                <div className="space-y-2">
                  {Object.entries({
                    grafica: 'Gráfica',
                    logistica: 'Logística', 
                    instalacion: 'Instalación',
                    tarima: 'Tarima'
                  }).map(([key, label]) => {
                    const costeBase = paqueteSeleccionado.costesAdicionales[key as keyof typeof paqueteSeleccionado.costesAdicionales] as number;
                    if (!costeBase && key === 'tarima') return null;
                    
                    const costePorM2Key = `${key}PorM2` as keyof typeof paqueteSeleccionado.costesAdicionales;
                    const costePorM2 = paqueteSeleccionado.costesAdicionales[costePorM2Key] as number || 0;
                    const metrosAdicionales = Math.max(0, datosProyecto.metrosCuadrados - (paqueteSeleccionado.metrosCuadradosBase || 0));
                    const costeAdicional = costePorM2 * metrosAdicionales;
                    const costeTotal = costeBase + costeAdicional;
                    
                    return (
                      <div key={key} className="border-l-2 border-green-200 pl-3 py-2">
                        <div className="flex justify-between items-center text-sm">
                          <span className="text-slate-700 font-medium">
                            {label}
                          </span>
                          <span className="font-bold">{formatearEUR(costeTotal)}</span>
                        </div>
                        <div className="text-xs text-slate-500 mt-2 space-y-1 bg-slate-50 p-2 rounded">
                          <div className="flex justify-between">
                            <span className="text-slate-600">Base:</span>
                            <span className="font-medium">{formatearEUR(costeBase)}</span>
                          </div>
                          {costeAdicional > 0 && (
                            <div className="flex justify-between text-orange-600">
                              <span>Extra: {formatearM2(metrosAdicionales)} × {formatearEUR(costePorM2)}/m²</span>
                              <span className="font-medium">+{formatearEUR(costeAdicional)}</span>
                            </div>
                          )}
                          <div className="flex justify-between pt-1 border-t border-slate-200">
                            <span className="text-slate-700 font-medium">Total {label.toLowerCase()}:</span>
                            <span className="font-bold text-green-600">{formatearEUR(costeTotal)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Configuración Avanzada */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="flex items-center">
              <Settings className="h-5 w-5 mr-2 text-blue-600" />
              Configuración de Cálculo
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setMostrarConfiguracion(!mostrarConfiguracion)}
            >
              {mostrarConfiguracion ? 'Ocultar' : 'Mostrar'} Parámetros
            </Button>
          </div>
          <CardDescription>
            Parámetros utilizados en las fórmulas de amortización y cálculo del PAR
          </CardDescription>
        </CardHeader>
        
        {mostrarConfiguracion && (
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="vidaUtil">Vida Útil (años)</Label>
                <Input
                  id="vidaUtil"
                  type="number"
                  value={configuracion.vidaUtilAnios}
                  onChange={(e) => setConfiguracion({
                    ...configuracion,
                    vidaUtilAnios: Number(e.target.value)
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="frecuencia">Frecuencia Uso (eventos/año)</Label>
                <Input
                  id="frecuencia"
                  type="number"
                  value={configuracion.frecuenciaUsoAnual}
                  onChange={(e) => setConfiguracion({
                    ...configuracion,
                    frecuenciaUsoAnual: Number(e.target.value)
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="tasaRotura">Tasa Rotura (%)</Label>
                <Input
                  id="tasaRotura"
                  type="number"
                  step="0.1"
                  value={configuracion.tasaRotura * 100}
                  onChange={(e) => setConfiguracion({
                    ...configuracion,
                    tasaRotura: Number(e.target.value) / 100
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="overhead">Overhead (%)</Label>
                <Input
                  id="overhead"
                  type="number"
                  step="0.1"
                  value={configuracion.overhead * 100}
                  onChange={(e) => setConfiguracion({
                    ...configuracion,
                    overhead: Number(e.target.value) / 100
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="margen">Margen (%)</Label>
                <Input
                  id="margen"
                  type="number"
                  step="0.1"
                  value={configuracion.margen * 100}
                  onChange={(e) => setConfiguracion({
                    ...configuracion,
                    margen: Number(e.target.value) / 100
                  })}
                />
              </div>
              
              <div>
                <Label htmlFor="iva">IVA (%)</Label>
                <Input
                  id="iva"
                  type="number"
                  step="0.1"
                  value={configuracion.iva * 100}
                  onChange={(e) => setConfiguracion({
                    ...configuracion,
                    iva: Number(e.target.value) / 100
                  })}
                />
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* Botón de Cálculo */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardContent className="pt-6">
          <div className="text-center space-y-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">
                ¿Listo para calcular tu presupuesto personalizado?
              </h3>
              <p className="text-sm text-slate-600 mt-2">
                Obtendrás el CTP (Coste Total del Proyecto) y PAR (Precio Alquiler Recomendado) 
                calculados específicamente para <span className="font-bold text-blue-600">{formatearM2(datosProyecto.metrosCuadrados)}</span> de stand
              </p>
              <p className="text-xs text-slate-500 mt-1">
                💡 Los costes se escalarán automáticamente según la superficie configurada y los componentes seleccionados
              </p>
            </div>
            
            <Button 
              size="lg" 
              onClick={handleCalcular}
              disabled={!paqueteSeleccionado || datosProyecto.metrosCuadrados <= 0}
              className="px-8 py-4 text-lg h-auto"
            >
              <Calculator className="h-6 w-6 mr-3" />
              <div className="text-left">
                <div>Calcular Presupuesto Completo</div>
                <div className="text-sm opacity-90">
                  {paqueteSeleccionado ? paqueteSeleccionado.nombre : 'Selecciona un paquete'} • {formatearM2(datosProyecto.metrosCuadrados)}
                </div>
              </div>
              <ArrowRight className="h-6 w-6 ml-3" />
            </Button>
            
            {(!paqueteSeleccionado || datosProyecto.metrosCuadrados <= 0) && (
              <p className="text-xs text-red-600">
                {!paqueteSeleccionado && "⚠️ Selecciona un paquete Octanorm"}
                {!paqueteSeleccionado && datosProyecto.metrosCuadrados <= 0 && " • "}
                {datosProyecto.metrosCuadrados <= 0 && "⚠️ Indica los metros cuadrados del stand"}
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}