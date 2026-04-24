/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Home, 
  Stethoscope, 
  BookOpen, 
  User, 
  Baby, 
  Calendar, 
  AlertCircle, 
  ChevronRight, 
  ArrowLeft,
  ChevronDown,
  Bell,
  Heart,
  Droplets,
  Plus,
  QrCode,
  LogOut,
  MapPin,
  Phone,
  Languages,
  ShieldCheck,
  BrainCircuit,
  Loader2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeCanvas } from 'qrcode.react';
import { Patient, HealthStatus, CheckupLog, Language } from './types';
import { HOSPITALS, EDUCATION_ARTICLES } from './constants';
import { analyzeSymptoms } from './services/aiService';

// --- Translations ---
const translations = {
  FR: {
    home: "Mon Suivi",
    suivi: "Ma santé",
    conseil: "Conseils",
    profil: "Moi",
    welcome: "Bonjour",
    journey: "Ma grossesse",
    weeks: "Semaines",
    remaining: "Encore",
    diagnostic_ia: "Vérifier ma santé",
    analyzing: "L'expert regarde...",
    smart_diag: "Avis de l'expert",
    oms_compliance: "Standard de soins",
    next_rdv: "Prochain RDV",
    local_nutrition: "Force & Manger",
    diagnostic_title: "Mon diagnostic",
    regular_suivi: "Vérifiez votre santé pour protéger bébé.",
    symptoms_mobile: "Signes",
    bp: "Tension",
    weight: "Mon Poids (kg)",
    start_ia: "Valider",
    guide_maternel: "L'école des mamans",
    know_protect: "Apprendre pour protéger bébé.",
    digital_pass: "Ma fiche santé",
    hide_fiche: "Fermer",
    pass_qr: "Ma fiche QR",
    digital_health_pass: "Fiche Santé Numérique",
    scan_info: "À montrer au docteur ou à l'infirmier pour voir votre historique.",
    logout: "Se déconnecter",
    other_symptom: "Autre signe ou message",
    submit_record: "Enregistrer",
    invalid_date: "La date n'est pas bonne. Vérifiez bien.",
    nutrition: "Manger",
    exercise: "Bouger",
    warning_signs: "Alertes",
    baby_growth: "Bébé",
    hygiene: "Propreté",
    mental_health: "Moral",
    trimester: "Trimestre",
    medical_record: "Historique",
    medical_history: "Historique Médical",
    back: "Retour",
    all: "Tout",
    stable: "Stable",
    vigilance: "Vigilance",
    action: "Action",
    all_normal: "Tout semble normal pour votre stade actuel.",
    start_checkup: "Commencez un bilan",
    no_logs: "Aucun bilan enregistré",
    patient_notes: "Notes patiente:"
  },
  SW: {
    home: "Maendeleo",
    suivi: "Afya",
    conseil: "Mafundisho",
    profil: "Mimi",
    welcome: "Habari",
    journey: "Mimba yangu",
    weeks: "Wiki",
    remaining: "Imebaki",
    diagnostic_ia: "Angalia afya",
    analyzing: "Mtaalamu anaangalia...",
    smart_diag: "Ushauri wa mtaalamu",
    oms_compliance: "Kiwango cha afya",
    next_rdv: "Ahadi ijayo",
    local_nutrition: "Nguvu na Chakula",
    diagnostic_title: "Afya yangu",
    regular_suivi: "Angalia afya yako kumlinda mtoto.",
    symptoms_mobile: "Dalili",
    bp: "Presha",
    weight: "Uzito (kg)",
    start_ia: "Kamilisha",
    guide_maternel: "Shule ya mama",
    know_protect: "Jifunze kumlinda mtoto.",
    digital_pass: "Kadi yangu ya afya",
    hide_fiche: "Funga",
    pass_qr: "Kadi yangu ya QR",
    digital_health_pass: "Kadi ya Afya ya Simu",
    scan_info: "Onyesha daktari au nesi namba hii waone historia yako.",
    logout: "Ondoka",
    other_symptom: "Dalili nyingine au maoni",
    submit_record: "Hifadhi",
    invalid_date: "Tarehe siyo sawa. Angalia tena.",
    nutrition: "Chakula",
    exercise: "Mazoezi",
    warning_signs: "Tahadhari",
    baby_growth: "Mtoto",
    hygiene: "Usafi",
    mental_health: "Moyo",
    trimester: "Miezi 3",
    medical_record: "Historia",
    medical_history: "Historia ya Matibabu",
    back: "Rudi",
    all: "Zote",
    stable: "Salama",
    vigilance: "Tahadhari",
    action: "Chukua hatua",
    all_normal: "Kila kitu kinaonekana kuwa sawa.",
    start_checkup: "Anza ukaguzi",
    no_logs: "Hakuna kumbukumbu",
    patient_notes: "Maelezo ya mgonjwa:"
  },
  MSH: {
    home: "Okukulikiriza",
    suivi: "Amagala",
    conseil: "Amagezi",
    profil: "Bwinji",
    welcome: "Oye’be",
    journey: "Olugendo",
    weeks: "Mviki",
    remaining: "Ocizigazize",
    diagnostic_ia: "Ocungule Amagala",
    analyzing: "Mtaalamu aciri kucungula...",
    smart_diag: "Okuhubirira k’Amagezi",
    oms_compliance: "Amarheto",
    next_rdv: "Okuhumana",
    local_nutrition: "Emisi n’Okulya",
    diagnostic_title: "Amagala gane",
    regular_suivi: "Okukulikiriza amagala kuli kunciza obuzine.",
    symptoms_mobile: "Bimanyiso",
    bp: "Emisi y’omwinyu",
    weight: "Obuzito (kg)",
    start_ia: "Kamilisha",
    guide_maternel: "Amagezi g’Abamyere",
    know_protect: "Okumanya kuli kunciza.",
    digital_pass: "Kadi yawe",
    hide_fiche: "Okufisa",
    pass_qr: "QR yawe",
    digital_health_pass: "Faili yawe omu Simu",
    scan_info: "Skena nambari eno lyo baderhe amagala gawe goshi.",
    logout: "Okuloga",
    other_symptom: "Icimanyiso cindi",
    submit_record: "Okuhifi",
    invalid_date: "Tarehe erhali bwo.",
    nutrition: "Okulya",
    exercise: "Okugendera",
    warning_signs: "Okutahaza",
    baby_growth: "Omwana",
    hygiene: "Okuhya",
    mental_health: "Moral",
    trimester: "Miezi isharhu",
    medical_record: "Historia",
    medical_history: "Historia l’Amagala",
    back: "Ocigaluke",
    all: "Zoshi",
    stable: "Amagala masiga",
    vigilance: "Okutahaza",
    action: "Icikorwa",
    all_normal: "Boshi buli bwo omu kasanzi kako.",
    start_checkup: "Oryuse okuchungula",
    no_logs: "Nta nambari hifi",
    patient_notes: "Bishoboza bye muntu:"
  }
};

