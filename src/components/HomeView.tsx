import React, { useState, useMemo, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  Search, 
  Plus, 
  Trash2, 
  Check, 
  ChevronDown, 
  ChevronUp, 
  ArrowUpRight, 
  X,
  Smartphone,
  Download,
  AlertTriangle,
  CheckCircle2,
  ListTodo
} from 'lucide-react';
import { Santri, KeamananRecord, BendaharaRecord, Kompleks, Kamar } from '../types';
import { INITIAL_KOMPLEKS, INITIAL_KAMAR } from './HumasyView';

interface HomeViewProps {
  santriList: Santri[];
  keamananList: KeamananRecord[];
  bendaharaList: BendaharaRecord[];
  onChangeModule: (mod: string, subTab?: string) => void;
  onResetAllLocalData?: () => void;
}

interface TaskItem {
  id: string;
  text: string;
  status: 'done' | 'pending';
  deadline?: string;
  color: 'green' | 'yellow' | 'blue';
}

export default function HomeView({ 
  santriList, 
  keamananList, 
  bendaharaList, 
  onChangeModule,
  onResetAllLocalData
}: HomeViewProps) {
  // PWA banner state
  const [showPwaBanner, setShowPwaBanner] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [isDismissed, setIsDismissed] = useState(() => {
    return localStorage.getItem('smartsantri_pwa_dismissed') === 'true';
  });

  // Search state
  const [searchQuery, setSearchQuery] = useState('');

  // Task list state - EMPTY default as requested (No fake dummy tasks)
  const [tasks, setTasks] = useState<TaskItem[]>(() => {
    try {
      const local = localStorage.getItem('smartsantri_dashboard_tasks');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return []; // Empty by default
  });

  const [newTaskInput, setNewTaskInput] = useState('');
  const [isAddingTask, setIsAddingTask] = useState(false);

  // Save tasks to localStorage
  useEffect(() => {
    localStorage.setItem('smartsantri_dashboard_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (navigator as any).standalone;
    if (isStandalone || isDismissed) return;

    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    if (isIosDevice) {
      setShowPwaBanner(true);
    }

    if ((window as any).deferredPrompt) {
      setInstallPrompt((window as any).deferredPrompt);
      setShowPwaBanner(true);
    }

    const handleInstallable = () => {
      setInstallPrompt((window as any).deferredPrompt);
      setShowPwaBanner(true);
    };

    const handleInstalled = () => {
      setShowPwaBanner(false);
    };

    window.addEventListener('pwa-installable', handleInstallable);
    window.addEventListener('pwa-installed', handleInstalled);
    return () => {
      window.removeEventListener('pwa-installable', handleInstallable);
      window.removeEventListener('pwa-installed', handleInstalled);
    };
  }, [isDismissed]);

  const handleInstallClick = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    console.log(`User installation decision: ${outcome}`);
    (window as any).deferredPrompt = null;
    setInstallPrompt(null);
    setShowPwaBanner(false);
  };

  const handleDismissPwaBanner = () => {
    setIsDismissed(true);
    localStorage.setItem('smartsantri_pwa_dismissed', 'true');
    setShowPwaBanner(false);
  };

  // Complex & Room data
  const kompleksList: Kompleks[] = useMemo(() => {
    try {
      const local = localStorage.getItem('smartsantri_kompleks');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_KOMPLEKS;
  }, []);

  const kamarList: Kamar[] = useMemo(() => {
    try {
      const local = localStorage.getItem('smartsantri_kamar');
      if (local) {
        const parsed = JSON.parse(local);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {
      console.error(e);
    }
    return INITIAL_KAMAR;
  }, []);

  // 1. Data Santri Real Breakdown
  const totalSantriReal = santriList.length;

  const putraAktif = useMemo(() => 
    santriList.filter(s => s.gender === 'Putra' && (s.statusKeanggotaan === 'Aktif' || !s.statusKeanggotaan)).length
  , [santriList]);

  const putraAlumni = useMemo(() => 
    santriList.filter(s => s.gender === 'Putra' && s.statusKeanggotaan === 'Alumni').length
  , [santriList]);

  const putraMeninggal = useMemo(() => 
    santriList.filter(s => s.gender === 'Putra' && s.statusKeanggotaan === 'Meninggal').length
  , [santriList]);

  const putriAktif = useMemo(() => 
    santriList.filter(s => s.gender === 'Putri' && (s.statusKeanggotaan === 'Aktif' || !s.statusKeanggotaan)).length
  , [santriList]);

  const putriAlumni = useMemo(() => 
    santriList.filter(s => s.gender === 'Putri' && s.statusKeanggotaan === 'Alumni').length
  , [santriList]);

  const putriMeninggal = useMemo(() => 
    santriList.filter(s => s.gender === 'Putri' && s.statusKeanggotaan === 'Meninggal').length
  , [santriList]);

  // 2. Status Domisili Real
  const putraMuqim = useMemo(() => 
    santriList.filter(s => s.gender === 'Putra' && (s.statusKeanggotaan === 'Aktif' || !s.statusKeanggotaan) && (s.statusDomisili || s.status || 'Muqim') === 'Muqim').length
  , [santriList]);

  const putriMuqim = useMemo(() => 
    santriList.filter(s => s.gender === 'Putri' && (s.statusKeanggotaan === 'Aktif' || !s.statusKeanggotaan) && (s.statusDomisili || s.status || 'Muqim') === 'Muqim').length
  , [santriList]);

  const pctPutraMuqim = putraAktif > 0 ? Math.round((putraMuqim / putraAktif) * 100) : 0;
  const pctPutriMuqim = putriAktif > 0 ? Math.round((putriMuqim / putriAktif) * 100) : 0;

  // 3. Kamar Terisi vs Belum Ditempatkan Real
  const putraInKamar = useMemo(() => 
    santriList.filter(s => s.gender === 'Putra' && (s.statusKeanggotaan === 'Aktif' || !s.statusKeanggotaan) && s.kamarId).length
  , [santriList]);

  const putraBelumKamar = useMemo(() => 
    santriList.filter(s => s.gender === 'Putra' && (s.statusKeanggotaan === 'Aktif' || !s.statusKeanggotaan) && !s.kamarId).length
  , [santriList]);

  const pctPutraKamar = (putraInKamar + putraBelumKamar) > 0 ? Math.round((putraInKamar / (putraInKamar + putraBelumKamar)) * 100) : 0;

  const putriInKamar = useMemo(() => 
    santriList.filter(s => s.gender === 'Putri' && (s.statusKeanggotaan === 'Aktif' || !s.statusKeanggotaan) && s.kamarId).length
  , [santriList]);

  const putriBelumKamar = useMemo(() => 
    santriList.filter(s => s.gender === 'Putri' && (s.statusKeanggotaan === 'Aktif' || !s.statusKeanggotaan) && !s.kamarId).length
  , [santriList]);

  const pctPutriKamar = (putriInKamar + putriBelumKamar) > 0 ? Math.round((putriInKamar / (putriInKamar + putriBelumKamar)) * 100) : 0;

  // 4. Monitor Emis Terdaftar Real
  const putraAktifEmis = useMemo(() => 
    santriList.filter(s => s.gender === 'Putra' && (s.statusKeanggotaan === 'Aktif' || !s.statusKeanggotaan) && (s.nis || s.nik)).length
  , [santriList]);
  const pctPutraAktifEmis = putraAktif > 0 ? Math.round((putraAktifEmis / putraAktif) * 100) : 0;

  const putraAlumniEmis = useMemo(() => 
    santriList.filter(s => s.gender === 'Putra' && s.statusKeanggotaan === 'Alumni' && (s.nis || s.nik)).length
  , [santriList]);
  const pctPutraAlumniEmis = putraAlumni > 0 ? Math.round((putraAlumniEmis / putraAlumni) * 100) : 0;

  const putriAktifEmis = useMemo(() => 
    santriList.filter(s => s.gender === 'Putri' && (s.statusKeanggotaan === 'Aktif' || !s.statusKeanggotaan) && (s.nis || s.nik)).length
  , [santriList]);
  const pctPutriAktifEmis = putriAktif > 0 ? Math.round((putriAktifEmis / putriAktif) * 100) : 0;

  const putriAlumniEmis = useMemo(() => 
    santriList.filter(s => s.gender === 'Putri' && s.statusKeanggotaan === 'Alumni' && (s.nis || s.nik)).length
  , [santriList]);
  const pctPutriAlumniEmis = putriAlumni > 0 ? Math.round((putriAlumniEmis / putriAlumni) * 100) : 0;

  // 5. Aktifitas Terbaru Real
  const latestActivity = useMemo(() => {
    if (keamananList && keamananList.length > 0) {
      const top = keamananList[keamananList.length - 1];
      return {
        time: top.tanggal || new Date().toLocaleDateString('id-ID'),
        text: `Catatan Pelanggaran: ${top.namaSantri} (${top.deskripsi || top.pelanggaran || 'Pelanggaran baru'})`
      };
    }
    if (santriList && santriList.length > 0) {
      const lastSantri = santriList[santriList.length - 1];
      return {
        time: new Date().toLocaleDateString('id-ID'),
        text: `Data ${lastSantri.nama} (${lastSantri.gender || 'Santri'}) terdaftar/diperbarui`
      };
    }
    return {
      time: '-',
      text: 'Belum ada aktivitas terbaru'
    };
  }, [keamananList, santriList]);

  // 6. Top Violators Real strictly from keamananList (No dummy fake data)
  const topViolators = useMemo(() => {
    if (!keamananList || keamananList.length === 0) return [];
    const map = new Map<string, { nama: string; poin: number; count: number }>();
    keamananList.forEach(k => {
      const existing = map.get(k.namaSantri) || { nama: k.namaSantri, poin: 0, count: 0 };
      existing.poin += k.poin || 0;
      existing.count += 1;
      map.set(k.namaSantri, existing);
    });
    return Array.from(map.values())
      .sort((a, b) => b.poin - a.poin)
      .slice(0, 10);
  }, [keamananList]);

  // Handle task actions
  const toggleTaskStatus = (id: string) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return {
          ...t,
          status: t.status === 'done' ? 'pending' : 'done'
        };
      }
      return t;
    }));
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
  };

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskInput.trim()) return;
    const newTask: TaskItem = {
      id: Date.now().toString(),
      text: newTaskInput.trim(),
      status: 'pending',
      deadline: '1h 00j 00m',
      color: tasks.length % 2 === 0 ? 'yellow' : 'blue'
    };
    setTasks(prev => [...prev, newTask]);
    setNewTaskInput('');
    setIsAddingTask(false);
  };

  // Filter tasks by search query if typed
  const filteredTasks = tasks.filter(t => 
    t.text.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="min-h-screen bg-[#E6F4F1] p-3 md:p-6 font-sans text-slate-800 space-y-4 max-w-[1600px] mx-auto"
    >
      {/* PWA Banner if applicable */}
      {showPwaBanner && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-900 text-white p-4 shadow-md border border-emerald-600/30"
        >
          <div className="flex items-start justify-between gap-4 relative z-10">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-yellow-300 shrink-0">
                <Smartphone className="h-5 w-5 animate-bounce" style={{ animationDuration: '3s' }} />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Instal Go AttarOkey di HP / Desktop</h3>
                <p className="text-xs text-emerald-100/90">
                  {isIOS 
                    ? "Gunakan portal ini lebih cepat dan lancar dari layar utama perangkat Apple Anda." 
                    : "Simpan aplikasi ini ke beranda untuk akses instan dan kinerja lebih lancar."}
                </p>
              </div>
            </div>
            <button
              onClick={handleDismissPwaBanner}
              className="text-white/70 hover:text-white bg-white/5 hover:bg-white/10 p-1 rounded-full transition-all shrink-0 cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          {!isIOS && installPrompt && (
            <div className="mt-3 flex gap-2 justify-end">
              <button
                onClick={handleInstallClick}
                className="inline-flex items-center gap-1.5 bg-yellow-400 hover:bg-yellow-300 text-emerald-950 font-bold px-4 py-1.5 rounded-xl text-xs shadow-xs transition-all cursor-pointer"
              >
                <Download className="h-3.5 w-3.5" />
                Instal
              </button>
            </div>
          )}
        </motion.div>
      )}

      {/* Main Grid Layout: Left Main Area & Right Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* LEFT / MAIN COLUMN (8 COLS ON LG / 9 COLS ON XL) */}
        <div className="lg:col-span-8 xl:col-span-9 space-y-4">

          {/* 1. Hero Welcome Banner */}
          <div className="bg-[#0D8A68] rounded-2xl p-5 text-white shadow-xs relative overflow-hidden flex flex-col justify-between min-h-[140px]">
            {/* Background subtle pattern decorative circle */}
            <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />

            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Sugeng Rawuh, <span className="font-serif italic font-normal text-emerald-200">David</span>
              </h1>
              <p className="text-xs md:text-sm text-emerald-100/90 italic mt-1.5 font-medium max-w-2xl">
                "Ojo pengen dadi pemimpin, tapi nek dikon mimpin kudu amanah" ~Syaikhina Minanurrochman
              </p>
            </div>

            <div className="mt-4">
              <button 
                onClick={() => onChangeModule('sekretaris', 'santri')}
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 text-white text-xs md:text-sm font-semibold px-4 py-2 rounded-full border border-white/25 transition-all cursor-pointer backdrop-blur-xs shadow-3xs"
              >
                <span className="w-5 h-5 rounded-full bg-white text-[#0D8A68] flex items-center justify-center font-bold text-xs shrink-0">→</span>
                <span>Mulai Jelajahi Data</span>
              </button>
            </div>
          </div>

          {/* 2. Aktifitas Terbaru Ticker Bar (REAL DATA) */}
          <div className="bg-white rounded-full p-1.5 px-3 border border-emerald-100 shadow-3xs flex items-center justify-between text-xs font-semibold gap-2">
            <div className="flex items-center gap-2.5 min-w-0 flex-1">
              <span className="bg-[#0D8A68] text-white text-[11px] font-bold px-3 py-1 rounded-full shrink-0 shadow-3xs">
                Aktifitas Terbaru
              </span>
              <span className="text-rose-500 font-bold shrink-0 text-[11px] md:text-xs">
                ({latestActivity.time})
              </span>
              <span className="text-slate-600 truncate text-[11px] md:text-xs font-medium">
                {latestActivity.text}
              </span>
            </div>
            <div className="flex items-center gap-0.5 text-slate-400 shrink-0">
              <button className="p-1 hover:text-slate-600 cursor-pointer">
                <ChevronUp className="w-3.5 h-3.5" />
              </button>
              <button className="p-1 hover:text-slate-600 cursor-pointer">
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* 3. Top Row Grid: Data Statistik Santri + Status Domisili + Donut Kamar Putra & Putri */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3.5">
            
            {/* Card A: Data Statistik Santri (5 Cols) - REAL DATA */}
            <div className="md:col-span-5 bg-white rounded-2xl border border-emerald-100/80 shadow-3xs overflow-hidden flex flex-col justify-between">
              {/* Header Pill */}
              <div className="bg-[#0D8A68] text-white text-center text-xs font-extrabold py-2.5 tracking-wide">
                Data Statistik Santri
              </div>

              {/* Body Content */}
              <div className="p-4 flex flex-col items-center justify-center space-y-4 flex-1">
                {/* Double Ring SVG Donut Chart */}
                <div className="relative w-36 h-36 flex items-center justify-center my-1">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                    {/* Outer Ring: Pink (Putri) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="40"
                      stroke="#FF4B91"
                      strokeWidth="8"
                      strokeDasharray={`${totalSantriReal > 0 ? (putriAktif + putriAlumni + putriMeninggal) / totalSantriReal * 251.3 : 0} 251.3`}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                    {/* Inner Ring: Cyan/Blue (Putra) */}
                    <circle
                      cx="50"
                      cy="50"
                      r="30"
                      stroke="#00A3FF"
                      strokeWidth="8"
                      strokeDasharray={`${totalSantriReal > 0 ? (putraAktif + putraAlumni + putraMeninggal) / totalSantriReal * 188.4 : 0} 188.4`}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  {/* Center Text */}
                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">TOTAL</span>
                    <span className="text-xl font-black text-slate-900 leading-none my-0.5">
                      {totalSantriReal}
                    </span>
                    <span className="text-[10px] font-bold text-slate-500">Santri</span>
                  </div>
                </div>

                {/* Table Breakdown (REAL DATA) */}
                <div className="w-full text-[11px] font-bold border border-slate-100 rounded-lg overflow-hidden">
                  <div className="grid grid-cols-4 text-center">
                    <div className="bg-white p-1 text-slate-400"></div>
                    <div className="bg-[#3B82F6] text-white p-1">Aktif</div>
                    <div className="bg-[#93C5FD] text-slate-800 p-1">Alumni</div>
                    <div className="bg-[#1E40AF] text-white p-1">Meninggal</div>
                  </div>
                  {/* Row Putra */}
                  <div className="grid grid-cols-4 text-center border-t border-slate-100">
                    <div className="bg-[#0284C7] text-white p-1 flex items-center justify-center">Putra</div>
                    <div className="bg-[#E0F2FE] text-sky-900 p-1">{putraAktif}</div>
                    <div className="bg-[#E0F2FE] text-sky-900 p-1">{putraAlumni}</div>
                    <div className="bg-[#E0F2FE] text-sky-900 p-1">{putraMeninggal}</div>
                  </div>
                  {/* Row Putri */}
                  <div className="grid grid-cols-4 text-center border-t border-slate-100">
                    <div className="bg-[#EC4899] text-white p-1 flex items-center justify-center">Putri</div>
                    <div className="bg-[#FCE7F3] text-pink-900 p-1">{putriAktif}</div>
                    <div className="bg-[#FCE7F3] text-pink-900 p-1">{putriAlumni}</div>
                    <div className="bg-[#FCE7F3] text-pink-900 p-1">{putriMeninggal}</div>
                  </div>
                </div>

                {/* Button Kelola Data */}
                <button 
                  onClick={() => onChangeModule('sekretaris', 'santri')}
                  className="w-full bg-[#0D8A68] hover:bg-[#0B7A5C] text-white font-extrabold text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-3xs transition-all cursor-pointer"
                >
                  <span>Kelola Data</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Card B & C & D: Status Domisili + Donut Kamar (7 Cols) - REAL DATA */}
            <div className="md:col-span-7 space-y-3.5 flex flex-col justify-between">
              
              {/* Card B: Status Domisili Santri Aktif */}
              <div className="bg-white rounded-2xl border border-emerald-100/80 shadow-3xs overflow-hidden">
                <div className="bg-[#0D8A68] text-white text-center text-xs font-extrabold py-2.5 tracking-wide">
                  Status Domisili Santri Aktif
                </div>
                <div className="p-4 space-y-3 text-xs font-bold">
                  {/* Row Putra */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-700">Domisili Muqim <span className="text-[#00A3FF]">Putra</span></span>
                      <span className="font-extrabold text-slate-800">{putraMuqim} <span className="text-slate-400 font-normal">/{putraAktif}</span></span>
                    </div>
                    <div className="w-full bg-slate-100 h-5 rounded-full overflow-hidden relative border border-slate-200/60">
                      <div className="bg-[#00A3FF] h-full rounded-full transition-all duration-500" style={{ width: `${pctPutraMuqim}%` }} />
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-white font-extrabold drop-shadow-xs">{pctPutraMuqim}%</span>
                    </div>
                  </div>

                  {/* Row Putri */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-slate-700">Domisili Muqim <span className="text-[#FF4B91]">Putri</span></span>
                      <span className="font-extrabold text-slate-800">{putriMuqim} <span className="text-slate-400 font-normal">/{putriAktif}</span></span>
                    </div>
                    <div className="w-full bg-slate-100 h-5 rounded-full overflow-hidden relative border border-slate-200/60">
                      <div className="bg-[#FF4B91] h-full rounded-full transition-all duration-500" style={{ width: `${pctPutriMuqim}%` }} />
                      <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-white font-extrabold drop-shadow-xs">{pctPutriMuqim}%</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Grid 2 Donut Cards for Kamar Putra & Kamar Putri */}
              <div className="grid grid-cols-2 gap-3.5 flex-1">
                
                {/* Kamar Putra Donut */}
                <div className="bg-white rounded-2xl border border-emerald-100/80 shadow-3xs p-3 flex flex-col items-center justify-between">
                  <div className="relative w-28 h-28 flex items-center justify-center my-1">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="34"
                        stroke="#00A3FF"
                        strokeWidth="12"
                        strokeDasharray={`${pctPutraKamar * 2.136} 213.6`}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Total</span>
                      <span className="text-xs font-black text-slate-800 leading-tight">{pctPutraKamar}%</span>
                      <span className="text-[8px] font-bold text-slate-400">Terisi</span>
                    </div>
                  </div>

                  {/* Dual Badge Footer */}
                  <div className="w-full text-[10px] font-bold border border-slate-100 rounded-lg overflow-hidden mt-2">
                    <div className="grid grid-cols-2 text-center">
                      <div className="bg-[#00A3FF] text-white p-1">Kamar Terisi</div>
                      <div className="bg-[#E0F2FE] text-sky-800 p-1">Blm ditempatkan</div>
                    </div>
                    <div className="grid grid-cols-2 text-center border-t border-slate-100">
                      <div className="p-1 bg-sky-50 text-sky-900 font-extrabold">{putraInKamar} <span className="font-normal text-slate-400 text-[9px]">/{putraInKamar + putraBelumKamar}</span></div>
                      <div className="p-1 bg-slate-50 text-slate-700 font-extrabold">{putraBelumKamar}</div>
                    </div>
                  </div>
                </div>

                {/* Kamar Putri Donut */}
                <div className="bg-white rounded-2xl border border-emerald-100/80 shadow-3xs p-3 flex flex-col items-center justify-between">
                  <div className="relative w-28 h-28 flex items-center justify-center my-1">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      <circle
                        cx="50"
                        cy="50"
                        r="34"
                        stroke="#FF4B91"
                        strokeWidth="12"
                        strokeDasharray={`${pctPutriKamar * 2.136} 213.6`}
                        strokeLinecap="round"
                        fill="transparent"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center text-center">
                      <span className="text-[8px] font-bold text-slate-400 uppercase">Total</span>
                      <span className="text-xs font-black text-slate-800 leading-tight">{pctPutriKamar}%</span>
                      <span className="text-[8px] font-bold text-slate-400">Terisi</span>
                    </div>
                  </div>

                  {/* Dual Badge Footer */}
                  <div className="w-full text-[10px] font-bold border border-slate-100 rounded-lg overflow-hidden mt-2">
                    <div className="grid grid-cols-2 text-center">
                      <div className="bg-[#FF4B91] text-white p-1">Kamar Terisi</div>
                      <div className="bg-[#FCE7F3] text-pink-800 p-1">Blm ditempatkan</div>
                    </div>
                    <div className="grid grid-cols-2 text-center border-t border-slate-100">
                      <div className="p-1 bg-pink-50 text-pink-900 font-extrabold">{putriInKamar} <span className="font-normal text-slate-400 text-[9px]">/{putriInKamar + putriBelumKamar}</span></div>
                      <div className="p-1 bg-slate-50 text-slate-700 font-extrabold">{putriBelumKamar}</div>
                    </div>
                  </div>
                </div>

              </div>

            </div>

          </div>

          {/* 4. Bottom Row Grid: Monitor Emis Terdaftar (REAL DATA) */}
          <div className="bg-white rounded-2xl border border-emerald-100/80 shadow-3xs overflow-hidden">
            <div className="bg-[#0D8A68] text-white text-center text-xs font-extrabold py-2.5 tracking-wide">
              Monitor Emis Terdaftar
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-bold">
              {/* Row 1 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-700">Santri Aktif <span className="text-[#0D8A68]">Putra</span></span>
                  <span className="font-extrabold text-slate-800">{putraAktifEmis} <span className="text-slate-400 font-normal">/{putraAktif}</span></span>
                </div>
                <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden relative">
                  <div className="bg-[#0D8A68] h-full rounded-full transition-all duration-500" style={{ width: `${pctPutraAktifEmis}%` }} />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-white font-bold">{pctPutraAktifEmis}%</span>
                </div>
              </div>

              {/* Row 2 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-700">Santri Alumni <span className="text-[#0D8A68]">Putra</span></span>
                  <span className="font-extrabold text-slate-800">{putraAlumniEmis} <span className="text-slate-400 font-normal">/{putraAlumni}</span></span>
                </div>
                <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden relative">
                  <div className="bg-[#0D8A68] h-full rounded-full transition-all duration-500" style={{ width: `${pctPutraAlumniEmis}%` }} />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-white font-bold">{pctPutraAlumniEmis}%</span>
                </div>
              </div>

              {/* Row 3 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-700">Santri Aktif <span className="text-[#3B82F6]">Putri</span></span>
                  <span className="font-extrabold text-slate-800">{putriAktifEmis} <span className="text-slate-400 font-normal">/{putriAktif}</span></span>
                </div>
                <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden relative">
                  <div className="bg-[#3B82F6] h-full rounded-full transition-all duration-500" style={{ width: `${pctPutriAktifEmis}%` }} />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-white font-bold">{pctPutriAktifEmis}%</span>
                </div>
              </div>

              {/* Row 4 */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-slate-700">Santri Alumni <span className="text-[#3B82F6]">Putri</span></span>
                  <span className="font-extrabold text-slate-800">{putriAlumniEmis} <span className="text-slate-400 font-normal">/{putriAlumni}</span></span>
                </div>
                <div className="w-full bg-slate-100 h-4 rounded-full overflow-hidden relative">
                  <div className="bg-[#3B82F6] h-full rounded-full transition-all duration-500" style={{ width: `${pctPutriAlumniEmis}%` }} />
                  <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[9px] text-white font-bold">{pctPutriAlumniEmis}%</span>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* RIGHT SIDEBAR COLUMN (4 COLS ON LG / 3 COLS ON XL) */}
        <div className="lg:col-span-4 xl:col-span-3 space-y-4">
          
          {/* Top Search Input Bar */}
          <div className="bg-white rounded-2xl p-2 px-4 border border-emerald-100 shadow-3xs flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input 
              type="text"
              placeholder="Cari"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs font-bold text-slate-800 placeholder-slate-400 bg-transparent focus:outline-none"
            />
          </div>

          {/* Tugas Saya Section (NO FAKE DATA) */}
          <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-3xs space-y-3">
            <div className="flex items-center justify-between pb-1 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-800 text-sm">Tugas Saya</h3>
              <button 
                onClick={() => setIsAddingTask(!isAddingTask)}
                className="w-6 h-6 rounded-full bg-slate-100 hover:bg-emerald-100 hover:text-emerald-700 flex items-center justify-center text-slate-600 transition-colors cursor-pointer font-bold"
                title="Tambah Tugas Baru"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Add Form */}
            {isAddingTask && (
              <form onSubmit={handleAddTask} className="flex flex-col gap-2 p-2 bg-slate-50 rounded-xl border border-slate-200">
                <input 
                  type="text"
                  placeholder="Deskripsi tugas baru..."
                  value={newTaskInput}
                  onChange={(e) => setNewTaskInput(e.target.value)}
                  className="text-xs p-2 rounded-lg bg-white border border-slate-200 font-medium focus:outline-none focus:border-emerald-500"
                  autoFocus
                />
                <div className="flex justify-end gap-1.5">
                  <button 
                    type="button" 
                    onClick={() => setIsAddingTask(false)}
                    className="px-2.5 py-1 text-[11px] font-bold text-slate-500 hover:bg-slate-200 rounded-lg cursor-pointer"
                  >
                    Batal
                  </button>
                  <button 
                    type="submit"
                    className="px-3 py-1 text-[11px] font-bold bg-[#0D8A68] text-white rounded-lg cursor-pointer"
                  >
                    Simpan
                  </button>
                </div>
              </form>
            )}

            {/* Task Items List */}
            <div className="space-y-2.5">
              {filteredTasks.map((task) => {
                const isDone = task.status === 'done';
                let cardBg = 'bg-slate-50 border-slate-100';
                if (isDone) {
                  cardBg = 'bg-[#EAFBF3] border-emerald-200/60';
                } else if (task.color === 'yellow') {
                  cardBg = 'bg-[#FFFBEB] border-amber-200/60';
                } else if (task.color === 'blue') {
                  cardBg = 'bg-[#F0F9FF] border-sky-200/60';
                }

                return (
                  <div 
                    key={task.id}
                    className={`p-3 rounded-2xl border ${cardBg} shadow-2xs space-y-2 transition-all`}
                  >
                    <div className="flex items-start gap-2.5">
                      {/* Checkbox */}
                      <button
                        onClick={() => toggleTaskStatus(task.id)}
                        className={`w-5 h-5 rounded-md border mt-0.5 flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                          isDone 
                            ? 'bg-emerald-500 border-emerald-500 text-white' 
                            : 'bg-white border-slate-300 hover:border-emerald-500'
                        }`}
                      >
                        {isDone && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                      </button>

                      {/* Task Text */}
                      <p className={`text-xs font-medium leading-relaxed flex-1 ${
                        isDone ? 'line-through text-slate-500' : 'text-slate-800 font-semibold'
                      }`}>
                        {task.text}
                      </p>
                    </div>

                    {/* Bottom Status / Deadline & Delete */}
                    <div className="flex items-center justify-between pt-1 pl-7">
                      {isDone ? (
                        <span className="bg-[#22C55E] text-white text-[10px] font-extrabold px-3 py-1 rounded-full shadow-3xs">
                          Terselesaikan
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-500">
                          <span>Deadline</span>
                          <span className="text-rose-500 font-extrabold">{task.deadline || '1h 00j 00m'}</span>
                        </div>
                      )}

                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-1 text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Hapus Tugas"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {filteredTasks.length === 0 && (
                <div className="text-center py-6 px-2 bg-slate-50/50 rounded-xl border border-dashed border-slate-200">
                  <ListTodo className="w-8 h-8 text-slate-300 mx-auto mb-1.5" />
                  <p className="text-xs font-semibold text-slate-500">Belum ada tugas</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">Klik + untuk menambah tugas baru</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>

      {/* FULL WIDTH CARD FOR TOP 10 PELANGGARAN (EXPANDED ALL THE WAY TO RIGHT SCREEN EDGE) */}
      <div className="w-full bg-[#0D8A68] rounded-2xl p-4 md:p-5 text-white shadow-3xs border border-emerald-700/50">
        
        {/* Top Pills Header */}
        <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <button className="bg-[#4ADE80] text-slate-950 font-black text-xs px-4 py-1.5 rounded-full shadow-3xs cursor-pointer">
              Top 10 Pelanggaran
            </button>
            <span className="text-xs text-emerald-100 font-medium hidden sm:inline">
              Data akumulasi dari modul Keamanan Santri
            </span>
          </div>

          <button 
            onClick={() => onChangeModule('keamanan')}
            className="inline-flex items-center gap-1.5 bg-[#0B7A5C] hover:bg-[#096B50] text-white font-bold text-xs px-4 py-1.5 rounded-full transition-colors cursor-pointer border border-emerald-400/20"
          >
            <span>Buka Modul Keamanan</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* List items 1 - 10 (FULL-WIDTH RESPONSIVE GRID) */}
        {topViolators.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
            {topViolators.map((item, idx) => {
              const rankNum = idx + 1;
              return (
                <div 
                  key={idx}
                  onClick={() => onChangeModule('keamanan')}
                  className="bg-[#10B981]/30 hover:bg-[#10B981]/50 border border-emerald-400/20 rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all text-xs font-bold gap-2 group shadow-2xs"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="w-6 h-6 rounded-full bg-white text-slate-900 font-extrabold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                        {rankNum}
                      </span>
                      <span className="text-white font-extrabold text-sm truncate group-hover:text-yellow-300 transition-colors">
                        {item.nama}
                      </span>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-emerald-200 shrink-0 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-emerald-400/20 text-[11px]">
                    <span className="text-emerald-200 font-bold">{item.poin} <span className="font-normal text-emerald-300/80 text-[10px]">Poin</span></span>
                    <span className="text-emerald-100 font-bold italic">{item.count}x <span className="font-normal text-emerald-300/80 text-[10px] not-italic">Pelanggaran</span></span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8 px-4 bg-emerald-900/30 rounded-xl border border-dashed border-emerald-500/30">
            <CheckCircle2 className="w-9 h-9 text-emerald-300/60 mx-auto mb-2" />
            <p className="text-sm font-bold text-emerald-100">Belum ada data pelanggaran tercatat</p>
            <p className="text-xs text-emerald-200/70 mt-1">
              Catatan pelanggaran santri dari modul Keamanan akan muncul di sini secara otomatis.
            </p>
          </div>
        )}

      </div>
    </motion.div>
  );
}
