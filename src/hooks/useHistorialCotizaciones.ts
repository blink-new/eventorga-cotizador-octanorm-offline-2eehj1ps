import { type ResultadoCalculo } from '../lib/calculator';

interface CotizacionGuardada extends ResultadoCalculo {
  id: string;
  fechaCreacion: string;
  titulo?: string;
}

const STORAGE_KEY = 'eventorga_cotizaciones_historial';

export function useHistorialCotizaciones() {
  const guardarCotizacion = (resultado: ResultadoCalculo, titulo?: string) => {
    const historialActual = localStorage.getItem(STORAGE_KEY);
    const cotizaciones: CotizacionGuardada[] = historialActual ? JSON.parse(historialActual) : [];
    
    const nuevaCotizacion: CotizacionGuardada = {
      ...resultado,
      id: `cot_${Date.now()}`,
      fechaCreacion: new Date().toISOString(),
      titulo: titulo || `Cotización ${resultado.paquete.nombre} - ${resultado.datosProyecto.nombreCliente || 'Sin cliente'}`
    };

    const nuevasCotizaciones = [nuevaCotizacion, ...cotizaciones];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nuevasCotizaciones));
    
    return nuevaCotizacion.id;
  };

  const obtenerCotizaciones = (): CotizacionGuardada[] => {
    const historialGuardado = localStorage.getItem(STORAGE_KEY);
    return historialGuardado ? JSON.parse(historialGuardado) : [];
  };

  return {
    guardarCotizacion,
    obtenerCotizaciones
  };
}