import { Activity, Heart, TrendingUp } from 'lucide-react';
import { CheckupLog, Language } from '../types';

const chartTranslations = {
  FR: {
    history_title: "Tableau Clinique de Suivi",
    weight_history: "Courbe d'évolution du Poids",
    bp_history: "Tension Artérielle (Systolique/Diastolique)",
    no_data: "Pas assez de mesures pour dessiner la courbe de tendance. Remplissez un bilan de santé pour commencer.",
    systolic: "Systolique (Haut)",
    diastolic: "Diastolique (Bas)",
    preeclampsia_warning: "Risque de Pré-éclampsie (>= 140/90)",
    healthy_range_weight: "Couloir recommandé OMS",
    weeks_pregnant: "Semaine",
    weight_unit: "kg",
    bp_unit: "mmHg",
    status_alert: "Mesure anormale - Vigilance recommandée"
  },
  SW: {
    history_title: "Chati ya Afya (Tathmini)",
    weight_history: "Mabadiliko ya Uzito",
    bp_history: "Shinikizo la Damu (Sistoliki/Diastoliki)",
    no_data: "Vipimo havitoshi kuchora grafu. Jaza ripoti ya afya ili uanzishe chati.",
    systolic: "Presha ya Juu (Sistoliki)",
    diastolic: "Presha ya Chini (Diastoliki)",
    preeclampsia_warning: "Hatari ya Shida ya Presha (>= 140/90)",
    healthy_range_weight: "Wastani wa Afya (OMS)",
    weeks_pregnant: "Wiki ya Mimba",
    weight_unit: "kg",
    bp_unit: "mmHg",
    status_alert: "Kipimo kiko nje ya kawaida"
  },
  MSH: {
    history_title: "Amacungule g'Amagala yinyu",
    weight_history: "Amaduga g'Obuzito",
    bp_history: "Amaduga g'Okuzimba kwa mashi",
    no_data: "Vipimo havitoshi kuchora grafu. Jaza ripoti ya afya kabisa.",
    systolic: "Okujunda kwa mashi (K’olubanda)",
    diastolic: "Okujunda kwa mashi (K’omwanda)",
    preeclampsia_warning: "Lufuatu l'Omwinyu (>= 140/90)",
    healthy_range_weight: "Amashako gabu (OMS)",
    weeks_pregnant: "Mviki ya Mimba",
    weight_unit: "kg",
    bp_unit: "mmHg",
    status_alert: "Kipimo kiko nje ya kawaida"
  }
};

