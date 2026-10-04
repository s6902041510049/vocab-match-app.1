'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import {
  Users,
  Play,
  Copy,
  Check,
  Trophy,
  Loader2,
  ArrowLeft,
  BookOpen,
  Link as LinkIcon,
  UserX,
  Flame,
  CheckCircle2,
} from 'lucide-react';

interface StudentMember {
  id: string;
  name: string;
  score: number;
  matchedPairsCount: number;
  completed: boolean;
  timeTakenSeconds?: number;
}

const AVATAR_COLORS = [
  'bg-pink-100 text-pink-700 border-pink-300',
  'bg-purple-100 text-purple-700 border-purple-300',
  'bg-blue-100 text-blue-700 border-blue-300',
  'bg-cyan-100 text-cyan-700 border-cyan-300',
  'bg-emerald-100 text-emerald-700 border-emerald-300',
  'bg-amber-100 text-amber-700 border-amber-300',
];

export default function TeacherRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomCode = (params?.code as string) || '123456';

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStarting, setIsStarting] = useState(false);

  // จำลองรายชื่อนักเรียนที่เข้าร่วมห้องเรียลไทม์
  const [students, setStudents] = useState<StudentMember[]>([
    { id: '1', name: 'น้องเจมส์', score: 0, matchedPairsCount: 0, completed: false },
    { id: '2', name: 'น้องฟ้า', score: 0, matchedPairsCount: 0, completed: false },
    { id: '3', name: 'น้องมิว', score: 0, matchedPairsCount: 0, completed: false },
    { id: '4', name: 'น้องไอซ์', score: 0, matchedPairsCount: 0, completed: false },
  ]);

  useEffect(() => {
    const auth = localStorage.getItem('teacher_auth');
    if (!auth) {
      router.push('/login');
    }
  }, [router]);

  const copyCode = () => {
    navigator.clipboard.writeText(roomCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const copyJoinLink = () => {
    const joinUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/student/join?code=${roomCode}`;
    navigator.clipboard.writeText(joinUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleStartGame = () => {
    if (students.length === 0) {
      alert('ยังไม่มีนักเรียนเข้าร่วมห้อง กรุณารอให้นักเรียนเข้าร่วมอย่างน้อย 1 คน');
      return;
    }
    setIsStarting(true);
    setTimeout(() => {
      setIsStarting(false);
      setIsPlaying(true);
      // จำลองอัปเดตคะแนนเมื่อเริ่มเกม
      setStudents((prev) =>
        prev.map((s) => ({
          ...s,
          score: Math.floor(Math.random() * 500) + 500,
          matchedPairsCount: 3,
          completed: true,
          timeTakenSeconds: Math.floor(Math.random() * 20) + 10,
        }))
      );
    }, 1000);
  };

  const handleEndGame = () => {
    if (confirm('คุณต้องการสิ้นสุดการแข่งขันและแสดงผลคะแนนสรุปใช่หรือไม่?')) {
      router.push(`/leaderboard/${roomCode}`);
    }
  };

  const handleKickStudent = (id: string, name: string) => {
    if (confirm(`คุณต้องการลบ "${name}" ออกจากห้องใช่หรือไม่?`)) {
      setStudents((prev) => prev.filter((s) => s.id !== id));
    }
  };

  const completedCount = students.filter((s) => s.completed).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/60 via-purple-50/40 to-pink-50/60 text-slate-800 flex flex-col pb-16">
      <Navbar userRole="teacher" userName="ครู mon" />

      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-8 w-full">
        {/* Top Bar */}
        <div className="flex items-center justify-between gap-4 mb-6">
          <button
            onClick={() => router.push('/teacher/dashboard')}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition text-sm bg-white border border-slate-200 px-4 py-2.5 rounded-2xl font-bold shadow-sm cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4 text-violet-600" />
            <span>กลับแดชบอร์ด</span>
          </button>

          <div className="flex items-center gap-2 bg-white border border-purple-100 px-4 py-2 rounded-2xl text-sm shadow-sm">
            <BookOpen className="w-4 h-4 text-violet-600" />
            <span className="text-slate-500 font-medium">หมวดหมู่:</span>
            <span className="font-extrabold text-slate-800">คำศัพท์วิทยาศาสตร์</span>
            <span className="text-xs text-violet-700 bg-violet-100 px-2.5 py-0.5 rounded-full font-bold ml-1">
              3 คู่คำศัพท์
            </span>
          </div>
        </div>

        {/* Room Code Banner */}
        <div className="bg-white border-2 border-purple-100 rounded-3xl p-6 sm:p-8 mb-8 shadow-xl text-center relative overflow-hidden">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold mb-4 border border-emerald-200">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{isPlaying ? 'กำลังแข่งขันเรียลไทม์ (Live Battle)' : 'ห้องเปิดแล้ว - กำลังรอนักเรียนเข้าร่วม'}</span>
          </div>

          <p className="text-violet-900 font-bold text-sm sm:text-base mb-3">รหัสเข้าร่วมห้องกิจกรรม (Room Code)</p>

          <div className="flex flex-wrap justify-center items-center gap-3 mb-5">
            <span className="text-5xl sm:text-7xl font-black tracking-widest text-emerald-600 bg-emerald-50 px-8 py-3.5 rounded-3xl border-2 border-emerald-200 font-mono">
              {roomCode}
            </span>
            <button
              onClick={copyCode}
              className="p-4 bg-slate-100 hover:bg-slate-200 rounded-2xl text-slate-700 transition font-bold shadow-sm cursor-pointer"
            >
              {copiedCode ? <Check className="w-5 h-5 text-emerald-600" /> : <Copy className="w-5 h-5 text-slate-500" />}
            </button>
            <button
              onClick={copyJoinLink}
              className="p-4 bg-cyan-50 hover:bg-cyan-100 border border-cyan-200 rounded-2xl text-cyan-700 transition font-bold flex items-center gap-2 shadow-sm cursor-pointer"
            >
              {copiedLink ? <Check className="w-5 h-5 text-cyan-600" /> : <LinkIcon className="w-5 h-5" />}
              <span>คัดลอกลิงก์</span>
            </button>
          </div>
        </div>

        {/* Students Monitor */}
        <div className="bg-white border-2 border-purple-100 rounded-3xl p-6 mb-8 shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 pb-4 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-black flex items-center gap-2 text-slate-800">
                <Users className="w-5 h-5 text-cyan-600" />
                <span>{isPlaying ? 'คะแนนและสถานะนักเรียนสด' : 'รายชื่อนักเรียนที่เข้าร่วม'}</span>
                <span className="text-sm bg-cyan-100 text-cyan-800 px-3 py-0.5 rounded-full font-extrabold ml-2">
                  {students.length} คน
                </span>
              </h2>
            </div>
            {isPlaying && (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 px-3.5 py-1.5 rounded-xl text-xs font-bold text-amber-800">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>เสร็จสิ้นแล้ว: {completedCount} / {students.length} คน</span>
              </div>
            )}
          </div>

          {!isPlaying ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {students.map((student, idx) => (
                <div
                  key={student.id}
                  className="bg-slate-50 border-2 border-slate-200 p-3.5 rounded-2xl flex items-center justify-between gap-2 shadow-sm group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={`w-8 h-8 rounded-xl border flex items-center justify-center font-bold text-xs ${AVATAR_COLORS[idx % AVATAR_COLORS.length]}`}>
                      {student.name.charAt(0)}
                    </div>
                    <span className="truncate text-sm font-bold text-slate-800">{student.name}</span>
                  </div>
                  <button
                    onClick={() => handleKickStudent(student.id, student.name)}
                    className="opacity-0 group-hover:opacity-100 p-1 hover:bg-rose-100 text-slate-400 hover:text-rose-600 rounded-lg transition cursor-pointer"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {students.map((student, idx) => (
                <div
                  key={student.id}
                  className={`flex items-center justify-between p-4 rounded-2xl border-2 transition ${
                    student.completed ? 'bg-emerald-50/80 border-emerald-300 text-emerald-900' : 'bg-white border-slate-200 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-xl bg-violet-100 text-violet-700 flex items-center justify-center font-black text-sm">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-extrabold text-base text-slate-800 flex items-center gap-2">
                        {student.name}
                        {student.completed && (
                          <span className="inline-flex items-center gap-1 text-[11px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" /> จบแล้ว ({student.timeTakenSeconds}s)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-emerald-600">{student.score}</span>
                    <span className="text-xs text-slate-400 block font-medium">คะแนน</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Action Button */}
        <div className="flex justify-center">
          {!isPlaying ? (
            <button
              onClick={handleStartGame}
              disabled={isStarting}
              className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white font-black text-xl px-12 py-4 rounded-2xl shadow-xl transition active:scale-95 cursor-pointer flex items-center gap-3"
            >
              {isStarting ? <Loader2 className="w-6 h-6 animate-spin" /> : <Play className="w-6 h-6 fill-white" />}
              <span>{isStarting ? 'กำลังเริ่มเกม...' : 'เริ่มกิจกรรมการแข่งขัน'}</span>
            </button>
          ) : (
            <button
              onClick={handleEndGame}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-white font-black text-lg px-10 py-4 rounded-2xl shadow-xl active:scale-95 transition flex items-center gap-2.5 cursor-pointer"
            >
              <Trophy className="w-6 h-6 fill-white" />
              <span>สิ้นสุดการแข่งขัน & สรุปผล TOP 10</span>
            </button>
          )}
        </div>
      </main>
    </div>
  );
}
