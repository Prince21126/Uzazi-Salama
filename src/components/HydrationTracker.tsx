import { useState, useEffect } from 'react';
import { GlassWater, Plus, Minus, Info, Award, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Language, Patient } from '../types';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';

interface HydrationTrackerProps {
  patient: Patient;
  language: Language;
  onUpdatePatient: (updated: Patient) => void;
}

const hydrationTranslations = {
  FR: {
    title: "Suivi d'Hydratation",
    goal: "Objectif quotidien",
    drank: "Consommé aujourd'hui",
    remaining: "Restant",
    add: "Ajouter de l'eau",
    presets: "Raccourcis",
    glass: "1 Verre (250 ml)",
    bottle: "1 Gourde (500 ml)",
    custom: "Ajouter personnalisé",
    who_rec: "L'OMS recommande au moins 2,5 à 3 litres de liquide par jour durant la grossesse pour assurer un volume de liquide amniotique optimal, favoriser le transit et prévenir les infections urinaires.",
    tip_0: "Commencez à boire de l'eau dès maintenant !",
    tip_1: "Bon début, continuez comme ça !",
    tip_2: "Presque atteint, encore un peu d'effort !",
    tip_3: "Objectif atteint ! Excellente hydratation.",
    undo: "Annuler",
    reset: "Réinitialiser",
    ml: "ml",
    liters: "L",
    history: "Vue d'ensemble",
    percentage: "Atteint",
    celebration: "Félicitations, maman ! Hydratation parfaite."
  },
  SW: {
    title: "Ufuatiliaji wa Maji",
    goal: "Malengo ya siku",
    drank: "Yaliyokunywa leo",
    remaining: "Yaliyobaki",
    add: "Ongeza maji",
    presets: "Njia za haraka",
    glass: "Kikombe 1 (250 ml)",
    bottle: "Chupa 1 (500 ml)",
    custom: "Ongeza kiasi chako",
    who_rec: "OMS inapendekeza angalau lita 2.5 hadi 3 za maji kila siku wakati wa ujauzito ili kulinda kiwango cha maji ya uzazi, kuzuia shida ya choo na kuzuia maambukizi ya mfumo wa mkojo.",
    tip_0: "Anza kunywa maji sasa hivi !",
    tip_1: "Mwanzo mzuri, endelea kabisa !",
    tip_2: "Karibu ufikie lengo, bado kidogo tu !",
    tip_3: "Umetimiza lengo ! Umekunywa maji ya kutosha leo.",
    undo: "Rudi nyuma",
    reset: "Anza upya",
    ml: "ml",
    liters: "L",
    history: "Muhtasari wa afya",
    percentage: "Imetimizwa",
    celebration: "Hongera sana maza! Maji kamili mwilini."
  },
  MSH: {
    title: "Okukulikiriza Amishi",
    goal: "Lufutu l'enjiku",
    drank: "Amishi manyirwe lelo",
    remaining: "Agasigire",
    add: "Oyongere amishi",
    presets: "Mishingo miyangu",
    glass: "Kizibo 1 (250 ml)",
    bottle: "Icupa 1 (500 ml)",
    custom: "Oyongere bwinji bwawe",
    who_rec: "OMS erhahazi okunywa amishi lita zibili na nusu (2.5) buli njiku lyo amagala na mishi m’obuliri b’omwana gabe masalala bwinji banji.",
    tip_0: "Oyeberere okunywa amishi buno buno !",
    tip_1: "Okuzibuha kwinja, ogendeleze bwo !",
    tip_2: "Ohigire ku lufutu lukulu lwewu !",
    tip_3: "Olufutu oluyerekeza ! Amishi mali manji bwo lelo.",
    undo: "Ocigaluke",
    reset: "Okufisa hosi",
    ml: "ml",
    liters: "L",
    history: "Amacungule",
    percentage: "Karibu",
    celebration: "Okuzibuha mpa mace! Amishi masalala."
  }
};