export default function ClinicalCharts({ logs, language, initialWeight = 65 }: { logs: CheckupLog[], language: Language, initialWeight?: number }) {
  const t = chartTranslations[language as keyof typeof chartTranslations] || chartTranslations.FR;

  // Prepare & sort logs chronologically (oldest first)
  const sortedLogs = [...logs]
    .filter(log => log.date)
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Extract Weight data points
  // Even if they didn't record weight in a log, we can fall back to general or previous
  const weightPoints = sortedLogs
    .map((log) => ({
      date: new Date(log.date).toLocaleDateString(language === 'FR' ? 'fr-FR' : 'sw-KE', { month: 'short', day: 'numeric' }),
      value: log.weight || undefined,
      rawDate: new Date(log.date)
    }))
    .filter(point => point.value !== undefined) as { date: string, value: number, rawDate: Date }[];

  // Extract BP data points
  const bpPoints = sortedLogs
    .map((log) => {
      if (!log.bloodPressure) return null;
      // Parse e.g. "12/8" or "120/80" or "13/8"
      const parts = log.bloodPressure.split('/');
      if (parts.length !== 2) return null;
      let sys = parseFloat(parts[0]);
      let dia = parseFloat(parts[1]);

      // Normalize if input was like "12/8" instead of "120/80"
      if (sys < 20) sys = sys * 10;
      if (dia < 15) dia = dia * 10;

      return {
        date: new Date(log.date).toLocaleDateString(language === 'FR' ? 'fr-FR' : 'sw-KE', { month: 'short', day: 'numeric' }),
        sys,
        dia,
        rawDate: new Date(log.date)
      };
    })
    .filter((point): point is { date: string, sys: number, dia: number, rawDate: Date } => point !== null);

  // Fallback to initial value if we don't have enough points
  const finalWeightPoints = weightPoints.length === 0 && initialWeight
    ? [{ date: "Init", value: initialWeight, rawDate: new Date() }]
    : weightPoints;

  // --- RENDERING SVG WEIGHT CHART ---
  const renderWeightChart = () => {
    if (finalWeightPoints.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-3xl border border-white/5 text-center min-h-[220px]">
          <Activity className="text-blue-400 mb-3 animate-pulse" size={28} />
          <p className="text-xs text-gray-400 italic max-w-sm">{t.no_data}</p>
        </div>
      );
    }

    const width = 500;
    const height = 180;
    const padding = 35;

    // Dimensions for drawing
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const values = finalWeightPoints.map(p => p.value);
    const minVal = Math.min(...values, initialWeight - 2) - 1;
    const maxVal = Math.max(...values, initialWeight + 10) + 1;
    const valRange = maxVal - minVal || 1;

    // Helper to map values to coordinates
    const getX = (index: number) => {
      if (finalWeightPoints.length <= 1) return padding + chartWidth / 2;
      return padding + (index / (finalWeightPoints.length - 1)) * chartWidth;
    };

    const getY = (value: number) => {
      return padding + chartHeight - ((value - minVal) / valRange) * chartHeight;
    };

    // Build the SVG path
    let linePath = "";
    let areaPath = "";

    if (finalWeightPoints.length > 0) {
      linePath = `M ${getX(0)} ${getY(finalWeightPoints[0].value)}`;
      areaPath = `M ${getX(0)} ${getY(minVal)} L ${getX(0)} ${getY(finalWeightPoints[0].value)}`;

      for (let i = 1; i < finalWeightPoints.length; i++) {
        const x = getX(i);
        const y = getY(finalWeightPoints[i].value);
        linePath += ` L ${x} ${y}`;
        areaPath += ` L ${x} ${y}`;
      }
      areaPath += ` L ${getX(finalWeightPoints.length - 1)} ${getY(minVal)} Z`;
    }

    return (
      <div className="bg-white/10/20 p-6 rounded-[2.5rem] border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-blue-500/10 text-blue-400 rounded-lg flex items-center justify-center">
              <Activity size={16} />
            </div>
            <h4 className="text-xs font-black uppercase text-white tracking-widest">{t.weight_history}</h4>
          </div>
          {finalWeightPoints.length > 0 && (
            <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-3 py-1 rounded-full">
              +{Math.max(0, Number((finalWeightPoints[finalWeightPoints.length - 1].value - initialWeight).toFixed(1)))} {t.weight_unit}
            </span>
          )}
        </div>

        <div className="relative w-full aspect-[5/2.2] md:aspect-[5/1.8]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full text-gray-500 overflow-visible">
            {/* Grid lines and labels */}
            {[0, 0.5, 1].map((ratio, idx) => {
              const val = minVal + ratio * valRange;
              const y = getY(val);
              return (
                <g key={idx}>
                  <line 
                    x1={padding} 
                    y1={y} 
                    x2={width - padding} 
                    y2={y} 
                    className="stroke-white/5 stroke-1" 
                    strokeDasharray="4 4"
                  />
                  <text 
                    x={padding - 8} 
                    y={y + 4} 
                    textAnchor="end" 
                    className="fill-gray-500 text-[10px] font-mono"
                  >
                    {Math.round(val)}{t.weight_unit}
                  </text>
                </g>
              );
            })}

            {/* Area gradient path */}
            {finalWeightPoints.length > 1 && (
              <path 
                d={areaPath} 
                fill="url(#weightGradient)" 
                className="opacity-50"
              />
            )}

            {/* Curve line */}
            {finalWeightPoints.length > 0 && (
              <path 
                d={linePath || `M ${padding + chartWidth / 2} ${getY(finalWeightPoints[0].value)}`} 
                className="stroke-blue-400 stroke-3 fill-none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Individual Data Points */}
            {finalWeightPoints.map((p, idx) => (
              <g key={idx}>
                <circle 
                  cx={getX(idx)} 
                  cy={getY(p.value)} 
                  r="6" 
                  className="fill-black stroke-blue-400 stroke-3"
                />
                {/* Tooltip on top of the last point */}
                {idx === finalWeightPoints.length - 1 && (
                  <g>
                    <rect 
                      x={getX(idx) - 24} 
                      y={getY(p.value) - 28} 
                      width="48" 
                      height="18" 
                      rx="6" 
                      className="fill-blue-500 shadow-xl"
                    />
                    <text 
                      x={getX(idx)} 
                      y={getY(p.value) - 16} 
                      textAnchor="middle" 
                      className="fill-black text-[9px] font-black"
                    >
                      {p.value}kg
                    </text>
                  </g>
                )}
                {/* Dates representation */}
                <text 
                  x={getX(idx)} 
                  y={height - padding + 16} 
                  textAnchor="middle" 
                  className="fill-gray-500 text-[9px] font-bold uppercase tracking-wider"
                >
                  {p.date}
                </text>
              </g>
            ))}

            {/* Gradients definitions */}
            <defs>
              <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#60A5FA" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#60A5FA" stopOpacity="0.0" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      </div>
    );
  };

  // --- RENDERING SVG BP CHART ---
  const renderBPChart = () => {
    if (bpPoints.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center p-8 bg-white/5 rounded-3xl border border-white/5 text-center min-h-[220px]">
          <Heart className="text-red-400 mb-3 animate-pulse" size={28} />
          <p className="text-xs text-gray-400 italic max-w-sm">{t.no_data}</p>
        </div>
      );
    }

    const width = 500;
    const height = 180;
    const padding = 35;

    // Dimensions for drawing
    const chartWidth = width - padding * 2;
    const chartHeight = height - padding * 2;

    const allSys = bpPoints.map(p => p.sys);
    const allDia = bpPoints.map(p => p.dia);
    const minVal = 50; // default lower boundary standard (diastolic)
    const maxVal = Math.max(...allSys, 150); // upper boundary (systolic & preeclampsia alert)
    const valRange = maxVal - minVal || 1;

    // Helper to map values to coordinates
    const getX = (index: number) => {
      if (bpPoints.length <= 1) return padding + chartWidth / 2;
      return padding + (index / (bpPoints.length - 1)) * chartWidth;
    };

    const getY = (value: number) => {
      return padding + chartHeight - ((value - minVal) / valRange) * chartHeight;
    };

    // Paths
    let sysPath = "";
    let diaPath = "";

    if (bpPoints.length > 0) {
      sysPath = `M ${getX(0)} ${getY(bpPoints[0].sys)}`;
      diaPath = `M ${getX(0)} ${getY(bpPoints[0].dia)}`;

      for (let i = 1; i < bpPoints.length; i++) {
        sysPath += ` L ${getX(i)} ${getY(bpPoints[i].sys)}`;
        diaPath += ` L ${getX(i)} ${getY(bpPoints[i].dia)}`;
      }
    }

    // Determine latest status
    const latestSys = bpPoints[bpPoints.length - 1].sys;
    const latestDia = bpPoints[bpPoints.length - 1].dia;
    const isHigh = latestSys >= 140 || latestDia >= 90;

    return (
      <div className="bg-white/10/20 p-6 rounded-[2.5rem] border border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-red-500/10 text-red-400 rounded-lg flex items-center justify-center">
              <Heart size={16} />
            </div>
            <h4 className="text-xs font-black uppercase text-white tracking-widest">{t.bp_history}</h4>
          </div>
          <span className={`text-[10px] font-black uppercase px-3 py-1 rounded-full ${isHigh ? 'bg-red-500/15 text-red-400 border border-red-500/20' : 'bg-green-500/15 text-green-400 border border-green-500/20'}`}>
            {latestSys}/{latestDia} {t.bp_unit}
          </span>
        </div>

        {isHigh && (
          <div className="bg-red-500/10 border border-red-500/20 rounded-2xl p-3 flex gap-2 items-center">
            <span className="w-2 h-2 rounded-full bg-red-400 animate-ping shrink-0" />
            <p className="text-[10px] text-red-200 italic font-medium">{t.preeclampsia_warning}</p>
          </div>
        )}

        <div className="relative w-full aspect-[5/2.2] md:aspect-[5/1.8]">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full text-gray-500 overflow-visible">
            {/* Preeclampsia Threshold Line (140 mmHg) */}
            <line 
              x1={padding} 
              y1={getY(140)} 
              x2={width - padding} 
              y2={getY(140)} 
              className="stroke-red-500/40 stroke-1" 
              strokeDasharray="2 2"
            />
            <text 
              x={width - padding - 4} 
              y={getY(140) - 4} 
              textAnchor="end" 
              className="fill-red-400/60 text-[8px] font-black uppercase tracking-wider"
            >
              OMS Alert (140)
            </text>

            {/* Grid lines and labels */}
            {[50, 90, 120, 150].map((val, idx) => {
              const y = getY(val);
              return (
                <g key={idx}>
                  <line 
                    x1={padding} 
                    y1={y} 
                    x2={width - padding} 
                    y2={y} 
                    className="stroke-white/5 stroke-1" 
                    strokeDasharray="4 4"
                  />
                  <text 
                    x={padding - 8} 
                    y={y + 4} 
                    textAnchor="end" 
                    className="fill-gray-500 text-[10px] font-mono"
                  >
                    {val}
                  </text>
                </g>
              );
            })}

            {/* Sys Curve line */}
            {bpPoints.length > 0 && (
              <path 
                d={sysPath} 
                className="stroke-red-400 stroke-3 fill-none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Dia Curve line */}
            {bpPoints.length > 0 && (
              <path 
                d={diaPath} 
                className="stroke-orange-400 stroke-3 fill-none"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            )}

            {/* Sys / Dia Data Points */}
            {bpPoints.map((p, idx) => {
              const isPtHigh = p.sys >= 140 || p.dia >= 90;
              return (
                <g key={idx}>
                  {/* Systolic dot */}
                  <circle 
                    cx={getX(idx)} 
                    cy={getY(p.sys)} 
                    r="5" 
                    className={`fill-black stroke-3 ${isPtHigh ? 'stroke-red-500 animate-pulse' : 'stroke-red-400'}`}
                  />
                  {/* Diastolic dot */}
                  <circle 
                    cx={getX(idx)} 
                    cy={getY(p.dia)} 
                    r="5" 
                    className={`fill-black stroke-3 ${isPtHigh ? 'stroke-red-500 animate-pulse' : 'stroke-orange-400'}`}
                  />

                  {/* Date representation */}
                  <text 
                    x={getX(idx)} 
                    y={height - padding + 16} 
                    textAnchor="middle" 
                    className="fill-gray-500 text-[9px] font-bold uppercase tracking-wider"
                  >
                    {p.date}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex gap-4 items-center justify-center text-[10px] font-black uppercase text-gray-400 tracking-wider">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-red-400" />
            <span>{t.systolic}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400" />
            <span>{t.diastolic}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6 w-full">
      <div className="flex items-center gap-3 border-b border-white/5 pb-4">
        <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary">
          <TrendingUp size={20} />
        </div>
        <div>
          <h3 className="text-sm font-black uppercase text-white tracking-widest">{t.history_title}</h3>
          <p className="text-[10px] text-gray-500 italic uppercase">Uzazi Salama Clinical Insights Dashboard</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {renderWeightChart()}
        {renderBPChart()}
      </div>
    </div>
  );
}
