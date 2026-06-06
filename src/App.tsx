import React, { useState, useEffect } from "react";
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
  Bell,
  Sun,
  Moon,
  Trash2,
  Edit2,
  Save,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { QRCodeCanvas } from "qrcode.react";
import { Patient, HealthStatus, CheckupLog, Language, Hospital } from "./types";
import { HOSPITALS, EDUCATION_ARTICLES } from "./constants";
import { analyzeSymptoms } from "./services/aiService";
import slugify from "slugify";
import { db, auth } from "./lib/firebase";
import { useAuth } from "./hooks/useAuth";
import { useHospitals } from "./hooks/useHospitals";
import ContractionTracker from "./components/ContractionTracker";
import ClinicalCharts from "./components/ClinicalCharts";
import HydrationTracker from "./components/HydrationTracker";
import BabySizeAnalogy from "./components/BabySizeAnalogy";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  onSnapshot,
  query,
  orderBy,
  addDoc,
  serverTimestamp,
  where,
  getDocs,
  limit,
  arrayUnion,
} from "firebase/firestore";

interface FirestoreErrorInfo {
  error: string;
  operationType: "create" | "update" | "delete" | "list" | "get" | "write";
  path: string | null;
  authInfo: {
    userId: string;
    email: string;
    emailVerified: boolean;
    isAnonymous: boolean;
    providerInfo: { providerId: string; displayName: string; email: string }[];
  };
}

