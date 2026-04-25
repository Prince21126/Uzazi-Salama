/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { 
  Heart, 
  Plus, 
  Baby, 
  User, 
  BookOpen, 
  Settings, 
  ChevronRight, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  MapPin, 
  Phone, 
  Calendar, 
  Stethoscope, 
  TrendingUp, 
  ShieldCheck, 
  History, 
  Languages, 
  ChevronDown, 
  Loader2, 
  Activity, 
  Clock, 
  Quote, 
  Sparkles,
  ArrowLeft,
  Home,
  RefreshCw,
  Droplets,
  QrCode,
  LogOut,
  BrainCircuit,
  Lightbulb,
  Bell
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { QRCodeCanvas } from 'qrcode.react';
import { Patient, HealthStatus, CheckupLog, Language, Hospital } from './types';
import { HOSPITALS, EDUCATION_ARTICLES } from './constants';
import { analyzeSymptoms } from './services/aiService';
import slugify from 'slugify';
import { db, auth } from './lib/firebase';
import { useAuth } from './hooks/useAuth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  onSnapshot, 
  query, 
  orderBy, 
  addDoc, 
  serverTimestamp,
  where,
  getDocs
} from 'firebase/firestore';

interface FirestoreErrorInfo {
  error: string;
  operationType: 'create' | 'update' | 'delete' | 'list' | 'get' | 'write';
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string; }[];
  }
}

function handleFirestoreError(error: any, operationType: FirestoreErrorInfo['operationType'], path: string | null = null) {
  if (error.code === 'permission-denied') {
    const user = auth.currentUser;
    const errorInfo: FirestoreErrorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: {
        userId: user?.uid || 'anonymous',
        email: user?.email || 'none',
        emailVerified: user?.emailVerified || false,
        isAnonymous: user?.isAnonymous || false,
        providerInfo: user?.providerData.map(p => ({
          providerId: p.providerId,
          displayName: p.displayName || '',
          email: p.email || ''
        })) || []
      }
    };
    throw new Error(JSON.stringify(errorInfo));
  }
  throw error;
}

