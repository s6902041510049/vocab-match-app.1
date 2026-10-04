import fs from 'fs';
import path from 'path';
import os from 'os';

export interface WordPair {
  id: string;
  term: string;
  meaning: string;
  categoryId?: string;
}

export interface StudentMember {
  id: string;
  name: string;
  joinedAt: number;
  score: number;
  matchedPairsCount: number;
  completed: boolean;
  timeTakenSeconds?: number;
  finishedAt?: number;
}

export interface Room {
  code: string;
  categoryId: string;
  categoryName: string;
  words: WordPair[];
  status: 'waiting' | 'playing' | 'ended';
  createdAt: number;
  startedAt?: number;
  endedAt?: number;
  students: Record<string, StudentMember>;
}

// On Vercel, process.cwd() is read-only, so use os.tmpdir()
const DATA_DIR = process.env.VERCEL
  ? path.join(os.tmpdir(), 'vocab_match_data')
  : path.join(process.cwd(), '.data');
const DATA_FILE = path.join(DATA_DIR, 'rooms.json');

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (e) {
    // Ignore error in read-only environments
  }
}

function loadRoomsFromFile(): Record<string, Room> {
  try {
    ensureDataDir();
    if (fs.existsSync(DATA_FILE)) {
      const content = fs.readFileSync(DATA_FILE, 'utf-8');
      return JSON.parse(content);
    }
  } catch (e) {
    console.error('Failed to load rooms from file:', e);
  }
  return {};
}

function saveRoomsToFile(roomsToSave: Record<string, Room>) {
  try {
    ensureDataDir();
    fs.writeFileSync(DATA_FILE, JSON.stringify(roomsToSave, null, 2), 'utf-8');
  } catch (e) {
    // Non-fatal if filesystem is restricted
    console.warn('Could not save rooms to disk (in-memory will be used):', e);
  }
}

declare global {
  // eslint-disable-next-line no-var
  var __VOCAB_ROOMS__: Record<string, Room> | undefined;
}

if (!globalThis.__VOCAB_ROOMS__) {
  globalThis.__VOCAB_ROOMS__ = loadRoomsFromFile();
}

const rooms = globalThis.__VOCAB_ROOMS__;

export function createRoom(
  code: string,
  categoryId: string,
  categoryName: string,
  words: WordPair[]
): Room {
  const newRoom: Room = {
    code,
    categoryId,
    categoryName: categoryName || 'หมวดหมู่ทั่วไป',
    words: words && words.length > 0 ? words : [],
    status: 'waiting',
    createdAt: Date.now(),
    students: {},
  };
  rooms[code] = newRoom;
  saveRoomsToFile(rooms);
  return newRoom;
}

export function getRoom(code: string): Room | null {
  return rooms[code] || null;
}

export function joinRoom(code: string, studentName: string): { student: StudentMember; room: Room } | null {
  const room = rooms[code];
  if (!room) return null;

  const trimmedName = studentName.trim();
  // Check if a student with the same name already exists in this room
  const existing = Object.values(room.students).find(
    (s) => s.name.toLowerCase() === trimmedName.toLowerCase()
  );

  if (existing) {
    return { student: existing, room };
  }

  const studentId = `std-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  const newStudent: StudentMember = {
    id: studentId,
    name: trimmedName,
    joinedAt: Date.now(),
    score: 0,
    matchedPairsCount: 0,
    completed: false,
  };

  room.students[studentId] = newStudent;
  saveRoomsToFile(rooms);
  return { student: newStudent, room };
}

export function startRoomGame(code: string): Room | null {
  const room = rooms[code];
  if (!room) return null;

  room.status = 'playing';
  room.startedAt = Date.now();
  saveRoomsToFile(rooms);
  return room;
}

export function updateStudentScore(
  code: string,
  studentId: string,
  data: {
    score: number;
    matchedPairsCount?: number;
    completed?: boolean;
    timeTakenSeconds?: number;
  }
): { room: Room; student: StudentMember } | null {
  const room = rooms[code];
  if (!room) return null;

  const student = room.students[studentId];
  if (!student) return null;

  if (typeof data.score === 'number') {
    student.score = data.score;
  }
  if (typeof data.matchedPairsCount === 'number') {
    student.matchedPairsCount = data.matchedPairsCount;
  }
  if (data.completed !== undefined) {
    student.completed = data.completed;
    if (data.completed && !student.finishedAt) {
      student.finishedAt = Date.now();
      if (typeof data.timeTakenSeconds === 'number') {
        student.timeTakenSeconds = data.timeTakenSeconds;
      } else if (room.startedAt) {
        student.timeTakenSeconds = Math.round((Date.now() - room.startedAt) / 1000);
      }
    }
  }

  saveRoomsToFile(rooms);
  return { room, student };
}

export function endRoomGame(code: string): Room | null {
  const room = rooms[code];
  if (!room) return null;

  room.status = 'ended';
  room.endedAt = Date.now();
  saveRoomsToFile(rooms);
  return room;
}

export function resetRoomGame(code: string): Room | null {
  const room = rooms[code];
  if (!room) return null;

  room.status = 'waiting';
  room.startedAt = undefined;
  room.endedAt = undefined;
  // Reset all students' progress
  Object.values(room.students).forEach((s) => {
    s.score = 0;
    s.matchedPairsCount = 0;
    s.completed = false;
    s.timeTakenSeconds = undefined;
    s.finishedAt = undefined;
  });

  saveRoomsToFile(rooms);
  return room;
}

export function kickStudent(code: string, studentId: string): boolean {
  const room = rooms[code];
  if (!room || !room.students[studentId]) return false;

  delete room.students[studentId];
  saveRoomsToFile(rooms);
  return true;
}
