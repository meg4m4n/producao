import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar, ZoomIn, ZoomOut, RotateCcw, Building, MapPin, Edit, CalendarDays, CalendarRange } from 'lucide-react';
import { Producao } from '../types';
import { useProducoes } from '../hooks/useSupabaseData';
import EditDateModal from '../components/EditDateModal';

type ViewMode = 'day' | 'week' | 'month';

const GanttChart: React.FC = () => {
  const { producoes, loading, error, updateProducao } = useProducoes();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [viewMode, setViewMode] = useState<ViewMode>('day');
  const timelineRef = useRef<HTMLDivElement>(null);
  const [editDateModal, setEditDateModal] = useState<{
    isOpen: boolean;
    producao: Producao | null;
  }>({ isOpen: false, producao: null });

  // Calculate date range
  const dateRange = useMemo(() => {
    const allDates = producoes.flatMap(p => [
      new Date(p.dataInicio),
      new Date(p.dataPrevisao),
      new Date(p.dataEstimadaEntrega)
    ]);
    
    const minDate = new Date(Math.min(...allDates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    // Add padding
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);
    
    return { minDate, maxDate };
  }, [producoes]);

  // Generate timeline dates
  const timelineDates = useMemo(() => {
    const dates = [];
    const current = new Date(dateRange.minDate);
    const increment = viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30;
    
    while (current <= dateRange.maxDate) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + increment);
    }
    
    return dates;
  }, [dateRange]);

  const dayWidth = viewMode === 'day' ? 30 * zoomLevel : viewMode === 'week' ? 120 * zoomLevel : 200 * zoomLevel;
  const totalWidth = timelineDates.length * dayWidth;

  const getQuantidadeTotal = (producao: Producao): number => {
    return producao.variantes.reduce((total, variante) => {
      return total + Object.values(variante.tamanhos).reduce((sum, qty) => sum + qty, 0);
    }, 0);
  };

  const getDatePosition = (date: Date): number => {
    if (viewMode === 'day') {
      const daysDiff = Math.floor((date.getTime() - dateRange.minDate.getTime()) / (1000 * 60 * 60 * 24));
      return daysDiff * (30 * zoomLevel);
    } else if (viewMode === 'week') {
      const weeksDiff = Math.floor((date.getTime() - dateRange.minDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
      return weeksDiff * (120 * zoomLevel);
    } else {
      const monthsDiff = Math.floor((date.getTime() - dateRange.minDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      return monthsDiff * (200 * zoomLevel);
    }
  };

  const getBarWidth = (startDate: Date, endDate: Date): number => {
    if (viewMode === 'day') {
      const daysDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
      return Math.max(daysDiff * (30 * zoomLevel), 30 * zoomLevel);
    } else if (viewMode === 'week') {
      const weeksDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 7));
      return Math.max(weeksDiff * (120 * zoomLevel), 120 * zoomLevel);
    } else {
      const monthsDiff = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24 * 30));
      return Math.max(monthsDiff * (200 * zoomLevel), 200 * zoomLevel);
    }
  };

  const getBarColor = (producao: Producao): string => {
    if (producao.estado === 'FALTA COMPONENTES') return 'bg-red-500';
    if (producao.problemas) return 'bg-orange-500';
    if (producao.emProducao) return 'bg-green-500';
    
    switch (producao.etapa) {
      case 'Desenvolvimento': return 'bg-yellow-500';
      case '1º proto': return 'bg-orange-400';
      case '2º proto': return 'bg-orange-500';
      case 'Size-Set': return 'bg-blue-500';
      case 'PPS': return 'bg-purple-500';
      case 'Produção': return 'bg-indigo-500';
      case 'Pronto': return 'bg-green-600';
      case 'Enviado': return 'bg-gray-500';
      default: return 'bg-gray-400';
    }
  };

  const isToday = (date: Date): boolean => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isWeekend = (date: Date): boolean => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const formatDate = (date: Date): string => {
    if (viewMode === 'day') {
      return date.toLocaleDateString('pt-PT', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    } else if (viewMode === 'week') {
      const weekEnd = new Date(date);
      weekEnd.setDate(weekEnd.getDate() + 6);
      return `${date.getDate()}/${date.getMonth() + 1} - ${weekEnd.getDate()}/${weekEnd.getMonth() + 1}`;
    } else {
      return date.toLocaleDateString('pt-PT', { 
        month: 'short', 
        year: '2-digit' 
      });
    }
  };

  const formatMonth = (date: Date): string => {
    return date.toLocaleDateString('pt-PT', { 
      month: 'long', 
      year: 'numeric' 
    });
  };

  // Group dates by month for header
  const monthGroups = useMemo(() => {
    const groups: { month: string; startIndex: number; days: number }[] = [];
    let currentMonth = '';
    let startIndex = 0;
    let days = 0;

    timelineDates.forEach((date, index) => {
      const monthYear = formatMonth(date);
      
      if (monthYear !== currentMonth) {
        if (currentMonth) {
          groups.push({ month: currentMonth, startIndex, days });
        }
        currentMonth = monthYear;
        startIndex = index;
        days = 1;
      } else {
        days++;
      }
    });

    if (currentMonth) {
      groups.push({ month: currentMonth, startIndex, days });
    }

    return groups;
  }, [timelineDates]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev * 1.2, 3));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev / 1.2, 0.3));
  };

  const handleResetZoom = () => {
    setZoomLevel(1);
    setScrollPosition(0);
    if (timelineRef.current) {
      timelineRef.current.scrollLeft = 0;
    }
  };

  useEffect(() => {
    if (timelineRef.current) {
      timelineRef.current.scrollLeft = scrollPosition;
    }
  }, [zoomLevel]);

  const handleDateEdit = async (producao: Producao, newDates: { dataInicio: string; dataFinal: string }) => {
    try {
      const updatedProducao = {
        ...producao,
        dataInicio: newDates.dataInicio,
        dataFinal: newDates.dataFinal
      };
      await updateProducao(producao.id, updatedProducao);
      setEditDateModal({ isOpen: false, producao: null });
    } catch (err) {
      alert('Erro ao atualizar datas');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando gráfico de Gantt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <div className="flex items-center space-x-3">
          <Calendar className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="text-lg font-semibold text-red-900">Erro ao carregar dados</h3>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Calendar className="w-8 h-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Planeamento</h1>
              <p className="text-gray-600">Timeline visual e planeamento das produções</p>
            </div>
          </div>
          
          {/* Zoom Controls */}
          <div className="flex items-center space-x-4">
            {/* View Mode Selector */}
            <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('day')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'day' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <Calendar className="w-4 h-4" />
                <span>Dia</span>
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <CalendarDays className="w-4 h-4" />
                <span>Semana</span>
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`flex items-center space-x-1 px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  viewMode === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                <CalendarRange className="w-4 h-4" />
                <span>Mês</span>
              </button>
            </div>
            
            {/* Zoom Controls */}
            <div className="flex items-center space-x-2">
            <button
              onClick={handleZoomOut}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom Out"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <span className="text-sm text-gray-600 min-w-[60px] text-center">
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={handleZoomIn}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Zoom In"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
            <button
              onClick={handleResetZoom}
              className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Reset Zoom"
            >
              <RotateCcw className="w-5 h-5" />
            </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gantt Chart */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Fixed Header */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            {/* Left Panel Header */}
            <div className="w-80 flex-shrink-0 border-r border-gray-200 bg-gray-50">
              <div className="grid grid-cols-4 h-12 text-xs font-medium text-gray-700">
                <div className="flex items-center px-3 border-r border-gray-200">Ref. Interna</div>
                <div className="flex items-center px-3 border-r border-gray-200">Quantidade</div>
                <div className="flex items-center px-3 border-r border-gray-200">Datas</div>
                <div className="flex items-center px-3">Local</div>
              </div>
            </div>
            
            {/* Timeline Header */}
            <div className="flex-1">
              <div 
                ref={timelineRef}
                className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100 max-h-[600px]"
                onScroll={(e) => setScrollPosition(e.currentTarget.scrollLeft)}
              >
                <div style={{ width: totalWidth }}>
                  {/* Month Headers */}
                  <div className="flex border-b border-gray-200 bg-gray-100 h-8">
                    {monthGroups.map((group, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-center text-xs font-semibold text-gray-700 border-r border-gray-300"
                        style={{ width: group.days * dayWidth }}
                      >
                        {group.month}
                      </div>
                    ))}
                  </div>
                  
                  {/* Day Headers */}
                  <div className="flex border-b border-gray-200 bg-gray-50 h-8">
                    {timelineDates.map((date, index) => (
                      <div
                        key={index}
                        className={`
                          flex items-center justify-center text-xs border-r border-gray-200
                          ${isToday(date) ? 'bg-blue-100 text-blue-800 font-bold' : ''}
                          ${isWeekend(date) ? 'bg-gray-100 text-gray-500' : 'text-gray-600'}
                        `}
                        style={{ width: dayWidth }}
                      >
                        {formatDate(date)}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Gantt Rows */}
        <div className="max-h-[500px] overflow-y-auto">
          {producoes.map((producao, index) => (
            <div key={producao.id} className="flex border-b border-gray-100 hover:bg-gray-50">
              {/* Left Panel */}
              <div className="w-80 flex-shrink-0 border-r border-gray-200 bg-white">
                <div className="grid grid-cols-4 h-16 text-xs">
                  {/* Ref Interna */}
                  <div className="flex items-center px-3 border-r border-gray-200">
                    <div>
                      <div className="font-semibold text-gray-900">{producao.referenciaInterna}</div>
                      <div className="text-gray-500">{producao.marca}</div>
                    </div>
                  </div>
                  
                  {/* Quantidade */}
                  <div className="flex items-center justify-center px-3 border-r border-gray-200">
                    <div className="text-center">
                      <div className="font-bold text-blue-600">{getQuantidadeTotal(producao)}</div>
                      <div className="text-gray-500">unidades</div>
                    </div>
                  </div>
                  
                  {/* Datas */}
                  <div className="flex items-center px-3 border-r border-gray-200">
                    <div>
                      <div className="text-gray-600">
                        {new Date(producao.dataInicio).toLocaleDateString('pt-PT')}
                      </div>
                      <div className="text-red-600 font-medium">
                        {new Date(producao.dataFinal).toLocaleDateString('pt-PT')}
                      </div>
                    </div>
                  </div>
                  
                  {/* Local */}
                  <div className="flex items-center px-3">
                    <div className="flex items-center space-x-1">
                      {producao.localProducao === 'Interno' ? (
                        <Building className="w-3 h-3 text-blue-600" />
                      ) : (
                        <MapPin className="w-3 h-3 text-orange-600" />
                      )}
                      <span className="text-gray-700">
                        {producao.localProducao === 'Interno' ? 'Interno' : (producao.empresaExterna || 'Externo')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Timeline */}
              <div className="flex-1 relative">
                <div 
                  className="overflow-x-auto h-16 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                  style={{ scrollLeft: scrollPosition }}
                >
                  <div 
                    className="relative h-16"
                    style={{ width: totalWidth }}
                  >
                    {/* Background grid */}
                    {timelineDates.map((date, dateIndex) => (
                      <div
                        key={dateIndex}
                        className={`
                          absolute top-0 bottom-0 border-r border-gray-100
                          ${isToday(date) ? 'bg-blue-50' : ''}
                          ${isWeekend(date) ? 'bg-gray-50' : ''}
                        `}
                        style={{ 
                          left: dateIndex * dayWidth, 
                          width: dayWidth 
                        }}
                      />
                    ))}
                    
                    {/* Today line */}
                    {timelineDates.some(date => isToday(date)) && (
                      <div
                        className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                        style={{ 
                          left: getDatePosition(new Date()) + dayWidth / 2 
                        }}
                      />
                    )}
                    
                    {/* Gantt Bar */}
                    <div
                      className={`
                        absolute top-2 bottom-2 rounded-md shadow-sm z-10 flex items-center px-2 cursor-pointer
                        ${getBarColor(producao)} opacity-80 hover:opacity-100 transition-opacity
                      `}
                      style={{
                        left: getDatePosition(new Date(producao.dataInicio)),
                        width: getBarWidth(new Date(producao.dataInicio), new Date(producao.dataFinal))
                      }}
                      title={`${producao.referenciaInterna} - ${producao.etapa} - ${producao.estado}`}
                      onClick={() => setEditDateModal({ isOpen: true, producao })}
                    >
                      <div className="text-white text-xs font-medium truncate flex items-center space-x-1">
                        {producao.etapa}
                        <Edit className="w-3 h-3 opacity-70" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <h3 className="text-sm font-medium text-gray-700 mb-3">Legenda</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 text-xs">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-yellow-500 rounded"></div>
            <span>Desenvolvimento</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-orange-400 rounded"></div>
            <span>1º Proto</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-orange-500 rounded"></div>
            <span>2º Proto</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-blue-500 rounded"></div>
            <span>Size-Set</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-purple-500 rounded"></div>
            <span>PPS</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-indigo-500 rounded"></div>
            <span>Produção</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-green-600 rounded"></div>
            <span>Pronto</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-3 bg-gray-500 rounded"></div>
            <span>Enviado</span>
          </div>
        </div>
        <div className="mt-3 pt-3 border-t border-gray-200">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 bg-red-500 rounded"></div>
              <span>Falta Componentes</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 bg-orange-500 rounded"></div>
              <span>Com Problemas</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-3 bg-green-500 rounded"></div>
              <span>Em Produção</span>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Date Modal */}
      <EditDateModal
        isOpen={editDateModal.isOpen}
        onClose={() => setEditDateModal({ isOpen: false, producao: null })}
        onSave={handleDateEdit}
        producao={editDateModal.producao}
      />
    </div>
  );
};

export default GanttChart;