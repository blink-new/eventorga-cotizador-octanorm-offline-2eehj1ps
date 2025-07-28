import React, { useState } from 'react';
import { Layers, Copy, Star, Zap, Crown, Building, Users, Briefcase } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { 
  formatearEUR,
  formatearM2,
  type PaqueteOctanorm
} from '../lib/calculator';

interface PlantillaPaquete {
  id: string;
  nombre: string;
  descripcion: string;
  categoria: 'corporativo' | 'comercial' | 'institucional' | 'startup';
  icono: React.ReactNode;
  paquete: PaqueteOctanorm;
  caracteristicas: string[];
  usoRecomendado: string;
}

interface Props {
  onSeleccionarPlantilla: (paquete: PaqueteOctanorm) => void;
}

const PLANTILLAS_PAQUETES: PlantillaPaquete[] = [
  {
    id: 'corporativo_premium',
    nombre: 'Corporativo Premium',
    descripcion: 'Para grandes empresas que buscan máximo impacto visual',
    categoria: 'corporativo',
    icono: <Crown className="h-6 w-6" />,
    usoRecomendado: 'Ferias internacionales, lanzamientos de producto, eventos VIP',
    caracteristicas: [
      'Estructura robusta y elegante',
      'Gráfica de alta calidad',
      'Iluminación LED integrada',
      'Zona de reuniones privada',
      'Almacenamiento oculto'
    ],
    paquete: {
      id: 'corporativo_premium',
      nombre: 'Corporativo Premium',
      descripcion: 'Paquete premium para empresas corporativas',
      metrosCuadradosBase: 80,
      componentes: [
        { nombre: 'Perfiles Octanorm 1m Premium', costeCompra: 55, cantidad: 60, costePorM2: 2.8 },
        { nombre: 'Perfiles Octanorm 2m Premium', costeCompra: 95, cantidad: 45, costePorM2: 3.8 },
        { nombre: 'Perfiles Octanorm 3m Premium', costeCompra: 135, cantidad: 25, costePorM2: 3.2 },
        { nombre: 'Perfiles Octanorm 4m Premium', costeCompra: 175, cantidad: 12, costePorM2: 2.5 },
        { nombre: 'Conectores Premium', costeCompra: 18, cantidad: 150, costePorM2: 0.9 },
        { nombre: 'Paneles 1x1m Premium', costeCompra: 140, cantidad: 30, costePorM2: 7.5 },
        { nombre: 'Paneles 2x1m Premium', costeCompra: 260, cantidad: 20, costePorM2: 7.0 },
        { nombre: 'Paneles especiales Premium', costeCompra: 420, cantidad: 8, costePorM2: 5.5 },
        { nombre: 'Base plates Premium', costeCompra: 45, cantidad: 30, costePorM2: 2.0 },
        { nombre: 'Sistema iluminación LED', costeCompra: 280, cantidad: 8, costePorM2: 3.5 },
        { nombre: 'Mobiliario corporativo', costeCompra: 350, cantidad: 6, costePorM2: 4.0 }
      ],
      costesAdicionales: {
        grafica: 3500,
        graficaPorM2: 35,
        logistica: 1200,
        logisticaPorM2: 12,
        instalacion: 2800,
        instalacionPorM2: 18,
        tarima: 1800,
        tarimaPorM2: 15
      }
    }
  },
  {
    id: 'comercial_impact',
    nombre: 'Comercial Impact',
    descripcion: 'Equilibrio perfecto entre impacto visual y presupuesto',
    categoria: 'comercial',
    icono: <Zap className="h-6 w-6" />,
    usoRecomendado: 'Ferias comerciales, exposiciones sectoriales, showrooms',
    caracteristicas: [
      'Diseño atractivo y funcional',
      'Gráfica de calidad media-alta',
      'Zona de exposición optimizada',
      'Espacio de almacenamiento',
      'Fácil montaje y desmontaje'
    ],
    paquete: {
      id: 'comercial_impact',
      nombre: 'Comercial Impact',
      descripcion: 'Paquete equilibrado para uso comercial',
      metrosCuadradosBase: 45,
      componentes: [
        { nombre: 'Perfiles Octanorm 1m', costeCompra: 48, cantidad: 40, costePorM2: 2.4 },
        { nombre: 'Perfiles Octanorm 2m', costeCompra: 88, cantidad: 30, costePorM2: 3.6 },
        { nombre: 'Perfiles Octanorm 3m', costeCompra: 128, cantidad: 15, costePorM2: 2.9 },
        { nombre: 'Conectores', costeCompra: 14, cantidad: 90, costePorM2: 0.75 },
        { nombre: 'Paneles 1x1m', costeCompra: 125, cantidad: 22, costePorM2: 7.2 },
        { nombre: 'Paneles 2x1m', costeCompra: 235, cantidad: 12, costePorM2: 6.8 },
        { nombre: 'Base plates', costeCompra: 38, cantidad: 18, costePorM2: 1.9 },
        { nombre: 'Elementos decorativos', costeCompra: 180, cantidad: 8, costePorM2: 2.5 },
        { nombre: 'Mobiliario básico', costeCompra: 220, cantidad: 4, costePorM2: 2.8 }
      ],
      costesAdicionales: {
        grafica: 2200,
        graficaPorM2: 28,
        logistica: 700,
        logisticaPorM2: 9,
        instalacion: 1600,
        instalacionPorM2: 14,
        tarima: 1000,
        tarimaPorM2: 11
      }
    }
  },
  {
    id: 'startup_essential',
    nombre: 'Startup Essential',
    descripcion: 'Solución económica sin comprometer la calidad',
    categoria: 'startup',
    icono: <Star className="h-6 w-6" />,
    usoRecomendado: 'Startups, pequeñas empresas, eventos locales',
    caracteristicas: [
      'Máximo aprovechamiento del espacio',
      'Gráfica optimizada',
      'Estructura modular',
      'Fácil transporte',
      'Excelente relación calidad-precio'
    ],
    paquete: {
      id: 'startup_essential',
      nombre: 'Startup Essential',
      descripcion: 'Paquete optimizado para startups y pequeñas empresas',
      metrosCuadradosBase: 15,
      componentes: [
        { nombre: 'Perfiles Octanorm 1m', costeCompra: 42, cantidad: 18, costePorM2: 2.2 },
        { nombre: 'Perfiles Octanorm 2m', costeCompra: 82, cantidad: 12, costePorM2: 3.4 },
        { nombre: 'Conectores', costeCompra: 10, cantidad: 45, costePorM2: 0.7 },
        { nombre: 'Paneles 1x1m', costeCompra: 115, cantidad: 8, costePorM2: 6.8 },
        { nombre: 'Base plates', costeCompra: 32, cantidad: 6, costePorM2: 1.8 },
        { nombre: 'Kit básico accesorios', costeCompra: 150, cantidad: 2, costePorM2: 1.5 }
      ],
      costesAdicionales: {
        grafica: 600,
        graficaPorM2: 20,
        logistica: 250,
        logisticaPorM2: 6,
        instalacion: 400,
        instalacionPorM2: 10,
        tarima: 300,
        tarimaPorM2: 8
      }
    }
  },
  {
    id: 'institucional_formal',
    nombre: 'Institucional Formal',
    descripcion: 'Diseño sobrio y profesional para instituciones',
    categoria: 'institucional',
    icono: <Building className="h-6 w-6" />,
    usoRecomendado: 'Organismos públicos, universidades, ONGs, eventos institucionales',
    caracteristicas: [
      'Diseño sobrio y elegante',
      'Materiales de alta durabilidad',
      'Espacios informativos amplios',
      'Zona de atención al público',
      'Cumple normativas oficiales'
    ],
    paquete: {
      id: 'institucional_formal',
      nombre: 'Institucional Formal',
      descripcion: 'Paquete diseñado para instituciones y organismos oficiales',
      metrosCuadradosBase: 60,
      componentes: [
        { nombre: 'Perfiles Octanorm 1m Institucional', costeCompra: 50, cantidad: 45, costePorM2: 2.5 },
        { nombre: 'Perfiles Octanorm 2m Institucional', costeCompra: 90, cantidad: 35, costePorM2: 3.5 },
        { nombre: 'Perfiles Octanorm 3m Institucional', costeCompra: 130, cantidad: 18, costePorM2: 3.0 },
        { nombre: 'Conectores Institucional', costeCompra: 15, cantidad: 110, costePorM2: 0.8 },
        { nombre: 'Paneles informativos 1x1m', costeCompra: 130, cantidad: 25, costePorM2: 7.0 },
        { nombre: 'Paneles informativos 2x1m', costeCompra: 245, cantidad: 15, costePorM2: 6.5 },
        { nombre: 'Base plates Institucional', costeCompra: 40, cantidad: 22, costePorM2: 1.9 },
        { nombre: 'Mobiliario institucional', costeCompra: 280, cantidad: 5, costePorM2: 3.2 },
        { nombre: 'Sistema información', costeCompra: 320, cantidad: 3, costePorM2: 2.8 }
      ],
      costesAdicionales: {
        grafica: 2800,
        graficaPorM2: 30,
        logistica: 900,
        logisticaPorM2: 10,
        instalacion: 2200,
        instalacionPorM2: 16,
        tarima: 1400,
        tarimaPorM2: 12
      }
    }
  }
];

