import { useState, useEffect } from 'react';
import { Clock, Play, Square, History, AlertCircle, RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language } from '../types';

interface Contraction {
  id: string;
  start: Date;
  end?: Date;
  duration?: number; // in seconds
  interval?: number; // in minutes since previous contraction started
}

const localTranslations = {
  FR: {
    contractions: "Compteur d'Uchungu / Contractions",
    start_contraction: "Démarrer Contraction",
    stop_contraction: "Terminer Contraction",
    active_contraction: "Contraction en cours...",
    duration: "Durée",
    interval: "Intervalle",
    sec: "sec",
    min: "min",
    average_duration: "Durée moyenne",
    average_interval: "Fréquence moyenne",
    no_records: "Aucune contraction enregistrée.",
    recent_title: "Historique (Dernières 24h)",
    rule_alert_title: "Alerte de Travail Actif (OMS)",
    rule_511_active: "TRAVAIL ACTIF DÉTECTÉ (Règle 5-1-1) : S'il vous plaît, rendez-vous immédiatement dans votre centre médical !",
    rule_normal: "Contractions irrégulières. Reposez-vous, buvez de l'eau et surveillez la fréquence.",
    clear_history: "Effacer",
    how_it_works: "Règle 5-1-1 : Contractions toutes les 5 minutes, d'environ 1 minute, depuis au moins 1 heure.",
    back: "Retour",
    last_contraction: "Dernière",
  },
  SW: {
    contractions: "Hesabu Uchungu (Contractions)",
    start_contraction: "Anzisha Uchungu",
    stop_contraction: "Maliza Uchungu",
    active_contraction: "Uchungu unaendelea...",
    duration: "Muda",
    interval: "Nafasi",
    sec: "sek",
    min: "dak",
    average_duration: "Muda wa wastani",
    average_interval: "Nafasi ya wastani",
    no_records: "Hakuna uchungu uliorekodiwa.",
    recent_title: "Historia (Saa 24 zilizopita)",
    rule_alert_title: "Tahadhari ya Kujifungua (OMS)",
    rule_511_active: "UCHUNGU WA MAANDALIZI TAYARI (Régle 5-1-1) : Tafadhali nenda haraka kwenye kituo chako cha afya !",
    rule_normal: "Uchungu wa kawaida na usio thabiti bado. Pumzika, kunywa maji na uendelee kuangalia na kurekodi.",
    clear_history: "Futa zote",
    how_it_works: "Sheria ya 5-1-1: Uchungu kila kisha dakika 5, unaoendelea kwa sekunde 60 (dakika 1), kwa muda wa saa 1.",
    back: "Rudi",
    last_contraction: "Ya mwisho",
  },
  MSH: {
    contractions: "Okukulikiriza Okulumwa (Contractions)",
    start_contraction: "Otangise Okulumwa",
    stop_contraction: "Oyimange Okulumwa",
    active_contraction: "Okulumwa kuli kugenda...",
    duration: "Muda",
    interval: "Omwanya",
    sec: "sek",
    min: "dak",
    average_duration: "Muda wa wastani",
    average_interval: "Omwanya gwa wastani",
    no_records: "Nta kulumwa kwasimbwa buno.",
    recent_title: "Historia l'Okulumwa",
    rule_alert_title: "Okukulikiriza l'Okulumwa (OMS)",
    rule_511_active: "OKULUMWA KWABA KWENENE (Règle 5-1-1) : Endela hano-hano emulasho wawe ohone amagala yawe n'omwana !",
    rule_normal: "Okulumwa kuli k’olugendo erhali kuli kuduga bwinji. Ohumule, onywe amishi na ulingirire.",
    clear_history: "Okufisa",
    how_it_works: "Kanuni ya 5-1-1: Okulumwa kuli kuduga kuli kisha dakika 5, mu muda gwa sekunde 60, mmuhugo gwa saa nshiba.",
    back: "Rudi",
    last_contraction: "Cindi gasi",
  }
};

