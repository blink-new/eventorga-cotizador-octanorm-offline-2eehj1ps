// Motor de cálculo Octanorm - Fórmulas exactas de amortización
// Eventorga Cotizador Offline - Versión Parametrizable

export interface ConfiguracionBase {
  vidaUtilAnios: number;
  frecuenciaUsoAnual: number;
  tasaRotura: number;
  overhead: number;
  margen: number;
  iva: number;
}

export interface ComponentePaquete {
  nombre: string;
  costeCompra: number;
  cantidad: number;
  costePorM2?: number; // Coste adicional por metro cuadrado
}

export interface CostesAdicionales {
  grafica: number;
  graficaPorM2?: number; // Coste gráfica por m²
  logistica: number;
  logisticaPorM2?: number; // Coste logística por m²
  instalacion: number;
  instalacionPorM2?: number; // Coste instalación por m²
  tarima?: number;
  tarimaPorM2?: number; // Coste tarima por m²
}

export interface PaqueteOctanorm {
  id: string;
  nombre: string;
  descripcion: string;
  componentes: ComponentePaquete[];
  costesAdicionales: CostesAdicionales;
  metrosCuadradosBase?: number; // M² incluidos en el paquete base
}

export interface DatosProyecto {
  metrosCuadrados: number;
  nombreCliente?: string;
  nombreProyecto?: string;
  fechaCotizacion?: string;
  observaciones?: string;
}

export interface ResultadoCalculo {
  paquete: PaqueteOctanorm;
  configuracion: ConfiguracionBase;
  datosProyecto: DatosProyecto;
  calculos: {
    costeCompraTotal: number;
    costeAdicionalPorM2: number;
    costeCompraFinal: number;
    amortizacionAnual: number;
    amortizacionPorUso: number;
    costeAmortizadoEvento: number;
    costeReposicion: number;
    costesDirectos: number;
    overhead: number;
    ctp: number;
    par: number;
    parConIva: number;
    costePorM2: number;
  };
  desglose: {
    componentes: Array<{
      nombre: string;
      costeCompra: number;
      cantidad: number;
      costeTotal: number;
      costePorM2: number;
      amortizadoEvento: number;
      reposicion: number;
    }>;
    costesAdicionales: {
      grafica: number;
      logistica: number;
      instalacion: number;
      tarima?: number;
      total: number;
    };
  };
}

// Configuración por defecto según especificaciones
export const CONFIGURACION_DEFAULT: ConfiguracionBase = {
  vidaUtilAnios: 10,
  frecuenciaUsoAnual: 5,
  tasaRotura: 0.02, // 2%
  overhead: 0.10, // 10%
  margen: 0.35, // 35%
  iva: 0.21 // 21%
};

