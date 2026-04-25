const fs = require('fs');

let code = fs.readFileSync('src/App.tsx', 'utf-8');

// We will handle the changes using node.
// Adding slugify import
code = code.replace(/import { db, auth } from '\.\/lib\/firebase';/, "import slugify from 'slugify';\nimport { db, auth } from './lib/firebase';");

// Fixing useEffect dependencies and logic
const oldUseEffect = `  // Logic to load data on mount
  useEffect(() => {
    if (!user) return;

    // Sync patient data
    const unsubPatient = onSnapshot(doc(db, 'users', user.uid), (snap) => {
      if (snap.exists()) {
        const p = snap.data() as Patient;
        setPatient(p);
        setIsAdmin(!!p.isAdmin);
        if (p.language) setLanguage(p.language as Language);
        localStorage.setItem('uzazi_patient', JSON.stringify(p));
      }
    });

    // Sync logs
    const q = query(collection(db, 'users', user.uid, 'logs'), orderBy('createdAt', 'desc'));
    const unsubLogs = onSnapshot(q, (snap) => {
      const logsData = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as CheckupLog));
      setLogs(logsData);
      localStorage.setItem('uzazi_logs', JSON.stringify(logsData));
    });

    return () => {
      unsubPatient();
      unsubLogs();
    };
  }, [user]);`;

const newUseEffect = `  // Logic to load data on mount
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
    });

    // Sync logs
    const q = query(collection(db, 'users', patient.id, 'logs'), orderBy('createdAt', 'desc'));
    const unsubLogs = onSnapshot(q, (snap) => {
      const logsData = snap.docs.map(doc => ({ ...doc.data(), id: doc.id } as CheckupLog));
      setLogs(logsData);
      localStorage.setItem('uzazi_logs', JSON.stringify(logsData));
    });

    return () => {
      unsubPatient();
      unsubLogs();
    };
  }, [user, patient?.id]);`;

code = code.replace(oldUseEffect, newUseEffect);

// Editing handleLogin
const oldHandleLogin = `  const handleLogin = async (name: string) => {
    setIsLoggingIn(true);
    setError(null);
    try {
      await googleLogin();
    } catch (e: any) {
      console.error("Login error:", e);
      setError("Erreur de connexion");
    } finally {
      setIsLoggingIn(false);
    }
  };`;

const newHandleLogin = `  const [pendingName, setPendingName] = useState<string>('');
  const handleLogin = async (name: string) => {
    const rawName = name.trim();
    if (!rawName) return;

    setIsLoggingIn(true);
    setError(null);
    try {
      if (!user) {
        await googleLogin();
      }
      
      if (rawName.toLowerCase() === '@admin') {
         setIsAdmin(true);
         setActiveTab('admin');
         setShowOnboarding(false);
         setPatient({ id: '@admin', name: '@admin', isAdmin: true } as any);
         return;
      }
      
      const slug = slugify(rawName, { lower: true, strict: true });
      const userDoc = await getDoc(doc(db, 'users', slug));
      
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
        setPendingName(rawName);
        setShowOnboarding(true);
      }
    } catch (e: any) {
      console.error("Login error:", e);
      setError("Erreur de connexion");
    } finally {
      setIsLoggingIn(false);
    }
  };`;

code = code.replace(oldHandleLogin, newHandleLogin);

// Also need to fix the updateDoc for language
code = code.replace(/await updateDoc\(doc\(db, 'users', user\.uid\), \{/g, "await updateDoc(doc(db, 'users', updatedPatient.id), {");

// Editing handleRegister
const oldHandleRegister = `  const handleRegister = async (name: string, phone: string, lmp: string, hospitalId: string) => {
    if (!user) return;
    setIsRegistering(true);
    setError(null);
    try {
      const newPatient: Patient = {
        id: user.uid,
        name,
        phone,
        weight: 65, // Default weight
        lastPeriodDate: lmp,
        dueDate: calculateDueDate(lmp),
        weeksPregnant: calculateWeeksPregnant(lmp),
        assignedHospitalId: hospitalId,
        language: language,
        isAdmin: user.email === 'princebamba2112@gmail.com',
      };
      
      await setDoc(doc(db, 'users', user.uid), {
        ...newPatient,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setPatient(newPatient);
      localStorage.setItem('uzazi_patient', JSON.stringify(newPatient));
      setShowOnboarding(false);
    } catch (e: any) {
      console.error("Registration error:", e);
      handleFirestoreError(e, 'create', \`users/\${user.uid}\`);
      setError("Erreur d'inscription");
    } finally {
      setIsRegistering(false);
    }
  };`;

const newHandleRegister = `  const handleRegister = async (name: string, phone: string, lmp: string, hospitalId: string) => {
    if (!user) return;
    setIsRegistering(true);
    setError(null);
    try {
      const slug = slugify(name, { lower: true, strict: true });
      const newPatient: Patient = {
        id: slug,
        name,
        phone,
        weight: 65, // Default weight
        lastPeriodDate: lmp,
        dueDate: calculateDueDate(lmp),
        weeksPregnant: calculateWeeksPregnant(lmp),
        assignedHospitalId: hospitalId,
        language: language,
        isAdmin: false,
      };
      
      await setDoc(doc(db, 'users', slug), {
        ...newPatient,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      
      setPatient(newPatient);
      localStorage.setItem('uzazi_patient', JSON.stringify(newPatient));
      localStorage.setItem('uzazi_saved_name', name);
      setShowOnboarding(false);
    } catch (e: any) {
      console.error("Registration error:", e);
      handleFirestoreError(e, 'create', \`users/something\`);
      setError("Erreur d'inscription");
    } finally {
      setIsRegistering(false);
    }
  };`;

code = code.replace(oldHandleRegister, newHandleRegister);

// Fixing handleAddLog
code = code.replace(/patientId: user\.uid,/g, "patientId: patient.id,");
code = code.replace(/await addDoc\(collection\(db, 'users', user\.uid, 'logs'\), logData\);/g, "await addDoc(collection(db, 'users', patient.id, 'logs'), logData);");
code = code.replace(/handleFirestoreError\(e, 'create', \`users\/\$\{user\.uid\}\/logs\`\);/g, "handleFirestoreError(e, 'create', \`users/\${patient.id}/logs\`);");

// Replace Onboarding init with pendingName
code = code.replace(/<Onboarding onRegister=\{handleRegister\} language=\{language\} initialName=\{patient\.name\} isLoading=\{isRegistering\} error=\{error\} \/>/g, "<Onboarding onRegister={handleRegister} language={language} initialName={pendingName || ''} isLoading={isRegistering} error={error} />");

fs.writeFileSync('src/App.tsx', code);
