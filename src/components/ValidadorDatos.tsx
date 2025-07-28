import React from 'react';
import { AlertTriangle, CheckCircle, Info } from 'lucide-react';
import { Alert, AlertDescription } from './ui/alert';
import { Badge } from './ui/badge';
import { type PaqueteOctanorm, type DatosProyecto, type ConfiguracionBase } from '../lib/calculator';

interface ValidacionResult {
  tipo: 'error' | 'warning' | 'info' | 'success';
  mensaje: string;
  campo?: string;
}

interface Props {
  paquete?: PaqueteOctanorm;
  datosProyecto: DatosProyecto;
  configuracion: ConfiguracionBase;
  mostrarDetalles?: boolean;
}

export function ValidadorDatos({ paquete, datosProyecto, configuracion, mostrarDetalles = false }: Props) {
  const validaciones: ValidacionResult[] = [];

  // Validar datos del proyecto
  if (datosProyecto.metrosCuadrados <= 0) {
    validaciones.push({
      tipo: 'error',
      mensaje: 'Los metros cuadrados deben ser mayor que 0',
      campo: 'metrosCuadrados'
    });
  } else if (datosProyecto.metrosCuadrados < 5) {
    validaciones.push({
      tipo: 'warning',
      mensaje: 'Stand muy pequeño (menos de 5m²). Verifica que sea correcto.',
      campo: 'metrosCuadrados'
    });
  } else if (datosProyecto.metrosCuadrados > 500) {
    validaciones.push({
      tipo: 'warning',
      mensaje: 'Stand muy grande (más de 500m²). Verifica que sea correcto.',
      campo: 'metrosCuadrados'
    });
  }

  if (!datosProyecto.nombreCliente?.trim()) {
    validaciones.push({
      tipo: 'info',
      mensaje: 'Considera agregar el nombre del cliente para el presupuesto',
      campo: 'nombreCliente'
    });
  }

  if (!datosProyecto.nombreProyecto?.trim()) {
    validaciones.push({
      tipo: 'info',
      mensaje: 'Considera agregar el nombre del proyecto para identificarlo mejor',
      campo: 'nombreProyecto'
    });
  }

  // Validar paquete seleccionado
  if (!paquete) {
    validaciones.push({
      tipo: 'error',
      mensaje: 'Debes seleccionar un paquete Octanorm',
      campo: 'paquete'
    });
  } else {
    // Validar componentes del paquete
    if (paquete.componentes.length === 0) {
      validaciones.push({
        tipo: 'error',
        mensaje: 'El paquete debe tener al menos un componente',
        campo: 'componentes'
      });
    }

    const componentesInvalidos = paquete.componentes.filter(
      comp => comp.costeCompra <= 0 || comp.cantidad <= 0
    );

    if (componentesInvalidos.length > 0) {
      validaciones.push({
        tipo: 'error',
        mensaje: `${componentesInvalidos.length} componente(s) tienen coste o cantidad inválidos`,
        campo: 'componentes'
      });
    }

    // Validar escalabilidad
    if (paquete.metrosCuadradosBase && datosProyecto.metrosCuadrados > paquete.metrosCuadradosBase) {
      const metrosAdicionales = datosProyecto.metrosCuadrados - paquete.metrosCuadradosBase;
      const componentesSinEscalabilidad = paquete.componentes.filter(
        comp => !comp.costePorM2 || comp.costePorM2 <= 0
      );

      if (componentesSinEscalabilidad.length > 0) {
        validaciones.push({
          tipo: 'warning',
          mensaje: `${componentesSinEscalabilidad.length} componente(s) no tienen coste por m² configurado para los ${metrosAdicionales.toFixed(1)}m² adicionales`,
          campo: 'escalabilidad'
        });
      }
    }

    // Validar costes adicionales
    const costesAdicionales = paquete.costesAdicionales;
    if (costesAdicionales.grafica <= 0 && costesAdicionales.logistica <= 0 && costesAdicionales.instalacion <= 0) {
      validaciones.push({
        tipo: 'warning',
        mensaje: 'No hay costes adicionales configurados (gráfica, logística, instalación)',
        campo: 'costesAdicionales'
      });
    }
  }

  // Validar configuración
  if (configuracion.vidaUtilAnios <= 0) {
    validaciones.push({
      tipo: 'error',
      mensaje: 'La vida útil debe ser mayor que 0 años',
      campo: 'vidaUtilAnios'
    });
  } else if (configuracion.vidaUtilAnios < 3) {
    validaciones.push({
      tipo: 'warning',
      mensaje: 'Vida útil muy corta (menos de 3 años). Esto aumentará significativamente los costes de amortización.',
      campo: 'vidaUtilAnios'
    });
  } else if (configuracion.vidaUtilAnios > 20) {
    validaciones.push({
      tipo: 'warning',
      mensaje: 'Vida útil muy larga (más de 20 años). Verifica que sea realista para equipos Octanorm.',
      campo: 'vidaUtilAnios'
    });
  }

  if (configuracion.frecuenciaUsoAnual <= 0) {
    validaciones.push({
      tipo: 'error',
      mensaje: 'La frecuencia de uso debe ser mayor que 0 eventos/año',
      campo: 'frecuenciaUsoAnual'
    });
  } else if (configuracion.frecuenciaUsoAnual > 50) {
    validaciones.push({
      tipo: 'warning',
      mensaje: 'Frecuencia de uso muy alta (más de 50 eventos/año). Verifica que sea realista.',
      campo: 'frecuenciaUsoAnual'
    });
  }

  if (configuracion.tasaRotura < 0 || configuracion.tasaRotura > 0.5) {
    validaciones.push({
      tipo: 'warning',
      mensaje: 'Tasa de rotura fuera del rango típico (0-50%). Verifica que sea correcta.',
      campo: 'tasaRotura'
    });
  }

  if (configuracion.margen < 0.1 || configuracion.margen > 0.8) {
    validaciones.push({
      tipo: 'warning',
      mensaje: 'Margen fuera del rango típico (10-80%). Verifica que sea correcto.',
      campo: 'margen'
    });
  }

  // Calcular estadísticas de validación
  const errores = validaciones.filter(v => v.tipo === 'error').length;
  const warnings = validaciones.filter(v => v.tipo === 'warning').length;
  const infos = validaciones.filter(v => v.tipo === 'info').length;

  const puedeCalcular = errores === 0;

  if (validaciones.length === 0) {
    return (
      <Alert className="border-green-200 bg-green-50">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <AlertDescription className="text-green-800">
          ✅ Todos los datos están correctos. Listo para calcular el presupuesto.
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-3">
      {/* Resumen de validación */}
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-slate-700">Estado de validación:</span>
        {errores > 0 && (
          <Badge variant="destructive" className="text-xs">
            {errores} error{errores !== 1 ? 'es' : ''}
          </Badge>
        )}
        {warnings > 0 && (
          <Badge variant="secondary" className="text-xs bg-orange-100 text-orange-800">
            {warnings} advertencia{warnings !== 1 ? 's' : ''}
          </Badge>
        )}
        {infos > 0 && (
          <Badge variant="outline" className="text-xs">
            {infos} sugerencia{infos !== 1 ? 's' : ''}
          </Badge>
        )}
        {puedeCalcular && (
          <Badge variant="default" className="text-xs bg-green-100 text-green-800">
            ✓ Listo para calcular
          </Badge>
        )}
      </div>

      {/* Mostrar validaciones si hay errores o si se solicitan detalles */}
      {(errores > 0 || mostrarDetalles) && (
        <div className="space-y-2">
          {validaciones.map((validacion, index) => {
            const Icon = validacion.tipo === 'error' ? AlertTriangle :
                        validacion.tipo === 'warning' ? AlertTriangle :
                        validacion.tipo === 'success' ? CheckCircle : Info;
            
            const alertVariant = validacion.tipo === 'error' ? 'destructive' : 'default';
            const iconColor = validacion.tipo === 'error' ? 'text-red-600' :
                             validacion.tipo === 'warning' ? 'text-orange-600' :
                             validacion.tipo === 'success' ? 'text-green-600' : 'text-blue-600';
            
            const bgColor = validacion.tipo === 'error' ? 'bg-red-50 border-red-200' :
                           validacion.tipo === 'warning' ? 'bg-orange-50 border-orange-200' :
                           validacion.tipo === 'success' ? 'bg-green-50 border-green-200' : 'bg-blue-50 border-blue-200';

            return (
              <Alert key={index} variant={alertVariant} className={bgColor}>
                <Icon className={`h-4 w-4 ${iconColor}`} />
                <AlertDescription>
                  <div className="flex justify-between items-start">
                    <span>{validacion.mensaje}</span>
                    {validacion.campo && (
                      <Badge variant="outline" className="text-xs ml-2">
                        {validacion.campo}
                      </Badge>
                    )}
                  </div>
                </AlertDescription>
              </Alert>
            );
          })}
        </div>
      )}
    </div>
  );
}