// --- Translations ---
const translations = {
  FR: {
    home: "Mon Suivi",
    suivi: "Ma santé",
    conseil: "Conseils",
    profil: "Moi",
    welcome: "Bonjour",
    journey: "Ma grossesse",
    journey_label: "Votre parcours",
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
    emergency: "Urgence",
    call_hospital: "Appeler l'hôpital",
    kick_counter: "Compteur de coups",
    contractions: "Contractions",
    start_counting: "Démarrer le comptage",
    stop_counting: "Arrêter",
    kicks_today: "Coups aujourd'hui",
    weight_track: "Suivi de poids",
    bp_track: "Tension",
    tools: "Outils",
    medical_record: "Historique",
    medical_history: "Historique Médical",
    back: "Retour",
    all: "Tout",
    stable: "Stable",
    vigilance: "Vigilance",
    action: "Action",
    show_qr: "Afficher QR",
    refresh_tips: "Nouveau conseil",
    active_followup: "Suivi Actif",
    risk: "Risque",
    normal: "Normal",
    emergency_contact: "Urgence",
    direct_line: "Ligne Directe",
    generated_by: "Généré par UZAZI SALAMA AI",
    soon: "Bientôt",
    current_health: "Ma santé actuelle",
    last_checkup: "Dernier bilan",
    days: "jours",
    days_left: "JOURS RESTANTS",
    medical_file: "Fiche médicale",
    see_details: "Voir détails",
    vital_signs: "Signes Vitaux",
    check_now: "Vérifier ma santé",
    note_label: "Note pour le docteur",
    note_placeholder: "Expliquez comment vous vous sentez...",
    tracking_details: "Détails du Suivi",
    assigned_hospital: "Hôpital Assigné",
    assigned_hospital_desc: "Votre centre de référence",
    emergency_desc: "Disponible 24h/24",
    weight_desc: "Dernier poids enregistré",
    bp_desc: "Dernière tension mesurée",
    hospital_label: "Hôpital",
    french: "FRANÇAIS",
    swahili: "SWAHILI",
    mashi: "MASHI",
    dpa_label: "DPA",
    id_label: "ID",
    full_name: "Votre Nom Complet",
    full_name_placeholder: "Ex: Zawadi Zawadi",
    phone_label: "Téléphone (Airtel/Orange)",
    lmp_date: "Date des Dernières Règles",
    medical_center: "Votre Centre Médical",
    start_tracking: "Lancer mon Suivi",
    continue: "Continuer",
    app_subtitle: "Votre partenaire intelligent pour une maternité en toute sécurité.",
    medical_record_title: "Ma fiche santé",
    followup_active: "Suivi Actif",
    all_normal: "Tout semble normal pour votre stade actuel.",
    start_checkup: "Commencez un bilan",
    no_logs: "Aucun bilan enregistré",
    patient_notes: "Notes patiente:",
    google_login: "Continuer avec Google",
    or: "OU",
    app_tagline: "Maman & Bébé",
    generate_ai_advice: "Nouveau conseil IA (OMS)",
    generating: "Génération...",
    fresh_advice: "Conseil du Moment",
    who_label: "Conforme OMS",
    admin_title: "Tableau de Bord Admin",
    stats_overview: "Aperçu Global",
    hospitals_management: "Gestion des Hôpitaux",
    emergencies_management: "Numéros d'Urgence",
    all_patients: "Toutes les Mamans",
    predict_labor: "Prédiction Accouchement",
    labor_prediction_desc: "Basé sur les contractions et antécédents",
    admin_access_code: "Code d'accès Admin",
    admin_auth: "Authentification Admin",
    access_granted: "Accès Autorisé",
    reports: "Rapports",
    total_women: "Total Femmes",
  },
  SW: {
    home: "Maendeleo",
    suivi: "Afya",
    conseil: "Mafundisho",
    profil: "Mimi",
    welcome: "Habari",
    journey: "Mimba yangu",
    journey_label: "Safari yako",
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
    emergency: "Dharura",
    call_hospital: "Piga simu hospitali",
    kick_counter: "Hesabu mateke",
    contractions: "Uchungu",
    start_counting: "Anza kuhesabu",
    stop_counting: "Acha",
    kicks_today: "Mateke ya leo",
    weight_track: "Uzito",
    bp_track: "Presha",
    tools: "Vifaa",
    medical_record: "Historia",
    medical_history: "Historia ya Matibabu",
    back: "Rudi",
    all: "Zote",
    stable: "Salama",
    vigilance: "Tahadhari",
    action: "Chukua hatua",
    show_qr: "Onyesha QR",
    refresh_tips: "Ushauri mwingine",
    active_followup: "Ufuatiliaji Unaoendelea",
    risk: "Hatari",
    normal: "Kawaida",
    emergency_contact: "Dharura",
    direct_line: "Njia ya Haraka",
    generated_by: "Imezalishwa na UZAZI SALAMA AI",
    soon: "Hivi karibuni",
    current_health: "Afya yangu sasa",
    last_checkup: "Ukaguzi wa mwisho",
    days: "siku",
    days_left: "SIKU ZILIZOBAKI",
    medical_file: "Kadi ya matibabu",
    see_details: "Angalia zaidi",
    vital_signs: "Dalili za Uzima",
    check_now: "Angalia afya sasa",
    note_label: "Maelezo kwa daktari",
    note_placeholder: "Eleza unavyohisi...",
    tracking_details: "Maelezo ya Ufuatiliaji",
    assigned_hospital: "Hospitali Iliyopangwa",
    assigned_hospital_desc: "Kituo chako cha rejea",
    emergency_desc: "Inapatikana saa 24",
    weight_desc: "Uzito wa mwisho",
    bp_desc: "Presha ya mwisho",
    hospital_label: "Hospitali",
    french: "KIFARANSA",
    swahili: "KISWAHILI",
    mashi: "KIMASHI",
    dpa_label: "DPA (Tarehe)",
    id_label: "ID Namba",
    full_name: "Jina Lako Kamili",
    full_name_placeholder: "Mifano: Zawadi Zawadi",
    phone_label: "Simu (Airtel/Orange)",
    lmp_date: "Tarehe ya Hedhi ya Mwisho",
    medical_center: "Kituo chako cha Matibabu",
    start_tracking: "Anza Ufuatiliaji",
    continue: "Endelea",
    app_subtitle: "Mwenzi wako mwerevu kwa uzazi salama kabisa.",
    medical_record_title: "Kadi yangu ya afya",
    followup_active: "Ufuatiliaji Unaoendelea",
    all_normal: "Kila kitu kinaonekana kuwa sawa.",
    start_checkup: "Anza ukaguzi",
    no_logs: "Hakuna kumbukumbu",
    patient_notes: "Maelezo ya mgonjwa:",
    google_login: "Endelea na Google",
    or: "AU",
    app_tagline: "Mama na Mtoto",
    generate_ai_advice: "Ushauri mupya wa IA (OMS)",
    generating: "Inatafuta...",
    fresh_advice: "Ushauri wa sasa",
    who_label: "Kulingana na OMS",
    admin_title: "Dashibodi ya Admin",
    stats_overview: "Maendeleo ya Jumla",
    hospitals_management: "Usimamizi wa Hospitali",
    emergencies_management: "Namba za Dharura",
    all_patients: "Wamama Wote",
    predict_labor: "Utabiri wa Kujifungua",
    labor_prediction_desc: "Kulingana na uchungu na historia",
    admin_access_code: "Namba ya siri ya Admin",
    admin_auth: "Utambulisho wa Admin",
    access_granted: "Ruhusa Imetolewa",
    reports: "Ripoti",
    total_women: "Jumla ya Wamama",
  },
  MSH: {
    home: "Okukulikiriza",
    suivi: "Amagala",
    conseil: "Amagezi",
    profil: "Bwinji",
    welcome: "Oye’be",
    journey: "Olugendo",
    journey_label: "Olugendo lwawe",
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
    emergency: "Dhambi",
    call_hospital: "Obahamagale emulasho",
    kick_counter: "Okucungula omwana",
    contractions: "Okulumwa",
    start_counting: "Otangire okubala",
    stop_counting: "Oyimange",
    kicks_today: "Mishingo ya lelo",
    weight_track: "Obuzito",
    bp_track: "Okuzimba kwa mashi",
    tools: "Emishi",
    medical_record: "Historia",
    medical_history: "Historia l’Amagala",
    back: "Ocigaluke",
    all: "Zoshi",
    stable: "Amagala masiga",
    vigilance: "Okutahaza",
    action: "Icikorwa",
    show_qr: "Okuyereka QR",
    refresh_tips: "Amagezi gandi",
    active_followup: "Okukulikiriza kuli kunciza",
    risk: "Obuzine",
    normal: "Boshi buli bwo",
    emergency_contact: "Obuzine",
    direct_line: "Emishi kwanji",
    generated_by: "Bishoboza bye UZAZI SALAMA AI",
    soon: "Hingirhi",
    current_health: "Amagala gane gunola",
    last_checkup: "Okulemya ku kasanzi",
    days: "njiku",
    days_left: "NJIKU ZICIGASIRE",
    medical_file: "Kadi l'amagala",
    see_details: "Olole bwinji",
    vital_signs: "Emisi y'amagala",
    check_now: "Ocungule amagala zene",
    note_label: "Ecijibizyo c’omudoktere",
    note_placeholder: "Omenyese buli bwo oli...",
    tracking_details: "Okukulikiriza kwanji",
    assigned_hospital: "Emulasho bayerekire",
    assigned_hospital_desc: "Enyumba y'amagala gawe",
    emergency_desc: "Saha muno-nane",
    weight_desc: "Obuzito bucikuliki",
    bp_desc: "Okuzimba kwa mashi",
    hospital_label: "Emulasho",
    french: "FRANÇAIS",
    swahili: "SWAHILI",
    mashi: "MASHI",
    dpa_label: "DPA",
    id_label: "ID",
    full_name: "Izino lyawe lyoshi",
    full_name_placeholder: "Kugalike: Zawadi Zawadi",
    phone_label: "Emishi ye simu",
    lmp_date: "Kasanzi l’okufunya",
    medical_center: "Enyumba y’obuzine kwanji",
    start_tracking: "Otangire okuchungula",
    continue: "Okugenderera",
    app_subtitle: "Okukulikiriza kuli kunciza obuzine bwawe.",
    medical_record_title: "Kadi yawe",
    followup_active: "Okukulikiriza kuli kunciza",
    all_normal: "Boshi buli bwo omu kasanzi kako.",
    start_checkup: "Oryuse okuchungula",
    no_logs: "Nta nambari hifi",
    patient_notes: "Bishoboza bye muntu:",
    google_login: "Oyandike n'Google",
    or: "KABA",
    app_tagline: "Omubyere n'omwana",
    generate_ai_advice: "Amagezi mayahya ga IA (OMS)",
    generating: "Okuchuuliriza...",
    fresh_advice: "Amagezi ga kasanzi",
    who_label: "Kulusha kwa OMS",
    admin_title: "Tableau de Bord Admin",
    stats_overview: "Okukulikiriza Kwoshi",
    hospitals_management: "Management ya Emulasho",
    emergencies_management: "Emishi ya Dhambi",
    all_patients: "Abamyere Boshi",
    predict_labor: "Okuhubirira kwa lufuatu",
    labor_prediction_desc: "Kulusha kwa mishingo",
    admin_access_code: "Code ya Admin",
    admin_auth: "Admin Auth",
    access_granted: "Obuhashe bwahebwa",
    reports: "Rapports",
    total_women: "Bamyere Boshi",
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

function KickCounterCard({ t }: { t: any }) {
  const [kicks, setKicks] = useState(0);
  const [isCounting, setIsCounting] = useState(false);

  return (
    <div className="bg-white/10/40 p-6 rounded-[2rem] shadow-sm border border-white/5 flex flex-col items-center justify-center text-center group h-full">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-500 ${isCounting ? 'bg-brand-primary text-gray-900 animate-pulse scale-110 shadow-lg shadow-brand-primary/20' : 'bg-brand-primary/10 text-brand-primary'}`}>
        <Activity size={24} />
      </div>
      <p className="text-[10px] font-black uppercase text-brand-primary/70 tracking-[0.3em] mb-1 italic">{t.kick_counter}</p>
      <p className="text-2xl font-black text-white leading-none border-none">{kicks}</p>
      
      <div className="flex gap-2 mt-4">
        {!isCounting ? (
          <button 
            onClick={() => setIsCounting(true)}
            className="text-[10px] font-black uppercase bg-white/5 px-4 py-2 rounded-xl text-brand-primary hover:bg-white/10 transition-colors"
          >
            {t.start_counting}
          </button>
        ) : (
          <div className="flex gap-2">
            <button 
              onClick={() => setKicks(k => k + 1)}
              className="w-10 h-10 bg-brand-primary text-gray-900 rounded-xl flex items-center justify-center shadow-lg active:scale-90 transition-transform"
            >
              +1
            </button>
            <button 
              onClick={() => setIsCounting(false)}
              className="text-[10px] font-black uppercase bg-red-400/10 px-4 py-2 rounded-xl text-red-400"
            >
              {t.stop_counting}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function NavButton({ active, icon: Icon, label, onClick }: { active: boolean, icon: any, label: string, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 transition-all duration-300 ${active ? 'text-brand-primary scale-110' : 'text-brand-primary/70 hover:text-brand-primary'}`}
    >
      <Icon size={18} className={active ? 'fill-brand-primary/20' : ''} />
      <span className="text-[10px] mt-1 font-black uppercase tracking-widest">{label}</span>
    </button>
  );
}

function AdminView({ language, db, logout }: { language: Language, db: any, logout: () => void }) {
  const t = translations[language];
  const [patients, setPatients] = useState<Patient[]>([]);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'patients' | 'hospitals' | 'emergencies'>('overview');
  const [newHospital, setNewHospital] = useState({ name: '', location: '', phone: '' });

  useEffect(() => {
    // Real-time patients
    const unsubPatients = onSnapshot(collection(db, 'users'), (snap) => {
      setPatients(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Patient)));
    }, (error) => {
      handleFirestoreError(error, 'get', 'users');
    });
    
    // Real-time hospitals
    const unsubHospitals = onSnapshot(collection(db, 'hospitals'), (snap) => {
      setHospitals(snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as Hospital)));
    }, (error) => {
      handleFirestoreError(error, 'get', 'hospitals');
    });

    return () => {
      unsubPatients();
      unsubHospitals();
    };
  }, [db]);

  const handleAddHospital = async () => {
    if (!newHospital.name || !newHospital.location) return;
    await addDoc(collection(db, 'hospitals'), newHospital);
    setNewHospital({ name: '', location: '', phone: '' });
  };

  return (
    <div className="p-6 space-y-8 max-w-6xl mx-auto min-h-screen pb-32">
       <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/5 p-5 rounded-[1.5rem] border border-white/5 shadow-xl">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 bg-brand-primary rounded-[0.75rem] flex items-center justify-center text-gray-900">
                <ShieldCheck size={20} />
             </div>
             <div>
                <h2 className="text-xl font-black text-white leading-none">{t.admin_title}</h2>
                <p className="text-[9px] font-black text-brand-primary uppercase tracking-widest mt-1">{t.access_granted}</p>
             </div>
          </div>
          <button 
            onClick={logout}
            className="px-6 py-3 bg-red-500/10 text-red-500 rounded-full font-black uppercase tracking-widest hover:bg-red-500/20 transition-all text-xs"
          >
            Déconnexion
          </button>
       </header>

       <div className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          {['overview', 'patients', 'hospitals', 'emergencies'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab as any)}
              className={`px-6 py-3 rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap ${
                activeSubTab === tab ? 'bg-brand-primary text-gray-900' : 'bg-white/5 text-white'
              }`}
            >
              {t[`${tab}_management` as keyof typeof t] || t[tab as keyof typeof t] || tab}
            </button>
          ))}
       </div>

       {activeSubTab === 'overview' && (
         <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
               <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-4">{t.total_women}</p>
               <h3 className="text-6xl font-black text-white leading-none">{patients.length}</h3>
            </div>
            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
               <p className="text-[10px] font-black text-white/50 uppercase tracking-widest mb-4">{t.hospitals_management}</p>
               <h3 className="text-6xl font-black text-white leading-none">{hospitals.length}</h3>
            </div>
         </div>
       )}

       {activeSubTab === 'patients' && (
         <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
            <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest">{t.all_patients}</h2>
            <div className="space-y-4">
              {patients.map(p => (
                <div key={p.id} className="flex justify-between items-center p-4 bg-white/5 rounded-xl border border-white/5">
                  <span className="font-bold text-white">{p.name}</span>
                  <span className="text-xs text-white/50">{p.id}</span>
                </div>
              ))}
            </div>
         </div>
       )}

       {activeSubTab === 'hospitals' && (
         <div className="space-y-6">
            <div className="bg-white/5 p-8 rounded-[2rem] border border-white/5">
               <h2 className="text-xl font-black text-white mb-6 uppercase tracking-widest">Ajouter Hôpital</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <input placeholder="Nom" className="bg-white/10 p-4 rounded-xl text-white" value={newHospital.name} onChange={e => setNewHospital({...newHospital, name: e.target.value})} />
                  <input placeholder="Lieu" className="bg-white/10 p-4 rounded-xl text-white" value={newHospital.location} onChange={e => setNewHospital({...newHospital, location: e.target.value})} />
                  <input placeholder="Téléphone" className="bg-white/10 p-4 rounded-xl text-white" value={newHospital.phone} onChange={e => setNewHospital({...newHospital, phone: e.target.value})} />
               </div>
               <button onClick={handleAddHospital} className="mt-4 px-6 py-3 bg-brand-primary text-gray-900 rounded-xl font-black uppercase tracking-widest">Ajouter</button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {hospitals.map(h => (
                <div key={h.id} className="bg-white/5 p-6 rounded-[2rem] border border-white/5">
                   <h4 className="font-black text-white text-lg">{h.name}</h4>
                   <p className="text-xs text-white/50">{h.location}</p>
                   <p className="text-xs text-brand-primary mt-2">{h.phone}</p>
                </div>
              ))}
            </div>
         </div>
       )}

    </div>
  );
}

