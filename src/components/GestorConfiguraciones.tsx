import React, { useState, useEffect } from 'react';
import { Save, FolderOpen, Trash2, Download, Upload, Settings } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from './ui/dialog';
import { type ConfiguracionBase, CONFIGURACION_DEFAULT } from '../lib/calculator';

interface ConfiguracionGuardada {
  id: string;
  nombre: string;
  descripcion?: string;
  configuracion: ConfiguracionBase;
  fechaCreacion: string;
  fechaModificacion: string;
}

interface Props {
  configuracionActual: ConfiguracionBase;
  onCargarConfiguracion: (configuracion: ConfiguracionBase) => void;
  onGuardarConfiguracion?: (configuracion: ConfiguracionBase, nombre: string) => void;
}

const STORAGE_KEY = 'eventorga_configuraciones_guardadas';

export function GestorConfiguraciones({ 
  configuracionActual, 
  onCargarConfiguracion, 
  onGuardarConfiguracion 
}: Props) {
  const [configuraciones, setConfiguraciones] = useState<ConfiguracionGuardada[]>([]);
  const [nombreNuevaConfig, setNombreNuevaConfig] = useState('');
  const [descripcionNuevaConfig, setDescripcionNuevaConfig] = useState('');
  const [mostrarDialogoGuardar, setMostrarDialogoGuardar] = useState(false);
  const [mostrarDialogoCargar, setMostrarDialogoCargar] = useState(false);

  // Cargar configuraciones guardadas al inicializar
  useEffect(() => {
    cargarConfiguracionesDesdeStorage();
  }, []);

  const cargarConfiguracionesDesdeStorage = () => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const configs = JSON.parse(stored) as ConfiguracionGuardada[];
        setConfiguraciones(configs);
      }
    } catch (error) {
      console.error('Error cargando configuraciones:', error);
    }
  };

  const guardarConfiguracionesEnStorage = (configs: ConfiguracionGuardada[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
      setConfiguraciones(configs);
    } catch (error) {
      console.error('Error guardando configuraciones:', error);
    }
  };

  const handleGuardarConfiguracion = () => {
    if (!nombreNuevaConfig.trim()) return;

    const nuevaConfiguracion: ConfiguracionGuardada = {
      id: `config_${Date.now()}`,
      nombre: nombreNuevaConfig.trim(),
      descripcion: descripcionNuevaConfig.trim() || undefined,
      configuracion: { ...configuracionActual },
      fechaCreacion: new Date().toISOString(),
      fechaModificacion: new Date().toISOString()
    };

    const nuevasConfiguraciones = [...configuraciones, nuevaConfiguracion];
    guardarConfiguracionesEnStorage(nuevasConfiguraciones);

    // Callback opcional para notificar al componente padre
    if (onGuardarConfiguracion) {
      onGuardarConfiguracion(configuracionActual, nombreNuevaConfig);
    }

    // Limpiar formulario y cerrar diálogo
    setNombreNuevaConfig('');
    setDescripcionNuevaConfig('');
    setMostrarDialogoGuardar(false);
  };

  const handleCargarConfiguracion = (config: ConfiguracionGuardada) => {
    onCargarConfiguracion(config.configuracion);
    setMostrarDialogoCargar(false);
  };

  const handleEliminarConfiguracion = (id: string) => {
    const nuevasConfiguraciones = configuraciones.filter(c => c.id !== id);
    guardarConfiguracionesEnStorage(nuevasConfiguraciones);
  };

  const handleRestaurarDefecto = () => {
    onCargarConfiguracion(CONFIGURACION_DEFAULT);
    setMostrarDialogoCargar(false);
  };

  const exportarConfiguraciones = () => {
    const dataStr = JSON.stringify(configuraciones, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `eventorga_configuraciones_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const importarConfiguraciones = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedConfigs = JSON.parse(e.target?.result as string) as ConfiguracionGuardada[];
        
        // Validar estructura básica
        const configsValidas = importedConfigs.filter(config => 
          config.id && config.nombre && config.configuracion &&
          typeof config.configuracion.vidaUtilAnios === 'number'
        );

        if (configsValidas.length > 0) {
          // Combinar con configuraciones existentes, evitando duplicados por nombre
          const nombresExistentes = new Set(configuraciones.map(c => c.nombre));
          const configsNuevas = configsValidas.filter(c => !nombresExistentes.has(c.nombre));
          
          const todasLasConfigs = [...configuraciones, ...configsNuevas];
          guardarConfiguracionesEnStorage(todasLasConfigs);
        }
      } catch (error) {
        console.error('Error importando configuraciones:', error);
      }
    };
    reader.readAsText(file);
    
    // Limpiar input
    event.target.value = '';
  };

  const formatearFecha = (fechaISO: string) => {
    return new Date(fechaISO).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const esConfiguracionActual = (config: ConfiguracionBase) => {
    return JSON.stringify(config) === JSON.stringify(configuracionActual);
  };

  return (
    <div className="flex items-center space-x-2">
      {/* Botón Guardar */}
      <Dialog open={mostrarDialogoGuardar} onOpenChange={setMostrarDialogoGuardar}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <Save className="h-4 w-4 mr-2" />
            Guardar Config
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Guardar Configuración Actual</DialogTitle>
            <DialogDescription>
              Guarda los parámetros actuales para reutilizarlos en futuros proyectos
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="nombreConfig">Nombre de la configuración *</Label>
              <Input
                id="nombreConfig"
                value={nombreNuevaConfig}
                onChange={(e) => setNombreNuevaConfig(e.target.value)}
                placeholder="ej: Stands Pequeños, Configuración Premium..."
              />
            </div>
            
            <div>
              <Label htmlFor="descripcionConfig">Descripción (opcional)</Label>
              <Input
                id="descripcionConfig"
                value={descripcionNuevaConfig}
                onChange={(e) => setDescripcionNuevaConfig(e.target.value)}
                placeholder="Describe cuándo usar esta configuración..."
              />
            </div>
            
            <div className="bg-slate-50 p-3 rounded-lg">
              <h4 className="text-sm font-medium text-slate-700 mb-2">Configuración actual:</h4>
              <div className="text-xs text-slate-600 space-y-1">
                <div>• Vida útil: {configuracionActual.vidaUtilAnios} años</div>
                <div>• Frecuencia: {configuracionActual.frecuenciaUsoAnual} eventos/año</div>
                <div>• Tasa rotura: {(configuracionActual.tasaRotura * 100).toFixed(1)}%</div>
                <div>• Overhead: {(configuracionActual.overhead * 100).toFixed(1)}%</div>
                <div>• Margen: {(configuracionActual.margen * 100).toFixed(1)}%</div>
                <div>• IVA: {(configuracionActual.iva * 100).toFixed(1)}%</div>
              </div>
            </div>
            
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                onClick={() => setMostrarDialogoGuardar(false)}
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleGuardarConfiguracion}
                disabled={!nombreNuevaConfig.trim()}
              >
                <Save className="h-4 w-4 mr-2" />
                Guardar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Botón Cargar */}
      <Dialog open={mostrarDialogoCargar} onOpenChange={setMostrarDialogoCargar}>
        <DialogTrigger asChild>
          <Button variant="outline" size="sm">
            <FolderOpen className="h-4 w-4 mr-2" />
            Cargar Config
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Cargar Configuración Guardada</DialogTitle>
            <DialogDescription>
              Selecciona una configuración guardada o restaura los valores por defecto
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Configuración por defecto */}
            <Card className="border-blue-200 bg-blue-50">
              <CardHeader className="pb-3">
                <div className="flex justify-between items-center">
                  <div>
                    <CardTitle className="text-base">Configuración por Defecto</CardTitle>
                    <CardDescription>Valores recomendados según especificaciones Octanorm</CardDescription>
                  </div>
                  <Button 
                    size="sm" 
                    onClick={handleRestaurarDefecto}
                    disabled={esConfiguracionActual(CONFIGURACION_DEFAULT)}
                  >
                    {esConfiguracionActual(CONFIGURACION_DEFAULT) ? 'Actual' : 'Cargar'}
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-slate-600 grid grid-cols-2 gap-2">
                  <div>• Vida útil: {CONFIGURACION_DEFAULT.vidaUtilAnios} años</div>
                  <div>• Frecuencia: {CONFIGURACION_DEFAULT.frecuenciaUsoAnual} eventos/año</div>
                  <div>• Tasa rotura: {(CONFIGURACION_DEFAULT.tasaRotura * 100).toFixed(1)}%</div>
                  <div>• Overhead: {(CONFIGURACION_DEFAULT.overhead * 100).toFixed(1)}%</div>
                  <div>• Margen: {(CONFIGURACION_DEFAULT.margen * 100).toFixed(1)}%</div>
                  <div>• IVA: {(CONFIGURACION_DEFAULT.iva * 100).toFixed(1)}%</div>
                </div>
              </CardContent>
            </Card>
            
            <Separator />
            
            {/* Configuraciones guardadas */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-slate-700">
                  Configuraciones Guardadas ({configuraciones.length})
                </h4>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="sm" onClick={exportarConfiguraciones}>
                    <Download className="h-4 w-4 mr-1" />
                    Exportar
                  </Button>
                  <label className="cursor-pointer">
                    <Button variant="ghost" size="sm" asChild>
                      <span>
                        <Upload className="h-4 w-4 mr-1" />
                        Importar
                      </span>
                    </Button>
                    <input
                      type="file"
                      accept=".json"
                      onChange={importarConfiguraciones}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>
              
              {configuraciones.length === 0 ? (
                <Alert>
                  <Settings className="h-4 w-4" />
                  <AlertDescription>
                    No hay configuraciones guardadas. Guarda tu configuración actual para reutilizarla más tarde.
                  </AlertDescription>
                </Alert>
              ) : (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {configuraciones.map((config) => (
                    <Card key={config.id} className="border-slate-200">
                      <CardContent className="p-3">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-1">
                              <h5 className="text-sm font-medium text-slate-900">{config.nombre}</h5>
                              {esConfiguracionActual(config.configuracion) && (
                                <Badge variant="default" className="text-xs">Actual</Badge>
                              )}
                            </div>
                            {config.descripcion && (
                              <p className="text-xs text-slate-600 mb-2">{config.descripcion}</p>
                            )}
                            <div className="text-xs text-slate-500 grid grid-cols-3 gap-1">
                              <div>Vida: {config.configuracion.vidaUtilAnios}a</div>
                              <div>Freq: {config.configuracion.frecuenciaUsoAnual}/a</div>
                              <div>Margen: {(config.configuracion.margen * 100).toFixed(0)}%</div>
                            </div>
                            <p className="text-xs text-slate-400 mt-1">
                              Guardado: {formatearFecha(config.fechaCreacion)}
                            </p>
                          </div>
                          <div className="flex space-x-1 ml-2">
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleCargarConfiguracion(config)}
                              disabled={esConfiguracionActual(config.configuracion)}
                            >
                              Cargar
                            </Button>
                            <Button 
                              size="sm" 
                              variant="ghost"
                              onClick={() => handleEliminarConfiguracion(config.id)}
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}