// Paquetes predefinidos con costes reales y escalabilidad por m²
export const PAQUETES_OCTANORM: PaqueteOctanorm[] = [
  {
    id: 'essential',
    nombre: 'Essential',
    descripcion: 'Paquete básico para stands pequeños (hasta 20m²)',
    metrosCuadradosBase: 20,
    componentes: [
      { nombre: 'Perfiles Octanorm 1m', costeCompra: 45, cantidad: 20, costePorM2: 2.5 },
      { nombre: 'Perfiles Octanorm 2m', costeCompra: 85, cantidad: 15, costePorM2: 4.0 },
      { nombre: 'Conectores', costeCompra: 12, cantidad: 50, costePorM2: 0.8 },
      { nombre: 'Paneles 1x1m', costeCompra: 120, cantidad: 10, costePorM2: 8.0 },
      { nombre: 'Base plates', costeCompra: 35, cantidad: 8, costePorM2: 2.0 }
    ],
    costesAdicionales: {
      grafica: 800,
      graficaPorM2: 25,
      logistica: 300,
      logisticaPorM2: 8,
      instalacion: 600,
      instalacionPorM2: 15,
      tarima: 400,
      tarimaPorM2: 12
    }
  },
  {
    id: 'impact',
    nombre: 'Impact',
    descripcion: 'Paquete intermedio para stands medianos (hasta 50m²)',
    metrosCuadradosBase: 50,
    componentes: [
      { nombre: 'Perfiles Octanorm 1m', costeCompra: 45, cantidad: 35, costePorM2: 2.2 },
      { nombre: 'Perfiles Octanorm 2m', costeCompra: 85, cantidad: 25, costePorM2: 3.5 },
      { nombre: 'Perfiles Octanorm 3m', costeCompra: 125, cantidad: 10, costePorM2: 2.8 },
      { nombre: 'Conectores', costeCompra: 12, cantidad: 80, costePorM2: 0.7 },
      { nombre: 'Paneles 1x1m', costeCompra: 120, cantidad: 18, costePorM2: 7.0 },
      { nombre: 'Paneles 2x1m', costeCompra: 220, cantidad: 8, costePorM2: 6.5 },
      { nombre: 'Base plates', costeCompra: 35, cantidad: 15, costePorM2: 1.8 }
    ],
    costesAdicionales: {
      grafica: 1500,
      graficaPorM2: 22,
      logistica: 500,
      logisticaPorM2: 7,
      instalacion: 1200,
      instalacionPorM2: 12,
      tarima: 800,
      tarimaPorM2: 10
    }
  },
  {
    id: 'premium',
    nombre: 'Premium',
    descripcion: 'Paquete completo para stands grandes (más de 50m²)',
    metrosCuadradosBase: 100,
    componentes: [
      { nombre: 'Perfiles Octanorm 1m', costeCompra: 45, cantidad: 50, costePorM2: 2.0 },
      { nombre: 'Perfiles Octanorm 2m', costeCompra: 85, cantidad: 40, costePorM2: 3.2 },
      { nombre: 'Perfiles Octanorm 3m', costeCompra: 125, cantidad: 20, costePorM2: 2.5 },
      { nombre: 'Perfiles Octanorm 4m', costeCompra: 165, cantidad: 8, costePorM2: 1.8 },
      { nombre: 'Conectores', costeCompra: 12, cantidad: 120, costePorM2: 0.6 },
      { nombre: 'Paneles 1x1m', costeCompra: 120, cantidad: 25, costePorM2: 6.5 },
      { nombre: 'Paneles 2x1m', costeCompra: 220, cantidad: 15, costePorM2: 6.0 },
      { nombre: 'Paneles especiales', costeCompra: 350, cantidad: 6, costePorM2: 4.0 },
      { nombre: 'Base plates', costeCompra: 35, cantidad: 25, costePorM2: 1.5 },
      { nombre: 'Accesorios premium', costeCompra: 180, cantidad: 10, costePorM2: 2.2 }
    ],
    costesAdicionales: {
      grafica: 2500,
      graficaPorM2: 20,
      logistica: 800,
      logisticaPorM2: 6,
      instalacion: 2000,
      instalacionPorM2: 10,
      tarima: 1200,
      tarimaPorM2: 8
    }
  }
];

/**
 * Calcula el CTP y PAR según las fórmulas exactas proporcionadas
 * Incluye escalabilidad por metros cuadrados
 */