const getLocalizedSymptoms = (language: Language) => {
  const symptomsDict = {
    FR: {
      fatigue: 'Fatigue intense',
      headache: 'Maux de tête violents',
      vision: 'Vision floue / Étincelles',
      ears: 'Bourdonnements d\'oreilles',
      bleeding: 'Saignements',
      swelling: 'Mains/Visage gonflés',
      fever: 'Fièvre / Frissons',
      no_movement: 'Bébé bouge moins de 10 fois',
      nausea: 'Vomissements excessifs',
      abdominal: 'Douleurs abdominales fortes',
      liquid: 'Pertes de liquide (Eaux)',
      cramps: 'Crampes persistantes',
    },
    SW: {
      fatigue: 'Uchovu mwingi',
      headache: 'Maumivu makali ya kichwa',
      vision: 'Kuona vibwa / Miwako',
      ears: 'Kuvuma masikioni',
      bleeding: 'Kutoka damu',
      swelling: 'Mikono/Uso kuvimba',
      fever: 'Homa / Baridi',
      no_movement: 'Mtoto hachezi mara 10',
      nausea: 'Kutapika sana',
      abdominal: 'Maumivu makali ya tumbo',
      liquid: 'Kutoka majimaji ya uzazi',
      cramps: 'Mkazo mkali wa tumbo',
    },
    MSH: {
      fatigue: 'Okuluha bwinji',
      headache: 'Obushigo b’omurhwi bwinji',
      vision: 'Okubona bwinji',
      ears: 'Okuniga omu mahrwi',
      bleeding: 'Okufuluha danda',
      swelling: 'Emikono n’obushu okufumba',
      fever: 'Omuliro gwinji',
      no_movement: 'Omwana arhazimbaga kashano',
      nausea: 'Okuluka bwinji',
      abdominal: 'Obushigo omu nda bwinji',
      liquid: 'Okuhula maji g’omwana',
      cramps: 'Okuniga omu nda bwinji',
    }
  };
  
  return [
    { id: 'fatigue', label: symptomsDict[language].fatigue, risk: 'warning' },
    { id: 'headache', label: symptomsDict[language].headache, risk: 'critical' },
    { id: 'vision', label: symptomsDict[language].vision, risk: 'critical' },
    { id: 'ears', label: symptomsDict[language].ears, risk: 'warning' },
    { id: 'bleeding', label: symptomsDict[language].bleeding, risk: 'critical' },
    { id: 'swelling', label: symptomsDict[language].swelling, risk: 'critical' },
    { id: 'fever', label: symptomsDict[language].fever, risk: 'critical' },
    { id: 'no_movement', label: symptomsDict[language].no_movement, risk: 'critical' },
    { id: 'nausea', label: symptomsDict[language].nausea, risk: 'warning' },
    { id: 'abdominal', label: symptomsDict[language].abdominal, risk: 'critical' },
    { id: 'liquid', label: symptomsDict[language].liquid, risk: 'critical' },
    { id: 'cramps', label: symptomsDict[language].cramps, risk: 'warning' },
  ];
};

// --- Utility Functions ---
const calculateWeeksPregnant = (lastPeriodDate: string) => {
  const lmp = new Date(lastPeriodDate);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - lmp.getTime());
  const diffWeeks = Math.floor(diffTime / (1000 * 60 * 60 * 24 * 7));
  return diffWeeks;
};

const calculateDueDate = (lastPeriodDate: string) => {
  const lmp = new Date(lastPeriodDate);
  const dpa = new Date(lmp);
  dpa.setDate(dpa.getDate() + 7);
  dpa.setMonth(dpa.getMonth() - 3);
  dpa.setFullYear(dpa.getFullYear() + 1);
  return dpa.toISOString();
};

// --- Components ---

