// types.ts
export interface Teacher {
  id: number;
  firstName: string;
  lastName: string;
}

export interface Student {
  id: number;
  firstName: string;
  lastName: string;
}

export interface Course {
  id: number;
  courseName: string;
  description: string;
  teacher: Teacher;
}

export interface User {
  id: number;
  username: string;
  role: "teacher" | "student" | "admin";
}