export function calcularCotizacion(
  paquete: PaqueteOctanorm,
  datosProyecto: DatosProyecto,
  configuracion: ConfiguracionBase = CONFIGURACION_DEFAULT
): ResultadoCalculo {
  const metrosCuadrados = datosProyecto.metrosCuadrados;
  const metrosBase = paquete.metrosCuadradosBase || 0;
  const metrosAdicionales = Math.max(0, metrosCuadrados - metrosBase);

  // 1. Calcular coste total de compra de componentes (base + adicional por m²)
  let costeCompraTotal = 0;
  let costeAdicionalPorM2 = 0;

  const desgloseComponentes = paquete.componentes.map(comp => {
    const costeBase = comp.costeCompra * comp.cantidad;
    const costeAdicional = (comp.costePorM2 || 0) * metrosAdicionales;
    const costeTotal = costeBase + costeAdicional;
    const costePorM2 = costeTotal / metrosCuadrados;
    
    costeCompraTotal += costeTotal;
    costeAdicionalPorM2 += costeAdicional;

    // Cálculos de amortización por componente
    const amortizadoEvento = (costeTotal / configuracion.vidaUtilAnios) / configuracion.frecuenciaUsoAnual;
    const reposicion = (costeTotal * configuracion.tasaRotura) / configuracion.frecuenciaUsoAnual;

    return {
      nombre: comp.nombre,
      costeCompra: comp.costeCompra,
      cantidad: comp.cantidad,
      costeTotal,
      costePorM2,
      amortizadoEvento,
      reposicion
    };
  });

  // 2. Calcular costes adicionales (base + adicional por m²)
  const costesAdicionales = {
    grafica: paquete.costesAdicionales.grafica + (paquete.costesAdicionales.graficaPorM2 || 0) * metrosAdicionales,
    logistica: paquete.costesAdicionales.logistica + (paquete.costesAdicionales.logisticaPorM2 || 0) * metrosAdicionales,
    instalacion: paquete.costesAdicionales.instalacion + (paquete.costesAdicionales.instalacionPorM2 || 0) * metrosAdicionales,
    tarima: paquete.costesAdicionales.tarima ? 
      paquete.costesAdicionales.tarima + (paquete.costesAdicionales.tarimaPorM2 || 0) * metrosAdicionales : 
      undefined,
    total: 0
  };

  costesAdicionales.total = costesAdicionales.grafica + costesAdicionales.logistica + 
    costesAdicionales.instalacion + (costesAdicionales.tarima || 0);

  // 3. Fórmulas de amortización
  const costeCompraFinal = costeCompraTotal;
  const amortizacionAnual = costeCompraFinal / configuracion.vidaUtilAnios;
  const vidaUtilUsos = configuracion.vidaUtilAnios * configuracion.frecuenciaUsoAnual;
  const amortizacionPorUso = costeCompraFinal / vidaUtilUsos;
  const costeAmortizadoEvento = amortizacionAnual / configuracion.frecuenciaUsoAnual;

  // 4. Coste de reposición
  const costeReposicion = (costeCompraFinal * configuracion.tasaRotura) / configuracion.frecuenciaUsoAnual;

  // 5. Costes directos (amortizado + reposición + adicionales)
  const costesDirectos = costeAmortizadoEvento + costeReposicion + costesAdicionales.total;

  // 6. Overhead (10% de costes directos)
  const overhead = costesDirectos * configuracion.overhead;

  // 7. CTP (Coste Total del Proyecto)
  const ctp = costesDirectos + overhead;

  // 8. PAR (Precio Alquiler Recomendado) - aplicando margen del 35%
  const par = ctp / (1 - configuracion.margen);

  // 9. PAR con IVA
  const parConIva = par * (1 + configuracion.iva);

  // 10. Coste por metro cuadrado
  const costePorM2 = par / metrosCuadrados;

  return {
    paquete,
    configuracion,
    datosProyecto,
    calculos: {
      costeCompraTotal,
      costeAdicionalPorM2,
      costeCompraFinal,
      amortizacionAnual,
      amortizacionPorUso,
      costeAmortizadoEvento,
      costeReposicion,
      costesDirectos,
      overhead,
      ctp,
      par,
      parConIva,
      costePorM2
    },
    desglose: {
      componentes: desgloseComponentes,
      costesAdicionales
    }
  };
}

/**
 * Crea un paquete personalizado vacío para configuración manual
 */
export function crearPaquetePersonalizado(): PaqueteOctanorm {
  return {
    id: 'personalizado',
    nombre: 'Paquete Personalizado',
    descripcion: 'Configuración personalizada de componentes',
    metrosCuadradosBase: 0,
    componentes: [
      { nombre: 'Componente 1', costeCompra: 0, cantidad: 0, costePorM2: 0 }
    ],
    costesAdicionales: {
      grafica: 0,
      graficaPorM2: 0,
      logistica: 0,
      logisticaPorM2: 0,
      instalacion: 0,
      instalacionPorM2: 0,
      tarima: 0,
      tarimaPorM2: 0
    }
  };
}

/**
 * Formatea números como moneda EUR
 */
export function formatearEUR(cantidad: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(cantidad);
}

/**
 * Formatea porcentajes
 */
export function formatearPorcentaje(decimal: number): string {
  return `${(decimal * 100).toFixed(1)}%`;
}

/**
 * Formatea metros cuadrados
 */
export function formatearM2(metros: number): string {
  return `${metros.toFixed(1)} m²`;
}