function NavButton({ active, icon: Icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 transition-all duration-300 ${active ? 'text-brand-primary scale-110' : 'text-gray-500 hover:text-gray-300'}`}
    >
      <Icon size={22} className={active ? 'fill-brand-primary/20' : ''} />
      <span className="text-[10px] mt-1 font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

export default function App() {
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'checkup' | 'education' | 'profile' | 'record'>('home');
  const [logs, setLogs] = useState<CheckupLog[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [language, setLanguage] = useState<Language>('FR');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    // Handle QR code link
    const params = new URLSearchParams(window.location.search);
    const recordData = params.get('record');
    if (recordData) {
      try {
        const decodedString = decodeURIComponent(atob(recordData).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join(''));
        const decoded = JSON.parse(decodedString);
        
        // Handle both old and new format
        if (decoded.n) {
          setPatient({
            id: decoded.id,
            name: decoded.n,
            phone: decoded.p,
            weeksPregnant: decoded.w,
            lastPeriodDate: new Date().toISOString(), // Mocked as it's not in the small QR
            dueDate: new Date().toISOString(),
            assignedHospitalId: 'h1'
          });
          setLogs(decoded.l.map((l: any) => ({
            id: Math.random().toString(),
            date: l.d,
            status: l.s,
            aiAnalysis: l.a,
            symptoms: []
          })));
        } else {
          setPatient(decoded.patient);
          setLogs(decoded.logs || []);
        }
        setActiveTab('record');
      } catch (e) {
        console.error("Invalid record data", e);
      }
      return;
    }

    const saved = localStorage.getItem('uzazi_patient');
    if (saved) {
      setPatient(JSON.parse(saved));
    } else {
      setShowOnboarding(true);
    }

    const savedLogs = localStorage.getItem('uzazi_logs');
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
  }, []);

  const handleRegister = (name: string, phone: string, lmp: string, hospitalId: string) => {
    const newPatient: Patient = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      phone,
      lastPeriodDate: lmp,
      dueDate: calculateDueDate(lmp),
      weeksPregnant: calculateWeeksPregnant(lmp),
      assignedHospitalId: hospitalId
    };
    setPatient(newPatient);
    localStorage.setItem('uzazi_patient', JSON.stringify(newPatient));
    setShowOnboarding(false);
  };

  const handleAddLog = async (newLog: { symptoms: string[], bloodPressure?: string, weight?: number }) => {
    setIsAnalyzing(true);
    setActiveTab('home'); // Transition early to show loading state

    const aiResult = await analyzeSymptoms(newLog, language);

    const log: CheckupLog = {
      ...newLog,
      id: Math.random().toString(36).substr(2, 9),
      patientId: patient?.id || '',
      date: new Date().toISOString(),
      status: aiResult.status as HealthStatus,
      aiAnalysis: aiResult.analysis
    };
    const updatedLogs = [log, ...logs];
    setLogs(updatedLogs);
    localStorage.setItem('uzazi_logs', JSON.stringify(updatedLogs));
    setIsAnalyzing(false);
  };

  const logout = () => {
    localStorage.clear();
    setPatient(null);
    setLogs([]);
    setShowOnboarding(true);
  };

  if (showOnboarding) {
    return <Onboarding onRegister={handleRegister} language={language} />;
  }

  if (!patient) return null;

  return (
    <div className="flex flex-col min-h-screen bg-app-bg dark font-sans selection:bg-brand-primary/30">
      {/* Header */}
      <header className="sticky top-0 w-full bg-gray-900/80 backdrop-blur-xl border-b border-white/5 flex justify-center z-[100]">
        <div className="w-full max-w-5xl px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <motion.div 
              whileHover={{ rotate: 180 }}
              className="w-12 h-12 bg-white p-1 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg border-2 border-brand-primary"
            >
              <img 
                src="https://plus.unsplash.com/premium_photo-1675713430635-424a132e4785?auto=format&fit=crop&q=80&w=200" 
                alt="Profile" 
                className="w-full h-full object-cover rounded-xl"
                referrerPolicy="no-referrer"
              />
            </motion.div>
            <div>
              <h1 className="text-base md:text-xl font-display font-black text-white border-none leading-none tracking-tight">Uzazi Salama</h1>
            </div>
          </div>
          
          <div className="relative">
            <button 
              onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
              className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Languages size={14} className="text-brand-primary" />
              <span className="text-[10px] font-black tracking-widest text-white">{language}</span>
              <ChevronDown size={14} className={`text-gray-400 transition-transform ${isLanguageMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {isLanguageMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  className="absolute right-0 mt-2 w-32 bg-gray-800 border border-white/10 rounded-2xl shadow-2xl z-[110] py-2"
                >
                  {(['FR', 'SW', 'MSH'] as Language[]).map(lang => (
                    <button 
                      key={lang}
                      onClick={() => {
                        setLanguage(lang);
                        setIsLanguageMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-[10px] font-black tracking-widest hover:bg-brand-primary/10 transition-colors ${language === lang ? 'text-brand-primary' : 'text-gray-300'}`}
                    >
                      {lang === 'FR' ? 'FRANÇAIS' : lang === 'SW' ? 'SWAHILI' : 'MASHI'}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 md:px-8 py-8 md:py-12 overflow-x-hidden">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="max-w-4xl mx-auto"
            >
              <HomeView 
                patient={patient} 
                lastLog={logs[0]} 
                onTabChange={setActiveTab} 
                isAnalyzing={isAnalyzing}
                language={language}
              />
            </motion.div>
          )}
          {activeTab === 'checkup' && (
            <motion.div
              key="checkup"
              initial={{ opacity: 0, x: 100 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -100 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="max-w-2xl mx-auto"
            >
              <CheckupView onAddLog={handleAddLog} language={language} />
            </motion.div>
          )}
          {activeTab === 'education' && (
            <motion.div
              key="education"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              <EducationView language={language} weeksPregnant={patient.weeksPregnant} />
            </motion.div>
          )}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="max-w-2xl mx-auto"
            >
              <ProfileView patient={patient!} logs={logs} onLogout={logout} language={language} />
            </motion.div>
          )}
          {activeTab === 'record' && (
            <motion.div
              key="record"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-4xl mx-auto"
            >
              <RecordView patient={patient!} logs={logs} language={language} onBack={() => setActiveTab('home')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Bar */}
      {activeTab !== 'record' && (
        <div className="sticky bottom-0 left-0 right-0 z-[100] p-4 flex justify-center pointer-events-none">
          <nav className="max-w-lg w-full bg-gray-900/90 backdrop-blur-2xl border border-white/10 px-4 py-3 flex justify-between items-center rounded-[2rem] shadow-2xl pointer-events-auto">
            <NavButton active={activeTab === 'home'} icon={Home} label={translations[language].home} onClick={() => setActiveTab('home')} />
            <NavButton active={activeTab === 'checkup'} icon={Stethoscope} label={translations[language].suivi} onClick={() => setActiveTab('checkup')} />
            <NavButton active={activeTab === 'education'} icon={BookOpen} label={translations[language].conseil} onClick={() => setActiveTab('education')} />
            <NavButton active={activeTab === 'profile'} icon={User} label={translations[language].profil} onClick={() => setActiveTab('profile')} />
          </nav>
        </div>
      )}
    </div>
  );
}

// --- Sub-Views ---

function Onboarding({ onRegister, language }: { onRegister: (name: string, phone: string, lmp: string, hospitalId: string) => void, language: Language }) {
  const t = translations[language];
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    lmp: '',
    hospitalId: HOSPITALS[0].id
  });
  const [error, setError] = useState('');

  const validateAndNext = () => {
    if (step === 2) {
      const lmpDate = new Date(formData.lmp);
      const today = new Date();
      const tenMonthsAgo = new Date();
      tenMonthsAgo.setMonth(today.getMonth() - 10);

      if (lmpDate > today || lmpDate < tenMonthsAgo || isNaN(lmpDate.getTime())) {
        setError(t.invalid_date);
        return;
      }
    }
    setError('');
    setStep(step + 1);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-app-bg p-8">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-12 mb-8"
      >
        <div className="w-20 h-20 bg-brand-primary/20 rounded-[2rem] flex items-center justify-center text-brand-primary mb-8 mx-auto shadow-2xl shadow-green-900/20">
          <Baby size={48} className="animate-pulse" />
        </div>
        <h1 className="text-3xl font-display font-black text-white border-none text-center leading-tight">Uzazi Salama</h1>
        <p className="text-gray-500 mt-3 text-center text-sm font-medium leading-relaxed px-4">Votre partenaire intelligent pour une maternité en toute sécurité.</p>
      </motion.div>

      <div className="space-y-8">
        {step === 1 ? (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            <div>
              <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-3">Votre Nom Complet</label>
              <input 
                type="text" 
                placeholder="Ex: Zawadi Zawadi"
                className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 text-white placeholder-gray-600 focus:bg-white/10 focus:ring-2 focus:ring-brand-primary focus:outline-none transition-all font-bold"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => step === 1 && formData.name && setStep(2)}
              className="w-full bg-brand-primary text-gray-900 py-5 rounded-2xl font-black shadow-2xl shadow-green-900/20 flex items-center justify-center gap-2 text-sm uppercase tracking-widest"
            >
              Continuer <ChevronRight size={18} />
            </motion.button>
          </motion.div>
        ) : (
          <motion.div 
            initial={{ opacity: 0, x: 20 }} 
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
             <button onClick={() => setStep(1)} className="text-[10px] font-black text-gray-500 mb-2 flex items-center gap-1 uppercase tracking-widest hover:text-white transition-colors">
              <ArrowLeft size={14} /> Retour
            </button>
            <div className="space-y-5">
              <div>
                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-3">Téléphone (Airtel/Orange)</label>
                <input 
                  type="tel" 
                  placeholder="+243 ..."
                  className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 text-white placeholder-gray-600 focus:bg-white/10 focus:ring-2 focus:ring-brand-primary focus:outline-none font-bold"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-3">Date des Dernières Règles</label>
                <input 
                  type="date" 
                  className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 text-white focus:bg-white/10 focus:ring-2 focus:ring-brand-primary focus:outline-none font-bold"
                  value={formData.lmp}
                  onChange={(e) => setFormData({...formData, lmp: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-3">Votre Centre Médical</label>
                <div className="relative">
                  <select 
                    className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 text-white focus:bg-white/10 focus:ring-2 focus:ring-brand-primary focus:outline-none appearance-none font-bold"
                    value={formData.hospitalId}
                    onChange={(e) => setFormData({...formData, hospitalId: e.target.value})}
                  >
                    {HOSPITALS.map(h => (
                      <option key={h.id} value={h.id}>{h.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" size={18} />
                </div>
              </div>
            </div>
            <motion.button 
              whileTap={{ scale: 0.95 }}
              onClick={() => onRegister(formData.name, formData.phone, formData.lmp, formData.hospitalId)}
              className="w-full bg-brand-primary text-gray-900 py-5 rounded-2xl font-black shadow-2xl shadow-green-900/20 text-sm uppercase tracking-widest mt-4"
            >
              Lancer mon Suivi
            </motion.button>
          </motion.div>
        )}
      </div>
    </div>
  );
}

function HomeView({ 
  patient, 
  lastLog, 
  onTabChange, 
  isAnalyzing,
  language
}: { 
  patient: Patient, 
  lastLog?: CheckupLog, 
  onTabChange: (tab: string) => void,
  isAnalyzing?: boolean,
  language: Language
}) {
  const t = translations[language];
  const weeksRemaining = 40 - patient.weeksPregnant;
  const progress = (patient.weeksPregnant / 40) * 100;
  
  // Trimester-specific rotating tip
  const currentTrimester = patient.weeksPregnant <= 13 ? 1 : patient.weeksPregnant <= 26 ? 2 : 3;
  const trimesterTips = EDUCATION_ARTICLES.filter(a => !a.trimester || a.trimester === currentTrimester);
  const dailyTip = trimesterTips[Math.floor(new Date().getDate() % trimesterTips.length)];

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-12">
           <motion.div 
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4 mb-2"
          >
             <span className="w-12 h-[2px] bg-brand-primary rounded-full"></span>
             <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">{t.back} — T{currentTrimester}</p>
          </motion.div>
        </div>

        {/* Left Column: Progress & Core Actions */}
        <div className="lg:col-span-7 space-y-8">
          {/* Welcome Card */}
          <motion.div 
            whileHover={{ scale: 1.01 }}
            className="bg-gradient-to-br from-gray-900 to-gray-800 rounded-[2.5rem] p-8 text-white shadow-2xl border border-white/5 overflow-hidden relative min-h-[300px] flex flex-col justify-center"
          >
            <div className="relative z-10">
              <p className="text-[10px] opacity-60 uppercase font-black tracking-[0.3em] border-none">{t.welcome}, {patient.name.split(' ')[0]}!</p>
              <h2 className="text-2xl md:text-3xl font-display font-black mt-2 border-none text-white leading-tight">{t.journey}</h2>
              
              <div className="mt-10 flex items-center gap-8">
                <div className="relative">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle 
                      cx="64" cy="64" r="58" 
                      className="stroke-white/5 fill-none" 
                      strokeWidth="12" 
                    />
                    <motion.circle 
                      cx="64" cy="64" r="58" 
                      className="stroke-brand-primary fill-none" 
                      strokeWidth="12"
                      strokeLinecap="round"
                      initial={{ strokeDasharray: "365", strokeDashoffset: "365" }}
                      animate={{ strokeDashoffset: 365 - (365 * progress) / 100 }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-brand-primary">{patient.weeksPregnant}</span>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-70">{t.weeks}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">{t.remaining}</p>
                  <p className="text-3xl md:text-4xl font-black tabular-nums text-white">{weeksRemaining < 0 ? 0 : weeksRemaining} <span className="text-[10px] uppercase font-black opacity-40">{t.weeks}</span></p>
                  <p className="text-[10px] font-bold opacity-60 mt-2">DPA: {new Date(patient.dueDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          </motion.div>

          {/* Action CTA */}
          <motion.button 
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTabChange('checkup')}
            className="w-full bg-brand-primary text-gray-900 py-6 rounded-[2.5rem] font-black text-sm shadow-2xl flex items-center justify-center gap-3 uppercase tracking-[0.2em] transition-all"
          >
            <Stethoscope size={24} />
            {t.diagnostic_ia}
          </motion.button>
        </div>

        {/* Right Column: Information & Daily Tip */}
        <div className="lg:col-span-5 space-y-8">
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div 
                key="analyzing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-gray-800/50 p-8 rounded-[2.5rem] flex flex-col items-center gap-6 text-center shadow-2xl border border-brand-primary/30 min-h-[200px] justify-center"
              >
                <Loader2 className="text-brand-primary animate-spin" size={48} />
                <p className="font-black text-white uppercase tracking-[0.3em] text-xs">{t.analyzing}</p>
              </motion.div>
            ) : lastLog ? (
              <motion.div 
                key="last-log"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-8 rounded-[2.5rem] border flex flex-col justify-between ${
                  lastLog.status === 'critical' ? 'bg-red-950/30 border-red-900/50 text-red-100' : 
                  lastLog.status === 'warning' ? 'bg-yellow-950/30 border-yellow-900/50 text-yellow-100' : 
                  'bg-brand-primary/5 border-brand-primary/20 text-white'
                } shadow-2xl backdrop-blur-md`}
              >
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                      lastLog.status === 'critical' ? 'bg-red-500' : 
                      lastLog.status === 'warning' ? 'bg-yellow-500 text-gray-900' : 
                      'bg-brand-primary text-gray-900'
                    }`}>
                      <Heart size={28} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 italic">{t.smart_diag}</p>
                      <p className="font-black text-sm uppercase tracking-[0.2em]">
                        {lastLog.status === 'stable' ? `✓ ${t.stable}` : lastLog.status === 'warning' ? `! ${t.vigilance}` : `⚠ ${t.action}`}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs md:text-sm leading-relaxed font-medium italic opacity-90">
                    {lastLog.aiAnalysis || t.all_normal}
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center opacity-40">
                  <span className="text-[8px] font-black uppercase tracking-widest">{t.oms_compliance}</span>
                  <ShieldCheck size={16} />
                </div>
              </motion.div>
            ) : (
                <div className="bg-gray-800/20 p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center text-center gap-4 min-h-[200px]">
                  <Heart className="text-gray-700" size={48} />
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] italic">{t.start_checkup}</p>
                </div>
            )}
          </AnimatePresence>

          {/* Daily Tip Card */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-gray-800/40 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-xl"
          >
            {dailyTip.imageUrl && (
              <img src={dailyTip.imageUrl} alt="Tip" className="w-full h-32 object-cover opacity-50 grayscale hover:grayscale-0 transition-all duration-500" referrerPolicy="no-referrer" />
            )}
            <div className="p-8">
              <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-2">{t.conseil} — {t[dailyTip.category as keyof typeof t] || dailyTip.category}</p>
              <h3 className="font-display font-black text-white text-lg border-none leading-tight">{dailyTip.translations[language].title}</h3>
              <p className="text-gray-400 text-xs mt-3 leading-relaxed italic font-medium">{dailyTip.translations[language].content}</p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

function CheckupView({ onAddLog, language }: { onAddLog: (log: { symptoms: string[], bloodPressure?: string, weight?: number, notes?: string }) => void, language: Language }) {
  const t = translations[language];
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [bloodPressure, setBloodPressure] = useState('');
  const [weight, setWeight] = useState('');
  const [notes, setNotes] = useState('');

  const potentialSymptoms = getLocalizedSymptoms(language);

  const handleToggleSymptom = (id: string) => {
    if (symptoms.includes(id)) {
      setSymptoms(symptoms.filter(s => s !== id));
    } else {
      setSymptoms([...symptoms, id]);
    }
  };

  const handleSubmit = () => {
    onAddLog({
      symptoms,
      bloodPressure: bloodPressure || undefined,
      weight: weight ? parseFloat(weight) : undefined,
      notes: notes || undefined
    });
  };

  return (
    <div className="p-6 space-y-8 pb-32">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-display font-black text-white border-none leading-tight">{t.diagnostic_title}</h2>
        <p className="text-gray-500 text-sm mt-1 font-medium italic">{t.regular_suivi}</p>
      </motion.div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] border-none mb-2">{t.symptoms_mobile}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          {potentialSymptoms.map((s, idx) => (
            <motion.button
              key={s.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => handleToggleSymptom(s.id)}
              className={`flex items-center justify-between px-6 py-5 rounded-[2rem] border transition-all h-full ${
                symptoms.includes(s.id) 
                  ? 'border-brand-primary bg-brand-primary/10 ring-2 ring-brand-primary/20 scale-[1.02]' 
                  : 'border-white/5 bg-gray-800/40'
              }`}
            >
              <span className={`text-sm font-black uppercase tracking-widest text-left ${symptoms.includes(s.id) ? 'text-brand-primary' : 'text-gray-400'}`}>{s.label}</span>
              {symptoms.includes(s.id) ? (
                <div className="w-6 h-6 bg-brand-primary rounded-lg flex items-center justify-center text-gray-900 shrink-0">
                  <ShieldCheck size={16} />
                </div>
              ) : s.risk === 'critical' ? (
                <AlertCircle size={20} className="text-red-500 opacity-40 shrink-0" />
              ) : null}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">{t.other_symptom}</label>
        <textarea 
          placeholder="..."
          rows={3}
          className="w-full px-5 py-4 rounded-[1.5rem] border border-white/5 focus:ring-2 focus:ring-brand-primary focus:outline-none bg-gray-800/40 text-white text-sm font-medium leading-relaxed"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">{t.bp}</label>
          <input 
            type="text" 
            placeholder="12/8"
            className="w-full px-5 py-4 rounded-[1.5rem] border border-white/5 focus:ring-2 focus:ring-brand-primary focus:outline-none bg-gray-800/40 text-white text-sm font-black tracking-widest placeholder-gray-700"
            value={bloodPressure}
            onChange={(e) => setBloodPressure(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mb-2">{t.weight}</label>
          <input 
            type="number" 
            placeholder="65"
            className="w-full px-5 py-4 rounded-[1.5rem] border border-white/5 focus:ring-2 focus:ring-brand-primary focus:outline-none bg-gray-800/40 text-white text-sm font-black tracking-widest placeholder-gray-700"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
          />
        </div>
      </div>

      <motion.button 
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleSubmit}
        className="w-full bg-brand-primary text-gray-900 py-6 rounded-[2.5rem] font-black shadow-2xl mt-4 uppercase tracking-[0.3em] text-sm"
      >
        {t.submit_record}
      </motion.button>
    </div>
  );
}

function EducationView({ language, weeksPregnant }: { language: Language, weeksPregnant: number }) {
  const t = translations[language];
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const currentTrimester = weeksPregnant <= 13 ? 1 : weeksPregnant <= 26 ? 2 : 3;
  const categories = ['nutrition', 'exercise', 'warning_signs', 'baby_growth', 'hygiene', 'mental_health'];
  
  const filteredArticles = EDUCATION_ARTICLES.filter(a => 
    (!selectedCategory || a.category === selectedCategory) &&
    (!a.trimester || a.trimester === currentTrimester)
  );

  return (
    <div className="p-6 space-y-8 pb-32">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <h2 className="text-3xl font-display font-black text-white border-none leading-tight">{t.guide_maternel}</h2>
        <p className="text-gray-500 text-sm mt-1 font-medium italic">{t.know_protect} ({t.trimester} {currentTrimester})</p>
      </motion.div>

      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
        <button 
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase shrink-0 transition-all ${!selectedCategory ? 'bg-brand-primary text-gray-900 shadow-lg' : 'bg-white/5 text-gray-400 border border-white/10'}`}
        >
          {t.all}
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase shrink-0 transition-all ${selectedCategory === cat ? 'bg-brand-primary text-gray-900 shadow-lg' : 'bg-white/5 text-gray-400 border border-white/10'}`}
          >
            {t[cat as keyof typeof t] || cat}
          </button>
        ))}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimatePresence mode="popLayout">
          {filteredArticles.map((article, idx) => (
            <motion.div 
              key={article.id} 
              layout
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ delay: idx * 0.05 }}
              className="bg-gray-800/40 rounded-[2.5rem] shadow-sm border border-white/5 relative overflow-hidden group flex flex-col"
            >
              {article.imageUrl && (
                <div className="h-40 overflow-hidden">
                  <img src={article.imageUrl} alt={article.title} className="w-full h-full object-cover opacity-60 group-hover:scale-110 transition-transform duration-700" referrerPolicy="no-referrer" />
                </div>
              )}
              <div className="p-8 flex-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 shadow-lg shrink-0 ${
                  ['nutrition', 'baby_growth', 'hygiene'].includes(article.category) ? 'bg-brand-primary/20 text-brand-primary' : 'bg-red-500/10 text-red-400'
                }`}>
                  {article.category === 'nutrition' ? <Droplets size={20} /> : <AlertCircle size={20} />}
                </div>
                <h3 className="font-display font-black text-white text-xl border-none leading-tight tracking-tight">{article.translations[language].title}</h3>
                <p className="text-gray-400 text-sm mt-4 leading-relaxed font-medium opacity-80">{article.translations[language].content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProfileView({ patient, logs, onLogout, language }: { patient: Patient, logs: CheckupLog[], onLogout: () => void, language: Language }) {
  const t = translations[language];
  const [showQR, setShowQR] = useState(false);
  const hospital = HOSPITALS.find(h => h.id === patient.assignedHospitalId);

  // Robust QR Code Generation
  const stringifyData = JSON.stringify({ 
    id: patient.id, 
    n: patient.name, 
    p: patient.phone, 
    w: patient.weeksPregnant,
    l: logs.slice(0, 3).map(l => ({ d: l.date, s: l.status, a: l.aiAnalysis })) 
  });
  
  const encodedData = btoa(encodeURIComponent(stringifyData).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16))));
  const recordLink = `${window.location.origin}${window.location.pathname}?record=${encodedData}`;

  return (
    <div className="p-6 space-y-8 pb-32 max-w-2xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center text-center"
      >
        <div className="w-28 h-28 bg-white p-2 rounded-full flex items-center justify-center mb-6 ring-4 ring-brand-primary/20 shadow-2xl relative">
          <div className="w-full h-full rounded-full overflow-hidden">
            <img 
              src="https://plus.unsplash.com/premium_photo-1675713430635-424a132e4785?auto=format&fit=crop&q=80&w=200" 
              alt="User" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          </div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -bottom-1 -right-1 w-10 h-10 bg-brand-primary rounded-xl border-4 border-gray-900 flex items-center justify-center text-gray-900"
          >
            <Heart size={20} fill="currentColor" />
          </motion.div>
        </div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-display font-black text-white border-none tracking-tight">{patient.name}</h2>
          <ShieldCheck size={20} className="text-brand-primary" />
        </div>
        <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] mt-2 italic">{patient.phone}</p>
        
        <span className="mt-4 inline-flex items-center gap-2 bg-brand-primary/10 text-brand-primary text-[10px] font-black px-4 py-1.5 rounded-full border border-brand-primary/20 uppercase tracking-[0.2em] shadow-sm">
          <ShieldCheck size={14} /> Suivi Actif
        </span>
      </motion.div>

      <div className="space-y-4">
        {[
          { icon: MapPin, label: "Centre Médical", value: hospital?.name, sub: hospital?.location, color: "text-brand-primary", bg: "bg-brand-primary/5" },
          { icon: Phone, label: "Urgence SOS", value: hospital?.emergencyContact, sub: "Disponible 24h/24", color: "text-red-400", bg: "bg-red-400/5" }
        ].map((item, i) => (
          <motion.div 
            key={i}
            whileHover={{ x: 5 }}
            className="bg-gray-800/40 p-6 rounded-[2rem] flex items-center gap-5 shadow-sm border border-white/5 group"
          >
            <div className={`${item.bg} p-4 rounded-2xl ${item.color} group-hover:scale-110 transition-transform`}>
              <item.icon size={24} />
            </div>
            <div className="flex-1">
              <p className="text-[9px] font-black text-gray-500 uppercase tracking-[0.3em] mb-1 italic">{item.label}</p>
              <p className="font-black text-white text-base leading-none border-none">{item.value}</p>
              <p className="text-[10px] text-gray-400 font-medium mt-1 opacity-60 tracking-wider uppercase leading-none">{item.sub}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="py-4 space-y-4">
        <motion.button 
          whileTap={{ scale: 0.98 }}
          onClick={() => setShowQR(!showQR)}
          className={`w-full py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-2xl transition-all duration-300 ${
            showQR ? 'bg-white text-gray-900 border-none' : 'bg-gray-800 border border-white/10 text-white'
          }`}
        >
          <QrCode size={20} />
          <span className="uppercase tracking-[0.2em]">{showQR ? t.hide_fiche : t.pass_qr}</span>
        </motion.button>

        <motion.button 
          onClick={onLogout}
          className="w-full py-4 rounded-[2rem] text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] flex items-center justify-center gap-2 hover:text-red-400 transition-colors"
        >
          <LogOut size={14} />
          {t.logout}
        </motion.button>
      </div>

      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="bg-white p-10 rounded-[3rem] border-[4px] border-brand-primary flex flex-col items-center shadow-2xl relative"
          >
             <div className="absolute top-4 left-0 right-0 flex justify-center">
                <span className="bg-brand-primary text-gray-900 text-[8px] font-black px-4 py-1 rounded-full uppercase tracking-widest">{t.digital_health_pass}</span>
             </div>
            <div className="bg-white p-4 rounded-[2rem] shadow-inner mb-2">
               <QRCodeCanvas 
                value={recordLink} 
                size={200} 
                level="M"
                includeMargin={false}
                className="max-w-full h-auto"
              />
            </div>
            <div className="mt-8 text-center space-y-2">
              <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.2em]">Uzazi ID : {patient.id.toUpperCase()}</p>
              <p className="text-[9px] font-bold text-gray-400 max-w-[220px] leading-relaxed italic uppercase tracking-wider">{t.scan_info}</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function RecordView({ patient, logs, language, onBack }: { patient: Patient, logs: CheckupLog[], language: Language, onBack: () => void }) {
  const t = translations[language];
  const hospital = HOSPITALS.find(h => h.id === patient.assignedHospitalId);

  return (
    <div className="p-6 space-y-8 bg-gray-900 min-h-screen">
      <header className="flex items-center justify-between gap-4">
        <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl text-white hover:bg-white/10">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-display font-black text-white">{t.medical_record}</h2>
        <div className="w-10" />
      </header>

      <div className="bg-white rounded-[3rem] p-8 text-gray-900 shadow-2xl shadow-black/50">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 overflow-hidden">
             <img 
               src="https://plus.unsplash.com/premium_photo-1675713430635-424a132e4785?auto=format&fit=crop&q=80&w=200" 
               className="w-full h-full object-cover" 
               referrerPolicy="no-referrer" 
             />
          </div>
          <div>
            <h3 className="text-2xl font-black">{patient.name}</h3>
            <p className="text-xs font-bold text-gray-400">{patient.phone}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-8">
           <div className="bg-gray-100/50 p-6 rounded-[2rem]">
              <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1">{t.weeks}</p>
              <p className="text-xl font-black text-gray-900">{patient.weeksPregnant}</p>
           </div>
           <div className="bg-gray-100/50 p-6 rounded-[2rem]">
              <p className="text-[8px] font-black uppercase text-gray-400 tracking-widest mb-1">DPA</p>
              <p className="text-xl font-black text-gray-900">{new Date(patient.dueDate).toLocaleDateString()}</p>
           </div>
        </div>

        <div className="space-y-6">
           <div className="border-b border-gray-100 pb-4">
              <h4 className="text-[10px] font-black uppercase text-brand-primary tracking-widest mb-2">{t.medical_record}</h4>
              <p className="text-sm font-bold text-gray-800">{hospital?.name}</p>
              <p className="text-[10px] text-gray-400 font-medium">{hospital?.location}</p>
           </div>

           <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">{t.medical_history}</h4>
              {logs.length === 0 ? (
                <p className="text-xs text-gray-400 italic">{t.no_logs}</p>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div key={log.id} className="bg-gray-100/30 p-6 rounded-[2rem] border border-gray-100">
                      <div className="flex justify-between items-center mb-4">
                         <p className="text-[10px] font-black text-gray-400">{new Date(log.date).toLocaleDateString()}</p>
                         <span className={`text-[8px] font-black px-3 py-1 rounded-full uppercase ${
                            log.status === 'critical' ? 'bg-red-100 text-red-600' : 
                            log.status === 'warning' ? 'bg-yellow-100 text-yellow-600' : 
                            'bg-green-100 text-green-600'
                         }`}>
                            {log.status === 'stable' ? t.stable : log.status === 'warning' ? t.vigilance : t.action}
                         </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-4">
                        {log.symptoms.map(s => (
                          <span key={s} className="bg-white px-3 py-1 rounded-lg text-[9px] font-bold text-gray-600 border border-gray-200">{s}</span>
                        ))}
                      </div>
                      <p className="text-xs text-gray-600 italic leading-relaxed">{log.aiAnalysis}</p>
                      {log.notes && (
                         <div className="mt-3 p-3 bg-white/50 rounded-xl border border-gray-100">
                            <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">{t.patient_notes}</p>
                            <p className="text-xs text-gray-500">{log.notes}</p>
                         </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
           </div>
        </div>
      </div>
    </div>
  );
}
