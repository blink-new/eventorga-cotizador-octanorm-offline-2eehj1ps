import React, { useState } from 'react';
import { Save, X, Plus, Trash2, Package, Euro, Ruler } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { 
  formatearEUR,
  formatearM2,
  type PaqueteOctanorm,
  type ComponentePaquete,
  type CostesAdicionales 
} from '../lib/calculator';

interface Props {
  paquete: PaqueteOctanorm;
  onGuardar: (paquete: PaqueteOctanorm) => void;
  onCancelar: () => void;
  modoEdicion?: boolean;
}

export function EditorPaquete({ paquete, onGuardar, onCancelar, modoEdicion = false }: Props) {
  const [paqueteEditado, setPaqueteEditado] = useState<PaqueteOctanorm>({ ...paquete });

  const handleCambiarDatosBasicos = (campo: keyof PaqueteOctanorm, valor: string | number) => {
    setPaqueteEditado({
      ...paqueteEditado,
      [campo]: valor
    });
  };

  const handleCambiarComponente = (index: number, campo: keyof ComponentePaquete, valor: string | number) => {
    const nuevosComponentes = [...paqueteEditado.componentes];
    nuevosComponentes[index] = {
      ...nuevosComponentes[index],
      [campo]: campo === 'nombre' ? valor : Number(valor)
    };
    setPaqueteEditado({
      ...paqueteEditado,
      componentes: nuevosComponentes
    });
  };

  const handleAgregarComponente = () => {
    setPaqueteEditado({
      ...paqueteEditado,
      componentes: [
        ...paqueteEditado.componentes,
        { nombre: 'Nuevo Componente', costeCompra: 0, cantidad: 1, costePorM2: 0 }
      ]
    });
  };

  const handleEliminarComponente = (index: number) => {
    if (paqueteEditado.componentes.length > 1) {
      const nuevosComponentes = paqueteEditado.componentes.filter((_, i) => i !== index);
      setPaqueteEditado({
        ...paqueteEditado,
        componentes: nuevosComponentes
      });
    }
  };

  const handleCambiarCosteAdicional = (campo: keyof CostesAdicionales, valor: number) => {
    setPaqueteEditado({
      ...paqueteEditado,
      costesAdicionales: {
        ...paqueteEditado.costesAdicionales,
        [campo]: valor
      }
    });
  };

  const calcularCosteTotal = () => {
    const costeComponentes = paqueteEditado.componentes.reduce(
      (total, comp) => total + (comp.costeCompra * comp.cantidad), 0
    );
    
    const costeAdicionales = 
      paqueteEditado.costesAdicionales.grafica +
      paqueteEditado.costesAdicionales.logistica +
      paqueteEditado.costesAdicionales.instalacion +
      (paqueteEditado.costesAdicionales.tarima || 0);
    
    return costeComponentes + costeAdicionales;
  };

  const calcularCostePorM2Adicional = () => {
    const costePorM2Componentes = paqueteEditado.componentes.reduce(
      (total, comp) => total + (comp.costePorM2 || 0), 0
    );
    
    const costePorM2Adicionales = 
      (paqueteEditado.costesAdicionales.graficaPorM2 || 0) +
      (paqueteEditado.costesAdicionales.logisticaPorM2 || 0) +
      (paqueteEditado.costesAdicionales.instalacionPorM2 || 0) +
      (paqueteEditado.costesAdicionales.tarimaPorM2 || 0);
    
    return costePorM2Componentes + costePorM2Adicionales;
  };

  const handleGuardar = () => {
    onGuardar(paqueteEditado);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="text-2xl flex items-center">
                <Package className="h-6 w-6 mr-2 text-purple-600" />
                {modoEdicion ? 'Editar Paquete' : 'Crear Paquete Personalizado'}
              </CardTitle>
              <CardDescription className="text-lg mt-2">
                Configure todos los componentes y costes de forma detallada
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button onClick={handleGuardar} className="px-6">
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
              <Button onClick={onCancelar} variant="outline">
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Datos Básicos */}
      <Card>
        <CardHeader>
          <CardTitle>Información Básica del Paquete</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre del Paquete *</Label>
              <Input
                id="nombre"
                value={paqueteEditado.nombre}
                onChange={(e) => handleCambiarDatosBasicos('nombre', e.target.value)}
                placeholder="Ej: Paquete Premium Personalizado"
              />
            </div>
            
            <div>
              <Label htmlFor="metrosBase">Metros Cuadrados Base</Label>
              <div className="relative">
                <Input
                  id="metrosBase"
                  type="number"
                  step="0.1"
                  min="0"
                  value={paqueteEditado.metrosCuadradosBase || 0}
                  onChange={(e) => handleCambiarDatosBasicos('metrosCuadradosBase', Number(e.target.value))}
                  placeholder="0"
                  className="pr-12"
                />
                <span className="absolute right-3 top-1/2 transform -translate-y-1/2 text-sm text-slate-500">
                  m²
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Superficie incluida en el coste base (sin coste adicional por m²)
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={paqueteEditado.descripcion}
              onChange={(e) => handleCambiarDatosBasicos('descripcion', e.target.value)}
              placeholder="Describe las características y uso recomendado de este paquete..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Componentes Octanorm */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Componentes Octanorm</CardTitle>
              <CardDescription>
                Configure cada componente con su coste base y coste adicional por metro cuadrado
              </CardDescription>
            </div>
            <Button onClick={handleAgregarComponente} variant="outline" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Agregar Componente
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paqueteEditado.componentes.map((componente, index) => (
              <div key={index} className="border rounded-lg p-4 bg-slate-50">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-medium text-slate-900">Componente {index + 1}</h4>
                  {paqueteEditado.componentes.length > 1 && (
                    <Button
                      onClick={() => handleEliminarComponente(index)}
                      variant="ghost"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <Label htmlFor={`comp-nombre-${index}`}>Nombre *</Label>
                    <Input
                      id={`comp-nombre-${index}`}
                      value={componente.nombre}
                      onChange={(e) => handleCambiarComponente(index, 'nombre', e.target.value)}
                      placeholder="Ej: Perfiles 2m"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`comp-cantidad-${index}`}>Cantidad</Label>
                    <Input
                      id={`comp-cantidad-${index}`}
                      type="number"
                      min="0"
                      value={componente.cantidad}
                      onChange={(e) => handleCambiarComponente(index, 'cantidad', e.target.value)}
                      placeholder="0"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`comp-coste-${index}`}>Coste Unitario</Label>
                    <div className="relative">
                      <Input
                        id={`comp-coste-${index}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={componente.costeCompra}
                        onChange={(e) => handleCambiarComponente(index, 'costeCompra', e.target.value)}
                        placeholder="0.00"
                        className="pr-8"
                      />
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-slate-500">
                        €
                      </span>
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`comp-m2-${index}`}>Coste por m² extra</Label>
                    <div className="relative">
                      <Input
                        id={`comp-m2-${index}`}
                        type="number"
                        step="0.01"
                        min="0"
                        value={componente.costePorM2 || 0}
                        onChange={(e) => handleCambiarComponente(index, 'costePorM2', e.target.value)}
                        placeholder="0.00"
                        className="pr-12"
                      />
                      <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-slate-500">
                        €/m²
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-3 pt-3 border-t bg-white rounded p-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Coste base:</span>
                    <span className="font-medium">{formatearEUR(componente.costeCompra * componente.cantidad)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-slate-600">Coste por m² adicional:</span>
                    <span className="font-medium text-orange-600">{formatearEUR(componente.costePorM2 || 0)}/m²</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Costes Adicionales */}
      <Card>
        <CardHeader>
          <CardTitle>Costes Adicionales</CardTitle>
          <CardDescription>
            Configure los costes de servicios adicionales (base + coste por m² extra)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Gráfica */}
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Gráfica</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="grafica-base">Coste Base</Label>
                  <div className="relative">
                    <Input
                      id="grafica-base"
                      type="number"
                      step="0.01"
                      min="0"
                      value={paqueteEditado.costesAdicionales.grafica}
                      onChange={(e) => handleCambiarCosteAdicional('grafica', Number(e.target.value))}
                      className="pr-8"
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-slate-500">€</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="grafica-m2">Por m² extra</Label>
                  <div className="relative">
                    <Input
                      id="grafica-m2"
                      type="number"
                      step="0.01"
                      min="0"
                      value={paqueteEditado.costesAdicionales.graficaPorM2 || 0}
                      onChange={(e) => handleCambiarCosteAdicional('graficaPorM2', Number(e.target.value))}
                      className="pr-12"
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-slate-500">€/m²</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Logística */}
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Logística</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="logistica-base">Coste Base</Label>
                  <div className="relative">
                    <Input
                      id="logistica-base"
                      type="number"
                      step="0.01"
                      min="0"
                      value={paqueteEditado.costesAdicionales.logistica}
                      onChange={(e) => handleCambiarCosteAdicional('logistica', Number(e.target.value))}
                      className="pr-8"
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-slate-500">€</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="logistica-m2">Por m² extra</Label>
                  <div className="relative">
                    <Input
                      id="logistica-m2"
                      type="number"
                      step="0.01"
                      min="0"
                      value={paqueteEditado.costesAdicionales.logisticaPorM2 || 0}
                      onChange={(e) => handleCambiarCosteAdicional('logisticaPorM2', Number(e.target.value))}
                      className="pr-12"
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-slate-500">€/m²</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Instalación */}
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Instalación</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="instalacion-base">Coste Base</Label>
                  <div className="relative">
                    <Input
                      id="instalacion-base"
                      type="number"
                      step="0.01"
                      min="0"
                      value={paqueteEditado.costesAdicionales.instalacion}
                      onChange={(e) => handleCambiarCosteAdicional('instalacion', Number(e.target.value))}
                      className="pr-8"
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-slate-500">€</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="instalacion-m2">Por m² extra</Label>
                  <div className="relative">
                    <Input
                      id="instalacion-m2"
                      type="number"
                      step="0.01"
                      min="0"
                      value={paqueteEditado.costesAdicionales.instalacionPorM2 || 0}
                      onChange={(e) => handleCambiarCosteAdicional('instalacionPorM2', Number(e.target.value))}
                      className="pr-12"
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-slate-500">€/m²</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Tarima */}
            <div className="space-y-3">
              <h4 className="font-medium text-slate-900">Tarima (Opcional)</h4>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="tarima-base">Coste Base</Label>
                  <div className="relative">
                    <Input
                      id="tarima-base"
                      type="number"
                      step="0.01"
                      min="0"
                      value={paqueteEditado.costesAdicionales.tarima || 0}
                      onChange={(e) => handleCambiarCosteAdicional('tarima', Number(e.target.value))}
                      className="pr-8"
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-slate-500">€</span>
                  </div>
                </div>
                <div>
                  <Label htmlFor="tarima-m2">Por m² extra</Label>
                  <div className="relative">
                    <Input
                      id="tarima-m2"
                      type="number"
                      step="0.01"
                      min="0"
                      value={paqueteEditado.costesAdicionales.tarimaPorM2 || 0}
                      onChange={(e) => handleCambiarCosteAdicional('tarimaPorM2', Number(e.target.value))}
                      className="pr-12"
                    />
                    <span className="absolute right-2 top-1/2 transform -translate-y-1/2 text-xs text-slate-500">€/m²</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Costes */}
      <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Euro className="h-5 w-5 mr-2 text-green-600" />
            Resumen de Costes del Paquete
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-sm text-slate-600">Coste Base Total</p>
              <p className="text-2xl font-bold text-slate-900">{formatearEUR(calcularCosteTotal())}</p>
              <p className="text-xs text-slate-500">
                Para {formatearM2(paqueteEditado.metrosCuadradosBase || 0)} base
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-slate-600">Coste Adicional por m²</p>
              <p className="text-2xl font-bold text-orange-600">{formatearEUR(calcularCostePorM2Adicional())}</p>
              <p className="text-xs text-slate-500">
                Por cada m² adicional
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-sm text-slate-600">Ejemplo para 50m²</p>
              <p className="text-2xl font-bold text-blue-600">
                {formatearEUR(calcularCosteTotal() + calcularCostePorM2Adicional() * Math.max(0, 50 - (paqueteEditado.metrosCuadradosBase || 0)))}
              </p>
              <p className="text-xs text-slate-500">
                Coste total estimado
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Información */}
      <Alert>
        <Ruler className="h-4 w-4" />
        <AlertDescription>
          <strong>Escalabilidad por metros cuadrados:</strong> El coste base incluye los componentes y servicios 
          para la superficie base configurada ({formatearM2(paqueteEditado.metrosCuadradosBase || 0)}). 
          Para superficies mayores, se aplicarán automáticamente los costes adicionales por m² configurados.
        </AlertDescription>
      </Alert>

      {/* Botones de Acción */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button onClick={onCancelar} variant="outline" size="lg">
          <X className="h-4 w-4 mr-2" />
          Cancelar
        </Button>
        <Button onClick={handleGuardar} size="lg" className="px-8">
          <Save className="h-4 w-4 mr-2" />
          {modoEdicion ? 'Guardar Cambios' : 'Crear Paquete'}
        </Button>
      </div>
    </div>
  );
}