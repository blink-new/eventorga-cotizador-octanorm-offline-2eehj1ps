import React, { useState } from 'react';
import { Calculator, FileText, Download, TestTube, Wifi, WifiOff, Scale, History, Layers } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Button } from './components/ui/button';
import { Badge } from './components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import { CotizadorPrincipal } from './components/CotizadorPrincipal';
import { ResultadosCalculo } from './components/ResultadosCalculo';
import { TestsAutomaticos } from './components/TestsAutomaticos';
import { ExportacionPDF } from './components/ExportacionPDF';
import { ComparadorPaquetes } from './components/ComparadorPaquetes';
import { HistorialCotizaciones } from './components/HistorialCotizaciones';
import { useHistorialCotizaciones } from './hooks/useHistorialCotizaciones';
import { PlantillasPaquetes } from './components/PlantillasPaquetes';
import { type ResultadoCalculo, type PaqueteOctanorm, PAQUETES_OCTANORM, CONFIGURACION_DEFAULT } from './lib/calculator';

function App() {
  const [resultado, setResultado] = useState<ResultadoCalculo | null>(null);
  const [tabActiva, setTabActiva] = useState('cotizador');
  const [isOnline] = useState(false); // Siempre offline para esta app
  const [paquetes, setPaquetes] = useState<PaqueteOctanorm[]>(PAQUETES_OCTANORM);
  const { guardarCotizacion } = useHistorialCotizaciones();

  const handleCalculoCompleto = (nuevoResultado: ResultadoCalculo) => {
    setResultado(nuevoResultado);
    setTabActiva('resultados');
    
    // Guardar automáticamente en el historial
    guardarCotizacion(nuevoResultado);
  };

  const handleSeleccionarPaqueteComparador = (paquete: PaqueteOctanorm) => {
    // Cambiar a la tab del cotizador con el paquete preseleccionado
    setTabActiva('cotizador');
    // Aquí podrías pasar el paquete seleccionado al cotizador si fuera necesario
  };

  const handleCargarCotizacionHistorial = (cotizacion: any) => {
    setResultado(cotizacion);
    setTabActiva('resultados');
  };

  const handleExportarCotizacionHistorial = (cotizacion: any) => {
    setResultado(cotizacion);
    setTabActiva('exportar');
  };

  const handleSeleccionarPlantilla = (paquete: PaqueteOctanorm) => {
    // Agregar la plantilla a la lista de paquetes disponibles si no existe
    const paqueteExiste = paquetes.find(p => p.id === paquete.id);
    if (!paqueteExiste) {
      setPaquetes([...paquetes, paquete]);
    }
    setTabActiva('cotizador');
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Calculator className="h-8 w-8 text-blue-600" />
                <div>
                  <h1 className="text-xl font-bold text-slate-900">Eventorga</h1>
                  <p className="text-sm text-slate-600">Cotizador Octanorm</p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant={isOnline ? "default" : "secondary"} className="flex items-center space-x-1">
                {isOnline ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                <span>{isOnline ? 'Online' : 'Offline'}</span>
              </Badge>
              
              <div className="text-right">
                <p className="text-sm font-medium text-slate-900">Versión 2.0</p>
                <p className="text-xs text-slate-600">Completamente Parametrizable</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">
            Cotizador Profesional Octanorm
          </h2>
          <p className="text-lg text-slate-600 max-w-3xl mx-auto">
            Calcula automáticamente el CTP y PAR de tus paquetes Octanorm con fórmulas exactas de amortización. 
            Completamente parametrizable por metros cuadrados. Exporta presupuestos profesionales en PDF y Excel.
          </p>
          <div className="mt-4 flex justify-center items-center space-x-6 text-sm text-slate-500">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              100% Offline
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-blue-500 rounded-full mr-2"></div>
              Fórmulas Exactas
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-purple-500 rounded-full mr-2"></div>
              Exportación PDF/Excel
            </span>
            <span className="flex items-center">
              <div className="w-2 h-2 bg-orange-500 rounded-full mr-2"></div>
              Completamente Parametrizable
            </span>
          </div>
        </div>

        {/* Navigation Tabs */}
        <Tabs value={tabActiva} onValueChange={setTabActiva} className="w-full">
          <TabsList className="grid w-full grid-cols-7 mb-8">
            <TabsTrigger value="cotizador" className="flex items-center space-x-2">
              <Calculator className="h-4 w-4" />
              <span>Cotizador</span>
            </TabsTrigger>
            <TabsTrigger value="plantillas" className="flex items-center space-x-2">
              <Layers className="h-4 w-4" />
              <span>Plantillas</span>
            </TabsTrigger>
            <TabsTrigger value="comparador" className="flex items-center space-x-2">
              <Scale className="h-4 w-4" />
              <span>Comparar</span>
            </TabsTrigger>
            <TabsTrigger value="resultados" disabled={!resultado} className="flex items-center space-x-2">
              <FileText className="h-4 w-4" />
              <span>Resultados</span>
            </TabsTrigger>
            <TabsTrigger value="exportar" disabled={!resultado} className="flex items-center space-x-2">
              <Download className="h-4 w-4" />
              <span>Exportar</span>
            </TabsTrigger>
            <TabsTrigger value="historial" className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>Historial</span>
            </TabsTrigger>
            <TabsTrigger value="tests" className="flex items-center space-x-2">
              <TestTube className="h-4 w-4" />
              <span>Tests</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="cotizador">
            <CotizadorPrincipal onCalculoCompleto={handleCalculoCompleto} />
          </TabsContent>

          <TabsContent value="plantillas">
            <PlantillasPaquetes onSeleccionarPlantilla={handleSeleccionarPlantilla} />
          </TabsContent>

          <TabsContent value="comparador">
            <ComparadorPaquetes 
              paquetes={paquetes}
              datosProyecto={{ 
                metrosCuadrados: 50, 
                nombreCliente: '', 
                nombreProyecto: '', 
                fechaCotizacion: new Date().toISOString().split('T')[0], 
                observaciones: '' 
              }}
              configuracion={CONFIGURACION_DEFAULT}
              onSeleccionarPaquete={handleSeleccionarPaqueteComparador}
            />
          </TabsContent>

          <TabsContent value="resultados">
            {resultado && <ResultadosCalculo resultado={resultado} />}
          </TabsContent>

          <TabsContent value="exportar">
            {resultado && <ExportacionPDF resultado={resultado} />}
          </TabsContent>

          <TabsContent value="historial">
            <HistorialCotizaciones 
              onCargarCotizacion={handleCargarCotizacionHistorial}
              onExportarCotizacion={handleExportarCotizacionHistorial}
            />
          </TabsContent>

          <TabsContent value="tests">
            <TestsAutomaticos />
          </TabsContent>
        </Tabs>

        {/* Footer Info */}
        <div className="mt-16 border-t border-slate-200 pt-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Política Comercial</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-600">
                  <p><strong>Anticipo:</strong> 80% al confirmar pedido</p>
                  <p><strong>Resto:</strong> 20% a la entrega</p>
                  <p><strong>IVA:</strong> 21% incluido en precios finales</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Parámetros de Cálculo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-600">
                  <p><strong>Vida útil:</strong> 10 años</p>
                  <p><strong>Frecuencia uso:</strong> 5 eventos/año</p>
                  <p><strong>Tasa rotura:</strong> 2%</p>
                  <p><strong>Margen:</strong> 35%</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Nuevas Características</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>✓ Editor de paquetes personalizado</p>
                  <p>✓ Plantillas especializadas</p>
                  <p>✓ Comparador de paquetes</p>
                  <p>✓ Historial de cotizaciones</p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Características Base</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm text-slate-600">
                  <p>✓ Funcionamiento offline completo</p>
                  <p>✓ Exportación PDF y Excel</p>
                  <p>✓ Tests automáticos integrados</p>
                  <p>✓ Fórmulas de amortización exactas</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;