export function PlantillasPaquetes({ onSeleccionarPlantilla }: Props) {
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string>('todas');
  const [plantillaExpandida, setPlantillaExpandida] = useState<string | null>(null);

  const categorias = [
    { id: 'todas', nombre: 'Todas', icono: <Layers className="h-4 w-4" /> },
    { id: 'corporativo', nombre: 'Corporativo', icono: <Crown className="h-4 w-4" /> },
    { id: 'comercial', nombre: 'Comercial', icono: <Briefcase className="h-4 w-4" /> },
    { id: 'startup', nombre: 'Startup', icono: <Star className="h-4 w-4" /> },
    { id: 'institucional', nombre: 'Institucional', icono: <Building className="h-4 w-4" /> }
  ];

  const plantillasFiltradas = categoriaSeleccionada === 'todas' 
    ? PLANTILLAS_PAQUETES 
    : PLANTILLAS_PAQUETES.filter(p => p.categoria === categoriaSeleccionada);

  const calcularCosteEstimado = (paquete: PaqueteOctanorm, metros: number = 50) => {
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

  const obtenerColorCategoria = (categoria: string) => {
    switch (categoria) {
      case 'corporativo': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'comercial': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'startup': return 'bg-green-100 text-green-800 border-green-200';
      case 'institucional': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Layers className="h-6 w-6 mr-2 text-emerald-600" />
            Plantillas de Paquetes Especializados
          </CardTitle>
          <CardDescription>
            Paquetes prediseñados optimizados para diferentes tipos de empresas y eventos
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Filtros por categoría */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-wrap gap-2">
            {categorias.map((categoria) => (
              <Button
                key={categoria.id}
                variant={categoriaSeleccionada === categoria.id ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoriaSeleccionada(categoria.id)}
                className="flex items-center"
              >
                {categoria.icono}
                <span className="ml-2">{categoria.nombre}</span>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Información sobre plantillas */}
      <Alert>
        <Users className="h-4 w-4" />
        <AlertDescription>
          <strong>Plantillas especializadas:</strong> Cada plantilla está optimizada para un tipo específico 
          de empresa y evento. Los componentes, costes y configuraciones han sido ajustados según las 
          necesidades típicas de cada sector.
        </AlertDescription>
      </Alert>

      {/* Grid de plantillas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {plantillasFiltradas.map((plantilla) => (
          <Card 
            key={plantilla.id} 
            className="hover:shadow-lg transition-all duration-200 border-2 border-transparent hover:border-emerald-200"
          >
            <CardHeader>
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${obtenerColorCategoria(plantilla.categoria)}`}>
                    {plantilla.icono}
                  </div>
                  <div>
                    <CardTitle className="text-xl">{plantilla.nombre}</CardTitle>
                    <CardDescription className="mt-1">
                      {plantilla.descripcion}
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className={obtenerColorCategoria(plantilla.categoria)}>
                  {plantilla.categoria.charAt(0).toUpperCase() + plantilla.categoria.slice(1)}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Uso recomendado */}
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Uso Recomendado</h4>
                <p className="text-sm text-slate-600">{plantilla.usoRecomendado}</p>
              </div>

              {/* Características principales */}
              <div>
                <h4 className="font-medium text-slate-900 mb-2">Características Principales</h4>
                <ul className="text-sm text-slate-600 space-y-1">
                  {plantilla.caracteristicas.slice(0, 3).map((caracteristica, idx) => (
                    <li key={idx} className="flex items-center">
                      <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                      {caracteristica}
                    </li>
                  ))}
                  {plantilla.caracteristicas.length > 3 && (
                    <li className="text-slate-500 text-xs">
                      ... y {plantilla.caracteristicas.length - 3} características más
                    </li>
                  )}
                </ul>
              </div>

              {/* Detalles técnicos */}
              <div className="bg-slate-50 p-3 rounded-lg">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="text-slate-600">Superficie base:</span>
                    <div className="font-medium">{formatearM2(plantilla.paquete.metrosCuadradosBase || 0)}</div>
                  </div>
                  <div>
                    <span className="text-slate-600">Componentes:</span>
                    <div className="font-medium">{plantilla.paquete.componentes.length}</div>
                  </div>
                  <div>
                    <span className="text-slate-600">Coste estimado (50m²):</span>
                    <div className="font-bold text-emerald-600">
                      {formatearEUR(calcularCosteEstimado(plantilla.paquete, 50))}
                    </div>
                  </div>
                  <div>
                    <span className="text-slate-600">Coste por m²:</span>
                    <div className="font-medium text-slate-700">
                      {formatearEUR(calcularCosteEstimado(plantilla.paquete, 50) / 50)}/m²
                    </div>
                  </div>
                </div>
              </div>

              {/* Botones de acción */}
              <div className="flex gap-2 pt-2">
                <Button 
                  className="flex-1"
                  onClick={() => onSeleccionarPlantilla(plantilla.paquete)}
                >
                  <Copy className="h-4 w-4 mr-2" />
                  Usar Plantilla
                </Button>
                
                <Button 
                  variant="outline"
                  size="sm"
                  onClick={() => setPlantillaExpandida(
                    plantillaExpandida === plantilla.id ? null : plantilla.id
                  )}
                >
                  {plantillaExpandida === plantilla.id ? 'Ocultar' : 'Ver'} Detalles
                </Button>
              </div>

              {/* Detalles expandidos */}
              {plantillaExpandida === plantilla.id && (
                <div className="mt-4 pt-4 border-t space-y-3">
                  <div>
                    <h5 className="font-medium text-slate-900 mb-2">Todas las Características</h5>
                    <ul className="text-sm text-slate-600 space-y-1">
                      {plantilla.caracteristicas.map((caracteristica, idx) => (
                        <li key={idx} className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full mr-2"></div>
                          {caracteristica}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h5 className="font-medium text-slate-900 mb-2">Componentes Principales</h5>
                    <div className="text-sm text-slate-600 space-y-1">
                      {plantilla.paquete.componentes.slice(0, 5).map((comp, idx) => (
                        <div key={idx} className="flex justify-between">
                          <span>{comp.nombre}</span>
                          <span className="font-medium">{comp.cantidad} uds</span>
                        </div>
                      ))}
                      {plantilla.paquete.componentes.length > 5 && (
                        <div className="text-slate-500 text-center text-xs pt-1">
                          ... y {plantilla.paquete.componentes.length - 5} componentes más
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <h5 className="font-medium text-slate-900 mb-2">Servicios Incluidos</h5>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-600">Gráfica:</span>
                        <span className="font-medium">{formatearEUR(plantilla.paquete.costesAdicionales.grafica)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Logística:</span>
                        <span className="font-medium">{formatearEUR(plantilla.paquete.costesAdicionales.logistica)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600">Instalación:</span>
                        <span className="font-medium">{formatearEUR(plantilla.paquete.costesAdicionales.instalacion)}</span>
                      </div>
                      {plantilla.paquete.costesAdicionales.tarima && (
                        <div className="flex justify-between">
                          <span className="text-slate-600">Tarima:</span>
                          <span className="font-medium">{formatearEUR(plantilla.paquete.costesAdicionales.tarima)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {plantillasFiltradas.length === 0 && (
        <Alert>
          <AlertDescription>
            No hay plantillas disponibles para la categoría seleccionada.
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}