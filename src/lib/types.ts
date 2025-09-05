

export interface User {
  id: string;
  username: string;
  passwordHash: string;
  role: 'admin' | 'accountant' | 'exam';
}


export interface Student {
  id: string;
  sid: string;
  name: string;
  rollNumber?: number;
  classId: string;
  profilePicture: string;
  address?: string;
  openingBalance?: number;
  inTuition?: boolean;
}

export interface ClassFees {
  registration: number;
  monthly: number;
  exam: number;
  sports: number;
  music: number;
  medical: number;
  tuition: number;
  stationery: number;
  tieBelt: number;
}

export interface Class {
  id: string;
  name:string;
  section: string;
  fees: ClassFees;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  date: Date;
  invoiceId: string;
}

export interface Subject {
  id:string;
  name: string;
  classId: string;
  fullMarksTheory: number;
  fullMarksPractical: number;
}

export interface Exam {
  id: string;
  name: string;
  date: Date;
}

export interface Result {
  id: string;
  examId: string;
  studentId: string;
  subjectId: string;
  theoryMarks?: number;
  practicalMarks?: number;
}

export interface InvoiceLineItem {
  feeType: keyof Omit<ClassFees, 'medical'> | 'Medical' | 'Previous Dues';
  amount: number;
}

export interface Invoice {
  id: string;
  studentId: string;
  classId: string;
  month: string; // e.g., "Baisakh"
  year: number; // e.g., 2081
  lineItems: InvoiceLineItem[];
  totalBilled: number;
  payments: Payment[];
  totalPaid: number;
  balance: number;
  createdAt: Date;
}

export interface StudentFeeSummary {
  student: Student;
  class: Class;
  latestInvoice: Invoice | null;
  totalPaidOverall: number;
  overallBalance: number;
  status: 'Paid' | 'Partial' | 'Unpaid' | 'Overpaid';
}

export interface SchoolSettings {
  schoolName?: string;
  schoolLogoUrl?: string;
  schoolAddress?: string;
  schoolPhone?: string;
}

export interface StudentBill {
    school: SchoolSettings;
    student: Student;
    class: Class;
    invoice: Invoice;
    previousDues: number;
  }

export interface ClassMonthlySummary {
  totalBilled: number;
  totalCollected: number;
  totalDues: number;
}

export interface StudentMarksheet {
  student: Student;
  class: Class;
  exam: Exam;
  results: {
    subjectName: string;
    fullMarksTheory: number;
    fullMarksPractical: number;
    theoryMarks: number;
    practicalMarks: number;
  }[];
}
