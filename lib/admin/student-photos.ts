import type { AdminStudentRow } from "@/lib/admin/types";

const STUDENT_PHOTOS: Record<string, string> = {
  "demo-student-profile":
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=640&h=640&q=80",
  s2: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=640&h=640&q=80",
  s3: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=640&h=640&q=80",
  s4: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=640&h=640&q=80",
  s5: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=640&h=640&q=80",
  s6: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=640&h=640&q=80",
  s7: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=640&h=640&q=80",
  s8: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=640&h=640&q=80",
  s9: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=640&h=640&q=80",
  s10: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?auto=format&fit=crop&w=640&h=640&q=80",
  s11: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=640&h=640&q=80",
  s12: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=640&h=640&q=80",
};

const FALLBACK = [
  "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=640&h=640&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=640&h=640&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=640&h=640&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=640&h=640&q=80",
];

export function studentPhoto(student: Pick<AdminStudentRow, "id">, index = 0) {
  return STUDENT_PHOTOS[student.id] ?? FALLBACK[index % FALLBACK.length];
}