function handleFirestoreError(
  error: any,
  operationType: FirestoreErrorInfo["operationType"],
  path: string | null = null,
) {
  console.error(`Firebase Error [${operationType}] at ${path}:`, error);
  if (error.code === "permission-denied") {
    const user = auth.currentUser;
    const errorInfo: FirestoreErrorInfo = {
      error: error.message,
      operationType,
      path,
      authInfo: {
        userId: user?.uid || "anonymous",
        email: user?.email || "none",
        emailVerified: user?.emailVerified || false,
        isAnonymous: user?.isAnonymous || false,
        providerInfo:
          user?.providerData.map((p) => ({
            providerId: p.providerId,
            displayName: p.displayName || "",
            email: p.email || "",
          })) || [],
      },
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
    scan_info:
      "À montrer au docteur ou à l'infirmier pour voir votre historique.",
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
    app_tagline: "Sécurité de la maman, bien-être du bébé au Sud-Kivu",
    theme_tooltip:
      "Option Soleil Kivu: Optimiser la luminosité en plein soleil",
    theme_light: "Mode Jour",
    theme_dark: "Mode Sombre",
    french: "Français",
    swahili: "Kiswahili",
    mashi: "Mashi",
    app_subtitle: "Mon compagnon de grossesse au Sud-Kivu",
    full_name: "Nom complet",
    start_tracking: "Commencer le suivi",
    phone_label: "Numéro de téléphone",
    full_name_placeholder: "Votre nom complet",
    lmp_date: "Date des dernières règles (LMP)",
    medical_center: "Centre médical ou hôpital",
    continue: "Continuer",
    due: "Date prévue d'accouchement",
    predict_labor: "Prédiction du travail",
    labor_prediction_desc:
      "Informations sur le déclenchement naturel du travail",
    back: "Retour",
    name: "Nom",
    dpa_label: "DPA",
    current_health: "Santé actuelle",
    stable: "Stable",
    vigilance: "Vigilance",
    action: "Urgence",
    all_normal: "Tout est normal",
    start_checkup: "Commencer la fiche de suivi",
    refresh_tips: "Conseils locaux",
    note_label: "Note d'observation",
    note_placeholder: "Ajouter des notes...",
    who_label: "Protocole OMS",
    generating: "Calcul du diagnostic...",
    generate_ai_advice: "Demander l'avis expert",
    all: "Tous",
    assigned: "Assigné à",
    followup_active: "Suivi actif",
    medical_record: "Fiche médicale",
    show_qr: "Voir QR code",
    tools: "Mes outils de suivi",
    is: "de",
    emergency: "Urgence",
    weight_track: "Poids de la maman",
    bp_track: "Pression artérielle",
    contractions: "Compteur contractions",
    start_counting: "Démarrer",
    medical_file: "Dossier de suivi",
    see_details: "Détails",
    medical_history: "Mon historique médical",
    no_logs: "Aucune observation enregistrée",
    id_label: "Identifiant",
    emergency_contact: "Contact d'Urgence",
    direct_line: "Ligne directe",
    risk: "Risque élevé",
    normal: "Normal",
    generated_by: "Généré par expertise locale Uzazi",
  },
  SW: {
    home: "Ufuatiliaji Wangu",
    suivi: "Afya Yangu",
    conseil: "Ushauri",
    profil: "Mimi",
    welcome: "Jambo",
    journey: "Mimba Yangu",
    journey_label: "Safari yako",
    weeks: "Majuma",
    remaining: "Bado",
    diagnostic_ia: "Kuangalia afya yangu",
    analyzing: "Mtaalamu anaangalia...",
    smart_diag: "Uamuzi wa mtaalamu",
    oms_compliance: "Kiwango cha huduma",
    next_rdv: "RDV Ifuatayo",
    local_nutrition: "Nguvu & Chakula",
    diagnostic_title: "Uchambuzi wangu",
    regular_suivi: "Chunguza afya yako ili kulinda mtoto.",
    symptoms_mobile: "Alama",
    bp: "Shinikizo",
    weight: "Uzito Wangu (kg)",
    start_ia: "Thibitisha",
    guide_maternel: "Shule ya akina mama",
    know_protect: "Jifunze kulinda mtoto.",
    digital_pass: "Kadi yangu ya afya",
    hide_fiche: "Funga",
    pass_qr: "Kadi yangu ya QR",
    digital_health_pass: "Kadi ya Afya ya Kidijitali",
    scan_info: "Onyesha daktari au muuguzi ili kuona historia yako.",
    logout: "Toka",
    other_symptom: "Dalili nyingine au ujumbe",
    submit_record: "Hifadhi",
    invalid_date: "Tarehe sio sawa. Angalia vizuri.",
    nutrition: "Kula",
    exercise: "Kusonga",
    warning_signs: "Tahadhari",
    baby_growth: "Mtoto",
    hygiene: "Usafi",
    mental_health: "Moyo",
    trimester: "Muhula",
    app_tagline: "Usalama wa mama, ustawi wa mtoto katika Sud-Kivu",
    theme_tooltip:
      "Mwangaza wa Jua: Kinga macho na usome kwa urahisi ukiwa nje",
    theme_light: "Njia ya Mchana",
    theme_dark: "Njia ya Giza",
    french: "Kifaransa",
    swahili: "Kiswahili",
    mashi: "Kishi",
    app_subtitle: "Mwenzi wangu wa mimba katika Sud-Kivu",
    full_name: "Jina kamili",
    start_tracking: "Anza ufuatiliaji",
    phone_label: "Nambari ya simu",
    full_name_placeholder: "Jina lako kamili",
    lmp_date: "Tarehe ya mwisho ya hedhi (LMP)",
    medical_center: "Kituo cha matibabu au hospitali",
    continue: "Endelea",
    due: "Tarehe ya makadirio ya kujifungua",
    predict_labor: "Ubashiri wa uchungu",
    labor_prediction_desc: "Habari kuhusu kuanza kwa uchungu wa asili",
    back: "Nyuma",
    name: "Jina",
    dpa_label: "DPA",
    current_health: "Afya ya sasa",
    stable: "Salama",
    vigilance: "Tahadhari",
    action: "Hatua haraka",
    all_normal: "Kila kitu ni sawa",
    start_checkup: "Anza fomu ya ufuatiliaji",
    refresh_tips: "Ushauri wa eneo letu",
    note_label: "Maelezo ya uchunguzi",
    note_placeholder: "Ongeza maelezo...",
    who_label: "Itifaki ya WHO",
    generating: "Kukadiria uchunguzi...",
    generate_ai_advice: "Omba maoni ya mtaalamu",
    all: "Wote",
    assigned: "Ametengewa",
    followup_active: "Ufuatiliaji unafanya kazi",
    medical_record: "Fomu ya matibabu",
    show_qr: "Onyesha nambari ya QR",
    tools: "Vifaa vyangu vya ufuatiliaji",
    is: "ya",
    emergency: "Dharura",
    weight_track: "Uzito wa mama",
    bp_track: "Shinikizo la damu",
    contractions: "Kiwango cha uchungu",
    start_counting: "Anza",
    medical_file: "Faili ya ufuatiliaji",
    see_details: "Maelezo",
    medical_history: "Historia yangu ya matibabu",
    no_logs: "Hakuna uchunguzi uliorekodiwa",
    id_label: "Kitambulisho",
    emergency_contact: "Mwasiliani wa Dharura",
    direct_line: "Nambari ya moja kwa moja",
    risk: "Hatari kubwa",
    normal: "Kawaida",
    generated_by: "Imetengenezwa na utaalam wa Uzazi wa eneo letu",
  },
  MSH: {
    home: "Okulandikira Kwani",
    suivi: "Amagala Gani",
    conseil: "Amahanu",
    profil: "Nie",
    welcome: "Bwinja",
    journey: "Omubyere gwani",
    journey_label: "Enyanya zawe",
    weeks: "Emishingo",
    remaining: "Okusigala",
    diagnostic_ia: "Okucungula amagala gani",
    analyzing: "Muganga alolere bwinja...",
    smart_diag: "Erizizi lya muganga",
    oms_compliance: "Kiwango k’okubeereca",
    next_rdv: "Olusiku luhereire",
    local_nutrition: "Emisi & Okulya",
    diagnostic_title: "Obugale bwani",
    regular_suivi: "Chunguza amagala gawe kunciza omwana.",
    symptoms_mobile: "Ibimanyiso",
    bp: "Tension",
    weight: "Obuzito bwani (kg)",
    start_ia: "Ndere",
    guide_maternel: "Ishule ry'abanyere",
    know_protect: "Yiga bwinja lyo ocungula omwana.",
    digital_pass: "Fiche y'amagala gani",
    hide_fiche: "Funga",
    pass_qr: "Fiche y'amagala ga QR",
    digital_health_pass: "Fiche y’Amagala ya Kidijitali",
    scan_info: "Oleshe omudoktori lyo abona ebiwandiko byawe.",
    logout: "Okurhenga",
    other_symptom: "Bindi bimanyiso bikuzibuha",
    submit_record: "Lika",
    invalid_date: "Olusiku lwirhasimire. Chungula bwinja.",
    nutrition: "Okulya",
    exercise: "Okugenda",
    warning_signs: "Emikuba",
    baby_growth: "Omwana",
    hygiene: "Usafi",
    mental_health: "Emoyo",
    trimester: "Olusanzi",
    app_tagline: "Obuzine bw'omubyere, obulume bw'omwana omu Sud-Kivu",
    theme_tooltip: "Mulerha gwa Jua lyo obona bwinja ku burhe",
    theme_light: "Mulerha",
    theme_dark: "Chiza",
    french: "Kifaransa",
    swahili: "Kiswahili",
    mashi: "Kishi",
    app_subtitle: "Muyigiriza wani omu Sud-Kivu",
    full_name: "Izino ryose",
    start_tracking: "Tangira okulandikira",
    phone_label: "Numero ya telefoni",
    full_name_placeholder: "Izino lyawe lyose",
    lmp_date: "Olusiku lwa mulyo luhereire (LMP)",
    medical_center: "Enyumpa y'amagala",
    continue: "Endere",
    due: "Olusiku lw'okubyala lwimanyirwe",
    predict_labor: "Okumanya kasanzi k'okubyala",
    labor_prediction_desc: "Ebiwandiko b’oku’rhenga asili’ kasanzi k’okubyala",
    back: "Galuka",
    name: "Izino",
    dpa_label: "DPA",
    current_health: "Amagala ga kasanzi",
    stable: "Bwinja",
    vigilance: "Okubeera maso",
    action: "Okugeraho haraka",
    all_normal: "Byose biri bwinja",
    start_checkup: "Tangira fiche y'okulandikira",
    refresh_tips: "Amahanu g'omu mushi gwishe",
    note_label: "Ebiwandiko by'okulola",
    note_placeholder: "Onyisheo amahanu...",
    who_label: "Itifaki ya WHO",
    generating: "Ocungula obugale...",
    generate_ai_advice: "Demander l'avis expert",
    all: "Byose",
    assigned: "Ahetewe",
    followup_active: "Okulandikira kuli bwinja",
    medical_record: "Fiche y'amagala",
    show_qr: "Olesha numero ya QR",
    tools: "Bintu birhabala okulandikira",
    is: "kwa",
    emergency: "Okugeraho",
    weight_track: "Obuzito bw'omubyere",
    bp_track: "Shinikizo la damu",
    contractions: "Compteur contractions",
    start_counting: "Tangira",
    medical_file: "Dossier y'amagala",
    see_details: "Okumanya binja",
    medical_history: "Ebiwandiko by’amagala gani g’embere",
    no_logs: "Nta bugale buvandisirwe",
    id_label: "Kitambulisho",
    emergency_contact: "Owa dharura",
    direct_line: "Numero ya kasanzi",
    risk: "Makuba gakuze",
    normal: "Normal",
    generated_by: "Ihikisirwe n’obuyigiriza bwa Uzazi bwa muno enshe",
  },
};

export default function App() {
  const {
    user,
    loading,
    anonymousLogin,
    emailLogin,
    emailSignUp,
    logout: googleLogout,
  } = useAuth();
  const { hospitals: globalHospitals } = useHospitals();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [activeTab, setActiveTab] = useState<
    "home" | "checkup" | "education" | "profile" | "record" | "admin" | "hospital"
  >("home");
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHospital, setIsHospital] = useState(false);
  const [hospitalStaff, setHospitalStaff] = useState<any | null>(null);
  const [logs, setLogs] = useState<CheckupLog[]>([]);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [language, setLanguage] = useState<Language>("FR");
  const [isLanguageMenuOpen, setIsLanguageMenuOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [theme, setTheme] = useState<"dark" | "light">(() => {
    const saved = localStorage.getItem("uzazi_theme");
    return saved === "light" || saved === "dark" ? saved : "dark";
  });

  useEffect(() => {
    if (user && !patient && !isLoggingIn) {
      syncUserProfile(user.uid);
    }
  }, [user, patient, isLoggingIn]);

  useEffect(() => {
    if (theme === "light") {
      document.documentElement.classList.add("light");
    } else {
      document.documentElement.classList.remove("light");
    }
    localStorage.setItem("uzazi_theme", theme);
  }, [theme]);

  const t = translations[language];

  // Logic to load data on mount
  useEffect(() => {
    if (!user || !patient?.id || patient.id === "@admin" || patient.id.startsWith("hospital_")) return;

    // Sync patient data
    const unsubPatient = onSnapshot(
      doc(db, "users", patient.id),
      (snap) => {
        if (snap.exists()) {
          const p = snap.data() as Patient;
          setPatient(p);
          setIsAdmin(!!p.isAdmin);
          if (p.language) setLanguage(p.language as Language);
          localStorage.setItem("uzazi_patient", JSON.stringify(p));
        }
      },
      (error) => {
        handleFirestoreError(error, "get", `users/${patient.id}`);
      },
    );

    // Sync logs
    const q = query(
      collection(db, "users", patient.id, "logs"),
      orderBy("createdAt", "desc"),
    );
    const unsubLogs = onSnapshot(
      q,
      (snap) => {
        const logsData = snap.docs.map(
          (doc) => ({ ...doc.data(), id: doc.id }) as CheckupLog,
        );
        setLogs(logsData);
        localStorage.setItem("uzazi_logs", JSON.stringify(logsData));
      },
      (error) => {
        handleFirestoreError(error, "get", `users/${patient.id}/logs`);
      },
    );

    return () => {
      unsubPatient();
      unsubLogs();
    };
  }, [user, patient?.id]);

  const [pendingName, setPendingName] = useState<string>("");
  const handleLogin = async (name: string) => {
    const rawName = name.trim();
    if (!rawName) return;

    setIsLoggingIn(true);
    setError(null);
    try {
      console.log("handleLogin started with name:", rawName);
      try {
        if (!user) {
          console.log("Not logged in, calling anonymousLogin");
          await anonymousLogin();
          console.log(
            "anonymousLogin completed successfully, waiting for auth state",
          );
          await new Promise((resolve) => setTimeout(resolve, 1000)); // Delay to allow auth state update
          console.log("Auth check:", auth.currentUser ? "Auth" : "No Auth");
        } else {
          console.log("User is already logged in");
        }
      } catch (authError: any) {
        console.error("Auth error in handleLogin:", authError);
        setError(authError.message);
        setIsLoggingIn(false);
        return;
      }

      if (rawName.toLowerCase() === "@admin") {
        console.log("Admin login detected");
        const currentUid = auth.currentUser?.uid;
        if (currentUid) {
          try {
            await setDoc(doc(db, "users", "admin-bypass"), {
              id: "admin-bypass",
              name: "Admin",
              email: "",
              phone: "00000000",
              weight: 0,
              lastPeriodDate: new Date().toISOString(),
              dueDate: new Date().toISOString(),
              weeksPregnant: 0,
              assignedHospitalId: "",
              language: language,
              isAdmin: true,
              uid: currentUid,
              createdAt: serverTimestamp(),
              updatedAt: serverTimestamp(),
            });
            console.log("Admin-bypass document updated with UID:", currentUid);
          } catch (adminDocErr) {
            console.error("Could not set admin-bypass document:", adminDocErr);
          }
        }
        setIsAdmin(true);
        setActiveTab("admin");
        setShowOnboarding(false);
        setPatient({
          id: "@admin",
          name: "@admin",
          isAdmin: true,
          uid: currentUid,
        } as any);
        return;
      }

      const slug = slugify(rawName, { lower: true, strict: true });
      console.log("Looking up user with slug:", slug);
      const userDoc = await getDoc(doc(db, "users", slug));
      console.log("Lookup finished. Exists:", userDoc.exists());

      if (userDoc.exists()) {
        const p = userDoc.data() as Patient;
        p.id = slug;
        if (user && p.uid !== user.uid) {
          p.uid = user.uid;
          try {
            await updateDoc(doc(db, "users", slug), {
              uid: user.uid,
              updatedAt: serverTimestamp(),
            });
            console.log("Successfully bound user UID to existing patient doc");
          } catch (bindErr) {
            console.error("Failed to bind UID to existing patient:", bindErr);
          }
        }
        setPatient(p);
        setIsAdmin(!!p.isAdmin);
        if (p.language) setLanguage(p.language as Language);
        setShowOnboarding(false);
        localStorage.setItem("uzazi_patient", JSON.stringify(p));
        localStorage.setItem("uzazi_saved_name", rawName);
      } else {
        console.log("User does not exist, showing onboarding");
        setPendingName(rawName);
        setShowOnboarding(true);
      }
    } catch (e: any) {
      console.error("Login error:", e);
      let errorMsg = "Erreur de connexion. Veuillez réessayer.";
      if (e.message && e.message.includes("permission-denied")) {
        errorMsg =
          "Accès refusé. Veuillez vérifier les règles de sécurité de votre base de données Firebase.";
      }
      setError(errorMsg);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const syncUserProfile = async (uid: string) => {
    try {
      // Try querying by 'uid' field (for admin/hospital staff linked via anonymous login)
      const q = query(collection(db, "users"), where("uid", "==", uid), limit(1));
      const snap = await getDocs(q);
      let p: any = null;
      if (!snap.empty) {
        p = snap.docs[0].data();
        p.id = snap.docs[0].id;
      } else {
        // Fallback to legacy/direct doc lookup if needed
        const profileSnap = await getDoc(doc(db, "users", uid));
        if (profileSnap.exists()) {
          p = profileSnap.data();
          p.id = profileSnap.id;
        }
      }

      if (p) {
        if (p.role === "admin" || p.isAdmin) {
          setIsAdmin(true);
          setIsHospital(false);
          setActiveTab("admin");
          setPatient({
            id: "@admin",
            name: "Administrateur",
            isAdmin: true,
            uid: uid,
          } as any);
          return true;
        } else if (p.role === "hospital") {
          setIsHospital(true);
          setIsAdmin(false);
          setHospitalStaff(p);
          setActiveTab("hospital");
          setPatient({
            id: `hospital_${uid}`,
            name: p.name || "Clinique",
            isAdmin: false,
            uid: uid,
          } as any);
          localStorage.setItem("uzazi_hospital_staff", JSON.stringify(p));
          return true;
        }
      } else {
        // If no profile found for this UID, check if we have a saved patient slug in localStorage
        const savedPatientStr = localStorage.getItem("uzazi_patient");
        if (savedPatientStr) {
          const savedPatient = JSON.parse(savedPatientStr);
          // Only trust it if it belongs to this UID or if we want to restore session
          if (savedPatient.uid === uid || !savedPatient.uid) {
             setPatient(savedPatient);
             return true;
          }
        }
      }
      return false;
    } catch (err) {
      console.error("Error syncing user profile:", err);
      return false;
    }
  };

  const handleLogout = async () => {
    await googleLogout();
    setPatient(null);
    setLogs([]);
    setIsAdmin(false);
    setIsHospital(false);
    setHospitalStaff(null);
    localStorage.removeItem("uzazi_patient");
    localStorage.removeItem("uzazi_logs");
    localStorage.removeItem("uzazi_hospital_staff");
    localStorage.removeItem("uzazi_saved_name");
  };

  useEffect(() => {
    if (!user) return;
    syncUserProfile(user.uid);
  }, [user]);

  const handleLanguageChange = async (lang: Language) => {
    setLanguage(lang);
    if (user && patient) {
      try {
        const updatedPatient = { ...patient, language: lang };
        setPatient(updatedPatient);
        localStorage.setItem("uzazi_patient", JSON.stringify(updatedPatient));

        await updateDoc(doc(db, "users", updatedPatient.id), {
          language: lang,
          updatedAt: serverTimestamp(),
        });
      } catch (e) {
        console.error("Failed to update language in Firestore", e);
      }
    }
  };

  useEffect(() => {
    // Handle QR code link
    const params = new URLSearchParams(window.location.search);
    const recordData = params.get("record");
    if (recordData) {
      try {
        const decodedString = decodeURIComponent(
          atob(recordData)
            .split("")
            .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
            .join(""),
        );
        const decoded = JSON.parse(decodedString);

        // Handle both old and new format
        if (decoded.n) {
          setPatient({
            id: decoded.id,
            name: decoded.n,
            phone: decoded.p,
            weight: decoded.we || 65, // Using transmitted weight or default
            bloodPressure: decoded.bp || undefined,
            weeksPregnant: decoded.w,
            lastPeriodDate: new Date().toISOString(), // Mocked as it's not in the small QR
            dueDate: new Date().toISOString(),
            assignedHospitalId: "h1",
          });
          setLogs(
            decoded.l.map((l: any) => ({
              id: Math.random().toString(),
              date: l.d,
              status: l.s,
              aiAnalysis: l.a,
              symptoms: [],
            })),
          );
        } else {
          setPatient(decoded.patient);
          setLogs(decoded.logs || []);
        }
        setActiveTab("record");
      } catch (e) {
        console.error("Invalid record data", e);
      }
      return;
    }

    const saved = localStorage.getItem("uzazi_patient");
    if (saved) {
      const p = JSON.parse(saved);
      setPatient(p);
      setIsAdmin(!!p.isAdmin);
      if (p.id === "@admin") {
        setIsAdmin(true);
        setActiveTab("admin");
      } else if (p.id?.startsWith("hospital_")) {
        setIsHospital(true);
        setActiveTab("hospital");
        const staffSaved = localStorage.getItem("uzazi_hospital_staff");
        if (staffSaved) {
          setHospitalStaff(JSON.parse(staffSaved));
        }
      } else if (!!p.isAdmin) {
        setActiveTab("admin");
      }
    } else {
      // Do nothing, let the user trigger onboarding via Login if necessary
    }

    const savedLogs = localStorage.getItem("uzazi_logs");
    if (savedLogs) {
      setLogs(JSON.parse(savedLogs));
    }
  }, []);

  const handleRegister = async (
    name: string,
    phone: string,
    lmp: string,
    hospitalId: string,
  ) => {
    console.log("handleRegister called", {
      name,
      phone,
      lmp,
      hospitalId,
      user: user?.uid,
    });
    if (!user) {
      console.error("handleRegister: No user found");
      setError("Erreur d'authentification. Veuillez vous reconnecter.");
      return;
    }
    setIsRegistering(true);
    setError(null);
    const slug = slugify(name, { lower: true, strict: true });
    try {
      console.log("slug:", slug);
      const newPatient: Patient = {
        id: slug,
        name,
        email: user.email || "",
        phone,
        weight: 65,
        lastPeriodDate: lmp,
        dueDate: calculateDueDate(lmp),
        weeksPregnant: calculateWeeksPregnant(lmp),
        assignedHospitalId: hospitalId,
        language: language,
        isAdmin: false,
        uid: user.uid,
      };

      console.log("Attempting to set doc:", `users/${slug}`);
      await setDoc(doc(db, "users", slug), {
        ...newPatient,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      console.log("Set doc successful");

      setPatient(newPatient);
      localStorage.setItem("uzazi_patient", JSON.stringify(newPatient));
      localStorage.setItem("uzazi_saved_name", name);
      setShowOnboarding(false);
    } catch (e: any) {
      console.error("Registration error:", e);
      handleFirestoreError(e, "create", `users/${slug}`);
      let errorMsg = "Erreur d'inscription. Veuillez vérifier votre connexion.";
      if (e.message && e.message.includes("permission-denied")) {
        errorMsg =
          "Création impossible : L'accès à la base de données Firebase est restreint par les règles de sécurité.";
      }
      setError(errorMsg);
    } finally {
      setIsRegistering(false);
    }
  };

  const handleAddLog = async (newLog: {
    symptoms: string[];
    bloodPressure?: string;
    weight?: number;
    notes?: string;
  }) => {
    if (!user || !patient) return;

    setIsAnalyzing(true);
    setActiveTab("home");

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
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "users", patient.id, "logs"), logData);

      // Mettre à jour le poids et la tension dans le profil
      if (newLog.weight || newLog.bloodPressure) {
        const updateData: any = { updatedAt: serverTimestamp() };
        if (newLog.weight) updateData.weight = newLog.weight;
        if (newLog.bloodPressure)
          updateData.bloodPressure = newLog.bloodPressure;
        await updateDoc(doc(db, "users", patient.id), updateData);
      }
    } catch (e: any) {
      console.error("Failed to save log", e);
      handleFirestoreError(e, "create", `users/${patient.id}/logs`);
      setError("Erreur lors de la sauvegarde du bilan. Veuillez réessayer.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const isProfileFound = isAdmin || isHospital || patient;
  if (loading || (user && !isProfileFound && !error)) {
    return (
      <div className="min-h-screen bg-[#0b0f1a] flex flex-col items-center justify-center gap-6">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-brand-primary/20 rounded-full animate-pulse" />
          <div className="absolute inset-0 w-16 h-16 border-t-4 border-brand-primary rounded-full animate-spin" />
        </div>
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.4em] animate-pulse italic">
          Synchronisation Uzazi...
        </p>
      </div>
    );
  }

  if (showOnboarding) {
    return (
      <Onboarding
        onRegister={handleRegister}
        language={language}
        initialName={pendingName || ""}
        isLoading={isRegistering}
        error={error}
        hospitals={globalHospitals}
      />
    );
  }

  if (!user) {
    return (
      <Login
        onLogin={handleLogin}
        language={language}
        isLoading={isLoggingIn}
        error={error}
      />
    );
  }

  if (isAdmin) {
    return (
      <div className="min-h-screen bg-gray-900 text-white selection:bg-brand-primary/30">
        <AdminView language={language} db={db} logout={handleLogout} />
      </div>
    );
  }

  if (isHospital && hospitalStaff) {
    return (
      <div className="min-h-screen bg-gray-900 text-white selection:bg-brand-primary/30">
        <HospitalView
          language={language}
          db={db}
          logout={handleLogout}
          staff={hospitalStaff}
        />
      </div>
    );
  }

  if (!patient && error) {
    return (
      <Login
        onLogin={handleLogin}
        language={language}
        isLoading={false}
        error={error}
      />
    );
  }

  if (!patient) {
    return null; // Should be covered by loading state above
  }

  return (
    <div
      className={`flex flex-col min-h-screen ${theme === "dark" ? "bg-app-bg dark text-white" : "bg-[#ECEFEA] light text-[#132A13]"} font-sans selection:bg-brand-primary/30`}
    >
      {/* Header */}
      <header className="sticky top-0 w-full bg-gray-900/80 backdrop-blur-xl border-b border-white/5 flex justify-center z-[100]">
        <div className="w-full max-w-5xl px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-gray-900 shadow-lg shadow-brand-primary/20">
              <Heart size={24} fill="currentColor" />
            </div>
            <div>
              <h1 className="text-xl font-display font-black text-white border-none leading-none tracking-tighter">
                UZAZI SALAMA
              </h1>
              <p className="text-[8px] font-black tracking-[0.3em] text-brand-primary/60 uppercase">
                {t.app_tagline}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-4">
            {!isAdmin && (
              <button
                onClick={() => {
                  const hospital = globalHospitals.find(
                    (h) => h.id === (patient as any).assignedHospitalId,
                  );
                  if (hospital)
                    window.location.href = `tel:${hospital.emergencyContact || hospital.phone}`;
                }}
                className="bg-red-400/10 text-red-400 p-2.5 rounded-xl hover:bg-red-400/20 transition-colors shadow-lg"
                title={(translations[language] as any).call_hospital}
              >
                <Phone size={18} />
              </button>
            )}

            {/* Theme selector for intense South Kivu sunshine visibility */}
            <button
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="flex items-center gap-2 bg-white/5 border border-white/10 px-3.5 py-2.5 rounded-xl hover:bg-white/10 transition-all shadow-md group text-white"
              title={t.theme_tooltip}
            >
              {theme === "dark" ? (
                <>
                  <Sun
                    size={14}
                    className="text-amber-400 group-hover:rotate-45 transition-transform"
                  />
                  <span className="text-[9px] font-black tracking-widest hidden md:inline uppercase">
                    {t.theme_light}
                  </span>
                </>
              ) : (
                <>
                  <Moon
                    size={14}
                    className="text-sky-400 group-hover:-translate-y-0.5 transition-transform"
                  />
                  <span className="text-[9px] font-black tracking-widest hidden md:inline uppercase">
                    {t.theme_dark}
                  </span>
                </>
              )}
            </button>

            <div className="relative">
              <button
                onClick={() => setIsLanguageMenuOpen(!isLanguageMenuOpen)}
                className="flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-2 rounded-xl hover:bg-white/10 transition-colors"
              >
                <Languages size={14} className="text-brand-primary" />
                <span className="text-[10px] font-black tracking-widest text-white">
                  {language}
                </span>
                <ChevronDown
                  size={14}
                  className={`text-brand-primary transition-transform ${isLanguageMenuOpen ? "rotate-180" : ""}`}
                />
              </button>

              <AnimatePresence>
                {isLanguageMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-32 bg-white/10 border border-white/10 rounded-2xl shadow-2xl z-[110] py-2"
                  >
                    {(["FR", "SW", "MSH"] as Language[]).map((lang) => (
                      <button
                        key={lang}
                        onClick={() => {
                          handleLanguageChange(lang);
                          setIsLanguageMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 text-[10px] font-black tracking-widest hover:bg-brand-primary/10 transition-colors ${language === lang ? "text-brand-primary" : "text-brand-primary"}`}
                      >
                        {lang === "FR"
                          ? t.french
                          : lang === "SW"
                            ? t.swahili
                            : t.mashi}
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
          {activeTab === "home" && (
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
                onUpdatePatient={(updated) => {
                  setPatient(updated);
                  localStorage.setItem(
                    "uzazi_patient",
                    JSON.stringify(updated),
                  );
                }}
              />
            </motion.div>
          )}
          {activeTab === "checkup" && (
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
          {activeTab === "education" && (
            <motion.div
              key="education"
              initial={{ opacity: 0, scale: 1.1 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="max-w-4xl mx-auto"
            >
              <EducationView
                language={language}
                weeksPregnant={patient.weeksPregnant}
              />
            </motion.div>
          )}
          {activeTab === "profile" && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 50 }}
              transition={{ type: "spring", damping: 20, stiffness: 100 }}
              className="max-w-6xl mx-auto w-full"
            >
              <ProfileView
                patient={patient!}
                logs={logs}
                onLogout={handleLogout}
                language={language}
                onTabChange={setActiveTab}
              />
            </motion.div>
          )}
          {activeTab === "admin" && isAdmin && (
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
          {activeTab === "record" && (
            <motion.div
              key="record"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-6xl mx-auto w-full"
            >
              <RecordView
                patient={patient!}
                logs={logs}
                language={language}
                onBack={() => setActiveTab("home")}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Navigation Bar */}
      {activeTab !== "record" && !isAdmin && (
        <div className="sticky bottom-0 left-0 right-0 z-[100] p-4 flex justify-center pointer-events-none">
          <nav className="max-w-lg w-full bg-gray-900/90 backdrop-blur-2xl border border-white/10 px-3 py-2 flex justify-between items-center rounded-[1.5rem] shadow-xl pointer-events-auto">
            <NavButton
              active={activeTab === "home"}
              icon={Home}
              label={translations[language].home}
              onClick={() => setActiveTab("home")}
            />
            <NavButton
              active={activeTab === "checkup"}
              icon={Stethoscope}
              label={translations[language].suivi}
              onClick={() => setActiveTab("checkup")}
            />
            <NavButton
              active={activeTab === "education"}
              icon={BookOpen}
              label={translations[language].conseil}
              onClick={() => setActiveTab("education")}
            />
            <NavButton
              active={activeTab === "profile"}
              icon={User}
              label={translations[language].profil}
              onClick={() => setActiveTab("profile")}
            />
          </nav>
        </div>
      )}
    </div>
  );
}

// --- Sub-Views ---

function Login({
  onLogin,
  language,
  isLoading: isParentLoading,
  error: parentError,
}: {
  onLogin: (name: string) => void;
  language: Language;
  isLoading: boolean;
  error: string | null;
}) {
  const t = translations[language];
  const { anonymousLogin, emailLogin, emailSignUp } = useAuth();
  const { hospitals } = useHospitals();
  const [sessionType, setSessionType] = useState<"patient" | "hospital" | "admin">("patient");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form states - Patient
  const [name, setName] = useState("");

  // Form states - Email & Password
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");

  // Hospital-spec Form states
  const [selectedHospitalId, setSelectedHospitalId] = useState("");
  const [registerNewHospital, setRegisterNewHospital] = useState(false);
  const [hospName, setHospName] = useState("");
  const [hospLocation, setHospLocation] = useState("");
  const [hospPhone, setHospPhone] = useState("");
  const [hospEmergency, setHospEmergency] = useState("");

  useEffect(() => {
    if (hospitals.length > 0 && !selectedHospitalId) {
      setSelectedHospitalId(hospitals[0].id);
    }
  }, [hospitals]);

  const handlePatientSubmit = async (e: any) => {
    e.preventDefault();
    if (!name.trim()) return;
    
    setError(null);
    setIsLoading(true);
    try {
      // In the handleLogin in App.tsx, anonymousLogin is called if user is null.
      // But we can call it here too to ensure we are logged in before onLogin.
      await anonymousLogin();
      onLogin(name.trim());
    } catch (err: any) {
      console.error("Patient auth error:", err);
      setError("Erreur d'accès. Veuillez réessayer.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleEmailSubmit = async (e: any) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const trimmedEmail = email.trim(); // This is now the "Identifier"
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setError("Veuillez remplir le nom et le mot de passe.");
      setIsLoading(false);
      return;
    }
    
    try {
      if (sessionType === "admin") {
        if (trimmedEmail.toLowerCase() === "admin" && trimmedPassword === "@Prince21") {
          const cred = await anonymousLogin();
          // Profile update for admin
          await setDoc(doc(db, "users", "admin-profile"), {
            name: "Administrateur",
            role: "admin",
            isAdmin: true,
            uid: cred.user.uid,
            updatedAt: serverTimestamp()
          }, { merge: true });
          window.location.reload();
          return;
        } else {
          try {
            await emailLogin(trimmedEmail, trimmedPassword);
            window.location.reload();
            return;
          } catch (e) {
             throw new Error("Identifiants administrateur incorrects.");
          }
        }
      } else if (sessionType === "hospital") {
        const q = query(
          collection(db, "users"),
          where("role", "==", "hospital")
        );
        const snap = await getDocs(q);
        const staffDoc = snap.docs.find(d => 
          d.data().email?.toLowerCase() === trimmedEmail.toLowerCase() && 
          d.data().password === trimmedPassword
        );

        if (staffDoc) {
          const cred = await anonymousLogin();
          // Link UID
          await updateDoc(doc(db, "users", staffDoc.id), {
            uid: cred.user.uid,
            updatedAt: serverTimestamp()
          });
          window.location.reload();
          return;
        } else {
          try {
             await emailLogin(trimmedEmail, trimmedPassword);
             window.location.reload();
             return;
          } catch (e) {
             throw new Error("Identifiants hospitaliers incorrects.");
          }
        }
      } else {
        throw new Error("L'authentification par e-mail n'est pas disponible pour les patientes.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/network-request-failed" || err.message?.includes("network-request-failed")) {
        setError("Erreur réseau : Impossible de contacter Firebase. Veuillez vérifier votre connexion internet et vous assurer que l'Authentification ANONYME est activée dans la console Firebase.");
      } else if (err.code === "auth/operation-not-allowed" || err.message?.includes("operation-not-allowed")) {
        if (sessionType === "admin" || sessionType === "hospital") {
          setError("L'authentification par e-mail n'est pas activée. Veuillez l'activer dans la console Firebase (Authentification > Sign-in method).");
        } else {
          setError("La connexion par e-mail n'est pas disponible pour le moment. Veuillez utiliser une autre méthode.");
        }
      } else if (err.code === "auth/email-already-in-use" || err.message?.includes("email-already-in-use")) {
        setError("Cette adresse e-mail est déjà utilisée.");
      } else if (err.code === "auth/invalid-credential" || err.message?.includes("invalid-credential")) {
        setError("Adresse e-mail ou mot de passe incorrect.");
      } else if (err.code === "auth/weak-password" || err.message?.includes("weak-password")) {
        setError("Le mot de passe choisi est trop faible.");
      } else {
        setError(err.message || "Une erreur est survenue lors de l'authentification.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const activeError = error || parentError;
  const isFormLoading = isLoading || isParentLoading;

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-6 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-green-900/20 via-gray-900 to-gray-900">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg space-y-6"
      >
        <div className="text-center space-y-3">
          <div className="w-16 h-16 bg-brand-primary/20 rounded-[1.5rem] flex items-center justify-center text-brand-primary mb-4 mx-auto shadow-2xl">
            <Baby size={36} className="animate-pulse" />
          </div>
          <h1 className="text-3xl font-display font-black text-white border-none tracking-tight">
            UZAZI SALAMA
          </h1>
          <p className="text-brand-primary/80 font-medium text-sm">{t.app_subtitle}</p>
        </div>

        {/* Choice of session button group */}
        <div className="bg-white/5 p-1.5 rounded-2xl border border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-1">
          <button
            onClick={() => {
              setSessionType("patient");
              setError(null);
            }}
            className={`py-3 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1.5 ${sessionType === "patient" ? "bg-brand-primary text-gray-900 shadow-lg" : "text-gray-400 hover:text-white"}`}
          >
            <Baby size={16} />
            <span>Patiente</span>
          </button>
          <button
            onClick={() => {
              setSessionType("hospital");
              setError(null);
            }}
            className={`py-3 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1.5 ${sessionType === "hospital" ? "bg-brand-primary text-gray-900 shadow-lg" : "text-gray-400 hover:text-white"}`}
          >
            <Stethoscope size={16} />
            <span>Hôpital</span>
          </button>
          <button
            onClick={() => {
              setSessionType("admin");
              setError(null);
            }}
            className={`py-3 px-1 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all flex flex-col items-center gap-1.5 ${sessionType === "admin" ? "bg-brand-primary text-gray-900 shadow-lg" : "text-gray-400 hover:text-white"}`}
          >
            <ShieldCheck size={16} />
            <span>Admin</span>
          </button>
        </div>

        <div className="bg-white/5 p-6 md:p-8 rounded-[2.5rem] border border-white/10 space-y-6 backdrop-blur-xl">
          {activeError && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl flex flex-col items-center justify-center gap-1 animate-shake">
              <span className="text-red-400 font-bold uppercase tracking-widest text-[9px]">
                Erreur
              </span>
              <span className="text-red-200 text-xs text-center">{activeError}</span>
            </div>
          )}

          {sessionType === "patient" ? (
             <form onSubmit={handlePatientSubmit} className="space-y-6">
                <div className="text-center pb-2">
                   <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary">Accès Patient</h3>
                   <p className="text-[10px] text-gray-500 font-bold mt-1 uppercase italic">Entrez votre nom pour continuer</p>
                </div>
              <div className="space-y-2">
                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] font-sans italic">
                  {t.full_name || "Nom Complet"}
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Zawadi Bamba"
                  className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 text-white placeholder-gray-600 focus:bg-white/10 focus:ring-2 focus:ring-brand-primary focus:outline-none font-bold"
                  disabled={isFormLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isFormLoading || !name.trim()}
                className="w-full bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-black py-4.5 rounded-2xl shadow-xl shadow-brand-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3 text-sm uppercase tracking-wider"
              >
                {isFormLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <ShieldCheck size={18} />
                )}
                <span>Accéder à mon suivi</span>
              </button>
            </form>
          ) : (
            <form onSubmit={handleEmailSubmit} className="space-y-5">
              {/* Login only for Admin and Hospital */}
              <div className="text-center pb-2">
                <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary">
                  {sessionType === "admin" ? "Espace Administration" : "Personnel Hospitalier"}
                </h3>
              </div>

              {authMode === "signup" && (
                <div className="space-y-2">
                  <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] font-sans italic">
                    Nom Complet du praticien / Admin
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Ex: Dr. Zawadi"
                    className="w-full px-5 py-3.5 rounded-2xl border border-white/5 bg-white/5 text-white placeholder-gray-600 focus:bg-white/10 focus:ring-2 focus:ring-brand-primary focus:outline-none font-bold"
                    disabled={isFormLoading}
                  />
                </div>
              )}

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] font-sans italic">
                  Identifiant / Email
                </label>
                <input
                  type="text"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={sessionType === "admin" ? "admin" : "Ex: email@hopital.com"}
                  className="w-full px-5 py-3.5 rounded-2xl border border-white/5 bg-white/5 text-white placeholder-gray-600 focus:bg-white/10 focus:ring-2 focus:ring-brand-primary focus:outline-none font-bold"
                  disabled={isFormLoading}
                />
              </div>

              <div className="space-y-2">
                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] font-sans italic">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="******"
                  className="w-full px-5 py-3.5 rounded-2xl border border-white/5 bg-white/5 text-white placeholder-gray-600 focus:bg-white/10 focus:ring-2 focus:ring-brand-primary focus:outline-none font-bold"
                  disabled={isFormLoading}
                />
              </div>

              {/* Hospital specific dropdown or creation */}
              {sessionType === "hospital" && authMode === "signup" && (
                <div className="space-y-4 pt-2 border-t border-white/5">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="newHosp"
                      checked={registerNewHospital}
                      onChange={(e) => setRegisterNewHospital(e.target.checked)}
                      className="rounded border-white/10 bg-white/5 text-brand-primary focus:ring-brand-primary"
                    />
                    <label htmlFor="newHosp" className="text-[11px] font-black text-brand-primary uppercase tracking-widest cursor-pointer">
                      Enregistrer un nouvel Hôpital
                    </label>
                  </div>

                  {registerNewHospital ? (
                    <div className="p-4 bg-white/5 border border-white/5 rounded-2xl space-y-3">
                      <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.2em]">Détails du Nouvel Hôpital</p>
                      <input
                        type="text"
                        placeholder="Nom de l'Hôpital / Centre"
                        value={hospName}
                        onChange={(e) => setHospName(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-white/5 bg-white/5 text-[12px] text-white placeholder-gray-600 focus:bg-white/10 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Localisation / Ville"
                        value={hospLocation}
                        onChange={(e) => setHospLocation(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-white/5 bg-white/5 text-[12px] text-white placeholder-gray-600 focus:bg-white/10 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Téléphone Contact"
                        value={hospPhone}
                        onChange={(e) => setHospPhone(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-white/5 bg-white/5 text-[12px] text-white placeholder-gray-600 focus:bg-white/10 focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="N° Urgence Maternité"
                        value={hospEmergency}
                        onChange={(e) => setHospEmergency(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-white/5 bg-white/5 text-[12px] text-white placeholder-gray-600 focus:bg-white/10 focus:outline-none"
                      />
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] font-sans italic">
                        Choisir le Centre Hospitalier
                      </label>
                      <select
                        value={selectedHospitalId}
                        onChange={(e) => setSelectedHospitalId(e.target.value)}
                        className="w-full px-5 py-3.5 rounded-2xl border border-white/5 bg-white/5 text-white focus:bg-white/10 focus:outline-none font-bold"
                      >
                        {hospitals.map((h) => (
                          <option key={h.id} value={h.id} className="bg-gray-800 text-white">
                            {h.name} ({h.location})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
              )}

              <button
                type="submit"
                disabled={isFormLoading}
                className="w-full bg-brand-primary hover:bg-brand-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-gray-900 font-black py-4 rounded-2xl shadow-xl shadow-brand-primary/20 transition-all active:scale-95 flex items-center justify-center gap-3 text-sm uppercase tracking-wider"
              >
                {isFormLoading ? (
                  <Loader2 className="animate-spin" size={18} />
                ) : (
                  <ShieldCheck size={18} />
                )}
                <span>
                  {authMode === "login" ? `S'authentifier (${sessionType === "admin" ? "Admin" : "Hôpital"})` : "Créer mon Espace Pro"}
                </span>
              </button>
            </form>
          )}

          {/* Mode Switcher - RESTRICTED TO PATIENT FLOW */}
          {sessionType === "patient" && (
            <div className="pt-6 border-t border-white/5 text-center">
              <button
                type="button"
                onClick={() => setAuthMode(authMode === "login" ? "signup" : "login")}
                className="text-[10px] font-black uppercase tracking-[2px] text-brand-primary hover:brightness-125 transition-all"
              >
                {authMode === "login" ? "Inscrivez-vous ici" : "Se connecter"}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}

function Onboarding({
  onRegister,
  language,
  initialName,
  isLoading,
  error: parentError,
  hospitals,
}: {
  onRegister: (
    name: string,
    phone: string,
    lmp: string,
    hospitalId: string,
  ) => void;
  language: Language;
  initialName: string;
  isLoading: boolean;
  error: string | null;
  hospitals: Hospital[];
}) {
  const t = translations[language];
  const [formData, setFormData] = useState({
    name: initialName || "",
    phone: "",
    lmp: "",
    hospitalId: hospitals[0]?.id || "",
  });
  const [localError, setLocalError] = useState("");
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  useEffect(() => {
    if (hospitals.length > 0 && !formData.hospitalId) {
      setFormData((prev) => ({ ...prev, hospitalId: hospitals[0].id }));
    }
  }, [hospitals]);

  const displayError = localError || parentError;

  const handleNext = () => {
    console.log("handleNext called, step:", step, "totalSteps:", totalSteps);
    setLocalError("");
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

      if (
        !formData.lmp ||
        lmpDate > today ||
        lmpDate < tenMonthsAgo ||
        isNaN(lmpDate.getTime())
      ) {
        setLocalError(t.invalid_date || "Date invalide");
        return;
      }
    }

    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      console.log("Registering with:", formData);
      onRegister(
        formData.name,
        formData.phone,
        formData.lmp,
        formData.hospitalId,
      );
    }
  };

  const handleBack = () => {
    setLocalError("");
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="flex flex-col min-h-screen max-w-md mx-auto bg-app-bg p-8">
      {/* Progress Dots */}
      <div className="flex gap-2 mb-12 justify-center mt-6">
        {[...Array(totalSteps)].map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-500 ${i + 1 === step ? "w-8 bg-brand-primary" : i + 1 < step ? "w-4 bg-brand-primary/50" : "w-4 bg-white/10"}`}
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
              <h2 className="text-3xl font-display font-black text-white leading-tight mb-2">
                Bienvenue !<br />
                Faisons connaissance.
              </h2>
              <p className="text-brand-primary/60 text-sm mb-8 font-medium">
                Commençons par les bases de votre identité.
              </p>

              <div className="space-y-5">
                <div>
                  <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-3 font-sans italic">
                    {t.full_name || "Nom Complet"}
                  </label>
                  <input
                    type="text"
                    placeholder={t.full_name_placeholder || "Ex: Zawadi"}
                    className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 text-white placeholder-gray-600 focus:bg-white/10 focus:ring-2 focus:ring-brand-primary focus:outline-none font-bold transition-all"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-3 font-sans italic">
                    {t.phone_label}
                  </label>
                  <input
                    type="tel"
                    placeholder="+243 ..."
                    className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 text-white placeholder-gray-600 focus:bg-white/10 focus:ring-2 focus:ring-brand-primary focus:outline-none font-bold transition-all"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
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
              <h2 className="text-3xl font-display font-black text-white leading-tight mb-2">
                Votre Suivi
              </h2>
              <p className="text-brand-primary/60 text-sm mb-8 font-medium">
                Cela nous aide à personnaliser vos recommandations pour votre
                grossesse.
              </p>

              <div>
                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-3 font-sans italic">
                  {t.lmp_date}
                </label>
                <input
                  type="date"
                  className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 text-white focus:bg-white/10 focus:ring-2 focus:ring-brand-primary focus:outline-none font-bold transition-all"
                  value={formData.lmp}
                  onChange={(e) =>
                    setFormData({ ...formData, lmp: e.target.value })
                  }
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
              <h2 className="text-3xl font-display font-black text-white leading-tight mb-2">
                Centre Médical
              </h2>
              <p className="text-brand-primary/60 text-sm mb-8 font-medium">
                Où souhaitez-vous être suivie ?
              </p>

              <div>
                <label className="block text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] mb-3 font-sans italic">
                  {t.medical_center}
                </label>
                <div className="relative">
                  <select
                    className="w-full px-5 py-4 rounded-2xl border border-white/5 bg-white/5 text-white focus:bg-white/10 focus:ring-2 focus:ring-brand-primary focus:outline-none appearance-none font-bold transition-all"
                    value={formData.hospitalId}
                    onChange={(e) =>
                      setFormData({ ...formData, hospitalId: e.target.value })
                    }
                    disabled={isLoading}
                  >
                    {hospitals.map((h) => (
                      <option key={h.id} value={h.id} className="bg-gray-900">
                        {h.name}
                      </option>
                    ))}
                  </select>
                  <ChevronDown
                    className="absolute right-5 top-1/2 -translate-y-1/2 text-brand-primary/70 pointer-events-none"
                    size={18}
                  />
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="mt-8">
        {displayError && (
          <div className="bg-red-500/10 border border-red-500/30 p-4 rounded-2xl mb-6 flex flex-col items-center justify-center gap-1 animate-shake">
            <span className="text-red-400 font-bold uppercase tracking-widest text-[10px]">
              Erreur
            </span>
            <span className="text-red-200 text-xs text-center">
              {displayError}
            </span>
          </div>
        )}
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
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : step === totalSteps ? (
              t.start_tracking
            ) : (
              t.continue
            )}
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
  language,
  onUpdatePatient,
}: {
  patient: Patient;
  lastLog?: CheckupLog;
  onTabChange: (tab: string) => void;
  isAnalyzing?: boolean;
  language: Language;
  onUpdatePatient: (updated: Patient) => void;
}) {
  const t = translations[language];
  const weeksRemaining = 40 - patient.weeksPregnant;
  const progress = (patient.weeksPregnant / 40) * 100;

  // Trimester-specific rotating tip
  const currentTrimester =
    patient.weeksPregnant <= 13 ? 1 : patient.weeksPregnant <= 26 ? 2 : 3;
  const trimesterTips = EDUCATION_ARTICLES.filter(
    (a) => !a.trimester || a.trimester === currentTrimester,
  );

  const [tipIndex, setTipIndex] = useState(0);

  useEffect(() => {
    // Pick a random tip on mount
    setTipIndex(Math.floor(Math.random() * trimesterTips.length));

    // Auto-refresh tips every 5 minutes
    const interval = setInterval(
      () => {
        setTipIndex((prev) => (prev + 1) % trimesterTips.length);
      },
      5 * 60 * 1000,
    );

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
    const prediction = new Date(
      baseDate.getTime() + (Math.random() * 4 - 2) * 24 * 60 * 60 * 1000,
    ); // ±2 days from due date
    const hour = Math.floor(Math.random() * 24);
    prediction.setHours(hour, 0, 0, 0);

    return {
      date: prediction.toLocaleDateString(
        language === "FR" ? "fr-FR" : "sw-KE",
      ),
      time: `${hour}h00`,
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
              <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
                {t.predict_labor}
              </p>
              <h3 className="text-xl font-display font-black text-gray-900 border-none leading-tight">
                {laborPrediction.date} à {laborPrediction.time}
              </h3>
              <p className="text-[10px] text-brand-primary font-medium italic mt-1">
                {t.labor_prediction_desc}
              </p>
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
            <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em]">
              {t.back} — T{currentTrimester}
            </p>
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
              <p className="text-[10px] opacity-60 uppercase font-black tracking-[0.3em] border-none">
                {t.welcome}, {patient.name.split(" ")[0]}!
              </p>
              <h2 className="text-2xl md:text-3xl font-display font-black mt-2 border-none text-white leading-tight">
                {t.journey_label || t.journey}
              </h2>

              <div className="mt-10 flex items-center gap-8">
                <div className="relative">
                  <svg className="w-32 h-32 transform -rotate-90">
                    <circle
                      cx="64"
                      cy="64"
                      r="58"
                      className="stroke-white/5 fill-none"
                      strokeWidth="12"
                    />
                    <motion.circle
                      cx="64"
                      cy="64"
                      r="58"
                      className="stroke-brand-primary fill-none"
                      strokeWidth="12"
                      strokeLinecap="round"
                      initial={{
                        strokeDasharray: "365",
                        strokeDashoffset: "365",
                      }}
                      animate={{
                        strokeDashoffset: 365 - (365 * progress) / 100,
                      }}
                      transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-brand-primary">
                      {patient.weeksPregnant}
                    </span>
                    <span className="text-[8px] font-black uppercase tracking-widest opacity-70">
                      {t.weeks}
                    </span>
                  </div>
                </div>

                <div className="flex-1 space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest opacity-40 italic">
                    {t.remaining}
                  </p>
                  <p className="text-3xl md:text-4xl font-black tabular-nums text-white">
                    {weeksRemaining < 0 ? 0 : weeksRemaining}{" "}
                    <span className="text-[10px] uppercase font-black opacity-40">
                      {t.weeks}
                    </span>
                  </p>
                  <p className="text-[10px] font-bold opacity-60 mt-2">
                    {t.dpa_label}:{" "}
                    {new Date(patient.dueDate).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute top-0 right-0 w-64 h-64 bg-brand-primary/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
          </motion.div>

          {/* Hydration Tracker */}
          <HydrationTracker
            patient={patient}
            language={language}
            onUpdatePatient={onUpdatePatient}
          />

          {/* Action CTA */}
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onTabChange("checkup")}
            className="w-full bg-brand-primary text-gray-900 py-6 rounded-[2.5rem] font-black text-sm shadow-2xl flex items-center justify-center gap-3 uppercase tracking-[0.2em] transition-all"
          >
            <Stethoscope size={24} />
            {t.diagnostic_ia}
          </motion.button>
        </div>

        {/* Right Column: Information & Daily Tip */}
        <div className="lg:col-span-5 space-y-8">
          {/* Baby Size Agricultural Analogy */}
          <BabySizeAnalogy
            weeksPregnant={patient.weeksPregnant}
            language={language}
          />

          <div className="px-4">
            <h4 className="text-[10px] font-black uppercase text-brand-primary/70 tracking-[0.4em] italic">
              {t.current_health}
            </h4>
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
                <Loader2
                  className="text-brand-primary animate-spin"
                  size={48}
                />
                <p className="font-black text-white uppercase tracking-[0.3em] text-xs">
                  {t.analyzing}
                </p>
              </motion.div>
            ) : lastLog ? (
              <motion.div
                key="last-log"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`p-8 rounded-[2.5rem] border flex flex-col justify-between ${
                  lastLog.status === "critical"
                    ? "bg-red-950/30 border-red-900/50 text-red-100"
                    : lastLog.status === "warning"
                      ? "bg-yellow-950/30 border-yellow-900/50 text-yellow-100"
                      : "bg-brand-primary/5 border-brand-primary/20 text-white"
                } shadow-2xl backdrop-blur-md`}
              >
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                        lastLog.status === "critical"
                          ? "bg-red-500"
                          : lastLog.status === "warning"
                            ? "bg-yellow-500 text-gray-900"
                            : "bg-brand-primary text-gray-900"
                      }`}
                    >
                      <Heart size={28} />
                    </div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-[0.3em] opacity-40 italic">
                        {t.smart_diag}
                      </p>
                      <p className="font-black text-sm uppercase tracking-[0.2em]">
                        {lastLog.status === "stable"
                          ? `✓ ${t.stable}`
                          : lastLog.status === "warning"
                            ? `! ${t.vigilance}`
                            : `⚠ ${t.action}`}
                      </p>
                    </div>
                  </div>
                  <p className="text-xs md:text-sm leading-relaxed font-medium italic opacity-90">
                    {lastLog.aiAnalysis || t.all_normal}
                  </p>
                </div>
                <div className="mt-8 pt-6 border-t border-white/5 flex justify-between items-center opacity-40">
                  <span className="text-[8px] font-black uppercase tracking-widest">
                    {t.oms_compliance}
                  </span>
                  <ShieldCheck size={16} />
                </div>
              </motion.div>
            ) : (
              <div className="bg-white/10 p-8 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center text-center gap-4 min-h-[200px]">
                <Heart className="text-gray-700" size={48} />
                <p className="text-[10px] font-black text-gray-600 uppercase tracking-[0.3em] italic">
                  {t.start_checkup}
                </p>
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
              <Lightbulb
                className="text-brand-primary opacity-20 transform group-hover:scale-110 group-hover:opacity-100 transition-all duration-700"
                size={80}
              />
              <div className="absolute top-4 right-4 z-10">
                <button
                  onClick={refreshTip}
                  className="bg-white/10 backdrop-blur-md p-3 rounded-2xl text-white hover:bg-brand-primary hover:text-gray-900 transition-all active:scale-90 shadow-xl border border-white/10"
                >
                  <RefreshCw
                    size={20}
                    className="hover:rotate-180 transition-transform duration-500"
                  />
                </button>
              </div>
            </div>
            <div className="p-8 relative">
              <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.4em] mb-3">
                {t.conseil} —{" "}
                {t[dailyTip.category as keyof typeof t] || dailyTip.category}
              </p>
              <h3 className="font-display font-black text-white text-xl border-none leading-tight">
                {dailyTip.translations[language].title}
              </h3>
              <p className="text-brand-primary text-sm mt-4 leading-relaxed italic font-medium opacity-80">
                {dailyTip.translations[language].content}
              </p>

              <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[9px] font-black text-gray-600 uppercase tracking-widest italic">
                  {t.refresh_tips}
                </span>
                <div className="flex gap-1">
                  {[0, 1, 2].map((i) => (
                    <div
                      key={i}
                      className={`w-1 h-1 rounded-full ${i === tipIndex % 3 ? "bg-brand-primary" : "bg-gray-700"}`}
                    />
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

function CheckupView({
  onAddLog,
  language,
}: {
  onAddLog: (log: {
    symptoms: string[];
    bloodPressure?: string;
    weight?: number;
    notes?: string;
  }) => void;
  language: Language;
}) {
  const t = translations[language];
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [bloodPressure, setBloodPressure] = useState("");
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");

  const potentialSymptoms = getLocalizedSymptoms(language);

  const handleToggleSymptom = (id: string) => {
    if (symptoms.includes(id)) {
      setSymptoms(symptoms.filter((s) => s !== id));
    } else {
      setSymptoms([...symptoms, id]);
    }
  };

  const handleSubmit = () => {
    onAddLog({
      symptoms,
      bloodPressure: bloodPressure || null,
      weight: weight ? parseFloat(weight) : null,
      notes: notes || null,
    });
  };

  return (
    <div className="p-6 space-y-8 pb-32">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h2 className="text-3xl font-display font-black text-white border-none leading-tight">
          {t.diagnostic_title}
        </h2>
        <p className="text-brand-primary/70 text-sm mt-1 font-medium italic">
          {t.regular_suivi}
        </p>
      </motion.div>

      <div className="space-y-4">
        <h3 className="text-[10px] font-black text-brand-primary uppercase tracking-[0.3em] border-none mb-2">
          {t.symptoms_mobile}
        </h3>
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
                  ? "border-brand-primary bg-brand-primary/10 ring-2 ring-brand-primary/20 scale-[1.02]"
                  : "border-white/5 bg-white/10/40"
              }`}
            >
              <span
                className={`text-sm font-black uppercase tracking-widest text-left ${symptoms.includes(s.id) ? "text-brand-primary" : "text-brand-primary"}`}
              >
                {s.label}
              </span>
              {symptoms.includes(s.id) ? (
                <div className="w-6 h-6 bg-brand-primary rounded-lg flex items-center justify-center text-gray-900 shrink-0">
                  <ShieldCheck size={16} />
                </div>
              ) : s.risk === "critical" ? (
                <AlertCircle
                  size={20}
                  className="text-red-500 opacity-40 shrink-0"
                />
              ) : null}
            </motion.button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        <label className="block text-[10px] font-black text-brand-primary/70 uppercase tracking-[0.3em] mb-2">
          {t.note_label}
        </label>
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
          <label className="block text-[10px] font-black text-brand-primary/70 uppercase tracking-[0.3em] mb-2">
            {t.bp}
          </label>
          <input
            type="text"
            placeholder="12/8"
            className="w-full px-5 py-4 rounded-[1.5rem] border border-white/5 focus:ring-2 focus:ring-brand-primary focus:outline-none bg-white/10/40 text-white text-sm font-black tracking-widest placeholder-gray-700"
            value={bloodPressure}
            onChange={(e) => setBloodPressure(e.target.value)}
          />
        </div>
        <div>
          <label className="block text-[10px] font-black text-brand-primary/70 uppercase tracking-[0.3em] mb-2">
            {t.weight}
          </label>
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

function EducationView({
  language,
  weeksPregnant,
}: {
  language: Language;
  weeksPregnant: number;
}) {
  const t = translations[language];
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [tipIndex, setTipIndex] = useState(0);

  const currentTrimester =
    weeksPregnant <= 13 ? 1 : weeksPregnant <= 26 ? 2 : 3;
  const categories = [
    "nutrition",
    "exercise",
    "warning_signs",
    "baby_growth",
    "hygiene",
    "mental_health",
  ];

  const [isGenerating, setIsGenerating] = useState(false);
  const [aiTip, setAiTip] = useState<{ title: string; content: string } | null>(
    null,
  );

  const filteredArticles = EDUCATION_ARTICLES.filter(
    (a) =>
      (!selectedCategory || a.category === selectedCategory) &&
      (!a.trimester || a.trimester === currentTrimester),
  );

  const generateAIAdvice = async () => {
    setIsGenerating(true);
    setAiTip(null); // Reset
    try {
      const resp = await fetch("/api/generate-advice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ trimester: currentTrimester, language }),
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
    const interval = setInterval(
      () => {
        setTipIndex(
          (prev) => (prev + 1) % Math.max(1, filteredArticles.length),
        );
      },
      5 * 60 * 1000,
    ); // 5 minutes
    return () => clearInterval(interval);
  }, [filteredArticles.length]);

  const refreshTips = () => {
    setTipIndex(Math.floor(Math.random() * filteredArticles.length));
  };

  const featuredTip = filteredArticles[tipIndex] || filteredArticles[0];

  return (
    <div className="p-6 space-y-8 pb-32">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex justify-between items-end"
      >
        <div>
          <h2 className="text-3xl font-display font-black text-white border-none leading-tight">
            {t.guide_maternel}
          </h2>
          <p className="text-brand-primary/70 text-sm mt-1 font-medium italic">
            {t.know_protect} ({t.trimester} {currentTrimester})
          </p>
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
            <span className="text-[8px] font-black text-brand-primary uppercase tracking-[0.2em]">
              {t.who_label}
            </span>
          </div>
          <div className="space-y-4">
            <div className="w-12 h-12 bg-brand-primary/20 rounded-2xl flex items-center justify-center text-brand-primary">
              <Sparkles size={24} />
            </div>
            <h3 className="text-xl font-display font-black text-gray-900 leading-tight">
              {aiTip.title}
            </h3>
            <p className="text-gray-600 font-medium leading-relaxed">
              {aiTip.content}
            </p>
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
              <span className="inline-block px-4 py-1.5 rounded-full bg-brand-primary text-gray-900 text-[10px] font-black uppercase tracking-widest">
                {t[featuredTip.category as keyof typeof t] ||
                  featuredTip.category}
              </span>
              <h3 className="text-2xl font-display font-black text-white leading-tight">
                {featuredTip.translations[language].title}
              </h3>
              <p className="text-brand-primary text-lg leading-relaxed font-medium">
                {featuredTip.translations[language].content}
              </p>
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
          className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase shrink-0 transition-all ${!selectedCategory ? "bg-brand-primary text-gray-900 shadow-lg" : "bg-white/5 text-brand-primary border border-white/10"}`}
        >
          {t.all}
        </button>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest uppercase shrink-0 transition-all ${selectedCategory === cat ? "bg-brand-primary text-gray-900 shadow-lg" : "bg-white/5 text-brand-primary border border-white/10"}`}
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
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center mb-6 shadow-lg shrink-0 ${
                    ["nutrition", "baby_growth", "hygiene"].includes(
                      article.category,
                    )
                      ? "bg-brand-primary/20 text-brand-primary"
                      : "bg-red-500/10 text-red-400"
                  }`}
                >
                  {article.category === "nutrition" ? (
                    <Droplets size={20} />
                  ) : (
                    <AlertCircle size={20} />
                  )}
                </div>
                <h3 className="font-display font-black text-white text-xl border-none leading-tight tracking-tight">
                  {article.translations[language].title}
                </h3>
                <p className="text-brand-primary text-sm mt-4 leading-relaxed font-medium opacity-80">
                  {article.translations[language].content}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProfileView({
  patient,
  logs,
  onLogout,
  language,
  onTabChange,
}: {
  patient: Patient;
  logs: CheckupLog[];
  onLogout: () => void;
  language: Language;
  onTabChange: (tab: any) => void;
}) {
  const t = translations[language];
  const [showQR, setShowQR] = useState(false);
  const [showContractionTracker, setShowContractionTracker] = useState(false);
  const { hospitals } = useHospitals();
  const hospital = hospitals.find((h) => h.id === patient.assignedHospitalId);

  // Robust QR Code Generation
  const stringifyData = JSON.stringify({
    id: patient.id,
    n: patient.name,
    p: patient.phone,
    w: patient.weeksPregnant,
    we: patient.weight,
    bp: patient.bloodPressure,
    l: logs.slice(0, 3).map((l) => ({
      d: l.date,
      s: l.status,
      a: l.aiAnalysis ? l.aiAnalysis.substring(0, 80) + "..." : "",
    })),
  });

  const encodedData = btoa(
    encodeURIComponent(stringifyData).replace(/%([0-9A-F]{2})/g, (match, p1) =>
      String.fromCharCode(parseInt(p1, 16)),
    ),
  );
  const recordLink = `${window.location.origin}${window.location.pathname}?record=${encodedData}`;

  return (
    <div className="p-4 md:p-8 space-y-8 pb-32 max-w-6xl mx-auto w-full">
      {/* Contraction Tracker Overlay */}
      <AnimatePresence>
        {showContractionTracker && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="w-full max-w-xl"
            >
              <ContractionTracker
                language={language}
                onClose={() => setShowContractionTracker(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Profil Header Adaptive */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col lg:flex-row lg:items-start items-center gap-10 bg-white/10 p-8 md:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden"
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
              <h2 className="text-3xl md:text-5xl font-display font-black text-white border-none tracking-tight leading-none">
                {patient.name}
              </h2>
              <div className="w-fit mx-auto lg:mx-0">
                <span className="inline-flex items-center gap-2 bg-brand-primary/20 text-brand-primary text-[10px] font-black px-4 py-2 rounded-full border border-brand-primary/30 uppercase tracking-[0.2em] shadow-lg whitespace-nowrap">
                  <ShieldCheck size={14} /> {t.followup_active}
                </span>
              </div>
            </div>
            <p className="text-[12px] font-black text-brand-primary/70 uppercase tracking-[0.4em] italic opacity-80">
              {patient.phone}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mt-8">
            <div className="bg-white/10 p-4 md:p-5 rounded-[2rem] border border-white/5 flex flex-col items-center lg:items-start">
              <Calendar className="text-brand-primary mb-2" size={20} />
              <p className="text-[9px] font-black text-brand-primary/70 uppercase tracking-widest mb-1">
                {t.journey}
              </p>
              <p className="text-lg md:text-xl font-black text-white leading-none whitespace-nowrap">
                {patient.weeksPregnant} {t.weeks}
              </p>
            </div>
            <div className="bg-white/10 p-4 md:p-5 rounded-[2rem] border border-white/5 flex flex-col items-center lg:items-start max-w-full overflow-hidden">
              <MapPin className="text-blue-400 mb-2" size={20} />
              <p className="text-[9px] font-black text-brand-primary/70 uppercase tracking-widest mb-1 truncate w-full">
                {t.medical_record}
              </p>
              <p className="text-[11px] md:text-[12px] font-black text-white truncate w-full uppercase">
                {hospital?.name}
              </p>
            </div>
            <div
              className="bg-brand-primary p-4 md:p-5 rounded-[2rem] flex flex-col items-center lg:items-start group cursor-pointer hover:shadow-lg shadow-brand-primary/20 transition-all col-span-2 md:col-span-1"
              onClick={() => setShowQR(true)}
            >
              <QrCode
                className="text-gray-900 mb-2 group-hover:scale-110 transition-transform"
                size={20}
              />
              <p className="text-[9px] font-black text-gray-900/60 uppercase tracking-widest mb-1">
                {t.digital_pass}
              </p>
              <p className="text-[10px] md:text-[11px] font-black text-gray-900 uppercase tracking-widest">
                {t.show_qr}
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 w-full">
        {/* Left Column: Stats & Tools */}
        <div className="xl:col-span-2 space-y-8">
          <div className="flex items-center justify-between px-4">
            <h4 className="text-[10px] font-black uppercase text-brand-primary/70 tracking-[0.4em] italic">
              {t.tools}
            </h4>
            {!patient.isAdmin && (
              <button
                onClick={() => {
                  const hospital = hospitals.find(
                    (h) => h.id === (patient as any).assignedHospitalId,
                  );
                  if (hospital)
                    window.location.href = `tel:${hospital.emergencyContact || hospital.phone}`;
                }}
                className="text-[9px] md:text-[10px] font-black text-red-400 uppercase tracking-widest flex items-center gap-2 bg-red-400/10 px-4 py-2 rounded-full border border-red-400/20"
              >
                <Phone size={12} /> {t.emergency}
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-2 gap-4 h-fit">
            <KickCounterCard t={t} />

            <div className="bg-white/10 p-6 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center text-center group hover:bg-white/5 transition-colors aspect-square lg:aspect-auto">
              <div className="w-12 h-12 bg-blue-400/10 text-blue-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Activity size={24} />
              </div>
              <p className="text-[10px] font-black text-brand-primary/70 uppercase tracking-widest mb-1 italic">
                {t.weight_track}
              </p>
              <p className="text-xl md:text-2xl font-black text-white">
                {patient.weight} kg
              </p>
            </div>

            <div className="bg-white/10/20 p-6 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center text-center group hover:bg-white/5 transition-colors aspect-square lg:aspect-auto">
              <div className="w-12 h-12 bg-red-400/10 text-red-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Heart size={24} />
              </div>
              <p className="text-[10px] font-black text-brand-primary/70 uppercase tracking-widest mb-1 italic">
                {t.bp_track}
              </p>
              <p className="text-xl md:text-2xl font-black text-white">
                {patient.bloodPressure || "—"}
              </p>
            </div>

            <div
              onClick={() => setShowContractionTracker(true)}
              className="bg-white/10 p-6 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white/10 group transition-all aspect-square lg:aspect-auto"
            >
              <div className="w-12 h-12 bg-purple-400/10 text-purple-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
                <Clock size={24} />
              </div>
              <p className="text-[10px] font-black text-brand-primary/70 uppercase tracking-widest mb-1 italic">
                {t.contractions}
              </p>
              <p className="text-sm font-black text-white group-hover:text-brand-primary transition-colors">
                {t.start_counting}
              </p>
            </div>
          </div>

          {/* Medical Charts of weight and BP progression */}
          <ClinicalCharts
            logs={logs}
            language={language}
            initialWeight={patient.weight}
          />

          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-brand-primary/70 tracking-[0.4em] px-4 italic">
              {t.medical_file}
            </h4>
            <div
              className="bg-white/10 p-8 rounded-[3rem] border border-white/5 flex items-center justify-between group cursor-pointer hover:bg-white/5 transition-colors"
              onClick={() => onTabChange("record")}
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary group-hover:scale-110 transition-transform">
                  <History size={24} />
                </div>
                <div>
                  <h5 className="text-sm font-black text-white uppercase tracking-widest">
                    {t.medical_record}
                  </h5>
                  <p className="text-[10px] text-brand-primary/70 font-bold opacity-60 uppercase">
                    {t.see_details}
                  </p>
                </div>
              </div>
              <ChevronRight size={20} className="text-brand-primary/70" />
            </div>
          </div>

          <div className="space-y-4">
            <h4 className="text-[10px] font-black uppercase text-brand-primary/70 tracking-[0.4em] px-4 italic">
              {t.medical_history}
            </h4>
            <div className="space-y-3">
              {logs.length === 0 ? (
                <div className="bg-white/10 p-12 rounded-[3.5rem] border border-dashed border-white/5 text-center">
                  <p className="text-sm text-gray-600 italic font-medium">
                    {t.no_logs}
                  </p>
                </div>
              ) : (
                logs.map((log) => (
                  <motion.div
                    key={log.id}
                    className="bg-white/10/30 p-6 md:p-8 rounded-[3rem] border border-white/5 hover:bg-white/10 transition-all group"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                      <span className="text-[10px] font-black text-brand-primary/70 uppercase tracking-widest">
                        {new Date(log.date).toLocaleDateString(
                          language === "FR" ? "fr-FR" : "sw-KE",
                        )}
                      </span>
                      <span
                        className={`w-fit px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-[0.2em] shadow-lg ${
                          log.status === "critical"
                            ? "bg-red-400 text-gray-900"
                            : log.status === "warning"
                              ? "bg-yellow-400 text-gray-900"
                              : "bg-green-400 text-gray-900"
                        }`}
                      >
                        {log.status === "stable"
                          ? t.stable
                          : log.status === "warning"
                            ? t.vigilance
                            : t.action}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {log.symptoms.map((s) => (
                        <span
                          key={s}
                          className="bg-white/5 px-4 py-2 rounded-xl text-[10px] font-bold text-brand-primary border border-white/10 group-hover:bg-white/10 transition-colors uppercase tracking-widest leading-none"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="bg-white/5 p-6 rounded-[2rem] relative overflow-hidden">
                      <BrainCircuit
                        size={40}
                        className="absolute right-[-10px] bottom-[-10px] text-white opacity-5"
                      />
                      <p className="text-xs md:text-sm text-brand-primary leading-relaxed font-medium relative z-10">
                        {log.aiAnalysis}
                      </p>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Pass QR Section */}
        <div className="space-y-8">
          <h4 className="text-[10px] font-black uppercase text-brand-primary/70 tracking-[0.4em] px-4 italic">
            {t.digital_pass}
          </h4>

          <div className="bg-white/10 p-5 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-brand-primary/5 via-transparent to-transparent opacity-50 transition-opacity group-hover:opacity-100" />

            <div className="relative z-10 space-y-4">
              <button
                onClick={() => setShowQR(!showQR)}
                className={`w-full py-6 rounded-[2.5rem] font-black flex items-center justify-center gap-4 transition-all duration-500 text-sm tracking-widest ${
                  showQR
                    ? "bg-white text-gray-900 shadow-2xl scale-[1.02]"
                    : "bg-brand-primary text-gray-900 shadow-xl shadow-brand-primary/20"
                }`}
              >
                <QrCode size={24} />
                {showQR ? t.hide_fiche.toUpperCase() : t.pass_qr.toUpperCase()}
              </button>

              <AnimatePresence>
                {showQR && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9, height: 0 }}
                    animate={{ opacity: 1, scale: 1, height: "auto" }}
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
                          <p className="text-[10px] font-black text-gray-900 uppercase tracking-[0.4em] px-4 py-2 bg-brand-primary/10 rounded-full">
                            {t.id_label}: {patient.id.toUpperCase()}
                          </p>
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

          <div className="bg-white/10 p-8 md:p-10 rounded-[3.5rem] border border-white/5 space-y-10">
            <div>
              <p className="text-[10px] font-black text-brand-primary/70 uppercase tracking-[0.4em] mb-6 italic">
                {t.medical_record}
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-5 bg-white/10 p-5 rounded-[2rem] border border-white/5 hover:bg-white/5 transition-all group">
                  <div className="w-14 h-14 bg-brand-primary/10 rounded-2xl flex items-center justify-center text-brand-primary shadow-inner group-hover:scale-110 transition-transform">
                    <MapPin size={28} />
                  </div>
                  <div className="flex-1 overflow-hidden">
                    <p className="text-sm font-black text-white border-none leading-none truncate uppercase tracking-widest">
                      {hospital?.name}
                    </p>
                    <p className="text-[10px] text-brand-primary/70 font-bold mt-2 opacity-60 uppercase">
                      {hospital?.location}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() =>
                    (window.location.href = `tel:${hospital?.emergencyContact}`)
                  }
                  className="w-full flex items-center gap-5 bg-red-400/5 p-5 rounded-[2rem] border border-red-400/10 hover:bg-red-400/10 transition-all group"
                >
                  <div className="w-14 h-14 bg-red-400/10 rounded-2xl flex items-center justify-center text-red-400 shadow-inner group-hover:animate-bounce">
                    <Phone size={28} />
                  </div>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-black text-white border-none leading-none uppercase tracking-widest">
                      {t.emergency_contact}
                    </p>
                    <p className="text-[10px] text-brand-primary/70 font-bold mt-2 opacity-60 uppercase">
                      {hospital?.emergencyContact}
                    </p>
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

function RecordView({
  patient,
  logs,
  language,
  onBack,
}: {
  patient: Patient;
  logs: CheckupLog[];
  language: Language;
  onBack: () => void;
}) {
  const t = translations[language];
  const { hospitals } = useHospitals();
  const hospital = hospitals.find((h) => h.id === patient.assignedHospitalId);

  return (
    <div className="p-4 md:p-8 space-y-8 bg-gray-900 min-h-screen">
      <header className="flex items-center justify-between gap-4 max-w-4xl mx-auto w-full">
        <button
          onClick={onBack}
          className="p-3 bg-white/5 rounded-2xl text-white hover:bg-white/10 transition-colors shadow-lg border border-white/5"
        >
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl md:text-2xl font-display font-black text-white uppercase tracking-widest">
          {t.medical_record}
        </h2>
        <div className="w-10 md:w-12 h-10 md:h-12 bg-brand-primary rounded-2xl flex items-center justify-center text-gray-900 shadow-xl">
          <Quote size={20} fill="currentColor" />
        </div>
      </header>

      <div className="bg-white rounded-[2.5rem] md:rounded-[3rem] p-6 md:p-12 text-gray-900 shadow-2xl shadow-black/50 max-w-4xl mx-auto w-full relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-gray-50 rounded-bl-[5rem]" />

        <div className="flex flex-col md:flex-row items-center md:items-start gap-8 mb-12 relative z-10">
          <div className="w-24 h-24 md:w-32 md:h-32 bg-gray-100 rounded-[2.5rem] flex items-center justify-center text-brand-primary overflow-hidden ring-8 ring-gray-50 shadow-inner">
            <User size={48} className="text-brand-primary/50" />
          </div>
          <div className="text-center md:text-left space-y-2">
            <h3 className="text-3xl md:text-5xl font-display font-black tracking-tight leading-none">
              {patient.name}
            </h3>
            <p className="text-[12px] font-black text-brand-primary uppercase tracking-[0.4em] italic">
              {patient.phone}
            </p>
            <div className="pt-4 flex flex-wrap justify-center md:justify-start gap-2">
              <span className="bg-gray-100 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-brand-primary/70 border border-gray-200 break-all">
                {t.id_label}: {patient.id.toUpperCase()}
              </span>
              <span className="bg-green-500/10 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-green-600 border border-green-500/20 whitespace-nowrap">
                {t.followup_active}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4 mb-12">
          <div className="bg-gray-50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100">
            <p className="text-[8px] md:text-[9px] font-black uppercase text-brand-primary tracking-widest mb-1 md:mb-2">
              {t.weeks}
            </p>
            <p className="text-xl md:text-2xl font-black text-gray-900 leading-none">
              {patient.weeksPregnant}
            </p>
          </div>
          <div className="bg-gray-50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100">
            <p className="text-[8px] md:text-[9px] font-black uppercase text-brand-primary tracking-widest mb-1 md:mb-2">
              {t.weight}
            </p>
            <p className="text-xl md:text-2xl font-black text-gray-900 leading-none">
              {patient.weight} kg
            </p>
          </div>
          <div className="bg-gray-50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100">
            <p className="text-[8px] md:text-[9px] font-black uppercase text-brand-primary tracking-widest mb-1 md:mb-2">
              {t.bp_track || "TENSION"}
            </p>
            <p className="text-xl md:text-2xl font-black text-gray-900 leading-none">
              {patient.bloodPressure || "—"}
            </p>
          </div>
          <div className="bg-gray-50 p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] border border-gray-100">
            <p className="text-[8px] md:text-[9px] font-black uppercase text-brand-primary tracking-widest mb-1 md:mb-2">
              {t.dpa_label}
            </p>
            <p className="text-sm md:text-lg font-black text-gray-900 leading-none uppercase tracking-tight">
              {new Date(patient.dueDate).toLocaleDateString()}
            </p>
          </div>
          <div className="bg-brand-primary p-4 md:p-6 rounded-[1.5rem] md:rounded-[2rem] shadow-lg shadow-brand-primary/20 col-span-2 lg:col-span-1">
            <p className="text-[8px] md:text-[9px] font-black uppercase text-gray-900/60 tracking-widest mb-1 md:mb-2">
              {t.risk}
            </p>
            <p className="text-xl md:text-2xl font-black text-gray-900 leading-none uppercase tracking-tighter">
              {t.normal}
            </p>
          </div>
        </div>

        <div className="space-y-12">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-brand-primary/20 rounded-xl flex items-center justify-center text-brand-primary">
                  <MapPin size={16} />
                </div>
                <h4 className="text-[11px] font-black uppercase text-gray-900 tracking-[0.2em]">
                  {t.medical_record}
                </h4>
              </div>
              <div className="bg-gray-50 p-6 rounded-[2rem] border border-gray-100">
                <p className="text-sm font-black text-gray-900 uppercase tracking-widest">
                  {hospital?.name}
                </p>
                <p className="text-[11px] text-brand-primary font-bold mt-2 opacity-80 uppercase leading-relaxed">
                  {hospital?.location}
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 bg-red-400/20 rounded-xl flex items-center justify-center text-red-500">
                  <Phone size={16} />
                </div>
                <h4 className="text-[11px] font-black uppercase text-gray-900 tracking-[0.2em]">
                  {t.emergency_contact}
                </h4>
              </div>
              <div className="bg-red-500/5 p-6 rounded-[2rem] border border-red-500/10">
                <p className="text-sm font-black text-gray-900 uppercase tracking-widest">
                  {t.direct_line}
                </p>
                <p className="text-[11px] text-red-500 font-black mt-2 uppercase tracking-widest">
                  {hospital?.emergencyContact}
                </p>
              </div>
            </div>
          </div>

          {patient.prescriptions && patient.prescriptions.length > 0 && (
            <div className="space-y-6 bg-green-500/5 p-6 md:p-8 rounded-[2.5rem] border border-green-500/20 mb-8">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500/20 rounded-xl flex items-center justify-center text-green-600">
                  <Stethoscope size={16} />
                </div>
                <h4 className="text-[11px] font-black uppercase text-green-600 tracking-[0.2em]">
                  Prescriptions & Conseils de l'Hôpital
                </h4>
              </div>
              <div className="space-y-4">
                {patient.prescriptions.map((pr) => (
                  <div key={pr.id} className="bg-white p-4.5 rounded-[1.5rem] border border-gray-100 shadow-sm space-y-2">
                    <p className="text-[9px] text-brand-primary font-black uppercase tracking-wider">
                      Le {new Date(pr.date).toLocaleDateString()} {pr.doctorName ? `| Clinique: ${pr.doctorName}` : ''}
                    </p>
                    <p className="text-xs md:text-sm text-gray-800 font-medium whitespace-pre-wrap">{pr.notes}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-8 h-8 bg-blue-400/20 rounded-xl flex items-center justify-center text-blue-500">
                <History size={16} />
              </div>
              <h4 className="text-[11px] font-black uppercase text-gray-900 tracking-[0.2em]">
                {t.medical_history}
              </h4>
            </div>

            {logs.length === 0 ? (
              <div className="bg-gray-50 p-12 rounded-[3rem] border border-dashed border-gray-200 text-center">
                <p className="text-sm text-brand-primary italic font-bold">
                  {t.no_logs}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="bg-gray-50 p-6 md:p-8 rounded-[2.5rem] border border-gray-100 hover:border-gray-300 transition-colors group"
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                      <div className="flex items-center gap-3">
                        <span className="w-2 h-2 rounded-full bg-brand-primary" />
                        <p className="text-[10px] font-black text-brand-primary uppercase tracking-widest">
                          {new Date(log.date).toLocaleDateString()}
                        </p>
                      </div>
                      <span
                        className={`text-[9px] font-black px-5 py-2 rounded-full uppercase tracking-widest shadow-sm ${
                          log.status === "critical"
                            ? "bg-red-500 text-white"
                            : log.status === "warning"
                              ? "bg-yellow-400 text-gray-900"
                              : "bg-green-500 text-white"
                        }`}
                      >
                        {log.status === "stable"
                          ? t.stable
                          : log.status === "warning"
                            ? t.vigilance
                            : t.action}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {log.symptoms.map((s) => (
                        <span
                          key={s}
                          className="bg-white px-4 py-2 rounded-xl text-[10px] font-black text-brand-primary/70 border border-gray-100 uppercase tracking-widest shadow-sm leading-none"
                        >
                          {s}
                        </span>
                      ))}
                    </div>
                    <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-inner relative overflow-hidden">
                      <BrainCircuit
                        size={40}
                        className="absolute right-[-10px] bottom-[-10px] text-gray-100"
                      />
                      <p className="text-xs md:text-sm text-gray-600 italic leading-relaxed font-medium relative z-10">
                        {log.aiAnalysis}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-gray-100 text-center">
          <p className="text-[10px] font-black text-brand-primary uppercase tracking-[0.6em] mb-4">
            {t.generated_by}
          </p>
          <div className="flex justify-center gap-4">
            <div className="w-8 h-[2px] bg-gray-100 mt-4" />
            <div className="w-12 h-12 bg-gray-50 p-2 rounded-xl">
              <ShieldCheck size={32} className="text-gray-100" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function HospitalView({
  language,
  db,
  logout,
  staff,
}: {
  language: Language;
  db: any;
  logout: () => void;
  staff: {
    uid: string;
    name: string;
    email: string;
    assignedHospitalId: string;
    role: string;
  };
}) {
  const t = translations[language];
  const { hospitals } = useHospitals();
  const hospital = hospitals.find((h) => h.id === staff.assignedHospitalId);

  // Real-time patients list registered under this hospital
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedPatientLogs, setSelectedPatientLogs] = useState<CheckupLog[]>([]);

  // Search & Filter
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Show forms
  const [showAddPatient, setShowAddPatient] = useState(false);
  const [activeDetailsTab, setActiveDetailsTab] = useState<"bilan" | "prescription" | "historique">("bilan");

  // Patient editing state
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editWeeks, setEditWeeks] = useState(0);
  const [updatingPatient, setUpdatingPatient] = useState(false);

  // New Patient Form state
  const [patName, setPatName] = useState("");
  const [patPhone, setPatPhone] = useState("");
  const [patLMP, setPatLMP] = useState("");
  const [patWeight, setPatWeight] = useState("");
  const [patBP, setPatBP] = useState("");
  const [savingPatient, setSavingPatient] = useState(false);

  // New Clinical log states (form in dossier details)
  const [newWeight, setNewWeight] = useState("");
  const [newBP, setNewBP] = useState("");
  const [newStatus, setNewStatus] = useState<HealthStatus>("stable");
  const [newSymptoms, setNewSymptoms] = useState<string[]>([]);
  const [newNotes, setNewNotes] = useState("");
  const [savingLog, setSavingLog] = useState(false);

  // New Prescription fields
  const [newPrescriptionText, setNewPrescriptionText] = useState("");
  const [savingPrescription, setSavingPrescription] = useState(false);

  // Edit hospital details
  const [isEditingHospital, setIsEditingHospital] = useState(false);
  const [hospName, setHospName] = useState("");
  const [hospLocation, setHospLocation] = useState("");
  const [hospPhone, setHospPhone] = useState("");
  const [hospEmergency, setHospEmergency] = useState("");
  const [savingHospital, setSavingHospital] = useState(false);

  useEffect(() => {
    if (hospital) {
      setHospName(hospital.name);
      setHospLocation(hospital.location);
      setHospPhone(hospital.phone);
      setHospEmergency(hospital.emergencyContact);
    }
  }, [hospital]);

  // Sync Patients
  useEffect(() => {
    if (!staff?.assignedHospitalId) return;
    const q = query(
      collection(db, "users"),
      where("assignedHospitalId", "==", staff.assignedHospitalId)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs
        .map((doc) => ({ ...doc.data(), id: doc.id }) as Patient)
        // filter out other non-prenatal profiles like admin or hospital staff
        .filter((p) => p.id !== "@admin" && !p.id.startsWith("hospital_") && p.role !== "hospital" && !p.isAdmin);
      setPatients(list);
    }, (error) => {
      console.error("Failed syncing hospital patients:", error);
    });
    return unsub;
  }, [db, staff?.assignedHospitalId]);

  // Sync active patient logs
  useEffect(() => {
    if (!selectedPatient?.id) {
      setSelectedPatientLogs([]);
      return;
    }
    const q = query(
      collection(db, "users", selectedPatient.id, "logs"),
      orderBy("date", "desc")
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((doc) => ({ ...doc.data(), id: doc.id }) as CheckupLog);
      setSelectedPatientLogs(list);
    }, (error) => {
      console.error("Failed syncing patient logs:", error);
    });
    return unsub;
  }, [db, selectedPatient?.id]);

  // Keep selectedPatient updated in real-time when patient records change
  useEffect(() => {
    if (!selectedPatient) return;
    const current = patients.find((p) => p.id === selectedPatient.id);
    if (current) {
      setSelectedPatient(current);
    }
  }, [patients]);

  // Handle hospital update
  const handleUpdateHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospName || !hospLocation || !hospPhone || !hospEmergency) {
      alert("Veuillez remplir tous les champs");
      return;
    }
    setSavingHospital(true);
    try {
      await updateDoc(doc(db, "hospitals", staff.assignedHospitalId), {
        name: hospName.trim(),
        location: hospLocation.trim(),
        phone: hospPhone.trim(),
        emergencyContact: hospEmergency.trim(),
      });
      setIsEditingHospital(false);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la modification de l'hôpital");
    } finally {
      setSavingHospital(false);
    }
  };

  // Register a Patient
  const handleRegisterPatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patName || !patPhone || !patLMP || !patWeight) {
      alert("Veuillez remplir tous les champs obligatoires (Nom, Téléphone, DDR, Poids).");
      return;
    }
    setSavingPatient(true);
    try {
      // Calculate gestation age from LMP
      const lmpDate = new Date(patLMP);
      const today = new Date();
      const diffMs = today.getTime() - lmpDate.getTime();
      const diffWeeks = Math.max(1, Math.floor(diffMs / (1000 * 60 * 60 * 24 * 7)));
      
      // Calculate DPA
      const dpa = new Date(lmpDate);
      dpa.setDate(dpa.getDate() + 280);

      const slug = slugify(patName, { lower: true, strict: true }) + "_" + Math.floor(100+Math.random()*900);
      const wVal = parseFloat(patWeight);

      const patientData: Patient = {
        id: slug,
        name: patName.trim(),
        phone: patPhone.trim(),
        email: `${slug}@uzazisalama.org`,
        weight: isNaN(wVal) ? 60 : wVal,
        bloodPressure: patBP || "120/80",
        lastPeriodDate: lmpDate.toISOString(),
        dueDate: dpa.toISOString(),
        weeksPregnant: diffWeeks,
        assignedHospitalId: staff.assignedHospitalId,
        language: "FR",
        prescriptions: [],
      };

      await setDoc(doc(db, "users", slug), patientData);

      // Create an initial checkup log
      const logData = {
        patientId: slug,
        date: new Date().toISOString(),
        symptoms: [],
        status: "stable" as HealthStatus,
        bloodPressure: patBP || "120/80",
        weight: isNaN(wVal) ? 60 : wVal,
        notes: "Admission de la patiente",
        aiAnalysis: "Bilan médical d'admission clinique.",
        createdAt: serverTimestamp(),
      };
      await addDoc(collection(db, "users", slug, "logs"), logData);

      // Reset
      setPatName("");
      setPatPhone("");
      setPatLMP("");
      setPatWeight("");
      setPatBP("");
      setShowAddPatient(false);
    } catch (err) {
      console.error("Failed to admit pregnant patient:", err);
      alert("Erreur lors de l'enregistrement de la patiente.");
    } finally {
      setSavingPatient(false);
    }
  };

  // Create Checkup Log inside Dossier details
  const handleAddClinicalLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setSavingLog(true);
    try {
      const parsedWeight = parseFloat(newWeight);
      const logData: any = {
        patientId: selectedPatient.id,
        date: new Date().toISOString(),
        symptoms: newSymptoms,
        status: newStatus,
        bloodPressure: newBP || null,
        weight: isNaN(parsedWeight) ? null : parsedWeight,
        notes: newNotes.trim(),
        aiAnalysis: `Observation clinique du personnel soignant au pôle de suivi. Recommandation clinique d'état de vigilance: ${newStatus.toUpperCase()}. NOTES: ${newNotes.trim() || "Aucun commentaire clinique supplémentaire."}`,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(db, "users", selectedPatient.id, "logs"), logData);

      const updates: any = {};
      if (!isNaN(parsedWeight)) updates.weight = parsedWeight;
      if (newBP) updates.bloodPressure = newBP;
      await updateDoc(doc(db, "users", selectedPatient.id), updates);

      // Clear Form state
      setNewWeight("");
      setNewBP("");
      setNewStatus("stable");
      setNewSymptoms([]);
      setNewNotes("");
      alert("Bilan clinique enregistré avec succès!");
    } catch (err) {
      console.error(err);
      alert("Erreur d'enregistrement.");
    } finally {
      setSavingLog(false);
    }
  };

  // Add clinical prescription
  const handleSavePrescription = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient || !newPrescriptionText.trim()) return;
    setSavingPrescription(true);
    try {
      const prData = {
        id: `pr_${Date.now()}_` + Math.floor(Math.random() * 100),
        date: new Date().toISOString(),
        notes: newPrescriptionText.trim(),
        doctorName: staff.name,
      };

      await updateDoc(doc(db, "users", selectedPatient.id), {
        prescriptions: arrayUnion(prData),
      });

      setNewPrescriptionText("");
      alert("Prescription enregistrée et transmise instantanément au dossier de la patiente!");
    } catch (err) {
      console.error(err);
      alert("Erreur de sauvegarde de l'ordonnance.");
    } finally {
      setSavingPrescription(false);
    }
  };

  // Symptoms choices
  const symptomsOptions = [
    "Saignements",
    "Fièvre",
    "Maux de tête sévères",
    "Diminution mouvements fœtaux",
    "Douleurs abdominales",
    "Gonflements des pieds/mains",
    "Nausées / Vomissements constants",
  ];

  const toggleSymptom = (s: string) => {
    if (newSymptoms.includes(s)) {
      setNewSymptoms(newSymptoms.filter((opt) => opt !== s));
    } else {
      setNewSymptoms([...newSymptoms, s]);
    }
  };

  const handleStartEditPatient = (p: Patient) => {
    setEditName(p.name);
    setEditPhone(p.phone);
    setEditWeeks(p.weeksPregnant);
    setIsEditingPatient(true);
  };

  const handleUpdatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setUpdatingPatient(true);
    try {
      await updateDoc(doc(db, "users", selectedPatient.id), {
        name: editName.trim(),
        phone: editPhone.trim(),
        weeksPregnant: Number(editWeeks),
        updatedAt: serverTimestamp(),
      });
      setIsEditingPatient(false);
      alert("Informations patiente mises à jour.");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour.");
    } finally {
      setUpdatingPatient(false);
    }
  };

  const handleDeletePatient = async (pId: string) => {
    if (!confirm("Voulez-vous vraiment supprimer cette patiente ainsi que tout son historique ? Cette action est irréversible.")) return;
    try {
      await deleteDoc(doc(db, "users", pId));
      if (selectedPatient?.id === pId) setSelectedPatient(null);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression.");
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!selectedPatient) return;
    if (!confirm("Supprimer cette observation de l'historique ?")) return;
    try {
      await deleteDoc(doc(db, "users", selectedPatient.id, "logs", logId));
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la suppression du log.");
    }
  };

  // Compute key stats for dashboard
  const totalPatientsCount = patients.length;
  const criticalCount = patients.filter((p) => p.bloodPressure && (parseFloat(p.bloodPressure.split("/")[0]) >= 140)).length;
  const warningCount = patients.filter((p) => p.weeksPregnant > 40).length;
  const stableCount = Math.max(0, totalPatientsCount - criticalCount - warningCount);

  // Filter patients mapping
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.phone.includes(searchQuery);

    const isPtHigh = p.bloodPressure && (parseFloat(p.bloodPressure.split("/")[0]) >= 140);
    const isPtOverdue = p.weeksPregnant > 40;

    let matchesFilter = true;
    if (statusFilter === "critical") matchesFilter = !!isPtHigh;
    else if (statusFilter === "warning") matchesFilter = !!isPtOverdue;
    else if (statusFilter === "stable") matchesFilter = !isPtHigh && !isPtOverdue;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Hospital Portal Header */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white/5 p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse" />
              <p className="text-[10px] font-black uppercase text-brand-primary tracking-[0.3em]">
                PÔLE CLINIQUE CONNECTÉ • ESPACE HÔPITAL
              </p>
            </div>
            <div className="flex items-center gap-3">
              <h2 className="text-2xl md:text-3xl font-display font-black text-white border-none leading-none tracking-tight">
                {isEditingHospital ? "Modifier le Centre" : hospital?.name || "Espace Hôpital"}
              </h2>
              <button
                onClick={() => setIsEditingHospital(!isEditingHospital)}
                className="p-1.5 bg-white/5 rounded-lg border border-white/5 text-brand-primary hover:bg-white/10"
              >
                <Edit2 size={14} />
              </button>
            </div>
            <p className="text-gray-400 text-xs font-medium mt-1 uppercase tracking-wider">
              DR. {staff.name.toUpperCase()} • Clinique rattachée : {hospital?.location || "Panzi, RD Congo"}
            </p>
          </div>
          <button
            onClick={logout}
            className="px-5 py-3 rounded-2xl bg-red-500/10 hover:bg-red-500 text-red-400 hover:text-white transition-all font-black uppercase tracking-wider text-[11px] flex items-center gap-2 border border-red-500/20"
          >
            <LogOut size={16} />
            Déconnexion
          </button>
        </header>

        {isEditingHospital && (
          <form onSubmit={handleUpdateHospital} className="bg-white/5 p-6 rounded-[2rem] border border-white/10 space-y-4 max-w-xl">
            <h3 className="text-xs font-black uppercase text-brand-primary tracking-widest">Coordonnées du Centre</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Nom du centre"
                value={hospName}
                onChange={(e) => setHospName(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-white/5 bg-white/5 text-[12px]"
              />
              <input
                type="text"
                placeholder="Lieu / Ville"
                value={hospLocation}
                onChange={(e) => setHospLocation(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-white/5 bg-white/5 text-[12px]"
              />
              <input
                type="text"
                placeholder="Téléphone"
                value={hospPhone}
                onChange={(e) => setHospPhone(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-white/5 bg-white/5 text-[12px]"
              />
              <input
                type="text"
                placeholder="N° Urgence Maternité"
                value={hospEmergency}
                onChange={(e) => setHospEmergency(e.target.value)}
                className="px-4 py-2.5 rounded-xl border border-white/5 bg-white/5 text-[12px]"
              />
            </div>
            <div className="flex gap-2 justify-end">
              <button
                type="button"
                onClick={() => setIsEditingHospital(false)}
                className="px-4 py-2 rounded-xl bg-white/5 text-[11px] text-gray-400 uppercase font-black"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={savingHospital}
                className="px-4 py-2 rounded-xl bg-brand-primary text-gray-900 text-[11px] font-black uppercase"
              >
                Enregistrer
              </button>
            </div>
          </form>
        )}

        {/* Layout split: Inline Adaptive Accordion List */}
        <div className="flex flex-col gap-8">
          {/* Action Bar */}
          <div className="flex flex-col sm:flex-row justify-between gap-4 items-stretch sm:items-center">
              <div className="flex gap-2 shrink-0">
                <input
                  type="text"
                  placeholder="Chercher une patiente par Nom / Tél..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="px-5 py-3 rounded-2xl bg-white/5 border border-white/5 focus:outline-none focus:ring-2 focus:ring-brand-primary max-w-sm w-full text-[12px]"
                />
              </div>

            <div className="flex gap-2 items-center justify-end">
              <button
                type="button"
                onClick={() => setShowAddPatient(!showAddPatient)}
                className="px-4 py-3 bg-brand-primary text-gray-900 rounded-2xl font-black text-[11px] uppercase tracking-wider flex items-center gap-2 active:scale-95 transition-transform"
              >
                <Plus size={16} />
                Nouvelle Patiente
              </button>
            </div>
          </div>

          {/* Quick Registration Panel */}
          {showAddPatient && (
            <form onSubmit={handleRegisterPatient} className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 space-y-4">
              <div className="flex justify-between items-center border-b border-white/5 pb-2">
                <h4 className="text-xs font-black uppercase text-brand-primary tracking-widest">Enregistrer une nouvelle Patiente (Admission clinique)</h4>
                <button type="button" onClick={() => setShowAddPatient(false)} className="text-gray-400 hover:text-white">
                  <X size={18} />
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-black">Nom de la future maman *</label>
                  <input
                    type="text"
                    placeholder="Ex: Zawadi Bamba"
                    required
                    value={patName}
                    onChange={(e) => setPatName(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 rounded-xl border border-white/5 text-[12px] text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-black">Téléphone de contact *</label>
                  <input
                    type="text"
                    placeholder="Ex: +243..."
                    required
                    value={patPhone}
                    onChange={(e) => setPatPhone(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 rounded-xl border border-white/5 text-[12px] text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-black">Date de dernières règles *</label>
                  <input
                    type="date"
                    required
                    value={patLMP}
                    onChange={(e) => setPatLMP(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 rounded-xl border border-white/5 text-[12px] text-white"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] text-gray-400 uppercase font-black">Poids d’admission (kg) *</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="Ex: 68"
                    value={patWeight}
                    onChange={(e) => setPatWeight(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 rounded-xl border border-white/5 text-[12px] text-white"
                  />
                </div>
                <div className="space-y-1 col-span-1 sm:col-span-2">
                  <label className="text-[10px] text-gray-400 uppercase font-black">Tension artérielle d’admission</label>
                  <input
                    type="text"
                    placeholder="Ex: 120/80"
                    value={patBP}
                    onChange={(e) => setPatBP(e.target.value)}
                    className="w-full px-4 py-2.5 bg-white/5 rounded-xl border border-white/5 text-[12px] text-white"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setShowAddPatient(false)}
                  className="px-4 py-2 bg-white/5 hover:bg-white/10 text-gray-400 font-bold rounded-xl text-[10px] uppercase"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={savingPatient}
                  className="px-4 py-2 bg-brand-primary hover:bg-brand-primary/90 text-gray-900 font-bold rounded-xl text-[10px] uppercase"
                >
                  {savingPatient ? "Enregistrement..." : "Confirmer l'Admission"}
                </button>
              </div>
            </form>
          )}

          {/* Patients Status Filter pills */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setStatusFilter("all")}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-white/5 ${statusFilter === "all" ? "bg-white/15 text-white" : "text-gray-400 hover:text-white"}`}
            >
              Toutes ({patients.length})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("stable")}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-green-500/10 ${statusFilter === "stable" ? "bg-green-500/10 text-green-400" : "text-gray-400 hover:text-white"}`}
            >
              Stable ({stableCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("warning")}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-yellow-500/10 ${statusFilter === "warning" ? "bg-yellow-400/10 text-yellow-500" : "text-gray-400 hover:text-white"}`}
            >
              Alerte DPA ({warningCount})
            </button>
            <button
              type="button"
              onClick={() => setStatusFilter("critical")}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border border-red-500/10 ${statusFilter === "critical" ? "bg-red-500/10 text-red-400" : "text-gray-400 hover:text-white"}`}
            >
              Vigilance ({criticalCount})
            </button>
          </div>

          {/* Patients Cards List as Accordion */}
          {filteredPatients.length === 0 ? (
            <div className="bg-white/5 p-16 rounded-[2.5rem] border border-dashed border-white/5 text-center text-gray-400">
              <Baby size={32} className="mx-auto mb-2 opacity-55" />
              <p className="text-xs font-black uppercase tracking-widest italic">Aucune patiente ne correspond à la recherche.</p>
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {filteredPatients.map((p) => {
                const isPtHigh = p.bloodPressure && (parseFloat(p.bloodPressure.split("/")[0]) >= 140);
                const isPtOverdue = p.weeksPregnant > 40;
                const profileStatus = isPtHigh ? "critical" : isPtOverdue ? "warning" : "stable";
                const isSelected = selectedPatient?.id === p.id;

                return (
                  <div
                    key={p.id}
                    className={`group rounded-[2.5rem] border transition-all duration-300 overflow-hidden ${isSelected ? "bg-white/5 border-white/10 ring-1 ring-white/5 shadow-2xl" : "bg-white/5 border-white/5 hover:bg-white/10"}`}
                  >
                    {/* Card Header (Shrunk context) */}
                    <div 
                      onClick={() => setSelectedPatient(isSelected ? null : p)}
                      className={`p-6 flex items-center gap-4 cursor-pointer transition-colors ${isSelected ? "bg-white/5" : ""}`}
                    >
                       <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-[1.2rem] shrink-0 shadow-inner ${isSelected ? "bg-brand-primary text-gray-950" : "bg-white/10 text-brand-primary"}`}>
                          {p.name.charAt(0).toUpperCase()}
                       </div>
                       <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3">
                             <h4 className="text-lg font-black text-white truncate leading-none uppercase tracking-tight">{p.name}</h4>
                             <span className={`px-2.5 py-0.5 rounded-full text-[7px] font-black uppercase tracking-widest ${profileStatus === "critical" ? "bg-red-500 text-white animate-pulse" : profileStatus === "warning" ? "bg-yellow-400 text-gray-950" : "bg-green-500 text-white"}`}>
                               {profileStatus === "critical" ? "Vigilance" : profileStatus === "warning" ? "Alerte DPA" : "Stable"}
                             </span>
                          </div>
                          <p className="text-[10px] text-gray-400 font-bold uppercase tracking-[0.2em] mt-1 font-mono">{p.phone} • {p.weeksPregnant} SA</p>
                       </div>
                       <div className="flex items-center gap-2">
                          <button
                             onClick={(e) => {
                               e.stopPropagation();
                               handleDeletePatient(p.id);
                             }}
                             className="p-2.5 bg-red-500/10 text-red-500 rounded-xl opacity-0 group-hover:opacity-100 transition-all hover:bg-red-500/20"
                             title="Supprimer la patiente"
                          >
                             <Trash2 size={14} />
                          </button>
                          <div className={`transition-transform duration-300 ${isSelected ? "rotate-180 text-brand-primary" : "text-gray-500"}`}>
                             <ChevronDown size={24} />
                          </div>
                       </div>
                    </div>

                    {/* Expansion Area (Inline Dossier) */}
                    {isSelected && (
                       <motion.div 
                         initial={{ height: 0, opacity: 0 }}
                         animate={{ height: "auto", opacity: 1 }}
                         className="border-t border-white/5 bg-gray-950/30 overflow-hidden"
                       >
                          <div className="p-6 md:p-8 space-y-8">
                              <div className="text-left border-b border-white/5 pb-4 flex justify-between items-end">
                                <div>
                                  <p className="text-[9px] font-black text-brand-primary uppercase tracking-[0.3em] mb-1">
                                    DOSSIER CLINIQUE PATIENTE
                                  </p>
                                  <h3 className="text-2xl font-display font-black text-white tracking-tight uppercase leading-none">
                                    {p.name}
                                  </h3>
                                </div>
                                <div className="flex gap-2">
                                   <button
                                     onClick={() => {
                                        setIsEditingPatient(!isEditingPatient);
                                        if (!isEditingPatient) handleStartEditPatient(p);
                                     }}
                                     className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${isEditingPatient ? "bg-brand-primary text-gray-950 border-brand-primary" : "bg-white/5 border-white/10 text-white hover:bg-white/10"}`}
                                   >
                                     {isEditingPatient ? "Annuler" : "Modifier"}
                                   </button>
                                   <div className="bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                                      <p className="text-[8px] text-gray-500 uppercase font-mono">ID: {p.id.toUpperCase()}</p>
                                   </div>
                                </div>
                              </div>

                              {isEditingPatient && selectedPatient ? (
                                 <div className="bg-white/5 p-6 rounded-[2.5rem] border border-brand-primary/30">
                                    <h5 className="text-[10px] font-black uppercase text-brand-primary mb-4 tracking-widest text-left">Modifier les informations de base</h5>
                                    <form onSubmit={handleUpdatePatient} className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
                                       <div className="space-y-1">
                                          <label className="text-[9px] font-black text-gray-400 uppercase">Nom complet</label>
                                          <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full bg-gray-950 border border-white/5 rounded-xl px-4 py-2 text-xs text-white" />
                                       </div>
                                       <div className="space-y-1">
                                          <label className="text-[9px] font-black text-gray-400 uppercase">Téléphone</label>
                                          <input type="text" value={editPhone} onChange={(e) => setEditPhone(e.target.value)} className="w-full bg-gray-950 border border-white/5 rounded-xl px-4 py-2 text-xs text-white" />
                                       </div>
                                       <div className="space-y-1">
                                          <label className="text-[9px] font-black text-gray-400 uppercase">SA Actuelles</label>
                                          <input type="number" value={editWeeks} onChange={(e) => setEditWeeks(Number(e.target.value))} className="w-full bg-gray-950 border border-white/5 rounded-xl px-4 py-2 text-xs text-white" />
                                       </div>
                                       <div className="pt-5 md:pt-0 flex items-end">
                                          <button type="submit" disabled={updatingPatient} className="w-full py-2 bg-brand-primary text-gray-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110">
                                            {updatingPatient ? "Mise à jour..." : "Sauvegarder"}
                                          </button>
                                       </div>
                                    </form>
                                 </div>
                              ) : (
                                 <>
                                    <div className="grid grid-cols-3 gap-2 bg-white/5 p-4 rounded-2xl border border-white/5 text-center">
                                      <div>
                                        <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest">Stade</p>
                                        <p className="text-base font-black text-white">{p.weeksPregnant} SA</p>
                                      </div>
                                      <div>
                                        <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest">Poids</p>
                                        <p className="text-base font-black text-white">{p.weight} kg</p>
                                      </div>
                                      <div>
                                        <p className="text-[8px] text-gray-400 uppercase font-black tracking-widest">BP</p>
                                        <p className="text-base font-black text-white">{p.bloodPressure || "—"}</p>
                                      </div>
                                    </div>

                                    <div>
                                      <ClinicalCharts logs={selectedPatientLogs} language={language} initialWeight={p.weight || 65} />
                                    </div>
                                 </>
                              )}

                              <div className="bg-white/5 p-6 rounded-[2.5rem] border border-white/10 space-y-6">
                                <div className="border-b border-white/5 flex gap-4">
                                  <button
                                    onClick={() => setActiveDetailsTab("bilan")}
                                    className={`text-[10px] pb-3 font-black uppercase tracking-widest transition-all ${activeDetailsTab === "bilan" ? "text-brand-primary border-b-2 border-brand-primary" : "text-gray-500 hover:text-white"}`}
                                  >
                                    Nouveau Bilan
                                  </button>
                                  <button
                                    onClick={() => setActiveDetailsTab("prescription")}
                                    className={`text-[10px] pb-3 font-black uppercase tracking-widest transition-all ${activeDetailsTab === "prescription" ? "text-brand-primary border-b-2 border-brand-primary" : "text-gray-500 hover:text-white"}`}
                                  >
                                    Ordonnance
                                  </button>
                                  <button
                                    onClick={() => setActiveDetailsTab("historique")}
                                    className={`text-[10px] pb-3 font-black uppercase tracking-widest transition-all ${activeDetailsTab === "historique" ? "text-brand-primary border-b-2 border-brand-primary" : "text-gray-500 hover:text-white"}`}
                                  >
                                    Historique Cli.
                                  </button>
                                </div>

                                {activeDetailsTab === "bilan" ? (
                                  <form onSubmit={handleAddClinicalLog} className="space-y-4 text-left">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="space-y-1">
                                        <label className="text-[9px] text-gray-400 uppercase font-black">Poids (kg)</label>
                                        <input type="number" step="0.1" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} className="w-full bg-gray-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-brand-primary outline-none" />
                                      </div>
                                      <div className="space-y-1">
                                        <label className="text-[9px] text-gray-400 uppercase font-black">BP</label>
                                        <input type="text" value={newBP} onChange={(e) => setNewBP(e.target.value)} className="w-full bg-gray-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:border-brand-primary outline-none" />
                                      </div>
                                    </div>
                                    <div>
                                       <label className="text-[9px] text-gray-400 uppercase font-black block mb-2">Symptômes</label>
                                       <div className="flex flex-wrap gap-1.5">
                                          {symptomsOptions.map(opt => (
                                              <button type="button" key={opt} onClick={() => toggleSymptom(opt)} className={`px-2.5 py-1.5 rounded-lg text-[8px] font-black uppercase transition-all ${newSymptoms.includes(opt) ? "bg-red-500 text-white" : "bg-white/5 text-gray-500 hover:bg-white/10"}`}>{opt}</button>
                                          ))}
                                       </div>
                                    </div>
                                    <div className="space-y-1">
                                      <label className="text-[9px] text-gray-400 uppercase font-black">Notes</label>
                                      <textarea rows={3} value={newNotes} onChange={(e) => setNewNotes(e.target.value)} className="w-full bg-gray-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-brand-primary outline-none" />
                                    </div>
                                    <button type="submit" disabled={savingLog} className="w-full py-3.5 bg-brand-primary text-gray-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-50">
                                      Enregistrer
                                    </button>
                                  </form>
                                ) : activeDetailsTab === "prescription" ? (
                                  <form onSubmit={handleSavePrescription} className="space-y-4 text-left">
                                    <div className="space-y-1">
                                      <label className="text-[9px] text-gray-400 uppercase font-black">Ordonnance</label>
                                      <textarea rows={6} value={newPrescriptionText} onChange={(e) => setNewPrescriptionText(e.target.value)} className="w-full bg-gray-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-brand-primary outline-none" />
                                    </div>
                                    <button type="submit" disabled={savingLog} className="w-full py-3.5 bg-brand-primary text-gray-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:brightness-110 disabled:opacity-50">
                                      Valider Prescription
                                    </button>
                                  </form>
                                ) : (
                                   <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                                      {selectedPatientLogs.length === 0 ? (
                                         <p className="text-[10px] text-gray-500 italic py-6">Aucun historique disponible.</p>
                                      ) : (
                                         selectedPatientLogs.map(log => (
                                            <div key={log.id} className="bg-gray-950 p-4 rounded-xl border border-white/5 relative group text-left">
                                               <button onClick={() => handleDeleteLog(log.id)} className="absolute top-2 right-2 p-1.5 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={12} /></button>
                                               <div className="flex justify-between items-start mb-2">
                                                  <p className="text-[9px] font-mono text-gray-500">{new Date(log.date).toLocaleDateString()}</p>
                                                  <span className={`px-2 py-0.5 rounded-full text-[7px] font-black uppercase ${log.status === 'critical' ? 'bg-red-500 text-white' : log.status === 'warning' ? 'bg-yellow-400 text-gray-950' : 'bg-green-500 text-white'}`}>{log.status}</span>
                                               </div>
                                               <div className="grid grid-cols-2 gap-2 text-[10px] mb-2 border-b border-white/5 pb-2">
                                                  <p><span className="text-gray-500 uppercase font-black text-[7px]">Poids:</span> <span className="text-white font-bold">{log.weight}kg</span></p>
                                                  <p><span className="text-gray-500 uppercase font-black text-[7px]">BP:</span> <span className="text-white font-bold">{log.bloodPressure}</span></p>
                                               </div>
                                               <p className="text-[10px] text-gray-300 leading-relaxed italic">{log.notes}</p>
                                            </div>
                                         ))
                                      )}
                                   </div>
                                )}
                              </div>
                          </div>
                       </motion.div>
                      )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function AdminView({
  language,
  db,
  logout,
}: {
  language: Language;
  db: any;
  logout: () => void;
}) {
  const t = translations[language];
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loadingPatients, setLoadingPatients] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "stable" | "warning" | "critical">("all");
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedLogs, setSelectedLogs] = useState<CheckupLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Staff CRUD state
  const [hospitalStaff, setHospitalStaff] = useState<any[]>([]);
  const [loadingStaff, setLoadingStaff] = useState(true);
  const [adminTab, setAdminTab] = useState<"patients" | "hospitals" | "staff">("patients");
  
  const [showAddStaff, setShowAddStaff] = useState(false);
  const [newStaffName, setNewStaffName] = useState("");
  const [newStaffEmail, setNewStaffEmail] = useState("");
  const [newStaffPassword, setNewStaffPassword] = useState("");
  const [selectedHospitalIdForStaff, setSelectedHospitalIdForStaff] = useState("");
  const [creatingStaff, setCreatingStaff] = useState(false);

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [isEditingPatient, setIsEditingPatient] = useState(false);
  const [editingStaff, setEditingStaff] = useState<any | null>(null);

  // Load hospital staff
  useEffect(() => {
    setLoadingStaff(true);
    const q = query(
      collection(db, "users"),
      where("role", "==", "hospital")
    );
    const unsub = onSnapshot(q, (snap) => {
      const staffList: any[] = [];
      snap.forEach((docSnap) => {
        staffList.push({ ...docSnap.data(), id: docSnap.id });
      });
      setHospitalStaff(staffList);
      setLoadingStaff(false);
    }, (err) => {
      console.error("Failed to load staff:", err);
      setLoadingStaff(false);
    });
    return () => unsub();
  }, [db]);

  // Load hospitals real-time
  useEffect(() => {
    const q = query(collection(db, "hospitals"), orderBy("name", "asc"));
    const unsub = onSnapshot(q, (snap) => {
      const list: Hospital[] = [];
      snap.forEach((d) => list.push({ ...d.data(), id: d.id } as Hospital));
      setHospitals(list);
    });
    return () => unsub();
  }, [db]);

  const handleDeleteStaff = async (id: string) => {
    if (!confirm("Voulez-vous vraiment supprimer ce membre du personnel ?"))
      return;
    try {
      await deleteDoc(doc(db, "users", id));
    } catch (err) {
      console.error("Failed to delete staff:", err);
      alert("Erreur lors de la suppression.");
    }
  };

  const handleStartEditStaff = (staff: any) => {
    setNewStaffName(staff.name);
    setNewStaffEmail(staff.email);
    setNewStaffPassword(staff.password || "");
    setSelectedHospitalIdForStaff(staff.assignedHospitalId || "");
    setEditingStaff(staff);
    setShowAddStaff(true);
  };

  const handleSaveStaff = async (e: any) => {
    e.preventDefault();
    if (!newStaffName || !newStaffEmail || !selectedHospitalIdForStaff) {
      alert("Veuillez remplir tous les champs.");
      return;
    }
    setCreatingStaff(true);
    try {
      if (editingStaff) {
        await updateDoc(doc(db, "users", editingStaff.id), {
          name: newStaffName,
          email: newStaffEmail,
          password: newStaffPassword,
          assignedHospitalId: selectedHospitalIdForStaff,
          updatedAt: serverTimestamp(),
        });
      } else {
        // Create user profile in Firestore
        // Note: In client-side Firebase, we can't create Auth accounts for others easily without signing out.
        await addDoc(collection(db, "users"), {
          name: newStaffName,
          email: newStaffEmail,
          password: newStaffPassword,
          role: "hospital",
          assignedHospitalId: selectedHospitalIdForStaff,
          createdAt: serverTimestamp(),
        });
      }

      setNewStaffName("");
      setNewStaffEmail("");
      setNewStaffPassword("");
      setSelectedHospitalIdForStaff("");
      setEditingStaff(null);
      setShowAddStaff(false);
      alert(editingStaff ? "Profil membre mis à jour avec succès." : "Le membre du personnel a été créé dans la base de données.");
    } catch (err) {
      console.error("Save staff error:", err);
      alert("Erreur lors de l'enregistrement.");
    } finally {
      setCreatingStaff(false);
    }
  };

  // UI change for Tabs
  const TAB_BUTTON_CLASS = (isActive: boolean) => 
    `px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all ${
      isActive
        ? "bg-brand-primary text-gray-950 border-brand-primary shadow-lg shadow-brand-primary/10"
        : "bg-white/5 hover:bg-white/10 border-white/5 text-gray-300"
    }`;

  const [editPatName, setEditPatName] = useState("");
  const [editPatPhone, setEditPatPhone] = useState("");
  const [editPatWeeks, setEditPatWeeks] = useState(0);
  const [editPatWeight, setEditPatWeight] = useState(65);
  const [editPatHospital, setEditPatHospital] = useState("");

  // Hospital CRUD state
  const [showAddHospital, setShowAddHospital] = useState(false);
  const [editingHospital, setEditingHospital] = useState<Hospital | null>(null);
  const [hospName, setHospName] = useState("");
  const [hospLocation, setHospLocation] = useState("");
  const [hospPhone, setHospPhone] = useState("");
  const [hospEmergency, setHospEmergency] = useState("");
  const [savingHospital, setSavingHospital] = useState(false);

  // New checkup log form state
  const [newBP, setNewBP] = useState("");
  const [newWeight, setNewWeight] = useState("");
  const [newStatus, setNewStatus] = useState<HealthStatus>("stable");
  const [newNotes, setNewNotes] = useState("");
  const [newSymptoms, setNewSymptoms] = useState<string[]>([]);
  const [submittingLog, setSubmittingLog] = useState(false);

  // Available symptoms for multiselect
  const commonSymptoms = [
    "Forte Fièvre",
    "Maux de tête graves",
    "Troubles visuels",
    "Saignement",
    "Pieds enflés",
    "Douleurs abdominales",
    "Fatigue extrême",
    "Contractions",
  ];

  // Load patients
  useEffect(() => {
    setLoadingPatients(true);
    const unsub = onSnapshot(
      collection(db, "users"),
      (snap) => {
        const list: Patient[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data();
          if (!data.isAdmin && data.role !== "hospital" && data.id !== "admin-bypass") {
            list.push({ ...data, id: docSnap.id } as Patient);
          }
        });
        setPatients(list);
        setLoadingPatients(false);
      },
      (err) => {
        console.error("Failed to load patients for admin:", err);
        setLoadingPatients(false);
      },
    );
    return () => unsub();
  }, [db]);

  // Load selected patient logs
  useEffect(() => {
    if (!selectedPatient) {
      setSelectedLogs([]);
      return;
    }
    setLoadingLogs(true);
    const q = query(
      collection(db, "users", selectedPatient.id, "logs"),
      orderBy("date", "desc"),
    );
    const unsub = onSnapshot(
      q,
      (snap) => {
        const logsList: CheckupLog[] = [];
        snap.forEach((docSnap) => {
          logsList.push({ ...docSnap.data(), id: docSnap.id } as CheckupLog);
        });
        setSelectedLogs(logsList);
        setLoadingLogs(false);
      },
      (err) => {
        console.error("Failed to load logs:", err);
        setLoadingLogs(false);
      },
    );
    return () => unsub();
  }, [db, selectedPatient]);

  // Handle Editing Patients Details
  const handleStartEditPatient = (p: Patient) => {
    setEditPatName(p.name);
    setEditPatPhone(p.phone);
    setEditPatWeeks(p.weeksPregnant);
    setEditPatWeight(p.weight);
    setEditPatHospital(p.assignedHospitalId || "");
    setIsEditingPatient(true);
  };

  const handleSavePatientProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    try {
      const updatePayload = {
        name: editPatName,
        phone: editPatPhone,
        weeksPregnant: Number(editPatWeeks),
        weight: Number(editPatWeight),
        assignedHospitalId: editPatHospital,
        updatedAt: serverTimestamp(),
      };
      await updateDoc(doc(db, "users", selectedPatient.id), updatePayload);

      // Locally update active view
      setSelectedPatient({
        ...selectedPatient,
        ...updatePayload,
      });
      setIsEditingPatient(false);
    } catch (err) {
      console.error("Failed to update patient profile:", err);
      alert("Erreur lors de la modification de la patiente.");
    }
  };

  const handleDeletePatient = async (pId: string) => {
    if (
      !confirm(
        "ÊTES-VOUS ABSOLUMENT SÛR ? Supprimer cette patiente effacera définitivement tout son dossier et son historique médical de la base de données. Cette action est irréversible."
      )
    ) {
      return;
    }
    try {
      await deleteDoc(doc(db, "users", pId));
      setSelectedPatient(null);
      setIsEditingPatient(false);
    } catch (err) {
      console.error("Failed to delete patient:", err);
      alert("Erreur lors de la suppression de la patiente.");
    }
  };

  // Hospital CRUD Handlers
  const handleStartEditHospital = (h: Hospital) => {
    setEditingHospital(h);
    setHospName(h.name);
    setHospLocation(h.location);
    setHospPhone(h.phone);
    setHospEmergency(h.emergencyContact);
    setShowAddHospital(true);
  };

  const handleSaveHospital = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hospName || !hospLocation || !hospPhone || !hospEmergency) {
      alert("Veuillez remplir tous les champs obligatoires.");
      return;
    }
    setSavingHospital(true);
    try {
      const hId = editingHospital ? editingHospital.id : `h_${Date.now()}`;
      await setDoc(doc(db, "hospitals", hId), {
        id: hId,
        name: hospName,
        location: hospLocation,
        phone: hospPhone,
        emergencyContact: hospEmergency,
      });

      // Reset
      setHospName("");
      setHospLocation("");
      setHospPhone("");
      setHospEmergency("");
      setEditingHospital(null);
      setShowAddHospital(false);
    } catch (err) {
      console.error("Failed to save Hospital center:", err);
      alert("Erreur lors de l'enregistrement de l'hôpital.");
    } finally {
      setSavingHospital(false);
    }
  };

  const handleDeleteHospital = async (hId: string) => {
    if (
      !confirm(
        "Êtes-vous sûr de vouloir de supprimer ce centre hospitalier de l'application ? Tout contact d'urgence lié sera désactivé."
      )
    ) {
      return;
    }
    try {
      await deleteDoc(doc(db, "hospitals", hId));
    } catch (err) {
      console.error("Failed to delete hospital center:", err);
      alert("Erreur de suppression.");
    }
  };

  const handleCreateCheckupLog = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPatient) return;
    setSubmittingLog(true);

    try {
      const weightNum = parseFloat(newWeight);
      const logData = {
        patientId: selectedPatient.id,
        date: new Date().toISOString(),
        symptoms: newSymptoms,
        status: newStatus,
        bloodPressure: newBP || null,
        weight: isNaN(weightNum) ? null : weightNum,
        notes: newNotes,
        aiAnalysis: `Bilan clinique établi en personne par le personnel médical au centre de suivi. Statut clinique: ${newStatus.toUpperCase()}. NOTES: ${newNotes || "Aucune observation supplémentaire."}`,
        createdAt: serverTimestamp(),
      };

      // Add to patient logs collection
      await addDoc(
        collection(db, "users", selectedPatient.id, "logs"),
        logData,
      );

      // Also update patient's current main info
      const updateData: any = { updatedAt: serverTimestamp() };
      if (!isNaN(weightNum)) updateData.weight = weightNum;
      if (newBP) updateData.bloodPressure = newBP;
      await updateDoc(doc(db, "users", selectedPatient.id), updateData);

      // Clear form
      setNewBP("");
      setNewWeight("");
      setNewStatus("stable");
      setNewNotes("");
      setNewSymptoms([]);
    } catch (err) {
      console.error("Failed to add clinical log:", err);
      alert("Erreur lors de la sauvegarde clinique.");
    } finally {
      setSubmittingLog(false);
    }
  };

  const handleDeleteLog = async (logId: string) => {
    if (!selectedPatient) return;
    if (
      !confirm(
        "Voulez-vous vraiment supprimer cette observation de l'historique ?",
      )
    )
      return;

    try {
      await deleteDoc(doc(db, "users", selectedPatient.id, "logs", logId));
    } catch (err) {
      console.error("Failed to delete log:", err);
      alert("Erreur lors de la suppression.");
    }
  };

  const toggleSymptom = (symptom: string) => {
    setNewSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom],
    );
  };

  // Filter & sort patients
  const filteredPatients = patients.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.phone.includes(searchTerm);
    if (!matchesSearch) return false;

    // Determine status based on their latest blood pressure
    if (statusFilter === "all") return true;

    const isCritical =
      p.bloodPressure &&
      p.bloodPressure.includes("/") &&
      parseInt(p.bloodPressure.split("/")[0]) >= 140;
    const isWarning =
      p.bloodPressure &&
      p.bloodPressure.includes("/") &&
      parseInt(p.bloodPressure.split("/")[0]) >= 130 &&
      parseInt(p.bloodPressure.split("/")[0]) < 140;
    const computedStatus = isCritical
      ? "critical"
      : isWarning
        ? "warning"
        : "stable";
    return computedStatus === statusFilter;
  });

  // Calculate patient current status simple gauge
  const getPatientStatus = (p: Patient) => {
    if (p.bloodPressure) {
      const parts = p.bloodPressure.split("/");
      if (parts.length === 2) {
        const sys = parseInt(parts[0]);
        if (sys >= 140) return "critical";
        if (sys >= 130) return "warning";
      }
    }
    return "stable";
  };

  // Generate QR for encoded patient file
  const generateQRText = () => {
    if (!selectedPatient) return "";
    const smallPayload = {
      id: selectedPatient.id,
      n: selectedPatient.name,
      p: selectedPatient.phone,
      w: selectedPatient.weeksPregnant,
      we: selectedPatient.weight,
      bp: selectedPatient.bloodPressure || "",
      l: selectedLogs.slice(0, 3).map((l) => ({
        d: l.date,
        s: l.status,
        a: l.aiAnalysis?.substring(0, 50) + "...",
      })),
    };
    try {
      const jsonStr = JSON.stringify(smallPayload);
      const utf8Bytes = new TextEncoder().encode(jsonStr);
      let binStr = "";
      for (let i = 0; i < utf8Bytes.byteLength; i++) {
        binStr += String.fromCharCode(utf8Bytes[i]);
      }
      return btoa(binStr);
    } catch (e) {
      console.error(e);
      return "";
    }
  };

  const qrValue = selectedPatient
    ? `${window.location.origin}/?record=${encodeURIComponent(generateQRText())}`
    : "";

  const selectedHospital = hospitals.find(
    (h) => h.id === selectedPatient?.assignedHospitalId,
  );

  return (
    <div className="bg-gray-900 border border-white/5 rounded-[3rem] p-6 lg:p-10 text-white shadow-2xl relative">
      <header className="flex flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-4 pb-6 border-b border-white/5">
        <div className="flex-1 min-w-0 pr-4">
          <h2 className="text-lg sm:text-2xl md:text-3xl font-display font-black tracking-tight uppercase leading-tight">
            Administration Uzazi Salama
          </h2>
          <p className="text-[8px] sm:text-[10px] text-brand-primary/60 font-black tracking-widest mt-1 uppercase">
            Gestion du réseau hospitalier
          </p>
        </div>
        <button
          onClick={logout}
          className="flex items-center gap-2 shrink-0 self-start sm:self-center bg-red-400/10 text-red-400 px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-[9px] sm:text-[10px] font-black uppercase tracking-widest border border-red-400/20 hover:bg-red-400/20 transition-all shadow-md whitespace-nowrap"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">Se déconnecter</span>
          <span className="inline sm:hidden">Quitter</span>
        </button>
      </header>

      {/* Tabs Menu */}
      <div className="flex gap-2 border-b border-white/5 pb-4 mb-8">
        <button
          onClick={() => setAdminTab("patients")}
          className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all ${adminTab === "patients" ? "bg-brand-primary text-gray-950 border-brand-primary shadow-lg shadow-brand-primary/10" : "bg-white/5 hover:bg-white/10 border-white/5 text-gray-300"}`}
        >
          Gestion Patientes ({patients.length})
        </button>
        <button
          onClick={() => setAdminTab("hospitals")}
          className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all ${adminTab === "hospitals" ? "bg-brand-primary text-gray-950 border-brand-primary shadow-lg shadow-brand-primary/10" : "bg-white/5 hover:bg-white/10 border-white/5 text-gray-300"}`}
        >
          Gestion Hôpitaux ({hospitals.length})
        </button>
        <button
          onClick={() => setAdminTab("staff")}
          className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest border transition-all ${adminTab === "staff" ? "bg-brand-primary text-gray-950 border-brand-primary shadow-lg shadow-brand-primary/10" : "bg-white/5 hover:bg-white/10 border-white/5 text-gray-300"}`}
        >
          Gestion Personnel ({hospitalStaff.length})
        </button>
      </div>

      {/* Admin Tab Content Rendering */}
      {adminTab === "staff" && (
        <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-white/5">
            <h3 className="text-sm font-black uppercase text-brand-primary tracking-widest">
              Gestion du Personnel Hospitalier
            </h3>
            <button
              onClick={() => {
                if (showAddStaff) {
                  setEditingStaff(null);
                  setNewStaffName("");
                  setNewStaffEmail("");
                  setSelectedHospitalIdForStaff("");
                }
                setShowAddStaff(!showAddStaff);
              }}
              className="bg-brand-primary text-gray-950 font-black uppercase text-[10px] px-5 py-3 rounded-2xl hover:scale-102 transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/10"
            >
              <Plus size={16} />
              {showAddStaff ? "Masquer formulaire" : "Recruter du personnel"}
            </button>
          </div>

          <div className="flex flex-col lg:flex-row gap-8 items-start">
            {showAddStaff && (
              <div className="w-full lg:w-1/3 shrink-0 bg-white/5 p-6 rounded-[2.5rem] border border-white/10 space-y-5 text-left">
                <h4 className="text-xs font-black uppercase text-brand-primary tracking-widest">
                  {editingStaff ? "Modification du compte" : "Création de compte Praticien"}
                </h4>
                <form onSubmit={handleSaveStaff} className="space-y-4 font-sans">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Nom Complet</label>
                    <input
                      type="text"
                      className="w-full bg-gray-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Email (Identifiant)</label>
                    <input
                      type="email"
                      className="w-full bg-gray-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                      value={newStaffEmail}
                      onChange={(e) => setNewStaffEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Mot de passe temporaire</label>
                    <input
                      type="password"
                      className="w-full bg-gray-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                      value={newStaffPassword}
                      onChange={(e) => setNewStaffPassword(e.target.value)}
                      required
                      minLength={6}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Hôpital d'Affectation</label>
                    <select
                      className="w-full bg-gray-950 border border-white/10 rounded-xl px-4 py-2 text-xs text-white"
                      value={selectedHospitalIdForStaff}
                      onChange={(e) => setSelectedHospitalIdForStaff(e.target.value)}
                      required
                    >
                      <option value="">Choisir un hôpital...</option>
                      {hospitals.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={creatingStaff}
                    className="w-full bg-brand-primary text-gray-950 font-black py-3 rounded-xl text-[10px] uppercase tracking-widest shadow-lg disabled:opacity-50"
                  >
                    {creatingStaff ? <Loader2 className="animate-spin inline" size={12} /> : (editingStaff ? "Enregistrer les modifications" : "Finaliser l'inscription")}
                  </button>
                </form>
              </div>
            )}

            <div className={`w-full ${showAddStaff ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"}`}>
              {loadingStaff ? (
                <p className="text-gray-500 italic text-xs">Chargement du personnel...</p>
              ) : hospitalStaff.length === 0 ? (
                <p className="text-gray-500 italic text-xs col-span-full py-12 text-center">Aucun membre du personnel enregistré dans le système.</p>
              ) : (
                hospitalStaff.map((s) => (
                  <div key={s.id} className="bg-white/5 border border-white/5 p-5 rounded-[2rem] flex flex-col justify-between gap-4 group">
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary font-bold">
                          {s.name.charAt(0)}
                        </div>
                        <div className="text-left">
                          <p className="text-xs font-black text-white uppercase truncate max-w-[150px]">{s.name}</p>
                          <p className="text-[8px] text-gray-500 font-mono italic">{s.email}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStartEditStaff(s)}
                          className="p-2 text-brand-primary hover:bg-white/5 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit2 size={12} />
                        </button>
                        <button
                          onClick={() => handleDeleteStaff(s.id)}
                          className="p-2 text-red-500 hover:bg-white/5 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </div>
                    <div className="pt-3 border-t border-white/5">
                      <p className="text-[8px] font-black uppercase text-brand-primary/60 tracking-widest">Hôpital</p>
                      <p className="text-[10px] text-white font-bold truncate">
                        {hospitals.find(h => h.id === s.assignedHospitalId)?.name || "Inconnu / Non affecté"}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {adminTab === "patients" && (
        <>
          <div className="flex flex-col gap-6">
            {/* Search & Filters Section */}
            <div className="space-y-4">
              <div className="flex flex-col gap-3">
                <h3 className="text-xs font-black uppercase tracking-widest text-brand-primary">
                  Recherche & Filtres
                </h3>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Rechercher par nom ou téléphone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 px-5 py-3.5 rounded-2xl text-[12px] font-medium placeholder-gray-500 text-white focus:outline-none focus:border-brand-primary transition-all shadow-inner"
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  <button
                    onClick={() => setStatusFilter("all")}
                    className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all ${statusFilter === "all" ? "bg-brand-primary text-gray-950 border-brand-primary font-black" : "bg-white/5 hover:bg-white/10 border-white/5 text-gray-300"}`}
                  >
                    Tous ({patients.length})
                  </button>
                  <button
                    onClick={() => setStatusFilter("critical")}
                    className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all ${statusFilter === "critical" ? "bg-red-500 text-white border-red-500 shadow-md shadow-red-500/20" : "bg-red-500/5 hover:bg-red-500/10 border-red-500/10 text-red-400"}`}
                  >
                    Urgences ({patients.filter((p) => getPatientStatus(p) === "critical").length})
                  </button>
                  <button
                    onClick={() => setStatusFilter("warning")}
                    className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all ${statusFilter === "warning" ? "bg-amber-500 text-gray-950 border-amber-500" : "bg-amber-500/5 hover:bg-amber-500/10 border-amber-500/10 text-amber-400"}`}
                  >
                    Vigilance ({patients.filter((p) => getPatientStatus(p) === "warning").length})
                  </button>
                  <button
                    onClick={() => setStatusFilter("stable")}
                    className={`px-4 py-2 text-[9px] font-black uppercase tracking-widest rounded-xl border transition-all ${statusFilter === "stable" ? "bg-green-500 text-white border-green-500" : "bg-green-500/5 hover:bg-green-500/10 border-green-500/10 text-green-400"}`}
                  >
                    Stables ({patients.filter((p) => getPatientStatus(p) === "stable").length})
                  </button>
                </div>
              </div>
            </div>

            {/* List of Patients - Redesigned as an Accordion List */}
            <div className="space-y-4">
              {loadingPatients ? (
                <div className="p-12 text-center text-gray-400 italic font-bold">
                  <Loader2 className="animate-spin text-brand-primary mx-auto mb-3" size={32} />
                  Chargement de la file d'attente...
                </div>
              ) : filteredPatients.length === 0 ? (
                <div className="bg-white/5 p-12 rounded-[2rem] border border-dashed border-white/10 text-center animate-pulse">
                  <p className="text-xs text-gray-400 italic">Aucune patiente trouvée.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {filteredPatients.map((p) => {
                    const patStatus = getPatientStatus(p);
                    const isSelected = selectedPatient?.id === p.id;
                    
                    return (
                      <div 
                        key={p.id} 
                        className={`group rounded-[2.5rem] border transition-all duration-300 overflow-hidden ${isSelected ? "bg-white/5 border-white/10 ring-1 ring-white/5" : "bg-white/5 hover:bg-white/10 border-white/5"}`}
                      >
                        {/* Header Area (Click to expand) */}
                        <div 
                          onClick={() => {
                            if (isSelected) setSelectedPatient(null);
                            else {
                                setSelectedPatient(p);
                                setIsEditingPatient(false);
                            }
                          }}
                          className={`p-5 flex items-center gap-4 cursor-pointer transition-colors ${isSelected ? "bg-white/5" : ""}`}
                        >
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-lg shadow-inner shrink-0 ${isSelected ? "bg-brand-primary text-gray-950" : "bg-white/10 text-white"}`}>
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                                <h4 className="text-base font-black truncate leading-none uppercase tracking-tight text-white">{p.name}</h4>
                                <span className={`w-2 h-2 rounded-full border ${patStatus === "critical" ? "bg-red-500 animate-pulse" : patStatus === "warning" ? "bg-amber-400" : "bg-green-500"}`} />
                            </div>
                            <p className="text-[10px] font-bold mt-1 text-gray-400 uppercase font-mono italic">
                              {p.phone} • {p.weeksPregnant} Semaines • ID: {p.id.slice(0, 8)}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                             <button
                               onClick={(e) => {
                                 e.stopPropagation();
                                 handleDeletePatient(p.id);
                               }}
                               className="p-2.5 bg-red-500/10 text-red-500 rounded-xl transition-all hover:bg-red-500/20 shadow-sm border border-red-500/10"
                               title="Supprimer la patiente"
                             >
                               <Trash2 size={14} />
                             </button>
                             <div className={`transition-transform duration-300 ${isSelected ? "rotate-180 text-brand-primary" : "text-gray-500"}`}>
                               <ChevronDown size={20} />
                             </div>
                          </div>
                        </div>

                        {/* Expanded Details Area */}
                        {isSelected && (
                          <motion.div 
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            className="border-t border-white/5 bg-gray-950/30 overflow-hidden"
                          >
                             <div className="p-6 space-y-8 animate-in fade-in slide-in-from-top-4 duration-500">
                                {/* Actions & QR */}
                                <div className="flex flex-wrap gap-2 justify-between items-center">
                                   <div className="flex gap-2">
                                      <button
                                        onClick={() => setIsEditingPatient(!isEditingPatient)}
                                        className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${isEditingPatient ? "bg-brand-primary text-gray-950 border-brand-primary" : "bg-white/5 border-white/10 text-white hover:bg-white/10"}`}
                                      >
                                        {isEditingPatient ? "Annuler Edition" : "Modifier Profil"}
                                      </button>
                                      <button
                                        onClick={() => setShowQR(true)}
                                        className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-[9px] font-black uppercase tracking-widest text-white transition-all flex items-center gap-2"
                                      >
                                        <QrCode size={12} />
                                        Fiche QR
                                      </button>
                                   </div>
                                   <div className="px-3 py-1 bg-brand-primary/10 rounded-lg text-[9px] font-black text-brand-primary uppercase font-mono">
                                      Status: {patStatus.toUpperCase()}
                                   </div>
                                </div>

                                {isEditingPatient ? (
                                    /* Inline Edit Form */
                                    <form onSubmit={handleSavePatientProfile} className="space-y-6 bg-white/5 p-6 rounded-2xl border border-white/5 text-left font-sans">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Nom Complet</label>
                                                <input type="text" value={editPatName} onChange={(e) => setEditPatName(e.target.value)} className="w-full bg-gray-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-primary" required />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Téléphone</label>
                                                <input type="text" value={editPatPhone} onChange={(e) => setEditPatPhone(e.target.value)} className="w-full bg-gray-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-brand-primary" required />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">SA</label>
                                                <input type="number" value={editPatWeeks} onChange={(e) => setEditPatWeeks(Number(e.target.value))} className="w-full bg-gray-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-primary" required />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">Hôpital</label>
                                                <select value={editPatHospital} onChange={(e) => setEditPatHospital(e.target.value)} className="w-full bg-gray-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-primary">
                                                    <option value="">Sélectionnez un centre...</option>
                                                    {hospitals.map((h) => <option key={h.id} value={h.id}>{h.name}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <button type="submit" className="w-full py-3 bg-brand-primary text-gray-950 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-brand-primary/90">Mettre à jour</button>
                                    </form>
                                ) : (
                                    <>
                                        {/* Summary Stats */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-left">
                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Semaines</span>
                                                <p className="text-xl font-bold text-white mt-1">{p.weeksPregnant}</p>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Tension</span>
                                                <p className="text-xl font-bold text-white mt-1">{p.bloodPressure || "—"}</p>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Poids</span>
                                                <p className="text-xl font-bold text-white mt-1">{p.weight} kg</p>
                                            </div>
                                            <div className="bg-white/5 p-4 rounded-2xl border border-white/5">
                                                <span className="text-[8px] font-black text-gray-500 uppercase tracking-widest">DPA</span>
                                                <p className="text-sm font-bold text-brand-primary mt-2 font-mono">{p.dueDate ? new Date(p.dueDate).toLocaleDateString() : "—"}</p>
                                            </div>
                                        </div>

                                        {/* Medical Center info */}
                                        {hospitals.find(h => h.id === p.assignedHospitalId) && (
                                            <div className="bg-brand-primary/5 p-5 rounded-2xl border border-brand-primary/10 flex items-center justify-between text-left">
                                                <div>
                                                    <h5 className="text-[8px] font-black text-brand-primary uppercase tracking-widest mb-1">Centre Assigné</h5>
                                                    <p className="text-sm font-black text-white uppercase">{hospitals.find(h => h.id === p.assignedHospitalId)?.name}</p>
                                                </div>
                                                <div className="text-right">
                                                    <p className="text-[8px] text-gray-400 uppercase font-bold tracking-widest">Contact</p>
                                                    <p className="text-[10px] text-white font-bold">{hospitals.find(h => h.id === p.assignedHospitalId)?.phone}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Inline Log Creation */}
                                        <div className="bg-white/5 p-6 rounded-[2rem] border border-white/10 space-y-6">
                                            <div className="flex items-center gap-3 text-left">
                                              <div className="w-8 h-8 bg-brand-primary/20 rounded-xl flex items-center justify-center text-brand-primary">
                                                <Stethoscope size={16} />
                                              </div>
                                              <h4 className="text-[10px] font-black uppercase text-brand-primary tracking-widest">Enregistrer un nouveau bilan</h4>
                                            </div>
                                            <form onSubmit={handleCreateCheckupLog} className="space-y-4">
                                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                                    <div className="space-y-1 text-left">
                                                        <label className="text-[8px] font-black text-gray-400 uppercase">Poids (kg)</label>
                                                        <input type="number" step="0.1" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} className="w-full bg-gray-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-brand-primary outline-none" />
                                                    </div>
                                                    <div className="space-y-1 text-left">
                                                        <label className="text-[8px] font-black text-gray-400 uppercase">Tension</label>
                                                        <input type="text" value={newBP} onChange={(e) => setNewBP(e.target.value)} className="w-full bg-gray-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-brand-primary outline-none font-mono" />
                                                    </div>
                                                    <div className="space-y-1 text-left">
                                                        <label className="text-[8px] font-black text-gray-400 uppercase">Statut</label>
                                                        <select value={newStatus} onChange={(e) => setNewStatus(e.target.value as HealthStatus)} className="w-full bg-gray-950 border border-white/5 rounded-xl px-4 py-2.5 text-xs text-white focus:border-brand-primary outline-none">
                                                            <option value="stable">Stable</option>
                                                            <option value="warning">Vigilance</option>
                                                            <option value="critical">Critique</option>
                                                        </select>
                                                    </div>
                                                </div>
                                                <div className="space-y-1 text-left">
                                                    <label className="text-[8px] font-black text-gray-400 uppercase">Symptômes & Notes</label>
                                                    <textarea rows={2} value={newNotes} onChange={(e) => setNewNotes(e.target.value)} className="w-full bg-gray-950 border border-white/5 rounded-xl px-4 py-3 text-xs text-white focus:border-brand-primary outline-none" placeholder="Observations cliniques..." />
                                                </div>
                                                <button type="submit" disabled={submittingLog} className="w-full bg-brand-primary text-gray-950 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
                                                    {submittingLog ? "Sauvegarde..." : "Valider le bilan"}
                                                </button>
                                            </form>
                                        </div>
                                    </>
                                )}
                             </div>
                          </motion.div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {adminTab === "hospitals" && (
              <div className="space-y-6">
          <div className="flex justify-between items-center pb-4 border-b border-white/5">
            <div>
              <h3 className="text-sm font-black uppercase text-brand-primary tracking-widest">
                Centres de Santé & Établissements
              </h3>
              <p className="text-[10px] text-gray-400 mt-1 uppercase">
                {hospitals.length} centres agréés intégrés dans le réseau de suivi clinique
              </p>
            </div>
            <button
              onClick={() => {
                setEditingHospital(null);
                setHospName("");
                setHospLocation("");
                setHospPhone("");
                setHospEmergency("");
                setShowAddHospital(!showAddHospital);
              }}
              className="bg-brand-primary text-gray-950 font-black uppercase text-[10px] px-5 py-3 rounded-2xl hover:scale-102 transition-all flex items-center gap-2 shadow-lg shadow-brand-primary/10"
            >
              <Plus size={16} />
              {showAddHospital ? "Masquer le formulaire" : "Ajouter un Centre"}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Hospital addition or editing form */}
            {showAddHospital && (
              <div className="lg:col-span-5 bg-white/5 border border-brand-primary/10 rounded-[2.5rem] p-6 text-left space-y-5">
                <h4 className="text-xs font-black uppercase text-brand-primary tracking-widest flex items-center gap-2">
                  <Stethoscope size={16} />
                  {editingHospital ? "Modifier le Centre" : "Enregistrer un nouveau Centre de Santé"}
                </h4>

                <form onSubmit={handleSaveHospital} className="space-y-4 font-sans">
                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                      Nom de l'établissement
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Hôpital Provincial de Bukavu"
                      value={hospName}
                      onChange={(e) => setHospName(e.target.value)}
                      className="w-full bg-gray-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-primary"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                      Localisation (Quartier, Avenue, Ville)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Bukavu, Sud-Kivu"
                      value={hospLocation}
                      onChange={(e) => setHospLocation(e.target.value)}
                      className="w-full bg-gray-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-primary"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                      Ligne Directe / Téléphone
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: +243 812 345 678"
                      value={hospPhone}
                      onChange={(e) => setHospPhone(e.target.value)}
                      className="w-full bg-gray-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-primary font-mono"
                      required
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-widest">
                      Contact d'Urgence (Ambulance / Maternité)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: +243 812 000 111"
                      value={hospEmergency}
                      onChange={(e) => setHospEmergency(e.target.value)}
                      className="w-full bg-gray-950 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-brand-primary font-mono"
                      required
                    />
                  </div>

                  <div className="flex gap-2 justify-end pt-2">
                    <button
                      type="button"
                      onClick={() => setShowAddHospital(false)}
                      className="px-4 py-2.5 rounded-xl text-[9px] font-black uppercase border border-white/10 hover:bg-white/5 transition-colors"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      disabled={savingHospital}
                      className="px-5 py-2.5 rounded-xl text-[9px] font-black uppercase bg-brand-primary text-gray-950 hover:bg-brand-primary/95 transition-colors flex items-center gap-1 shadow-lg disabled:opacity-50"
                    >
                      {savingHospital ? <Loader2 className="animate-spin inline" size={10} /> : null}
                      Sauvegarder
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* List of active Hospitals */}
            <div className={showAddHospital ? "lg:col-span-7 space-y-4" : "lg:col-span-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"}>
              {hospitals.length === 0 ? (
                <div className="col-span-full bg-white/5 p-12 rounded-[2.5rem] text-center border border-dashed border-white/10">
                  <p className="text-sm text-gray-400 italic">Aucun établissement médical enregistré.</p>
                </div>
              ) : (
                hospitals.map((h) => (
                  <div
                    key={h.id}
                    className="bg-white/5 border border-white/5 p-6 rounded-[2.5rem] hover:border-white/10 transition-colors text-left flex flex-col justify-between h-full space-y-4 group relative"
                  >
                    <div className="space-y-2">
                      <div className="flex justify-between items-start gap-4">
                        <div className="w-10 h-10 bg-brand-primary/10 rounded-xl flex items-center justify-center text-brand-primary shadow-inner shrink-0">
                          <MapPin size={18} />
                        </div>
                        <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => handleStartEditHospital(h)}
                            className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/5 text-[9px]"
                            title="Modifier"
                          >
                            <Edit2 size={12} />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteHospital(h.id)}
                            className="p-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/10 text-[9px]"
                            title="Supprimer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-sm font-black text-white uppercase tracking-tight">
                          {h.name}
                        </h4>
                        <p className="text-[10px] text-gray-400 font-bold uppercase mt-1">
                          {h.location}
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-white/5 space-y-1.5">
                      <p className="text-[10px] text-gray-400">
                        Contact: <strong className="text-white font-mono font-bold">{h.phone}</strong>
                      </p>
                      <p className="text-[10px] text-red-400 font-black uppercase tracking-widest">
                        Urgence: <span className="font-mono">{h.emergencyContact}</span>
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* QR MODAL */}
      <AnimatePresence>
        {showQR && selectedPatient && (
          <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white p-8 rounded-[3rem] max-w-sm w-full flex flex-col items-center text-center shadow-2xl relative"
            >
              <button
                onClick={() => setShowQR(false)}
                className="absolute top-5 right-5 p-2 bg-gray-100 rounded-full hover:bg-gray-200 text-gray-900 transition-colors"
              >
                <X size={16} />
              </button>

              <h4 className="text-lg font-black text-gray-900 uppercase tracking-tight mb-2">
                FICHE DE SUIVI NUMÉRIQUE
              </h4>
              <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-6">
                Fiche QR de {selectedPatient.name}
              </p>

              <div className="p-4 bg-gray-50 rounded-3xl border border-gray-100 shadow-inner mb-6">
                <QRCodeCanvas value={qrValue} size={200} />
              </div>

              <p className="text-[10px] text-brand-primary font-black tracking-widest uppercase mb-4 leading-normal leading-relaxed">
                À flasher par un confrère médecin ou infirmier au Sud-Kivu pour visualiser le parcours clinique complet.
              </p>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

// Helper Functions & Additional Components

export function calculateDueDate(lmpDateString: string): string {
  const lmp = new Date(lmpDateString);
  if (isNaN(lmp.getTime())) return new Date().toISOString();
  const dueDate = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
  return dueDate.toISOString();
}

export function calculateWeeksPregnant(lmpDateString: string): number {
  const lmp = new Date(lmpDateString);
  if (isNaN(lmp.getTime())) return 0;
  const diffMs = Date.now() - lmp.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return Math.max(0, Math.min(42, diffWeeks));
}

interface SymptomDefinition {
  id: string;
  label: string;
  risk?: "critical" | "warning" | "stable";
}

export function getLocalizedSymptoms(language: Language): SymptomDefinition[] {
  const symptomsByLang: { [key in Language]: SymptomDefinition[] } = {
    FR: [
      { id: "fevre", label: "Forte Fièvre", risk: "critical" },
      { id: "maux_tete", label: "Maux de tête graves", risk: "critical" },
      { id: "troubles_visuels", label: "Troubles visuels", risk: "critical" },
      { id: "saignement", label: "Saignement vaginal", risk: "critical" },
      { id: "pieds_enfles", label: "Pieds très enflés", risk: "warning" },
      { id: "contractions", label: "Contractions précoces", risk: "warning" },
      { id: "mouvement_bebe", label: "Moins de mouvements de bébé", risk: "critical" },
      { id: "fatigue", label: "Fatigue extrême", risk: "stable" },
    ],
    SW: [
      { id: "fevre", label: "Homa kali", risk: "critical" },
      { id: "maux_tete", label: "Maumivu makali ya kichwa", risk: "critical" },
      { id: "troubles_visuels", label: "Maono hafifu", risk: "critical" },
      { id: "saignement", label: "Kutokwa na damu", risk: "critical" },
      { id: "pieds_enfles", label: "Miguu kuvimba sana", risk: "warning" },
      { id: "contractions", label: "Vifungo vya mapema", risk: "warning" },
      { id: "mouvement_bebe", label: "Kupungua kwa mtoto kusonga", risk: "critical" },
      { id: "fatigue", label: "Uchovu uliokithiri", risk: "stable" },
    ],
    MSH: [
      { id: "fevre", label: "Omuliro gwinji", risk: "critical" },
      { id: "maux_tete", label: "Obushigo omu murhwi", risk: "critical" },
      { id: "troubles_visuels", label: "Amarhu g’amasu mafumu", risk: "critical" },
      { id: "saignement", label: "Okufuluha danda", risk: "critical" },
      { id: "pieds_enfles", label: "Ebinshino kufumba bwinji", risk: "warning" },
      { id: "contractions", label: "Okulomwa omu nda", risk: "warning" },
      { id: "mouvement_bebe", label: "Kupungua kwa omwana okunesa", risk: "critical" },
      { id: "fatigue", label: "Okuluha bwinji", risk: "stable" },
    ],
  };
  return symptomsByLang[language] || symptomsByLang["FR"];
}

function NavButton({
  active,
  icon: Icon,
  label,
  onClick,
}: {
  active: boolean;
  icon: any;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all relative ${
        active ? "text-brand-primary font-black" : "text-gray-400 hover:text-white"
      }`}
    >
      <Icon size={20} className={active ? "scale-110 text-brand-primary" : ""} />
      <span className="text-[9px] font-bold mt-1 uppercase tracking-wider">{label}</span>
      {active && (
        <motion.div
          layoutId="activeTabIndicator"
          className="absolute -bottom-1 left-2 right-2 h-0.5 bg-brand-primary rounded-full"
        />
      )}
    </button>
  );
}

function KickCounterCard({ t }: { t: any }) {
  const [kickCount, setKickCount] = useState(() => {
    const saved = localStorage.getItem("uzazi_kick_count");
    return saved ? parseInt(saved, 10) : 0;
  });

  const handleAddKick = () => {
    const newCount = kickCount + 1;
    setKickCount(newCount);
    localStorage.setItem("uzazi_kick_count", newCount.toString());
  };

  const handleResetKicks = (e: React.MouseEvent) => {
    e.stopPropagation();
    setKickCount(0);
    localStorage.setItem("uzazi_kick_count", "0");
  };

  return (
    <div className="bg-white/10 p-6 rounded-[2.5rem] border border-white/5 flex flex-col items-center justify-center text-center group hover:bg-white/5 transition-colors aspect-square lg:aspect-auto relative overflow-hidden">
      <div className="w-12 h-12 bg-amber-400/10 text-amber-400 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg">
        <Baby size={24} />
      </div>
      <p className="text-[10px] font-black text-brand-primary/70 uppercase tracking-widest mb-1 italic">
        {t.baby_kicks || "Mouvements Bébé"}
      </p>
      <p className="text-xl md:text-2xl font-black text-white">{kickCount}</p>

      <div className="flex gap-2 mt-4 relative z-10 font-sans">
        <button
          onClick={handleAddKick}
          className="bg-brand-primary text-gray-950 font-black uppercase text-[9px] px-3 py-1.5 rounded-xl hover:scale-105 active:scale-95 transition-all shadow-md"
        >
          +1 Kick
        </button>
        {kickCount > 0 && (
          <button
            onClick={handleResetKicks}
            className="bg-white/5 hover:bg-white/10 text-white font-black uppercase text-[9px] px-2.5 py-1.5 rounded-xl transition-all border border-white/5"
          >
            Reset
          </button>
        )}
      </div>
    </div>
  );
}

