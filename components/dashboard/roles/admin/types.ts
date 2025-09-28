export interface BaseUser {
  id: number | null; // allow null to match backend inconsistency
  username: string;
  email: string;
  role: "ADMIN" | "TEACHER" | "STUDENT";
  firstName: string;
  middleName?: string;
  lastName: string;
}

export interface Admin extends BaseUser {
  department?: string;
}

export interface Teacher extends BaseUser {
  subject?: string;
}

export interface Student extends BaseUser {
  gradeLevel?: string;
}

export type User = Admin | Teacher | Student;
