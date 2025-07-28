import React, { useState, useEffect } from 'react';
import { TestTube, CheckCircle, XCircle, AlertCircle, Play, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { 
  PAQUETES_OCTANORM, 
  CONFIGURACION_DEFAULT, 
  calcularCotizacion, 
  formatearEUR,
  type ResultadoCalculo 
} from '../lib/calculator';

interface TestResult {
  id: string;
  nombre: string;
  descripcion: string;
  estado: 'pendiente' | 'ejecutando' | 'exitoso' | 'fallido';
  resultado?: any;
  error?: string;
  duracion?: number;
  esperado?: any;
  obtenido?: any;
}

interface TestSuite {
  nombre: string;
  tests: TestResult[];
  estado: 'pendiente' | 'ejecutando' | 'completado';
  exitosos: number;
  fallidos: number;
  duracionTotal: number;
}

export function TestsAutomaticos() {
  const [testSuite, setTestSuite] = useState<TestSuite>({
    nombre: 'Tests de Cálculo Octanorm',
    tests: [],
    estado: 'pendiente',
    exitosos: 0,
    fallidos: 0,
    duracionTotal: 0
  });

  const [progreso, setProgreso] = useState(0);
  const [ejecutando, setEjecutando] = useState(false);

  const inicializarTests = () => {
    const tests: TestResult[] = [
      {
        id: 'test-essential-ctp',
        nombre: 'Cálculo CTP - Paquete Essential',
        descripcion: 'Verifica que el CTP del paquete Essential se calcule correctamente',
        estado: 'pendiente'
      },
      {
        id: 'test-essential-par',
        nombre: 'Cálculo PAR - Paquete Essential',
        descripcion: 'Verifica que el PAR del paquete Essential incluya el margen correcto',
        estado: 'pendiente'
      },
      {
        id: 'test-impact-ctp',
        nombre: 'Cálculo CTP - Paquete Impact',
        descripcion: 'Verifica que el CTP del paquete Impact se calcule correctamente',
        estado: 'pendiente'
      },
      {
        id: 'test-impact-par',
        nombre: 'Cálculo PAR - Paquete Impact',
        descripcion: 'Verifica que el PAR del paquete Impact incluya el margen correcto',
        estado: 'pendiente'
      },
      {
        id: 'test-premium-ctp',
        nombre: 'Cálculo CTP - Paquete Premium',
        descripcion: 'Verifica que el CTP del paquete Premium se calcule correctamente',
        estado: 'pendiente'
      },
      {
        id: 'test-premium-par',
        nombre: 'Cálculo PAR - Paquete Premium',
        descripcion: 'Verifica que el PAR del paquete Premium incluya el margen correcto',
        estado: 'pendiente'
      },
      {
        id: 'test-amortizacion-formulas',
        nombre: 'Fórmulas de Amortización',
        descripcion: 'Verifica que las fórmulas de amortización se apliquen correctamente',
        estado: 'pendiente'
      },
      {
        id: 'test-overhead-calculo',
        nombre: 'Cálculo de Overhead',
        descripcion: 'Verifica que el overhead del 10% se aplique correctamente',
        estado: 'pendiente'
      },
      {
        id: 'test-iva-aplicacion',
        nombre: 'Aplicación de IVA',
        descripcion: 'Verifica que el IVA del 21% se aplique correctamente al PAR',
        estado: 'pendiente'
      },
      {
        id: 'test-configuracion-personalizada',
        nombre: 'Configuración Personalizada',
        descripcion: 'Verifica que los cambios en la configuración afecten los cálculos',
        estado: 'pendiente'
      }
    ];

    setTestSuite({
      nombre: 'Tests de Cálculo Octanorm',
      tests,
      estado: 'pendiente',
      exitosos: 0,
      fallidos: 0,
      duracionTotal: 0
    });
  };

  const ejecutarTestIndividual = async (testId: string): Promise<any> => {
    switch (testId) {
      case 'test-essential-ctp': {
        const resultado = calcularCotizacion(PAQUETES_OCTANORM[0], CONFIGURACION_DEFAULT);
        const ctpEsperado = 3490; // Valor aproximado esperado
        const diferencia = Math.abs(resultado.calculos.ctp - ctpEsperado);
        const tolerancia = ctpEsperado * 0.1; // 10% de tolerancia
        
        if (diferencia > tolerancia) {
          throw new Error(`CTP fuera del rango esperado. Esperado: ~${formatearEUR(ctpEsperado)}, Obtenido: ${formatearEUR(resultado.calculos.ctp)}`);
        }
        
        return {
          resultado: 'CTP calculado correctamente',
          esperado: `~${formatearEUR(ctpEsperado)}`,
          obtenido: formatearEUR(resultado.calculos.ctp)
        };
      }

      case 'test-essential-par': {
        const resultado = calcularCotizacion(PAQUETES_OCTANORM[0], CONFIGURACION_DEFAULT);
        const margenAplicado = (resultado.calculos.par - resultado.calculos.ctp) / resultado.calculos.ctp;
        const margenEsperado = CONFIGURACION_DEFAULT.margen / (1 - CONFIGURACION_DEFAULT.margen);
        const diferencia = Math.abs(margenAplicado - margenEsperado);
        
        if (diferencia > 0.01) { // 1% de tolerancia
          throw new Error(`Margen incorrecto. Esperado: ${(margenEsperado * 100).toFixed(1)}%, Obtenido: ${(margenAplicado * 100).toFixed(1)}%`);
        }
        
        return {
          resultado: 'PAR calculado con margen correcto',
          esperado: `Margen ${(margenEsperado * 100).toFixed(1)}%`,
          obtenido: `Margen ${(margenAplicado * 100).toFixed(1)}%`
        };
      }

      case 'test-impact-ctp': {
        const resultado = calcularCotizacion(PAQUETES_OCTANORM[1], CONFIGURACION_DEFAULT);
        const ctpEsperado = 5800; // Valor aproximado esperado
        const diferencia = Math.abs(resultado.calculos.ctp - ctpEsperado);
        const tolerancia = ctpEsperado * 0.15; // 15% de tolerancia
        
        if (diferencia > tolerancia) {
          throw new Error(`CTP fuera del rango esperado. Esperado: ~${formatearEUR(ctpEsperado)}, Obtenido: ${formatearEUR(resultado.calculos.ctp)}`);
        }
        
        return {
          resultado: 'CTP calculado correctamente',
          esperado: `~${formatearEUR(ctpEsperado)}`,
          obtenido: formatearEUR(resultado.calculos.ctp)
        };
      }

      case 'test-impact-par': {
        const resultado = calcularCotizacion(PAQUETES_OCTANORM[1], CONFIGURACION_DEFAULT);
        const parEsperado = resultado.calculos.ctp / (1 - CONFIGURACION_DEFAULT.margen);
        const diferencia = Math.abs(resultado.calculos.par - parEsperado);
        
        if (diferencia > 0.01) {
          throw new Error(`PAR incorrecto. Esperado: ${formatearEUR(parEsperado)}, Obtenido: ${formatearEUR(resultado.calculos.par)}`);
        }
        
        return {
          resultado: 'PAR calculado correctamente',
          esperado: formatearEUR(parEsperado),
          obtenido: formatearEUR(resultado.calculos.par)
        };
      }

      case 'test-premium-ctp': {
        const resultado = calcularCotizacion(PAQUETES_OCTANORM[2], CONFIGURACION_DEFAULT);
        const ctpEsperado = 8500; // Valor aproximado esperado
        const diferencia = Math.abs(resultado.calculos.ctp - ctpEsperado);
        const tolerancia = ctpEsperado * 0.15; // 15% de tolerancia
        
        if (diferencia > tolerancia) {
          throw new Error(`CTP fuera del rango esperado. Esperado: ~${formatearEUR(ctpEsperado)}, Obtenido: ${formatearEUR(resultado.calculos.ctp)}`);
        }
        
        return {
          resultado: 'CTP calculado correctamente',
          esperado: `~${formatearEUR(ctpEsperado)}`,
          obtenido: formatearEUR(resultado.calculos.ctp)
        };
      }

      case 'test-premium-par': {
        const resultado = calcularCotizacion(PAQUETES_OCTANORM[2], CONFIGURACION_DEFAULT);
        const parEsperado = resultado.calculos.ctp / (1 - CONFIGURACION_DEFAULT.margen);
        const diferencia = Math.abs(resultado.calculos.par - parEsperado);
        
        if (diferencia > 0.01) {
          throw new Error(`PAR incorrecto. Esperado: ${formatearEUR(parEsperado)}, Obtenido: ${formatearEUR(resultado.calculos.par)}`);
        }
        
        return {
          resultado: 'PAR calculado correctamente',
          esperado: formatearEUR(parEsperado),
          obtenido: formatearEUR(resultado.calculos.par)
        };
      }

      case 'test-amortizacion-formulas': {
        const resultado = calcularCotizacion(PAQUETES_OCTANORM[0], CONFIGURACION_DEFAULT);
        const amortizacionEsperada = resultado.calculos.costeCompraTotal / CONFIGURACION_DEFAULT.vidaUtilAnios;
        const costeEventoEsperado = amortizacionEsperada / CONFIGURACION_DEFAULT.frecuenciaUsoAnual;
        
        if (Math.abs(resultado.calculos.amortizacionAnual - amortizacionEsperada) > 0.01) {
          throw new Error('Fórmula de amortización anual incorrecta');
        }
        
        if (Math.abs(resultado.calculos.costeAmortizadoEvento - costeEventoEsperado) > 0.01) {
          throw new Error('Fórmula de coste amortizado por evento incorrecta');
        }
        
        return {
          resultado: 'Fórmulas de amortización correctas',
          esperado: 'Amortización anual y por evento calculadas según fórmulas',
          obtenido: 'Cálculos coinciden con las fórmulas esperadas'
        };
      }

      case 'test-overhead-calculo': {
        const resultado = calcularCotizacion(PAQUETES_OCTANORM[0], CONFIGURACION_DEFAULT);
        const overheadEsperado = resultado.calculos.costesDirectos * CONFIGURACION_DEFAULT.overhead;
        
        if (Math.abs(resultado.calculos.overhead - overheadEsperado) > 0.01) {
          throw new Error(`Overhead incorrecto. Esperado: ${formatearEUR(overheadEsperado)}, Obtenido: ${formatearEUR(resultado.calculos.overhead)}`);
        }
        
        return {
          resultado: 'Overhead calculado correctamente',
          esperado: `${CONFIGURACION_DEFAULT.overhead * 100}% de costes directos`,
          obtenido: formatearEUR(resultado.calculos.overhead)
        };
      }

      case 'test-iva-aplicacion': {
        const resultado = calcularCotizacion(PAQUETES_OCTANORM[0], CONFIGURACION_DEFAULT);
        const parConIvaEsperado = resultado.calculos.par * (1 + CONFIGURACION_DEFAULT.iva);
        
        if (Math.abs(resultado.calculos.parConIva - parConIvaEsperado) > 0.01) {
          throw new Error(`IVA mal aplicado. Esperado: ${formatearEUR(parConIvaEsperado)}, Obtenido: ${formatearEUR(resultado.calculos.parConIva)}`);
        }
        
        return {
          resultado: 'IVA aplicado correctamente',
          esperado: `${CONFIGURACION_DEFAULT.iva * 100}% sobre PAR`,
          obtenido: formatearEUR(resultado.calculos.parConIva)
        };
      }

      case 'test-configuracion-personalizada': {
        const configPersonalizada = {
          ...CONFIGURACION_DEFAULT,
          vidaUtilAnios: 8,
          frecuenciaUsoAnual: 6,
          margen: 0.40
        };
        
        const resultadoDefault = calcularCotizacion(PAQUETES_OCTANORM[0], CONFIGURACION_DEFAULT);
        const resultadoPersonalizado = calcularCotizacion(PAQUETES_OCTANORM[0], configPersonalizada);
        
        if (resultadoDefault.calculos.par === resultadoPersonalizado.calculos.par) {
          throw new Error('La configuración personalizada no afecta los cálculos');
        }
        
        return {
          resultado: 'Configuración personalizada funciona correctamente',
          esperado: 'Diferentes resultados con configuración personalizada',
          obtenido: `PAR cambia de ${formatearEUR(resultadoDefault.calculos.par)} a ${formatearEUR(resultadoPersonalizado.calculos.par)}`
        };
      }

      default:
        throw new Error(`Test no implementado: ${testId}`);
    }
  };

  // Inicializar tests
  useEffect(() => {
    inicializarTests();
  }, []);

  const ejecutarTests = async () => {
    setEjecutando(true);
    setProgreso(0);
    
    const testsActualizados = [...testSuite.tests];
    let exitosos = 0;
    let fallidos = 0;
    const inicioTotal = Date.now();

    // Actualizar estado a ejecutando
    setTestSuite(prev => ({
      ...prev,
      estado: 'ejecutando',
      exitosos: 0,
      fallidos: 0
    }));

    for (let i = 0; i < testsActualizados.length; i++) {
      const test = testsActualizados[i];
      const inicio = Date.now();
      
      // Marcar test como ejecutando
      testsActualizados[i] = { ...test, estado: 'ejecutando' };
      setTestSuite(prev => ({ ...prev, tests: [...testsActualizados] }));
      
      // Simular tiempo de ejecución
      await new Promise(resolve => setTimeout(resolve, 500));
      
      try {
        const resultado = await ejecutarTestIndividual(test.id);
        const duracion = Date.now() - inicio;
        
        testsActualizados[i] = {
          ...test,
          estado: 'exitoso',
          resultado: resultado.resultado,
          esperado: resultado.esperado,
          obtenido: resultado.obtenido,
          duracion
        };
        exitosos++;
      } catch (error) {
        const duracion = Date.now() - inicio;
        
        testsActualizados[i] = {
          ...test,
          estado: 'fallido',
          error: error instanceof Error ? error.message : 'Error desconocido',
          duracion
        };
        fallidos++;
      }
      
      // Actualizar progreso
      setProgreso(((i + 1) / testsActualizados.length) * 100);
      setTestSuite(prev => ({
        ...prev,
        tests: [...testsActualizados],
        exitosos,
        fallidos
      }));
    }

    const duracionTotal = Date.now() - inicioTotal;
    
    setTestSuite(prev => ({
      ...prev,
      estado: 'completado',
      duracionTotal
    }));
    
    setEjecutando(false);
  };

  const reiniciarTests = () => {
    inicializarTests();
    setProgreso(0);
    setEjecutando(false);
  };

  const getIconoEstado = (estado: TestResult['estado']) => {
    switch (estado) {
      case 'exitoso':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'fallido':
        return <XCircle className="h-5 w-5 text-red-600" />;
      case 'ejecutando':
        return <div className="h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />;
      default:
        return <AlertCircle className="h-5 w-5 text-slate-400" />;
    }
  };

  const getBadgeVariant = (estado: TestResult['estado']) => {
    switch (estado) {
      case 'exitoso':
        return 'default';
      case 'fallido':
        return 'destructive';
      case 'ejecutando':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <Card className="bg-gradient-to-r from-purple-50 to-indigo-50 border-purple-200">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center">
            <TestTube className="h-6 w-6 mr-2 text-purple-600" />
            Tests Automáticos
          </CardTitle>
          <CardDescription className="text-lg">
            Validación automática de todas las fórmulas y cálculos del sistema
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <Badge variant="outline" className="mb-2">Total Tests</Badge>
              <p className="font-bold text-2xl">{testSuite.tests.length}</p>
            </div>
            <div className="text-center">
              <Badge variant="default" className="mb-2">Exitosos</Badge>
              <p className="font-bold text-2xl text-green-600">{testSuite.exitosos}</p>
            </div>
            <div className="text-center">
              <Badge variant="destructive" className="mb-2">Fallidos</Badge>
              <p className="font-bold text-2xl text-red-600">{testSuite.fallidos}</p>
            </div>
            <div className="text-center">
              <Badge variant="secondary" className="mb-2">Duración</Badge>
              <p className="font-bold text-2xl">{(testSuite.duracionTotal / 1000).toFixed(1)}s</p>
            </div>
          </div>

          {ejecutando && (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">Progreso de Tests</span>
                <span className="text-sm text-slate-600">{progreso.toFixed(0)}%</span>
              </div>
              <Progress value={progreso} className="w-full" />
            </div>
          )}

          <div className="flex gap-4">
            <Button 
              onClick={ejecutarTests}
              disabled={ejecutando}
              size="lg"
            >
              <Play className="h-5 w-5 mr-2" />
              {ejecutando ? 'Ejecutando Tests...' : 'Ejecutar Todos los Tests'}
            </Button>
            
            <Button 
              onClick={reiniciarTests}
              disabled={ejecutando}
              variant="outline"
              size="lg"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Reiniciar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Resultados de Tests */}
      <div className="space-y-4">
        {testSuite.tests.map((test) => (
          <Card key={test.id} className={`transition-all duration-200 ${
            test.estado === 'exitoso' ? 'border-green-200 bg-green-50' :
            test.estado === 'fallido' ? 'border-red-200 bg-red-50' :
            test.estado === 'ejecutando' ? 'border-blue-200 bg-blue-50' :
            ''
          }`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  {getIconoEstado(test.estado)}
                  <div>
                    <CardTitle className="text-lg">{test.nombre}</CardTitle>
                    <CardDescription>{test.descripcion}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={getBadgeVariant(test.estado)}>
                    {test.estado === 'pendiente' ? 'Pendiente' :
                     test.estado === 'ejecutando' ? 'Ejecutando' :
                     test.estado === 'exitoso' ? 'Exitoso' : 'Fallido'}
                  </Badge>
                  {test.duracion && (
                    <Badge variant="outline">
                      {test.duracion}ms
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            
            {(test.estado === 'exitoso' || test.estado === 'fallido') && (
              <CardContent className="pt-0">
                {test.estado === 'exitoso' && (
                  <div className="space-y-2">
                    <p className="text-sm text-green-700 font-medium">{test.resultado}</p>
                    {test.esperado && test.obtenido && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-slate-700">Esperado:</span>
                          <p className="text-slate-600">{test.esperado}</p>
                        </div>
                        <div>
                          <span className="font-medium text-slate-700">Obtenido:</span>
                          <p className="text-slate-600">{test.obtenido}</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                
                {test.estado === 'fallido' && (
                  <Alert>
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Error:</strong> {test.error}
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            )}
          </Card>
        ))}
      </div>

      {/* Información sobre los Tests */}
      <Card>
        <CardHeader>
          <CardTitle>Información sobre los Tests</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4 text-sm text-slate-600">
            <p>
              <strong>Propósito:</strong> Estos tests automáticos validan que todas las fórmulas de cálculo 
              funcionen correctamente según las especificaciones proporcionadas.
            </p>
            
            <div>
              <strong>Tests incluidos:</strong>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Cálculo de CTP para los tres paquetes (Essential, Impact, Premium)</li>
                <li>Cálculo de PAR con margen del 35%</li>
                <li>Aplicación correcta de las fórmulas de amortización</li>
                <li>Cálculo de overhead del 10%</li>
                <li>Aplicación de IVA del 21%</li>
                <li>Funcionamiento con configuración personalizada</li>
              </ul>
            </div>
            
            <p>
              <strong>Tolerancia:</strong> Los tests permiten pequeñas variaciones (1-15%) para acomodar 
              diferencias de redondeo y aproximaciones en los cálculos.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}