export default function ContractionTracker({ language, onClose }: { language: Language, onClose?: () => void }) {
  const t = localTranslations[language as keyof typeof localTranslations] || localTranslations.FR;
  
  const [contractions, setContractions] = useState<Contraction[]>(() => {
    const saved = localStorage.getItem('uzazi_contractions');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Convert ISO string back to Date
        return parsed.map((c: any) => ({
          ...c,
          start: new Date(c.start),
          end: c.end ? new Date(c.end) : undefined
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  const [isActive, setIsActive] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [liveSeconds, setLiveSeconds] = useState(0);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('uzazi_contractions', JSON.stringify(contractions));
  }, [contractions]);

  // Live timer for active contraction
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isActive && startTime) {
      interval = setInterval(() => {
        const diff = Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
        setLiveSeconds(diff);
      }, 1000);
    } else {
      setLiveSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isActive, startTime]);

  const handleStart = () => {
    const now = new Date();
    setIsActive(true);
    setStartTime(now);
  };

  const handleStop = () => {
    if (!startTime) return;
    const now = new Date();
    const duration = Math.max(1, Math.floor((now.getTime() - startTime.getTime()) / 1000));
    
    // Calculate interval since START of previous contraction
    let interval: number | undefined;
    if (contractions.length > 0) {
      const prev = contractions[0]; // first item is newest in our array
      const diffMs = startTime.getTime() - prev.start.getTime();
      interval = Math.max(0.1, Number((diffMs / 60000).toFixed(1)));
    }

    const newContraction: Contraction = {
      id: Math.random().toString(36).substring(2, 9),
      start: startTime,
      end: now,
      duration,
      interval
    };

    setContractions(prev => [newContraction, ...prev]);
    setIsActive(false);
    setStartTime(null);
  };

  const handleClear = () => {
    if (window.confirm(language === 'SW' ? 'Je, una uhakika wa kufuta?' : 'Effacer tout l\'historique ?')) {
      setContractions([]);
    }
  };

  // Compute metrics
  const validContractions = contractions.filter(c => c.duration !== undefined);
  const avgDuration = validContractions.length > 0
    ? Math.round(validContractions.reduce((sum, c) => sum + (c.duration || 0), 0) / validContractions.length)
    : 0;
  
  const intervalContractions = validContractions.filter(c => c.interval !== undefined);
  const avgInterval = intervalContractions.length > 0
    ? Number((intervalContractions.reduce((sum, c) => sum + (c.interval || 0), 0) / intervalContractions.length).toFixed(1))
    : 0;

  // Analyze active labor: rule 5-1-1
  // - Contractions every 5 minutes (approx 3-6 mins interval)
  // - Lasting 1 minute (approx >= 45-60 seconds)
  // - For at least 1 hour (requires at least 3 contractions in recent history with this pattern)
  const isRule511Met = () => {
    if (validContractions.length < 3) return false;
    
    // Take the 3 latest contractions
    const recent = validContractions.slice(0, 3);
    
    const badDuration = recent.some(c => (c.duration || 0) < 40); // must be around 45-60s
    if (badDuration) return false;

    const badInterval = recent.some(c => {
      if (c.interval === undefined) return false;
      return c.interval > 6 || c.interval < 3; // must be spaced 3 to 6 mins
    });
    if (badInterval) return false;

    return true;
  };

  const activeLabor = isRule511Met();

  return (
    <div className="bg-black/90 p-8 rounded-[3rem] border border-white/10 w-full max-w-xl mx-auto text-white shadow-2xl relative overflow-hidden backdrop-blur-xl">
      {/* Decorative ambient background */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full filter blur-[60px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-brand-primary/10 rounded-full filter blur-[60px] pointer-events-none" />

      <div className="flex items-center justify-between border-b border-white/5 pb-4 mb-6 relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-purple-500/20 rounded-xl flex items-center justify-center text-purple-400">
            <Clock size={20} className={isActive ? 'animate-spin' : ''} />
          </div>
          <div>
            <h3 className="text-md font-black uppercase tracking-wider">{t.contractions}</h3>
            <p className="text-[10px] text-gray-400 italic">{t.how_it_works}</p>
          </div>
        </div>
        {onClose && (
          <button 
            onClick={onClose}
            className="text-[10px] font-black uppercase bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-gray-400"
          >
            {t.back}
          </button>
        )}
      </div>

      <div className="flex flex-col items-center justify-center py-6 relative z-10">
        {/* Pulse Circle Animation when active */}
        <div className="relative w-44 h-44 flex items-center justify-center">
          <AnimatePresence>
            {isActive && (
              <>
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0.5 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 2, ease: "easeOut" }}
                  className="absolute inset-0 bg-purple-500/20 rounded-full"
                />
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0.8 }}
                  animate={{ scale: 1.25, opacity: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ repeat: Infinity, duration: 1.5, ease: "easeOut", delay: 0.5 }}
                  className="absolute inset-0 bg-brand-primary/20 rounded-full"
                />
              </>
            )}
          </AnimatePresence>

          <div className={`w-36 h-36 rounded-full flex flex-col items-center justify-center text-center shadow-2xl border transition-all duration-500 ${isActive ? 'bg-purple-600 border-purple-400 text-white scale-110' : 'bg-white/5 border-white/10 text-brand-primary'}`}>
            {isActive ? (
              <>
                <span className="text-[10px] font-black tracking-widest uppercase opacity-75">{t.active_contraction}</span>
                <span className="text-4xl font-display font-black my-1">{liveSeconds}s</span>
              </>
            ) : (
              <>
                <span className="text-[10px] font-black tracking-widest uppercase opacity-60">Prêt</span>
                <span className="text-2xl font-black text-white">{contractions.length}</span>
                <span className="text-[8px] font-black uppercase opacity-60 tracking-wider">contractions</span>
              </>
            )}
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 flex justify-center w-full">
          {!isActive ? (
            <button 
              onClick={handleStart}
              className="px-8 py-4 bg-brand-primary text-gray-900 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
            >
              <Play size={14} fill="currentColor" /> {t.start_contraction}
            </button>
          ) : (
            <button 
              onClick={handleStop}
              className="px-8 py-4 bg-red-400 text-gray-900 rounded-full font-black text-xs uppercase tracking-widest hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center gap-2"
            >
              <Square size={14} fill="currentColor" /> {t.stop_contraction}
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      {validContractions.length > 0 && (
        <div className="grid grid-cols-2 gap-4 my-6 bg-white/5 p-4 rounded-2xl relative z-10 border border-white/5">
          <div className="text-center">
            <span className="text-[8px] font-black uppercase text-gray-400 tracking-wider block mb-1">{t.average_duration}</span>
            <span className="text-xl font-black text-brand-primary">{avgDuration} {t.sec}</span>
          </div>
          <div className="text-center border-l border-white/10">
            <span className="text-[8px] font-black uppercase text-gray-400 tracking-wider block mb-1">{t.average_interval}</span>
            <span className="text-xl font-black text-purple-400">{avgInterval > 0 ? `${avgInterval} ${t.min}` : '—'}</span>
          </div>
        </div>
      )}

      {/* Warning recommendation box based on symptoms */}
      {validContractions.length >= 3 && (
        <div className={`p-4 rounded-2xl flex gap-3 relative z-10 border items-start ${activeLabor ? 'bg-red-500/10 border-red-500/30' : 'bg-blue-500/5 border-blue-500/10'}`}>
          <AlertCircle className={activeLabor ? 'text-red-400 shrink-0 mt-0.5' : 'text-blue-400 shrink-0 mt-0.5'} size={18} />
          <div>
            <h4 className={`text-[10px] font-black uppercase tracking-wider ${activeLabor ? 'text-red-400' : 'text-blue-400'}`}>
              {t.rule_alert_title}
            </h4>
            <p className="text-[10px] text-gray-300 leading-snug mt-1 italic">
              {activeLabor ? t.rule_511_active : t.rule_normal}
            </p>
          </div>
        </div>
      )}

      {/* History List */}
      <div className="mt-8 relative z-10">
        <div className="flex items-center justify-between border-b border-white/5 pb-2 mb-3">
          <span className="text-[9px] font-black uppercase text-gray-400 tracking-widest flex items-center gap-1.5">
            <History size={12} /> {t.recent_title}
          </span>
          {contractions.length > 0 && (
            <button 
              onClick={handleClear}
              className="text-[9px] font-black uppercase text-red-400/70 hover:text-red-400 flex items-center gap-1 bg-red-400/5 px-2 py-1 rounded"
            >
              <RefreshCw size={10} /> {t.clear_history}
            </button>
          )}
        </div>

        {contractions.length === 0 ? (
          <p className="text-[10px] text-gray-500 italic text-center py-4">{t.no_records}</p>
        ) : (
          <div className="max-h-36 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-white/10">
            {contractions.slice(0, 5).map((c, idx) => (
              <div 
                key={c.id}
                className="bg-white/5 p-3 rounded-xl flex items-center justify-between text-xs hover:bg-white/10 transition-colors border border-white/5"
              >
                <div className="flex flex-col">
                  <span className="text-[8px] uppercase font-black text-gray-400">{t.last_contraction} #{idx + 1}</span>
                  <span className="text-[10px] font-medium text-gray-300">
                    {c.start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-black">
                  <div className="flex flex-col items-end">
                    <span className="text-[8px] uppercase font-black text-gray-400">{t.duration}</span>
                    <span className="text-brand-primary">{c.duration}s</span>
                  </div>
                  {c.interval !== undefined && (
                    <div className="flex flex-col items-end">
                      <span className="text-[8px] uppercase font-black text-gray-400">{t.interval}</span>
                      <span className="text-purple-400">{c.interval}m</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