// --- Main App Component ---

export default function App() {
  const { user, loading, googleLogin, logout: googleLogout } = useAuth();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<'home' | 'checkup' | 'education' | 'profile' | 'record' | 'admin'>('home');
  const [isAdmin, setIsAdmin] = useState(false);
  const [logs, setLogs] = useState<CheckupLog[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [language, setLanguage] = useState<Language>('FR');
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const t = translations[language];

  // Logic to load data on mount
  useEffect(() => {
    if (!user || !patient?.id) return;

    // Sync patient data
    const unsubPatient = onSnapshot(doc(db, 'users', patient.id), (snap) => {
      if (snap.exists()) {
        const p = snap.data() as Patient;
        setPatient(p);
        setIsAdmin(!!p.isAdmin);
        if (p.language) setLanguage(p.language as Language);
        localStorage.setItem('uzazi_patient', JSON.stringify(p));
      }
    }, (error) => {
      handleFirestoreError(error, 'get', `users/${patient.id}`);
    });

    // Sync logs
    const q = query(collection(db, 'users', patient.id, 'logs'), orderBy('createdAt', 'desc'));
    const unsubLogs = onSnapshot(q, (snap) => {
      const logsData = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as CheckupLog));
      setLogs(logsData);
      localStorage.setItem('uzazi_logs', JSON.stringify(logsData));
    }, (error) => {
      handleFirestoreError(error, 'get', `users/${patient.id}/logs`);
    });

    return () => {
      unsubPatient();
      unsubLogs();
    };
  }, [user, patient?.id]);

  const [pendingName, setPendingName] = useState<string>('');
  const handleLogin = async (name: string) => {
    const rawName = name.trim();
    if (!rawName) return;

    setIsLoggingIn(true);
    setError(null);
    try {
      console.log('handleLogin started with name:', rawName);
      try {
        if (!user) {
          console.log('Not logged in, calling googleLogin');
          await googleLogin();
          console.log('googleLogin completed successfully, waiting for auth state');
          await new Promise(resolve => setTimeout(resolve, 1000)); // Delay to allow auth state update
          console.log('Auth check:', auth.currentUser ? 'Auth' : 'No Auth');
        } else {
          console.log('User is already logged in');
        }
      } catch (authError: any) {
        console.error('Auth error in handleLogin:', authError);
        setError(authError.message);
        setIsLoggingIn(false);
        return;
      }
      
      if (rawName.toLowerCase() === '@admin') {
         console.log('Admin login detected');
         setIsAdmin(true);
         setActiveTab('admin');
         setShowOnboarding(false);
         setPatient({ id: '@admin', name: '@admin', isAdmin: true } as any);
         return;
      }
      
      const slug = slugify(rawName, { lower: true, strict: true });
      console.log('Looking up user with slug:', slug);
      const userDoc = await getDoc(doc(db, 'users', slug));
      console.log('Lookup finished. Exists:', userDoc.exists());
      
      if (userDoc.exists()) {
        const p = userDoc.data() as Patient;
        p.id = slug;
        setPatient(p);
        setIsAdmin(!!p.isAdmin);
        if (p.language) setLanguage(p.language as Language);
        setShowOnboarding(false);
        localStorage.setItem('uzazi_patient', JSON.stringify(p));
        localStorage.setItem('uzazi_saved_name', rawName);
      } else {
        console.log('User does not exist, showing onboarding');
        setPendingName(rawName);
        setShowOnboarding(true);
      }
    } catch (e: any) {
      console.error("Login error:", e);
      setError("Erreur de connexion. Vérifiez votre configuration Firebase.");
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await googleLogout();
    setPatient(null);
    setLogs([]);
    localStorage.removeItem('uzazi_patient');
    localStorage.removeItem('uzazi_logs');
    setIsAdmin(false);
    setActiveTab('home');
    setShowOnboarding(false);
  };

  const handleLanguageChange = async (lang: Language) => {
    setLanguage(lang);
    if (user && patient) {
      try {
        const updatedPatient = { ...patient, language: lang };
        setPatient(updatedPatient);
        localStorage.setItem('uzazi_patient', JSON.stringify(updatedPatient));
        
        await updateDoc(doc(db, 'users', updatedPatient.id), {
          language: lang,
          updatedAt: serverTimestamp()
        });
      } catch (e) {
        console.error("Failed to update language in Firestore", e);
      }
    }
  };

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
            weight: 65, // Default for shared record
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
      const p = JSON.parse(saved);
      setPatient(p);
      setIsAdmin(!!p.isAdmin);
      if (!!p.isAdmin) setActiveTab('admin');
    } else {
      // Do nothing, let the user trigger onboarding via Login if necessary
    }

    const savedLogs = localStorage.getItem('uzazi_logs');
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
  }, []);

  const handleRegister = async (name: string, phone: string, lmp: string, hospitalId: string) => {
    console.log('handleRegister called', { name, phone, lmp, hospitalId, user: user?.uid });
    if (!user) {
      console.error('handleRegister: No user found');
      setError("Erreur d'authentification. Veuillez vous reconnecter.");
      return;
    }
    setIsRegistering(true);
    setError(null);
    const slug = slugify(name, { lower: true, strict: true });
    try {
      console.log('slug:', slug);
      const newPatient: Patient = {
        id: slug,
        name,
        email: user.email || '',
        phone,
        weight: 65,
        lastPeriodDate: lmp,
        dueDate: calculateDueDate(lmp),
        weeksPregnant: calculateWeeksPregnant(lmp),
        assignedHospitalId: hospitalId,
        language: language,
        isAdmin: false,
      };
      
      console.log('Attempting to set doc:', `users/${slug}`);
      await setDoc(doc(db, 'users', slug), {
        ...newPatient,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      console.log('Set doc successful');
      
      setPatient(newPatient);
      localStorage.setItem('uzazi_patient', JSON.stringify(newPatient));
      localStorage.setItem('uzazi_saved_name', name);
      setShowOnboarding(false);
    } catch (e: any) {
      console.error("Registration error:", e);
      handleFirestoreError(e, 'create', `users/${slug}`);
      setError("Erreur d'inscription. Veuillez réessayer.");
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAddLog = async (newLog: { symptoms: string[], bloodPressure?: string, weight?: number, notes?: string }) => {
    if (!user || !patient) return;
    
    setIsAnalyzing(true);
    setActiveTab('home'); 

    try {
      const aiResult = await analyzeSymptoms(newLog, language);

      const logData = {
        ...newLog,
        bloodPressure: newLog.bloodPressure || null,
        weight: newLog.weight || null,
        notes: newLog.notes || "",
        patientId: patient.id,
        date: new Date().toISOString(),
        status: aiResult.status as HealthStatus,
        aiAnalysis: aiResult.analysis,
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'users', patient.id, 'logs'), logData);
    } catch (e: any) {
      console.error("Failed to save log", e);
      handleFirestoreError(e, 'create', `users/${patient.id}/logs`);
      setError("Erreur lors de la sauvegarde du bilan. Veuillez réessayer.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <Loader2 className="text-brand-primary animate-spin" size={48} />
      </div>
    );
  }

  if (showOnboarding) {
    return <Onboarding onRegister={handleRegister} language={language} initialName={pendingName || ''} isLoading={isRegistering} error={error} />;
  }

  if (!user || !patient) {
    return <Login onLogin={handleLogin} language={language} isLoading={isLoggingIn} error={error} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-app-bg dark font-sans selection:bg-brand-primary/30">
      {/* Header */}
      <header className="sticky top-0 w-full bg-gray-900/80 backdrop-blur-xl border-b border-white/5 flex justify-center z-[100]">
        <div className="w-full max-w-5xl px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-gray-900 shadow-lg shadow-brand-primary/20">
              <Heart size={24} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-xl font-display font-black text-white border-none leading-none tracking-tighter">UZAZI</h1>
              <p className="text-[8px] font-black tracking-[0.3em] text-brand-primary/60 uppercase">{t.app_tagline}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 md:gap-4">
             {!isAdmin && (
              <button 
               onClick={() => {
                 const hospital = HOSPITALS.find(h => h.id === (patient as any).assignedHospitalId);
                 if (hospital) window.location.href = `tel:${hospital.emergencyContact}`;
               }}
               className="bg-red-400/10 text-red-400 p-2.5 rounded-xl hover:bg-red-400/20 transition-colors shadow-lg"
               title={(translations[language] as any).call_hospital}
             >
               <Phone size={18} />
             </button>
             )}

            <div className="relative">
              <button 
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <Languages size={14} className="text-brand-primary" />
                <span className="text-[10px] font-black tracking-widest text-white">{language}</span>
                <ChevronDown size={14} className={`text-brand-primary transition-transform ${isLanguageMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              
              <AnimatePresence>
                {isLanguageMenuOpen && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-32 bg-white/10 border border-white/10 rounded-2xl shadow-2xl z-[110] py-2"
                  >
                    {(['FR', 'SW', 'MSH'] as Language[]).map(lang => (
                      <button 
                        key={lang}
                        onClick={() => {
                          handleLanguageChange(lang);
                          setIsLanguageMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-[10px] font-black tracking-widest hover:bg-brand-primary/10 transition-colors ${language === lang ? 'text-brand-primary' : 'text-brand-primary'}`}
                      >
                        {lang === 'FR' ? t.french : lang === 'SW' ? t.swahili : t.mashi}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
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
              className="max-w-6xl mx-auto w-full"
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
              className="max-w-6xl mx-auto w-full"
            >
              <ProfileView patient={patient!} logs={logs} onLogout={handleLogout} language={language} onTabChange={setActiveTab} />
            </motion.div>
          )}
          {activeTab === 'admin' && isAdmin && (
            <motion.div
              key="admin"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="max-w-6xl mx-auto w-full"
            >
              <AdminView language={language} db={db} logout={googleLogout} />
            </motion.div>
          )}
          {activeTab === 'record' && (
            <motion.div
              key="record"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-6xl mx-auto w-full"
            >
              <RecordView patient={patient!} logs={logs} language={language} onBack={() => setActiveTab('home')} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Bar */}
      {activeTab !== 'record' && !isAdmin && (
        <div className="sticky bottom-0 left-0 right-0 z-[100] p-4 flex justify-center pointer-events-none">
          <nav className="max-w-lg w-full bg-gray-900/90 backdrop-blur-2xl border border-white/10 px-3 py-2 flex justify-between items-center rounded-[1.5rem] shadow-xl pointer-events-auto">
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

function Login({ onLogin, language, isLoading, error }: { onLogin: (name: string) => void, language: Language, isLoading: boolean, error: string | null }) {
  const t = translations[language];
  const [name, setName] = useState('');

  const handleSubmit = (e: any) => {
    e.preventDefault();
    if (name.trim()) onLogin(name.trim());
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-green-900/20 via-gray-900 to-gray-900">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-brand-primary/20 rounded-[2rem] flex items-center justify-center text-brand-primary mb-6 mx-auto shadow-2xl">
            <Baby size={48} className="animate-pulse" />
          </div>
          <h1 className="text-4xl font-display font-black text-white border-none tracking-tight">UZAZI SALAMA</h1>
          <p className="text-brand-primary font-medium">{t.app_subtitle}</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white/5 p-8 rounded-[3rem] border border-white/10 space-y-6 backdrop-blur-xl">
          {error && (
            <p className="text-red-400 text-xs font-bold text-center animate-shake">{error}</p>
          )}

          <div className="space-y-2">
            <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] font-sans italic">
              {t.full_name || "Nom Complet"}
            </label>
            <input 
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Ex: Zawadi"
              className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 text-white placeholder-gray-600 focus:bg-white/10 focus:ring-2 focus:ring-brand-primary focus:outline-none font-bold"
              disabled={isLoading}
            />
          </div>

          <button 
            type="submit"
            disabled={isLoading || !name.trim()}
            className="w-full bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-black py-5 rounded-2xl shadow-xl shadow-brand-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <ShieldCheck size={20} />}
            {!isLoading && (t.start_tracking || "Continuer")}
          </button>
        </form>
      </motion.div>
    </div>
  );
}

function Onboarding({ onRegister, language, initialName, isLoading, error: parentError }: { onRegister: (name: string, phone: string, lmp: string, hospitalId: string) => void, language: Language, initialName: string, isLoading: boolean, error: string | null }) {
  const t = translations[language];
  const [formData, setFormData] = useState({
    name: initialName || '',
    phone: '',
    lmp: '',
    hospitalId: HOSPITALS[0].id
  });
  const [localError, setLocalError] = useState('');
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const displayError = localError || parentError;

  const handleNext = () => {
    console.log('handleNext called, step:', step, 'totalSteps:', totalSteps);
    setLocalError('');
    if (step === 1) {
      if (!formData.name.trim()) {
        setLocalError(t.full_name || "Nom requis / Name required");
        return;
      }
      if (!formData.phone.trim()) {
        setLocalError(t.phone_label || "Téléphone requis / Phone required");
        return;
      }
    }
    if (step === 2) {
      const lmpDate = new Date(formData.lmp);
      const today = new Date();
      const tenMonthsAgo = new Date();
      tenMonthsAgo.setMonth(today.getMonth() - 10);
      
      if (!formData.lmp || lmpDate > today || lmpDate < tenMonthsAgo || isNaN(lmpDate.getTime())) {
        setLocalError(t.invalid_date || "Date invalide");
        return;
      }
    }
    
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      console.log('Registering with:', formData);
      onRegister(formData.name, formData.phone, formData.lmp, formData.hospitalId);
    }
  };

  const handleBack = () => {
    setLocalError('');
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-app-bg p-8">
      {/* Progress Dots */}
      <div className="flex gap-2 mb-12 justify-center mt-6">
        {[...Array(totalSteps)].map((_, i) => (
          <div 
            key={i} 
            className={`h-1.5 rounded-full transition-all duration-500 ${i + 1 === step ? 'w-8 bg-brand-primary' : i + 1 < step ? 'w-4 bg-brand-primary/50' : 'w-4 bg-white/10'}`} 
          />
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
          className="flex-1 flex flex-col"
        >
          {step === 1 && (
            <div className="space-y-6 flex-1">
              <div className="w-16 h-16 bg-brand-primary/20 rounded-2xl flex items-center justify-center text-brand-primary mb-6 shadow-xl shadow-brand-primary/10">
                <User size={32} />
              </div>
              <h2 className="text-3xl font-display font-black text-white leading-tight mb-2">Bienvenue !<br/>Faisons connaissance.</h2>
              <p className="text-brand-primary/60 text-sm mb-8 font-medium">Commençons par les bases de votre identité.</p>

              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-3 font-sans italic">{t.full_name || "Nom Complet"}</label>
                  <input 
                    type="text" 
                    placeholder={t.full_name_placeholder || "Ex: Zawadi"}
                    className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 text-white placeholder-gray-600 focus:bg-white/10 focus:ring-2 focus:ring-brand-primary focus:outline-none font-bold transition-all"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-3 font-sans italic">{t.phone_label}</label>
                  <input 
                    type="tel" 
                    placeholder="+243 ..."
                    className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 text-white placeholder-gray-600 focus:bg-white/10 focus:ring-2 focus:ring-brand-primary focus:outline-none font-bold transition-all"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 flex-1">
              <div className="w-16 h-16 bg-brand-primary/20 rounded-2xl flex items-center justify-center text-brand-primary mb-6 shadow-xl shadow-brand-primary/10">
                <Calendar size={32} />
              </div>
              <h2 className="text-3xl font-display font-black text-white leading-tight mb-2">Votre Suivi</h2>
              <p className="text-brand-primary/60 text-sm mb-8 font-medium">Cela nous aide à personnaliser vos recommandations pour votre grossesse.</p>

              <div>
                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-3 font-sans italic">{t.lmp_date}</label>
                <input 
                  type="date" 
                  className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 text-white focus:bg-white/10 focus:ring-2 focus:ring-brand-primary focus:outline-none font-bold transition-all"
                  value={formData.lmp}
                  onChange={(e) => setFormData({...formData, lmp: e.target.value})}
                  disabled={isLoading}
                />
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 flex-1">
              <div className="w-16 h-16 bg-brand-primary/20 rounded-2xl flex items-center justify-center text-brand-primary mb-6 shadow-xl shadow-brand-primary/10">
                <MapPin size={32} />
              </div>
              <h2 className="text-3xl font-display font-black text-white leading-tight mb-2">Centre Médical</h2>
              <p className="text-brand-primary/60 text-sm mb-8 font-medium">Où souhaitez-vous être suivie ?</p>

              <div>
                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-3 font-sans italic">{t.medical_center}</label>
                <div className="relative">
                  <select 
                    className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 text-white focus:bg-white/10 focus:ring-2 focus:ring-brand-primary focus:outline-none appearance-none font-bold transition-all"
                    value={formData.hospitalId}
                    onChange={(e) => setFormData({...formData, hospitalId: e.target.value})}
                    disabled={isLoading}
                  >
                    {HOSPITALS.map(h => (
                      <option key={h.id} value={h.id} className="bg-gray-900">{h.name}</option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-5 top-1/2 -translate-y-1/2 text-brand-primary/70 pointer-events-none" size={18} />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8">
        {displayError && <p className="text-red-400 text-center text-[10px] font-bold mb-4 uppercase tracking-widest">{displayError}</p>}
        <div className="flex gap-4">
          {step > 1 && (
            <button 
              onClick={handleBack}
              disabled={isLoading}
              className="w-14 h-14 shrink-0 rounded-2xl border border-white/10 text-white flex items-center justify-center hover:bg-white/5 transition-all"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <motion.button 
            whileTap={{ scale: 0.95 }}
            disabled={isLoading}
            onClick={handleNext}
            className="flex-1 bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 h-14 rounded-2xl font-black shadow-2xl flex items-center justify-center gap-2 text-sm uppercase tracking-widest transition-all"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : (step === totalSteps ? t.start_tracking : t.continue)}
            {!isLoading && step < totalSteps && <ArrowRight size={18} />}
          </motion.button>
        </div>
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
  
  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    // Pick a random tip on mount
    setTipIndex(Math.floor(Math.random() * trimesterTips.length));

    // Auto-refresh tips every 5 minutes
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % trimesterTips.length);
    }, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, [patient.weeksPregnant]);

  const dailyTip = trimesterTips[tipIndex] || trimesterTips[0];

  const refreshTip = () => {
    let nextIndex;
    do {
      nextIndex = Math.floor(Math.random() * trimesterTips.length);
    } while (nextIndex === tipIndex && trimesterTips.length > 1);
    setTipIndex(nextIndex);
  };

  // Labor Prediction Logic
  const getLaborPrediction = () => {
    if (patient.weeksPregnant < 36) return null;
    
    // Simulate prediction based on weeks and random variance for demo
    const baseDate = new Date(patient.dueDate);
    const prediction = new Date(baseDate.getTime() + (Math.random() * 4 - 2) * 24 * 60 * 60 * 1000); // ±2 days from due date
    const hour = Math.floor(Math.random() * 24);
    prediction.setHours(hour, 0, 0, 0);
    
    return {
      date: prediction.toLocaleDateString(language === 'FR' ? 'fr-FR' : 'sw-KE'),
      time: `${hour}h00`
    };
  };

  const laborPrediction = getLaborPrediction();

  return (
    <div className="p-6 space-y-8 max-w-5xl mx-auto">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Prediction Card if near term */}
        {laborPrediction && (
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-12 bg-white p-6 rounded-[2.5rem] shadow-xl border-l-8 border-brand-primary flex items-center gap-6"
          >
            <div className="w-16 h-16 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary shrink-0">
               <Clock size={32} className="animate-pulse" />
            </div>
            <div>
              <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{t.predict_labor}</p>
              <h3 className="text-xl font-display font-black text-gray-900 border-none leading-tight">
                {laborPrediction.date} à {laborPrediction.time}
              </h3>
              <p className="text-[10px] text-brand-primary font-medium italic mt-1">{t.labor_prediction_desc}</p>
            </div>
          </motion.div>
        )}
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
              <h2 className="text-2xl md:text-3xl font-display font-black mt-2 border-none text-white leading-tight">{t.journey_label || t.journey}</h2>
              
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
                  <p className="text-[10px] font-bold opacity-60 mt-2">{t.dpa_label}: {new Date(patient.dueDate).toLocaleDateString()}</p>
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
          <div className="px-4">
             <h4 className="text-[10px] font-black uppercase text-brand-primary/70 tracking-[0.4em] italic">{t.current_health}</h4>
          </div>
          <AnimatePresence mode="wait">
            {isAnalyzing ? (
              <motion.div 
                key="analyzing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="bg-white/10 p-8 rounded-[2.5rem] flex flex-col items-center gap-6 text-center shadow-2xl border border-brand-primary/30 min-h-[200px] justify-center"
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
                <div className="bg-white/10/20 p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center text-center gap-4 min-h-[200px]">
                  <Heart className="text-gray-700" size={48} />
                  <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] italic">{t.start_checkup}</p>
                </div>
            )}
          </AnimatePresence>

          {/* Daily Tip Card */}
          <motion.div 
            layout
            className="bg-white/10/40 rounded-[2.5rem] border border-white/5 overflow-hidden shadow-sm group hover:border-brand-primary/30 transition-all duration-500"
          >
            <div className="relative bg-gray-800 flex items-center justify-center min-h-[192px] overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/10 to-transparent"></div>
               <Lightbulb className="text-brand-primary opacity-20 transform group-hover:scale-110 group-hover:opacity-100 transition-all duration-700" size={80} />
              <div className="absolute top-4 right-4 z-10">
                <button 
                  onClick={refreshTip}
                  className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-white hover:bg-brand-primary hover:text-gray-900 transition-all active:scale-90 shadow-xl border border-white/10"
                >
                  <RefreshCw size={20} className="hover:rotate-180 transition-transform duration-500" />
                </button>
              </div>
            </div>
            <div className="p-8 relative">
              <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-3">{t.conseil} — {t[dailyTip.category as keyof typeof t] || dailyTip.category}</p>
              <h3 className="font-display font-black text-white text-xl border-none leading-tight">{dailyTip.translations[language].title}</h3>
              <p className="text-brand-primary text-sm mt-4 leading-relaxed italic font-medium opacity-80">{dailyTip.translations[language].content}</p>
              
              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest italic">{t.refresh_tips}</span>
                <div className="flex gap-1">
                  {[0, 1, 2].map(i => (
                    <div key={i} className={`w-1 h-1 rounded-full ${i === tipIndex % 3 ? 'bg-brand-primary' : 'bg-gray-700'}`} />
                  ))}
                </div>
              </div>
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
      bloodPressure: bloodPressure || null,
      weight: weight ? parseFloat(weight) : null,
      notes: notes || null
    });
  };

  return (
    <div className="p-6 space-y-8 pb-32">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-3xl font-display font-black text-white border-none leading-tight">{t.diagnostic_title}</h2>
        <p className="text-brand-primary/70 text-sm mt-1 font-medium italic">{t.regular_suivi}</p>
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
                  : 'border-white/5 bg-white/10/40'
              }`}
            >
              <span className={`text-sm font-black uppercase tracking-widest text-left ${symptoms.includes(s.id) ? 'text-brand-primary' : 'text-brand-primary'}`}>{s.label}</span>
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
        <label className="block text-[10px] font-black text-brand-primary/70 uppercase tracking-[0.3em] mb-2">{t.note_label}</label>
        <textarea 
          placeholder={t.note_placeholder}
          rows={3}
          className="w-full px-5 py-4 rounded-[1.5rem] border border-white/5 focus:ring-2 focus:ring-brand-primary focus:outline-none bg-white/10/40 text-white text-sm font-medium leading-relaxed"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-[10px] font-black text-brand-primary/70 uppercase tracking-[0.3em] mb-2">{t.bp}</label>
          <input 
            type="text" 
            placeholder="12/8"
            className="w-full px-5 py-4 rounded-[1.5rem] border border-white/5 focus:ring-2 focus:ring-brand-primary focus:outline-none bg-white/10/40 text-white text-sm font-black tracking-widest placeholder-gray-700"
            value={bloodPressure}
            onChange={(e) => setBloodPressure(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-brand-primary/70 uppercase tracking-[0.3em] mb-2">{t.weight}</label>
          <input 
            type="number" 
            placeholder="65"
            className="w-full px-5 py-4 rounded-[1.5rem] border border-white/5 focus:ring-2 focus:ring-brand-primary focus:outline-none bg-white/10/40 text-white text-sm font-black tracking-widest placeholder-gray-700"
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
  const [tipIndex, setTipIndex] = useState(0);

  const currentTrimester = weeksPregnant <= 13 ? 1 : weeksPregnant <= 26 ? 2 : 3;
  const categories = ['nutrition', 'exercise', 'warning_signs', 'baby_growth', 'hygiene', 'mental_health'];
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTip, setAiTip] = useState<{title: string, content: string} | null>(null);

  const filteredArticles = EDUCATION_ARTICLES.filter(a => 
    (!selectedCategory || a.category === selectedCategory) &&
    (!a.trimester || a.trimester === currentTrimester)
  );

  const generateAIAdvice = async () => {
    setIsGenerating(true);
    setAiTip(null); // Reset
    try {
      const resp = await fetch('/api/generate-advice', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ trimester: currentTrimester, language })
      });
      const data = await resp.json();
      if (data.title) setAiTip(data);
    } catch (e) {
      console.error("AI Advice failed", e);
    } finally {
      setIsGenerating(false);
    }
  };

  // Rotation logic for the education view too
  useEffect(() => {
    const interval = setInterval(() => {
      setTipIndex(prev => (prev + 1) % Math.max(1, filteredArticles.length));
    }, 5 * 60 * 1000); // 5 minutes
    return () => clearInterval(interval);
  }, [filteredArticles.length]);

  const refreshTips = () => {
    setTipIndex(Math.floor(Math.random() * filteredArticles.length));
  };

  const featuredTip = filteredArticles[tipIndex] || filteredArticles[0];

  return (
    <div className="p-6 space-y-8 pb-32">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="flex justify-between items-end">
        <div>
          <h2 className="text-3xl font-display font-black text-white border-none leading-tight">{t.guide_maternel}</h2>
          <p className="text-brand-primary/70 text-sm mt-1 font-medium italic">{t.know_protect} ({t.trimester} {currentTrimester})</p>
        </div>
        <button 
          onClick={refreshTips}
          className="p-3 bg-white/5 rounded-2xl text-brand-primary hover:bg-brand-primary hover:text-gray-900 transition-all active:scale-90 border border-white/10"
        >
          <RefreshCw size={20} />
        </button>
      </motion.div>

      {/* AI Fresh Advice Modalish Display */}
      {aiTip && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 shadow-2xl relative overflow-hidden ring-4 ring-brand-primary/20 mb-8"
        >
          <div className="absolute top-4 right-4 flex items-center gap-2 px-3 py-1 rounded-full bg-brand-primary/10 border border-brand-primary/20">
            <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.2em]">{t.who_label}</span>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-brand-primary/20 rounded-2xl flex items-center justify-center text-brand-primary">
              <Sparkles size={24} />
            </div>
            <h3 className="text-xl font-display font-black text-gray-900 leading-tight">{aiTip.title}</h3>
            <p className="text-gray-600 font-medium leading-relaxed">{aiTip.content}</p>
            <button 
              onClick={() => setAiTip(null)}
              className="px-6 py-2 rounded-full border-2 border-gray-100 text-brand-primary font-bold text-xs hover:bg-gray-50 transition-colors"
            >
              {t.back}
            </button>
          </div>
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-brand-primary/5 rounded-full blur-2xl" />
        </motion.div>
      )}

      {/* Featured Rotating Advice */}
      {featuredTip && (
        <motion.div 
          key={featuredTip.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative bg-gradient-to-br from-brand-primary/20 to-gray-800/40 rounded-[2.5rem] border border-brand-primary/30 p-8 overflow-hidden group shadow-2xl"
        >
           <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-[2rem] bg-gray-900/50 flex items-center justify-center shrink-0 border-4 border-white/5 relative overflow-hidden group-hover:border-brand-primary/20 transition-colors duration-500">
                <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                <Lightbulb size={48} className="text-brand-primary z-10" />
              </div>
              <div className="space-y-4">
                <span className="inline-block px-4 py-1.5 rounded-full bg-brand-primary text-gray-900 text-[10px] font-black uppercase tracking-widest">{t[featuredTip.category as keyof typeof t] || featuredTip.category}</span>
                <h3 className="text-2xl font-display font-black text-white leading-tight">{featuredTip.translations[language].title}</h3>
                <p className="text-brand-primary text-lg leading-relaxed font-medium">{featuredTip.translations[language].content}</p>
              </div>
           </div>
           <div className="absolute top-0 right-0 w-32 h-32 bg-brand-primary/10 rounded-full blur-3xl -mr-16 -mt-16" />
        </motion.div>
      )}

      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar">
        <button 
          onClick={generateAIAdvice}
          disabled={isGenerating}
          className="shrink-0 px-6 py-4 rounded-2xl bg-brand-primary text-gray-900 font-black text-[10px] uppercase tracking-widest shadow-lg shadow-brand-primary/20 flex items-center gap-2 hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
        >
          <Sparkles size={14} className={isGenerating ? "animate-spin" : ""} />
          {isGenerating ? t.generating : t.generate_ai_advice}
        </button>
        <button 
          onClick={() => setSelectedCategory(null)}
          className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase shrink-0 transition-all ${!selectedCategory ? 'bg-brand-primary text-gray-900 shadow-lg' : 'bg-white/5 text-brand-primary border border-white/10'}`}
        >
          {t.all}
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase shrink-0 transition-all ${selectedCategory === cat ? 'bg-brand-primary text-gray-900 shadow-lg' : 'bg-white/5 text-brand-primary border border-white/10'}`}
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
              className="bg-white/10/40 rounded-[2.5rem] shadow-sm border border-white/5 relative overflow-hidden group flex flex-col"
            >
              <div className="p-8 flex-1">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 shadow-lg shrink-0 ${
                  ['nutrition', 'baby_growth', 'hygiene'].includes(article.category) ? 'bg-brand-primary/20 text-brand-primary' : 'bg-red-500/10 text-red-400'
                }`}>
                  {article.category === 'nutrition' ? <Droplets size={20} /> : <AlertCircle size={20} />}
                </div>
                <h3 className="font-display font-black text-white text-xl border-none leading-tight tracking-tight">{article.translations[language].title}</h3>
                <p className="text-brand-primary text-sm mt-4 leading-relaxed font-medium opacity-80">{article.translations[language].content}</p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProfileView({ patient, logs, onLogout, language, onTabChange }: { patient: Patient, logs: CheckupLog[], onLogout: () => void, language: Language, onTabChange: (tab: any) => void }) {
  const t = translations[language];
  const [showQR, setShowQR] = useState(false);
  const hospital = HOSPITALS.find(h => h.id === patient.assignedHospitalId);

  // Robust QR Code Generation
  const stringifyData = JSON.stringify({ 
    id: patient.id, 
    n: patient.name, 
    p: patient.phone, 
    w: patient.weeksPregnant,
      l: logs.slice(0, 3).map(l => ({ 
        d: l.date, 
        s: l.status, 
        a: l.aiAnalysis ? l.aiAnalysis.substring(0, 80) + '...' : '' 
      })) 
    });
  
  const encodedData = btoa(encodeURIComponent(stringifyData).replace(/%([0-9A-F]{2})/g, (match, p1) => String.fromCharCode(parseInt(p1, 16))));
  const recordLink = `${window.location.origin}${window.location.pathname}?record=${encodedData}`;

  return (
    <div className="p-4 md:p-8 space-y-8 pb-32 max-w-6xl mx-auto w-full">
      {/* Profil Header Adaptive */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col lg:flex-row lg:items-start items-center gap-10 bg-white/10/20 p-8 md:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -mr-32 -mt-32" />
        
        <div className="w-32 h-32 md:w-48 md:h-48 bg-white p-2 rounded-full flex items-center justify-center shrink-0 ring-8 ring-brand-primary/10 shadow-2xl relative z-10 transition-transform hover:scale-105 duration-700">
          <div className="w-full h-full rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
            <User size={64} className="text-gray-400" />
          </div>
          <motion.div 
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 2 }}
            className="absolute -bottom-1 -right-1 w-12 h-12 bg-brand-primary rounded-2xl border-4 border-gray-900 flex items-center justify-center text-gray-900 shadow-xl"
          >
            <Heart size={24} fill="currentColor" />
          </motion.div>
        </div>

        <div className="flex-1 space-y-6 text-center lg:text-left relative z-10 w-full">
          <div className="space-y-4">
             <div className="flex flex-col lg:flex-row lg:items-center gap-4 justify-center lg:justify-start">
               <h2 className="text-3xl md:text-5xl font-display font-black text-white border-none tracking-tight leading-none">{patient.name}</h2>
               <div className="w-fit mx-auto lg:mx-0">
                  <span className="inline-flex items-center gap-2 bg-brand-primary/20 text-brand-primary text-[10px] font-black px-4 py-2 rounded-full border border-brand-primary/30 uppercase tracking-[0.2em] shadow-lg whitespace-nowrap">
                  <ShieldCheck size={14} /> {t.followup_active}
                </span>
               </div>
             </div>
             <p className="text-[12px] font-black text-brand-primary/70 uppercase tracking-[0.4em] italic opacity-80">{patient.phone}</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mt-8">
             <div className="bg-white/10 p-4 md:p-5 rounded-[2rem] border border-white/5 flex flex-col items-center lg:items-start">
                <Calendar className="text-brand-primary mb-2" size={20} />
                <p className="text-[9px] font-black text-brand-primary/70 uppercase tracking-widest mb-1">{t.journey}</p>
                <p className="text-lg md:text-xl font-black text-white leading-none whitespace-nowrap">{patient.weeksPregnant} {t.weeks}</p>
             </div>
             <div className="bg-white/10 p-4 md:p-5 rounded-[2rem] border border-white/5 flex flex-col items-center lg:items-start max-w-full overflow-hidden">
                <MapPin className="text-blue-400 mb-2" size={20} />
                <p className="text-[9px] font-black text-brand-primary/70 uppercase tracking-widest mb-1 truncate w-full">{t.medical_record}</p>
                <p className="text-[11px] md:text-[12px] font-black text-white truncate w-full uppercase">{hospital?.name}</p>
             </div>
             <div className="bg-brand-primary p-4 md:p-5 rounded-[2rem] flex flex-col items-center lg:items-start group cursor-pointer hover:shadow-lg shadow-brand-primary/20 transition-all col-span-2 md:col-span-1" onClick={() => setShowQR(true)}>
                <QrCode className="text-gray-900 mb-2 group-hover:scale-110 transition-transform" size={20} />
                <p className="text-[9px] font-black text-gray-900/60 uppercase tracking-widest mb-1">{t.digital_pass}</p>
                <p className="text-[10px] md:text-[11px] font-black text-gray-900 uppercase tracking-widest">{t.show_qr}</p>
             </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 w-full">
        {/* Left Column: Stats & Tools */}
        <div className="xl:col-span-2 space-y-8">
           <div className="flex items-center justify-between px-4">
              <h4 className="text-[10px] font-black uppercase text-brand-primary/70 tracking-[0.4em] italic">{t.tools}</h4>
              {!patient.isAdmin && (
                <button 
                  onClick={() => {
                    const hospital = HOSPITALS.find(h => h.id === (patient as any).assignedHospitalId);
                    if (hospital) window.location.href = `tel:${hospital.emergencyContact}`;
                  }}
                  className="text-[9px] md:text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-2 bg-red-400/10 px-4 py-2 rounded-full border border-red-400/20"
                >
                  <Phone size={12} /> {t.emergency}
                </button>
              )}
           </div>
           
           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-2 gap-4 h-fit">
              <KickCounterCard t={t} />
              
              <div className="bg-white/10/20 p-6 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center text-center group hover:bg-white/5 transition-colors aspect-square lg:aspect-auto">
                <div className="w-12 h-12 bg-blue-400/10 text-blue-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Activity size={24} />
                </div>
                <p className="text-[10px] font-black text-brand-primary/70 uppercase tracking-widest mb-1 italic">{t.weight_track}</p>
                <p className="text-xl md:text-2xl font-black text-white">{patient.weight} kg</p>
              </div>

              <div className="bg-white/10/20 p-6 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center text-center group hover:bg-white/5 transition-colors aspect-square lg:aspect-auto">
                <div className="w-12 h-12 bg-red-400/10 text-red-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                  <Heart size={24} />
                </div>
                <p className="text-[10px] font-black text-brand-primary/70 uppercase tracking-widest mb-1 italic">{t.bp_track}</p>
                <p className="text-xl md:text-2xl font-black text-white">12/8</p>
              </div>

              <div className="bg-white/10/20 p-6 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center text-center opacity-40 aspect-square lg:aspect-auto">
                <div className="w-12 h-12 bg-purple-400/10 text-purple-400 rounded-2xl flex items-center justify-center mb-4">
                  <Clock size={24} />
                </div>
                <p className="text-[10px] font-black text-brand-primary/70 uppercase tracking-widest mb-1 italic">{t.contractions}</p>
                <p className="text-sm font-black text-white italic">{t.soon}</p>
              </div>
           </div>

           <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-brand-primary/70 tracking-[0.4em] px-4 italic">{t.medical_file}</h4>
              <div className="bg-white/10/20 p-8 rounded-[3rem] border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors" onClick={() => onTabChange('record')}>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                    <History size={24} />
                  </div>
                  <div>
                    <h5 className="text-sm font-black text-white uppercase tracking-widest">{t.medical_record}</h5>
                    <p className="text-[10px] text-brand-primary/70 font-bold opacity-60 uppercase">{t.see_details}</p>
                  </div>
                </div>
                <ChevronRight size={20} className="text-brand-primary/70" />
              </div>
           </div>

           <div className="space-y-4">
              <h4 className="text-[10px] font-black uppercase text-brand-primary/70 tracking-[0.4em] px-4 italic">{t.medical_history}</h4>
              <div className="space-y-3">
                {logs.length === 0 ? (
                  <div className="bg-white/10/20 p-12 rounded-[3.5rem] border border-dashed border-white/5 text-center">
                    <p className="text-sm text-gray-600 italic font-medium">{t.no_logs}</p>
                  </div>
                ) : (
                  logs.map((log) => (
                    <motion.div 
                      key={log.id} 
                      className="bg-white/10/30 p-6 md:p-8 rounded-[3rem] border border-white/5 hover:bg-white/10 transition-all group"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                         <span className="text-[10px] font-black text-brand-primary/70 uppercase tracking-widest">{new Date(log.date).toLocaleDateString(language === 'FR' ? 'fr-FR' : 'sw-KE')}</span>
                         <span className={`w-fit px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg ${
                             log.status === 'critical' ? 'bg-red-400 text-gray-900' : 
                             log.status === 'warning' ? 'bg-yellow-400 text-gray-900' : 
                             'bg-green-400 text-gray-900'
                          }`}>
                            {log.status === 'stable' ? t.stable : log.status === 'warning' ? t.vigilance : t.action}
                         </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {log.symptoms.map(s => (
                          <span key={s} className="bg-white/5 px-4 py-2 rounded-xl text-[10px] font-bold text-brand-primary border border-white/10 group-hover:bg-white/10 transition-colors uppercase tracking-widest leading-none">{s}</span>
                        ))}
                      </div>
                      <div className="bg-white/5 p-6 rounded-[2rem] relative overflow-hidden">
                         <BrainCircuit size={40} className="absolute right-[-10px] bottom-[-10px] text-white opacity-5" />
                         <p className="text-xs md:text-sm text-brand-primary leading-relaxed font-medium relative z-10">{log.aiAnalysis}</p>
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
           </div>
        </div>

        {/* Right Column: Pass QR Section */}
        <div className="space-y-8">
           <h4 className="text-[10px] font-black uppercase text-brand-primary/70 tracking-[0.4em] px-4 italic">{t.digital_pass}</h4>
           
           <div className="bg-white/10/20 p-5 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
              <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-transparent opacity-50 transition-opacity group-hover:opacity-100" />
              
              <div className="relative z-10 space-y-4">
                <button 
                  onClick={() => setShowQR(!showQR)}
                  className={`w-full py-6 rounded-[2.5rem] font-black flex items-center justify-center gap-4 transition-all duration-500 text-sm tracking-widest ${
                    showQR ? 'bg-white text-gray-900 shadow-2xl scale-[1.02]' : 'bg-brand-primary text-gray-900 shadow-xl shadow-brand-primary/20'
                  }`}
                >
                  <QrCode size={24} />
                  {showQR ? t.hide_fiche.toUpperCase() : t.pass_qr.toUpperCase()}
                </button>

                <AnimatePresence>
                  {showQR && (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.9, height: 0 }}
                      animate={{ opacity: 1, scale: 1, height: 'auto' }}
                      exit={{ opacity: 0, scale: 0.9, height: 0 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-white p-8 md:p-12 rounded-[3.5rem] mt-4 flex flex-col items-center relative overflow-hidden group/qr shadow-inner">
                        {/* Adaptive Professional Frame */}
                        <div className="absolute inset-0 bg-brand-primary/5 opacity-0 group-hover/qr:opacity-100 transition-opacity pointer-events-none" />
                        
                        <div className="relative bg-white p-4 rounded-[2rem] shadow-2xl transition-all duration-700 hover:rotate-1 hover:scale-105 border-4 border-brand-primary/5">
                           <QRCodeCanvas 
                            value={recordLink} 
                            size={220} 
                            level="H" 
                            className="max-w-full h-auto"
                            imageSettings={{
                                src: "https://cdn-icons-png.flaticon.com/512/3063/3063822.png", 
                                height: 40,
                                width: 40,
                                excavate: true,
                            }}
                          />
                          {/* Adaptive Corner Accents */}
                          <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-brand-primary/40 rounded-tl-[1.5rem]" />
                          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-brand-primary/40 rounded-br-[1.5rem]" />
                        </div>

                        <div className="text-center space-y-4 mt-8 relative z-10 w-full">
                          <div className="flex items-center justify-center gap-3">
                            <span className="h-[1px] flex-1 bg-gray-100" />
                            <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.4em] px-4 py-2 bg-brand-primary/10 rounded-full">{t.id_label}: {patient.id.toUpperCase()}</p>
                            <span className="h-[1px] flex-1 bg-gray-100" />
                          </div>
                          <p className="text-[10px] md:text-[11px] font-black text-brand-primary uppercase tracking-[0.2em] leading-relaxed max-w-[280px] mx-auto opacity-70 italic">
                            {t.scan_info}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
           </div>

           <div className="bg-white/10/20 p-8 md:p-10 rounded-[3.5rem] border border-white/5 space-y-10">
              <div>
                <p className="text-[10px] font-black text-brand-primary/70 uppercase tracking-[0.4em] mb-6 italic">{t.medical_record}</p>
                <div className="space-y-4">
                   <div className="flex items-center gap-5 bg-white/10 p-5 rounded-[2rem] border border-white/5 hover:bg-white/5 transition-all group">
                      <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary shadow-inner group-hover:scale-110 transition-transform">
                         <MapPin size={28} />
                      </div>
                      <div className="flex-1 overflow-hidden">
                         <p className="text-sm font-black text-white border-none leading-none truncate uppercase tracking-widest">{hospital?.name}</p>
                         <p className="text-[10px] text-brand-primary/70 font-bold mt-2 opacity-60 uppercase">{hospital?.location}</p>
                      </div>
                   </div>
                   
                   <button 
                     onClick={() => window.location.href = `tel:${hospital?.emergencyContact}`}
                     className="w-full flex items-center gap-5 bg-red-400/5 p-5 rounded-[2rem] border border-red-400/10 hover:bg-red-400/10 transition-all group"
                   >
                      <div className="w-14 h-14 bg-red-400/10 rounded-2xl flex items-center justify-center text-red-400 shadow-inner group-hover:animate-bounce">
                         <Phone size={28} />
                      </div>
                      <div className="flex-1 text-left">
                         <p className="text-sm font-black text-white border-none leading-none uppercase tracking-widest">{t.emergency_contact}</p>
                         <p className="text-[10px] text-brand-primary/70 font-bold mt-2 opacity-60 uppercase">{hospital?.emergencyContact}</p>
                      </div>
                   </button>
                </div>
              </div>

              <motion.button 
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onLogout}
                className="w-full py-5 rounded-[2rem] text-[10px] font-black text-gray-600 uppercase tracking-[0.5em] flex items-center justify-center gap-3 hover:bg-red-400/10 hover:text-red-400 transition-all border border-white/5 shadow-lg"
              >
                <LogOut size={16} className="opacity-50" />
                {t.logout}
              </motion.button>
           </div>
        </div>
      </div>
    </div>
  );
}

function RecordView({ patient, logs, language, onBack }: { patient: Patient, logs: CheckupLog[], language: Language, onBack: () => void }) {
  const t = translations[language];
  const hospital = HOSPITALS.find(h => h.id === patient.assignedHospitalId);

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-900 min-h-screen">
      <header className="flex items-center justify-between gap-4 max-w-4xl mx-auto w-full">
        <button onClick={onBack} className="p-3 bg-white/5 rounded-2xl text-white hover:bg-white/10 transition-colors shadow-lg border border-white/5">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-widest">{t.medical_record}</h2>
        <div className="w-10 md:w-12 h-10 md:h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-gray-900 shadow-xl">
           <Quote size={20} fill="currentColor" />
        </div>
      </header>

      <div className="bg-white rounded-[3rem] p-8 md:p-12 text-gray-900 shadow-2xl shadow-black/50 max-w-4xl mx-auto w-full relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[5rem]" />
        
        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 relative z-10">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-[2.5rem] flex items-center justify-center text-brand-primary overflow-hidden ring-8 ring-gray-50 shadow-inner">
             <User size={48} className="text-brand-primary/50" />
          </div>
          <div className="text-center md:text-left space-y-2">
            <h3 className="text-3xl md:text-5xl font-display font-black tracking-tight leading-none">{patient.name}</h3>
            <p className="text-[12px] font-black text-brand-primary uppercase tracking-[0.4em] italic">{patient.phone}</p>
            <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-2">
               <span className="bg-gray-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-primary/70 border border-gray-200">{t.id_label}: {patient.id.toUpperCase()}</span>
               <span className="bg-green-500/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-green-600 border border-green-500/20">{t.followup_active}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
           <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
              <p className="text-[9px] font-black uppercase text-brand-primary tracking-widest mb-2">{t.weeks}</p>
              <p className="text-2xl font-black text-gray-900 leading-none">{patient.weeksPregnant}</p>
           </div>
           <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
              <p className="text-[9px] font-black uppercase text-brand-primary tracking-widest mb-2">{t.weight}</p>
              <p className="text-2xl font-black text-gray-900 leading-none">{patient.weight} kg</p>
           </div>
           <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
              <p className="text-[9px] font-black uppercase text-brand-primary tracking-widest mb-2">{t.dpa_label}</p>
              <p className="text-lg font-black text-gray-900 leading-none uppercase tracking-tight">{new Date(patient.dueDate).toLocaleDateString()}</p>
           </div>
           <div className="bg-brand-primary p-6 rounded-[2rem] shadow-lg shadow-brand-primary/20">
              <p className="text-[9px] font-black uppercase text-gray-900/60 tracking-widest mb-2">{t.risk}</p>
              <p className="text-2xl font-black text-gray-900 leading-none uppercase tracking-tighter">{t.normal}</p>
           </div>
        </div>

        <div className="space-y-12">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
              <div className="space-y-4">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-brand-primary/20 rounded-xl flex items-center justify-center text-brand-primary">
                       <MapPin size={16} />
                    </div>
                    <h4 className="text-[11px] font-black uppercase text-gray-900 tracking-[0.2em]">{t.medical_record}</h4>
                 </div>
                 <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                    <p className="text-sm font-black text-gray-900 uppercase tracking-widest">{hospital?.name}</p>
                    <p className="text-[11px] text-brand-primary font-bold mt-2 opacity-80 uppercase leading-relaxed">{hospital?.location}</p>
                 </div>
              </div>

              <div className="space-y-4">
                 <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-red-400/20 rounded-xl flex items-center justify-center text-red-500">
                       <Phone size={16} />
                    </div>
                    <h4 className="text-[11px] font-black uppercase text-gray-900 tracking-[0.2em]">{t.emergency_contact}</h4>
                 </div>
                 <div className="bg-red-500/5 p-6 rounded-[2rem] border border-red-500/10">
                    <p className="text-sm font-black text-gray-900 uppercase tracking-widest">{t.direct_line}</p>
                    <p className="text-[11px] text-red-500 font-black mt-2 uppercase tracking-widest">{hospital?.emergencyContact}</p>
                 </div>
              </div>
           </div>

           <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                 <div className="w-8 h-8 bg-blue-400/20 rounded-xl flex items-center justify-center text-blue-500">
                    <History size={16} />
                 </div>
                 <h4 className="text-[11px] font-black uppercase text-gray-900 tracking-[0.2em]">{t.medical_history}</h4>
              </div>
              
              {logs.length === 0 ? (
                <div className="bg-gray-50 p-12 rounded-[3rem] border border-dashed border-gray-200 text-center">
                  <p className="text-sm text-brand-primary italic font-bold">{t.no_logs}</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {logs.map((log) => (
                    <div key={log.id} className="bg-gray-50 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 hover:border-gray-300 transition-colors group">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                         <div className="flex items-center gap-3">
                            <span className="w-2 h-2 rounded-full bg-brand-primary" />
                            <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">{new Date(log.date).toLocaleDateString()}</p>
                         </div>
                         <span className={`text-[9px] font-black px-5 py-2 rounded-full uppercase tracking-widest shadow-sm ${
                            log.status === 'critical' ? 'bg-red-500 text-white' : 
                            log.status === 'warning' ? 'bg-yellow-400 text-gray-900' : 
                            'bg-green-500 text-white'
                         }`}>
                            {log.status === 'stable' ? t.stable : log.status === 'warning' ? t.vigilance : t.action}
                         </span>
                      </div>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {log.symptoms.map(s => (
                          <span key={s} className="bg-white px-4 py-2 rounded-xl text-[10px] font-black text-brand-primary/70 border border-gray-100 uppercase tracking-widest shadow-sm leading-none">{s}</span>
                        ))}
                      </div>
                      <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-inner relative overflow-hidden">
                         <BrainCircuit size={40} className="absolute right-[-10px] bottom-[-10px] text-gray-100" />
                         <p className="text-xs md:text-sm text-gray-600 italic leading-relaxed font-medium relative z-10">{log.aiAnalysis}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
           </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 text-center">
           <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.6em] mb-4">{t.generated_by}</p>
           <div className="flex justify-center gap-4">
              <div className="w-8 h-[2px] bg-gray-100 mt-4" />
              <div className="w-12 h-12 bg-gray-50 p-2 rounded-xl">
                 <ShieldCheck size={32} className="text-gray-100" />
              </div>
              <div className="w-8 h-[2px] bg-gray-100 mt-4" />
           </div>
        </div>
      </div>
    </div>
  );
}