export default function HydrationTracker({ patient, language, onUpdatePatient }: HydrationTrackerProps) {
  const t = hydrationTranslations[language as keyof typeof hydrationTranslations] || hydrationTranslations.FR;

  const currentGoal = patient.waterGoal || 2500; // default 2.5 liters
  const currentDate = new Date().toISOString().split('T')[0]; // local ISO-like YYYY-MM-DD
  
  // Local state initialized carefully from patient properties, with a reset guard for date change
  const [sessionIntake, setSessionIntake] = useState(() => {
    if (patient.waterTodayDate === currentDate) {
      return patient.waterIntakeToday || 0;
    }
    return 0; // reset on new day
  });

  const [history, setHistory] = useState<number[]>([]); // record individual steps for Undo capability

  // Detect day changes in parent synced state
  useEffect(() => {
    if (patient.waterTodayDate !== currentDate) {
      // Direct reset trigger
      updateDatabaseIntake(0, currentGoal, currentDate);
    } else {
      setSessionIntake(patient.waterIntakeToday || 0);
    }
  }, [patient.waterTodayDate, patient.waterIntakeToday]);

  const updateDatabaseIntake = async (newIntake: number, goal: number, dateStr: string) => {
    const safeIntake = Math.max(0, newIntake);
    
    // Optimistic UI state update
    const updatedPatient: Patient = {
      ...patient,
      waterIntakeToday: safeIntake,
      waterGoal: goal,
      waterTodayDate: dateStr
    };
    onUpdatePatient(updatedPatient);
    setSessionIntake(safeIntake);

    try {
      // Sync strictly into Firestore
      await updateDoc(doc(db, 'users', patient.id), {
        waterIntakeToday: safeIntake,
        waterGoal: goal,
        waterTodayDate: dateStr,
        updatedAt: new Date()
      });
    } catch (error) {
      console.error("Hydration sync error:", error);
    }
  };

  const addWater = (amount: number) => {
    setHistory(prev => [...prev, sessionIntake]);
    const finalVal = sessionIntake + amount;
    updateDatabaseIntake(finalVal, currentGoal, currentDate);
  };

  const handleUndo = () => {
    if (history.length === 0) return;
    const lastVal = history[history.length - 1];
    setHistory(prev => prev.slice(0, -1));
    updateDatabaseIntake(lastVal, currentGoal, currentDate);
  };

  const handleReset = () => {
    if (window.confirm(language === 'SW' ? 'Je, una uhakika wa kufuta mchango wa leo?' : 'Réinitialiser votre suivi de boissons pour aujourd\'hui ?')) {
      setHistory(prev => [...prev, sessionIntake]);
      updateDatabaseIntake(0, currentGoal, currentDate);
    }
  };

  // Quick helper to increase or decrease goal
  const adjustGoal = (amount: number) => {
    const newGoal = Math.max(1500, Math.min(5000, currentGoal + amount));
    updateDatabaseIntake(sessionIntake, newGoal, currentDate);
  };

  const percentage = Math.min(100, Math.round((sessionIntake / currentGoal) * 100));
  const remainingValue = Math.max(0, currentGoal - sessionIntake);

  // Pick suitable visual tip
  const getProgressTip = () => {
    if (percentage === 0) return t.tip_0;
    if (percentage < 55) return t.tip_1;
    if (percentage < 100) return t.tip_2;
    return t.celebration;
  };

  // Render visual glasses row up to 10 glasses (based on goal divided into 250ml steps)
  const totalGlassesGoal = Math.ceil(currentGoal / 250);
  const currentGlassesDrank = Math.round(sessionIntake / 250);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-6 text-white border border-white/5 shadow-2xl relative overflow-hidden"
    >
      {/* Decorative radial lighting representing water fluid */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-sky-500/5 rounded-full blur-[80px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-36 h-36 bg-blue-500/5 rounded-full blur-[60px] pointer-events-none" />

      {/* Main Hydration Card Header */}
      <div className="flex items-start justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-sky-500/10 text-sky-400 rounded-2xl flex items-center justify-center">
            <GlassWater size={22} className={sessionIntake > 0 ? 'animate-bounce' : ''} />
          </div>
          <div>
            <h3 className="text-sm font-black uppercase tracking-wider text-white border-none">{t.title}</h3>
            <p className="text-[10px] text-sky-400/80 font-black tracking-widest">{currentDate}</p>
          </div>
        </div>
        
        {/* Undo & Reset actions */}
        <div className="flex gap-2">
          {history.length > 0 && (
            <button 
              onClick={handleUndo} 
              className="text-[9px] font-black uppercase bg-white/5 border border-white/5 hover:bg-white/10 text-gray-400 py-1.5 px-3 rounded-xl transition-all"
            >
              {t.undo}
            </button>
          )}
          {sessionIntake > 0 && (
            <button 
              onClick={handleReset} 
              className="text-[9px] font-black uppercase bg-red-500/10 hover:bg-red-500/20 text-red-400 py-1.5 px-3 rounded-xl transition-all"
            >
              <RefreshCw size={10} className="inline mr-1" /> {t.reset}
            </button>
          )}
        </div>
      </div>

      {/* Layout Grid: Visual Indicator Wave Container & Numerical details */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center relative z-10">
        
        {/* Fluid wave visual circle box */}
        <div className="md:col-span-5 flex flex-col items-center justify-center">
          <div className="w-36 h-36 rounded-full bg-white/5 border border-white/10 relative overflow-hidden flex items-center justify-center shadow-inner">
            
            {/* Dynamic Water wave fill visual using simple absolute elevation */}
            <motion.div 
              className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-sky-600 to-sky-400 opacity-80"
              style={{ originY: 1 }}
              initial={{ height: "0%" }}
              animate={{ height: `${percentage}%` }}
              transition={{ duration: 1, ease: "easeInOut" }}
            >
              {/* Overlay dynamic light reflections / details */}
              <div className="absolute top-0 inset-x-0 h-1 bg-white/30 filter blur-[1px] animate-pulse" />
            </motion.div>

            {/* Absolute Numeric values centered over Wave */}
            <div className="relative z-10 flex flex-col items-center justify-center text-center">
              <span className={`text-[9px] uppercase font-bold tracking-widest ${percentage > 50 ? 'text-gray-900/80' : 'text-gray-400'}`}>
                {t.percentage}
              </span>
              <span className={`text-4xl font-display font-black leading-none my-1 ${percentage > 50 ? 'text-gray-900' : 'text-white'}`}>
                {percentage}%
              </span>
              <span className={`text-[9px] font-black uppercase tracking-wider ${percentage > 50 ? 'text-gray-900/60' : 'text-sky-400'}`}>
                {sessionIntake} {t.ml}
              </span>
            </div>
          </div>
        </div>

        {/* Detailed stats columns */}
        <div className="md:col-span-7 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            
            {/* Drank info panel */}
            <div className="bg-white/5 border border-white/5 p-4 rounded-3xl">
              <p className="text-[9px] font-black uppercase opacity-55 tracking-wider">{t.drank}</p>
              <p className="text-xl font-black mt-1 text-white">
                {(sessionIntake / 1000).toFixed(2)} <span className="text-[10px] font-black uppercase text-sky-400">{t.liters}</span>
              </p>
            </div>

            {/* Remaining info panel */}
            <div className="bg-white/5 border border-white/5 p-4 rounded-3xl">
              <p className="text-[9px] font-black uppercase opacity-55 tracking-wider">{t.remaining}</p>
              <p className="text-xl font-black mt-1 text-gray-300">
                {(remainingValue / 1000).toFixed(2)} <span className="text-[10px] font-black uppercase opacity-50">{t.liters}</span>
              </p>
            </div>
          </div>

          {/* Setup / Adjust water daily goal dynamically */}
          <div className="bg-white/5 border border-white/5 p-3 rounded-2xl flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-[8px] font-black uppercase opacity-45 tracking-wider">{t.goal}</span>
              <span className="text-xs font-black text-white">{(currentGoal / 1000).toFixed(1)} Litres</span>
            </div>
            <div className="flex gap-1.5">
              <button 
                onClick={() => adjustGoal(-250)} 
                className="w-7 h-7 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 hover:text-white text-gray-400 transition"
              >
                <Minus size={12} />
              </button>
              <button 
                onClick={() => adjustGoal(250)} 
                className="w-7 h-7 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center hover:bg-white/10 hover:text-sky-400 text-gray-400 transition"
              >
                <Plus size={12} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Motivational progress tip & celebration marker */}
      <div className="mt-6 flex gap-3 p-4 rounded-3xl bg-sky-500/5 border border-sky-500/10 items-start relative z-10">
        {percentage >= 100 ? (
          <Award className="text-amber-400 shrink-0 mt-0.5 animate-bounce" size={18} />
        ) : (
          <Info className="text-sky-400 shrink-0 mt-0.5" size={18} />
        )}
        <div className="space-y-0.5">
          <p className="text-[8px] font-black uppercase text-sky-400 tracking-[0.2em]">Uzazi Hydration Assistant</p>
          <p className="text-[10px] text-gray-200 font-medium leading-relaxed italic">
            {getProgressTip()}
          </p>
        </div>
      </div>

      {/* Grid of click-to-drink additions */}
      <div className="mt-6 space-y-3 relative z-10">
        <p className="text-[9px] font-black uppercase opacity-40 tracking-widest pl-1">{t.presets}</p>
        <div className="grid grid-cols-2 gap-3">
          <button 
            onClick={() => addWater(250)}
            className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/5 hover:bg-sky-500/15 hover:border-sky-500/10 text-xs font-black text-white hover:text-sky-400 rounded-2xl transition"
          >
            <span>{t.glass}</span>
            <Plus size={12} />
          </button>
          
          <button 
            onClick={() => addWater(500)}
            className="flex items-center justify-between px-4 py-3 bg-white/5 border border-white/5 hover:bg-sky-500/15 hover:border-sky-500/10 text-xs font-black text-white hover:text-sky-400 rounded-2xl transition"
          >
            <span>{t.bottle}</span>
            <Plus size={12} />
          </button>
        </div>
      </div>

      {/* Visual Glasses row for rich interactive satisfaction */}
      <div className="mt-6 border-t border-white/5 pt-4 flex flex-col items-center justify-center gap-1.5 relative z-10">
        <div className="flex flex-wrap gap-2 items-center justify-center">
          {Array.from({ length: totalGlassesGoal }).map((_, idx) => {
            const isFilled = idx < currentGlassesDrank;
            return (
              <motion.div
                key={idx}
                whileHover={{ scale: 1.1 }}
                onClick={() => {
                  if (isFilled) {
                    // Reduce water by 250
                    setHistory(prev => [...prev, sessionIntake]);
                    updateDatabaseIntake(sessionIntake - 250, currentGoal, currentDate);
                  } else {
                    addWater(250);
                  }
                }}
                className={`w-6 h-6 rounded-lg cursor-pointer flex items-center justify-center transition-all ${
                  isFilled 
                    ? 'bg-sky-500 text-gray-900 border border-sky-400' 
                    : 'bg-white/5 text-gray-600 border border-white/5 hover:border-sky-500/30'
                }`}
              >
                <GlassWater size={12} className={isFilled ? 'animate-pulse' : ''} />
              </motion.div>
            );
          })}
        </div>
        <p className="text-[8px] font-semibold text-gray-500 uppercase tracking-widest">{currentGlassesDrank} / {totalGlassesGoal} verres</p>
      </div>

      {/* WHO / OMS Guidance Expandable / Read Info block */}
      <div className="mt-4 pt-4 border-t border-white/5 relative z-10">
        <p className="text-[8px] font-black uppercase text-gray-500 tracking-wider mb-1">Co-conception OMS / WHO Guidelines</p>
        <p className="text-[9px] text-gray-400 leading-relaxed italic">{t.who_rec}</p>
      </div>
    </motion.div>
  );
}
