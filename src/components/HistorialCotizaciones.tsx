import React, { useState, useEffect } from 'react';
import { History, Download, Trash2, Eye, Calendar, User, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Alert, AlertDescription } from './ui/alert';
import { 
  formatearEUR,
  formatearM2,
  type ResultadoCalculo
} from '../lib/calculator';

interface CotizacionGuardada extends ResultadoCalculo {
  id: string;
  fechaCreacion: string;
  titulo?: string;
}

interface Props {
  onCargarCotizacion: (cotizacion: CotizacionGuardada) => void;
  onExportarCotizacion: (cotizacion: CotizacionGuardada) => void;
}

const STORAGE_KEY = 'eventorga_cotizaciones_historial';

export function HistorialCotizaciones({ onCargarCotizacion, onExportarCotizacion }: Props) {
  const [cotizaciones, setCotizaciones] = useState<CotizacionGuardada[]>([]);
  const [filtro, setFiltro] = useState('');
  const [ordenPor, setOrdenPor] = useState<'fecha' | 'precio' | 'cliente'>('fecha');

  // Cargar historial del localStorage
  useEffect(() => {
    const historialGuardado = localStorage.getItem(STORAGE_KEY);
    if (historialGuardado) {
      try {
        const cotizacionesParsed = JSON.parse(historialGuardado);
        setCotizaciones(cotizacionesParsed);
      } catch (error) {
        console.error('Error al cargar historial:', error);
      }
    }
  }, []);

  // Eliminar cotización
  const eliminarCotizacion = (id: string) => {
    const cotizacionesFiltradas = cotizaciones.filter(c => c.id !== id);
    setCotizaciones(cotizacionesFiltradas);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cotizacionesFiltradas));
  };

  // Limpiar todo el historial
  const limpiarHistorial = () => {
    setCotizaciones([]);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Filtrar y ordenar cotizaciones
  const cotizacionesFiltradas = cotizaciones
    .filter(cot => {
      if (!filtro) return true;
      const textoFiltro = filtro.toLowerCase();
      return (
        cot.titulo?.toLowerCase().includes(textoFiltro) ||
        cot.datosProyecto.nombreCliente?.toLowerCase().includes(textoFiltro) ||
        cot.datosProyecto.nombreProyecto?.toLowerCase().includes(textoFiltro) ||
        cot.paquete.nombre.toLowerCase().includes(textoFiltro)
      );
    })
    .sort((a, b) => {
      switch (ordenPor) {
        case 'fecha':
          return new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime();
        case 'precio':
          return b.calculos.par - a.calculos.par;
        case 'cliente':
          return (a.datosProyecto.nombreCliente || '').localeCompare(b.datosProyecto.nombreCliente || '');
        default:
          return 0;
      }
    });

  const formatearFecha = (fechaISO: string) => {
    return new Date(fechaISO).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const obtenerBadgeColor = (paqueteId: string) => {
    switch (paqueteId) {
      case 'essential': return 'secondary';
      case 'impact': return 'default';
      case 'premium': return 'destructive';
      default: return 'outline';
    }
  };

  const obtenerBadgeTexto = (paqueteId: string) => {
    switch (paqueteId) {
      case 'essential': return 'Básico';
      case 'impact': return 'Intermedio';
      case 'premium': return 'Premium';
      default: return 'Personalizado';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-200">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="flex items-center">
                <History className="h-6 w-6 mr-2 text-indigo-600" />
                Historial de Cotizaciones
              </CardTitle>
              <CardDescription>
                {cotizaciones.length} cotizaciones guardadas localmente
              </CardDescription>
            </div>
            {cotizaciones.length > 0 && (
              <Button 
                variant="outline" 
                onClick={limpiarHistorial}
                className="text-red-600 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpiar Todo
              </Button>
            )}
          </div>
        </CardHeader>
      </Card>

      {cotizaciones.length === 0 ? (
        <Alert>
          <History className="h-4 w-4" />
          <AlertDescription>
            No hay cotizaciones guardadas aún. Las cotizaciones se guardarán automáticamente 
            cuando calcules un presupuesto y podrás acceder a ellas desde aquí.
          </AlertDescription>
        </Alert>
      ) : (
        <>
          {/* Filtros y ordenación */}
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="filtro">Buscar cotizaciones</Label>
                  <Input
                    id="filtro"
                    placeholder="Buscar por cliente, proyecto, paquete..."
                    value={filtro}
                    onChange={(e) => setFiltro(e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="orden">Ordenar por</Label>
                  <select
                    id="orden"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={ordenPor}
                    onChange={(e) => setOrdenPor(e.target.value as 'fecha' | 'precio' | 'cliente')}
                  >
                    <option value="fecha">Fecha (más reciente)</option>
                    <option value="precio">Precio (mayor a menor)</option>
                    <option value="cliente">Cliente (A-Z)</option>
                  </select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de cotizaciones */}
          <div className="space-y-4">
            {cotizacionesFiltradas.map((cotizacion) => (
              <Card key={cotizacion.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardContent className="pt-6">
                  <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                    {/* Información básica */}
                    <div className="lg:col-span-2 space-y-2">
                      <div className="flex items-start justify-between">
                        <h3 className="font-semibold text-slate-900 text-lg">
                          {cotizacion.titulo}
                        </h3>
                        <Badge variant={obtenerBadgeColor(cotizacion.paquete.id)}>
                          {obtenerBadgeTexto(cotizacion.paquete.id)}
                        </Badge>
                      </div>
                      
                      <div className="space-y-1 text-sm text-slate-600">
                        {cotizacion.datosProyecto.nombreCliente && (
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            {cotizacion.datosProyecto.nombreCliente}
                          </div>
                        )}
                        
                        {cotizacion.datosProyecto.nombreProyecto && (
                          <div className="flex items-center">
                            <Package className="h-4 w-4 mr-2" />
                            {cotizacion.datosProyecto.nombreProyecto}
                          </div>
                        )}
                        
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-2" />
                          {formatearFecha(cotizacion.fechaCreacion)}
                        </div>
                      </div>
                    </div>

                    {/* Detalles del proyecto */}
                    <div className="space-y-2">
                      <h4 className="font-medium text-slate-900">Detalles</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-slate-600">Superficie:</span>
                          <span className="font-medium">
                            {formatearM2(cotizacion.datosProyecto.metrosCuadrados)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Paquete:</span>
                          <span className="font-medium">{cotizacion.paquete.nombre}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-600">Componentes:</span>
                          <span className="font-medium">{cotizacion.paquete.componentes.length}</span>
                        </div>
                      </div>
                    </div>

                    {/* Precios y acciones */}
                    <div className="space-y-3">
                      <div className="text-center">
                        <p className="text-sm text-slate-600">PAR con IVA</p>
                        <p className="text-2xl font-bold text-blue-600">
                          {formatearEUR(cotizacion.calculos.parConIva)}
                        </p>
                        <p className="text-xs text-slate-500">
                          {formatearEUR(cotizacion.calculos.costePorM2)}/m²
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <Button 
                          size="sm" 
                          onClick={() => onCargarCotizacion(cotizacion)}
                          className="w-full"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => onExportarCotizacion(cotizacion)}
                          className="w-full"
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Exportar PDF
                        </Button>
                        
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={() => eliminarCotizacion(cotizacion.id)}
                          className="w-full text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {cotizacionesFiltradas.length === 0 && filtro && (
            <Alert>
              <AlertDescription>
                No se encontraron cotizaciones que coincidan con "<strong>{filtro}</strong>".
                Intenta con otros términos de búsqueda.
              </AlertDescription>
            </Alert>
          )}
        </>
      )}
    </div>
  );
}

