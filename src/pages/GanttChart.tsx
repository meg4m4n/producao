import React, { useState, useMemo, useRef, useEffect } from 'react';
import { Calendar, Building, MapPin, CalendarDays, CalendarRange } from 'lucide-react';
import { Producao } from '../types';
import { useProducoes } from '../hooks/useSupabaseData';
import ProducaoForm from '../components/ProducaoForm';

type ViewMode = 'day' | 'week' | 'month';

const LEFT_WIDTH = 770; // OP 120 + Ref 180 + Qtd 80 + Datas 170 + Local 130 + Min 90

const GanttChart: React.FC = () => {
  const { producoes, loading, error, updateProducao } = useProducoes();

  const [zoomLevel, setZoomLevel] = useState(0.3); // visão geral por defeito
  const [viewMode, setViewMode] = useState<ViewMode>('day');

  const timelineHeaderRef = useRef<HTMLDivElement>(null);
  const [editModal, setEditModal] = useState<{ isOpen: boolean; producao: Producao | null }>({
    isOpen: false,
    producao: null,
  });

  /* ------------------------------- HELPERS -------------------------------- */

  const safeDate = (d?: string) => (d ? new Date(d) : null);

  const getQuantidadeTotal = (producao: Producao): number =>
    producao.variantes.reduce(
      (total, variante) =>
        total + Object.values(variante.tamanhos).reduce((sum, qty) => sum + qty, 0),
      0
    );

  const minutosEstimados = (producao: Producao): number => {
    const minPorPeca = (producao as any).tempoProducaoEstimado ?? 0; // “min por peça”
    return Math.max(0, Number(minPorPeca) * getQuantidadeTotal(producao));
  };

  const colorBar = (p: Producao): string => {
    if (p.estado === 'FALTA COMPONENTES') return 'bg-red-500';
    if (p.problemas) return 'bg-orange-500';
    if (p.emProducao) return 'bg-green-500';
    switch (p.etapa) {
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

  const isToday = (d: Date) => {
    const t = new Date();
    return d.getFullYear() === t.getFullYear() && d.getMonth() === t.getMonth() && d.getDate() === t.getDate();
  };

  const isWeekend = (d: Date) => d.getDay() === 0 || d.getDay() === 6;
  const fmtDate = (d: Date) => d.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit' });

  /* ------------------------------ DATE RANGE ------------------------------ */

  const dateRange = useMemo(() => {
    if (!producoes.length) {
      const today = new Date();
      const minDate = new Date(today);
      const maxDate = new Date(today);
      minDate.setDate(today.getDate() - 7);
      maxDate.setDate(today.getDate() + 7);
      return { minDate, maxDate };
    }

    const allDates: Date[] = [];
    producoes.forEach((p) => {
      const di = safeDate(p.dataInicio);
      const df =
        safeDate((p as any).dataFinal) ||
        safeDate((p as any).dataEstimadaEntrega) ||
        safeDate(p.dataPrevisao);
      if (di) allDates.push(di);
      if (df) allDates.push(df);
    });

    const minMs = Math.min(...allDates.map((d) => d.getTime()));
    const maxMs = Math.max(...allDates.map((d) => d.getTime()));
    const minDate = new Date(minMs);
    const maxDate = new Date(maxMs);

    // acolchoar
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    return { minDate, maxDate };
  }, [producoes]);

  const timelineDates = useMemo(() => {
    const out: Date[] = [];
    const cur = new Date(dateRange.minDate);
    const inc = viewMode === 'day' ? 1 : viewMode === 'week' ? 7 : 30;
    while (cur <= dateRange.maxDate) {
      out.push(new Date(cur));
      cur.setDate(cur.getDate() + inc);
    }
    return out;
  }, [dateRange, viewMode]);

  const unitWidth =
    viewMode === 'day' ? 30 * zoomLevel : viewMode === 'week' ? 120 * zoomLevel : 200 * zoomLevel;
  const totalWidth = Math.max(1, timelineDates.length * unitWidth);

  const posForDate = (date: Date): number => {
    const msDiff = date.getTime() - dateRange.minDate.getTime();
    const dayMs = 1000 * 60 * 60 * 24;
    if (viewMode === 'day') {
      const days = Math.floor(msDiff / dayMs);
      return days * unitWidth;
    } else if (viewMode === 'week') {
      const weeks = Math.floor(msDiff / (dayMs * 7));
      return weeks * unitWidth;
    } else {
      const months = Math.floor(msDiff / (dayMs * 30));
      return months * unitWidth;
    }
  };

  const widthForSpan = (start: Date, end: Date): number => {
    const ms = end.getTime() - start.getTime();
    const dayMs = 1000 * 60 * 60 * 24;
    if (viewMode === 'day') {
      const days = Math.max(1, Math.floor(ms / dayMs));
      return Math.max(days * unitWidth, unitWidth);
    } else if (viewMode === 'week') {
      const weeks = Math.max(1, Math.floor(ms / (dayMs * 7)));
      return Math.max(weeks * unitWidth, unitWidth);
    } else {
      const months = Math.max(1, Math.floor(ms / (dayMs * 30)));
      return Math.max(months * unitWidth, unitWidth);
    }
  };

  // grupos por mês (header superior)
  const monthGroups = useMemo(() => {
    const groups: { month: string; count: number }[] = [];
    let cur = '';
    let count = 0;
    timelineDates.forEach((d, idx) => {
      const label = d.toLocaleDateString('pt-PT', { month: 'long', year: 'numeric' });
      if (idx === 0) {
        cur = label;
        count = 1;
      } else if (label === cur) {
        count++;
      } else {
        groups.push({ month: cur, count });
        cur = label;
        count = 1;
      }
    });
    if (cur) groups.push({ month: cur, count });
    return groups;
  }, [timelineDates]);

  /* -------------------------- CENTER ON TODAY ----------------------------- */

  const centerOnToday = () => {
    const el = timelineHeaderRef.current;
    if (!el || timelineDates.length === 0) return;

    const today = new Date();
    // clamp today into the visible range
    const clampDate =
      today < dateRange.minDate ? dateRange.minDate
      : today > dateRange.maxDate ? dateRange.maxDate
      : today;

    const target = posForDate(clampDate) + unitWidth / 2; // centro da célula de hoje
    const viewport = el.clientWidth || 0;
    const scrollLeft = Math.max(0, target - viewport / 2);
    el.scrollLeft = scrollLeft;

    // alinhar também as linhas (cada linha copia este scrollLeft)
    // guardamos num data-attr para usar nas linhas
    el.setAttribute('data-sync-scroll', String(scrollLeft));
  };

  // centre no mount e quando muda zoom/viewMode/prod range
  useEffect(() => {
    // esperar o layout calcular larguras
    const id = requestAnimationFrame(centerOnToday);
    return () => cancelAnimationFrame(id);
  }, [zoomLevel, viewMode, totalWidth, dateRange.minDate.getTime(), dateRange.maxDate.getTime()]);

  /* -------------------------------- SAVE ---------------------------------- */

  const handleEditProducao = async (producaoAtualizada: Producao) => {
    try {
      await updateProducao(producaoAtualizada.id, producaoAtualizada);
      setEditModal({ isOpen: false, producao: null });
    } catch {
      alert('Erro ao atualizar produção');
    }
  };

  /* -------------------------------- UI ------------------------------------ */

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
      {/* Header / Controlos */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-6 h-6 text-blue-600" />
            <div>
              <h1 className="text-xl font-bold text-gray-900 leading-tight">Planeamento</h1>
              <p className="text-gray-600 text-sm">Gantt com OP, referências, quantidades e cronologia</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View mode */}
            <div className="flex items-center gap-1 bg-gray-100 rounded p-1">
              <button
                onClick={() => setViewMode('day')}
                className={`px-2 py-1 rounded text-sm font-medium ${viewMode === 'day' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Dia
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-2 py-1 rounded text-sm font-medium ${viewMode === 'week' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Semana
              </button>
              <button
                onClick={() => setViewMode('month')}
                className={`px-2 py-1 rounded text-sm font-medium ${viewMode === 'month' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-800'}`}
              >
                Mês
              </button>
            </div>

            {/* Zoom */}
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Zoom:</span>
              <button
                onClick={() => setZoomLevel((v) => Math.max(0.2, v - 0.1))}
                className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
              >
                -
              </button>
              <span className="text-sm text-gray-600 min-w-[40px] text-center">
                {Math.round(zoomLevel * 100)}%
              </span>
              <button
                onClick={() => setZoomLevel((v) => Math.min(1.5, v + 0.1))}
                className="px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300 text-sm"
              >
                +
              </button>
              <button
                onClick={() => setZoomLevel(0.3)}
                className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm"
              >
                Visão Geral
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Gantt */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        {/* Header fixo da grelha */}
        <div className="border-b border-gray-200 bg-gray-50">
          <div className="flex">
            {/* Cabeçalho painel esquerdo */}
            <div className="flex-shrink-0" style={{ width: LEFT_WIDTH }}>
              <div className="grid grid-cols-[120px_180px_80px_170px_130px_90px] h-10 text-[11px] font-medium text-gray-700">
                <div className="flex items-center px-2 border-r border-gray-200">OP</div>
                <div className="flex items-center px-2 border-r border-gray-200">Ref. Interna</div>
                <div className="flex items-center px-2 border-r border-gray-200">Qtd</div>
                <div className="flex items-center px-2 border-r border-gray-200">Datas</div>
                <div className="flex items-center px-2 border-r border-gray-200">Local</div>
                <div className="flex items-center px-2">Min (Est.)</div>
              </div>
            </div>

            {/* Cabeçalho da timeline */}
            <div className="flex-1">
              <div
                ref={timelineHeaderRef}
                className="overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
              >
                <div style={{ width: totalWidth }}>
                  {/* meses */}
                  <div className="flex border-b border-gray-200 bg-gray-100 h-7">
                    {monthGroups.map((g, i) => (
                      <div
                        key={i}
                        className="flex items-center justify-center text-[11px] font-semibold text-gray-700 border-r border-gray-300"
                        style={{ width: g.count * unitWidth }}
                      >
                        {g.month}
                      </div>
                    ))}
                  </div>
                  {/* dias/semanas/meses */}
                  <div className="flex border-b border-gray-200 bg-gray-50 h-7">
                    {timelineDates.map((d, i) => (
                      <div
                        key={i}
                        className={[
                          'flex items-center justify-center text-[11px] border-r border-gray-200',
                          isToday(d) ? 'bg-blue-100 text-blue-800 font-bold' : '',
                          isWeekend(d) ? 'bg-gray-100 text-gray-500' : 'text-gray-600',
                        ].join(' ')}
                        style={{ width: unitWidth }}
                      >
                        {viewMode === 'day'
                          ? fmtDate(d)
                          : viewMode === 'week'
                          ? (() => {
                              const end = new Date(d);
                              end.setDate(end.getDate() + 6);
                              return `${d.getDate()}/${d.getMonth() + 1} - ${end.getDate()}/${end.getMonth() + 1}`;
                            })()
                          : d.toLocaleDateString('pt-PT', { month: 'short', year: '2-digit' })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Linhas do Gantt */}
        <div className="max-h-[560px] overflow-y-auto">
          {producoes.map((p) => {
            const qtd = getQuantidadeTotal(p);
            const di = safeDate(p.dataInicio) || new Date();
            const df =
              safeDate((p as any).dataFinal) ||
              safeDate((p as any).dataEstimadaEntrega) ||
              safeDate(p.dataPrevisao) ||
              safeDate(p.dataInicio) ||
              new Date();

            const mins = minutosEstimados(p);

            return (
              <div key={p.id} className="flex border-b border-gray-100 hover:bg-gray-50">
                {/* Painel esquerdo */}
                <div className="flex-shrink-0 bg-white border-r border-gray-200" style={{ width: LEFT_WIDTH }}>
                  <div className="grid grid-cols-[120px_180px_80px_170px_130px_90px] h-14 text-[12px]">
                    {/* OP */}
                    <div className="flex items-center px-2 border-r border-gray-200">
                      <div className="font-semibold text-gray-900 truncate" title={p.codigoOP || '-'}>
                        {p.codigoOP || '-'}
                      </div>
                    </div>
                    {/* Ref + marca */}
                    <div className="flex items-center px-2 border-r border-gray-200">
                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{p.referenciaInterna}</div>
                        <div className="text-gray-500 text-[11px] truncate">{p.marca}</div>
                      </div>
                    </div>
                    {/* Qtd */}
                    <div className="flex items-center justify-center px-2 border-r border-gray-200">
                      <div className="text-center">
                        <div className="font-bold text-blue-600 leading-tight">{qtd}</div>
                        <div className="text-gray-500 text-[10px]">unid.</div>
                      </div>
                    </div>
                    {/* Datas */}
                    <div className="flex items-center px-2 border-r border-gray-200">
                      <div className="leading-tight">
                        <div className="text-gray-600">{di ? fmtDate(di) : '-'}</div>
                        <div className="text-red-600 font-medium">{df ? fmtDate(df) : '-'}</div>
                      </div>
                    </div>
                    {/* Local */}
                    <div className="flex items-center px-2 border-r border-gray-200">
                      <div className="flex items-center gap-1 truncate">
                        {p.localProducao === 'Interno' ? (
                          <Building className="w-3 h-3 text-blue-600" />
                        ) : (
                          <MapPin className="w-3 h-3 text-orange-600" />
                        )}
                        <span className="text-gray-700 truncate">
                          {p.localProducao === 'Interno' ? 'Interno' : p.empresaExterna || 'Externo'}
                        </span>
                      </div>
                    </div>
                    {/* Min (Est.) */}
                    <div className="flex items-center px-2">
                      <div className="text-right w-full leading-tight">
                        <div className="font-semibold text-gray-900">{producao.tempoProducaoEstimado || 0}</div>
                        <div className="text-gray-500 text-[10px]">min</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Timeline */}
                <div className="flex-1 relative">
                  <div
                    className="overflow-x-auto h-14 scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100"
                    ref={(el) => {
                      // sincronizar scroll horizontal com o header
                      if (!el || !timelineHeaderRef.current) return;
                      const header = timelineHeaderRef.current;
                      // aplicar o scroll do header às linhas
                      const sync = () => {
                        el.scrollLeft = header.scrollLeft;
                      };
                      // inicial
                      const val = header.getAttribute('data-sync-scroll');
                      if (val) el.scrollLeft = Number(val);
                      // listeners
                      const onScroll = () => (el.scrollLeft = header.scrollLeft);
                      header.addEventListener('scroll', onScroll);
                      // cleanup
                      return () => header.removeEventListener('scroll', onScroll);
                    }}
                  >
                    <div className="relative h-14" style={{ width: totalWidth }}>
                      {/* grelha */}
                      {timelineDates.map((d, i) => (
                        <div
                          key={i}
                          className={[
                            'absolute top-0 bottom-0 border-r border-gray-100',
                            isToday(d) ? 'bg-blue-50' : '',
                            isWeekend(d) ? 'bg-gray-50' : '',
                          ].join(' ')}
                          style={{ left: i * unitWidth, width: unitWidth }}
                        />
                      ))}

                      {/* hoje */}
                      {timelineDates.some(isToday) && (
                        <div
                          className="absolute top-0 bottom-0 w-0.5 bg-red-500 z-20"
                          style={{ left: posForDate(new Date()) + unitWidth / 2 }}
                        />
                      )}

                      {/* barra */}
                      {di && df && (
                        <div
                          className={[
                            'absolute top-2 bottom-2 rounded-md shadow-sm z-10 flex items-center px-2 cursor-pointer',
                            colorBar(p),
                            'opacity-85 hover:opacity-100 transition-opacity',
                          ].join(' ')}
                          style={{
                            left: posForDate(di),
                            width: Math.max(8, widthForSpan(di, df)),
                          }}
                          title={`${p.codigoOP || ''} ${p.referenciaInterna} • ${qtd} un • ${di ? fmtDate(di) : '?'} → ${
                            df ? fmtDate(df) : '?'
                          }`}
                          onClick={() => setEditModal({ isOpen: true, producao: p })}
                        >
                          <div className="text-white text-[11px] font-medium truncate">
                            {zoomLevel > 0.5 ? `${p.codigoOP || ''} — ${p.referenciaInterna}` : p.codigoOP || p.referenciaInterna}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Modal de edição */}
      <ProducaoForm
        isOpen={editModal.isOpen}
        onClose={() => setEditModal({ isOpen: false, producao: null })}
        onSave={handleEditProducao}
        producao={editModal.producao}
      />
    </div>
  );
};

export default GanttChart;
