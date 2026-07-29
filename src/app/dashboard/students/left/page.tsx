"use client"
import Link from "next/link"
import * as React from "react"
import { PageHeader } from "@/components/page-header"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { getStudents, getClasses, readmitStudent } from "@/lib/data"
import { ArrowLeft, Loader2, User as UserIcon, LogIn } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Student, Class } from "@/lib/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function LeftStudentsPage() {
  const [students, setStudents] = React.useState<Student[]>([]);
  const [classes, setClasses] = React.useState<Class[]>([]);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const [studentsData, classesData] = await Promise.all([
        getStudents({ status: "left" }),
        getClasses()
      ]);
      setStudents(studentsData);
      setClasses(classesData);
    } catch (e) {
      console.error("Failed to fetch left students data", e);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);

  async function handleReadmit(studentId: string, name: string) {
    if (!confirm(`Are you sure you want to re-admit ${name}?`)) return;
    try {
      await readmitStudent(studentId);
      toast({
        title: "Success",
        description: `${name} has been re-admitted successfully.`,
      });
      fetchData();
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to re-admit student.",
      });
    }
  }

  const getClassName = (classId: string) => {
    const cls = classes.find((c) => c.id === classId);
    if (!cls) return "Unknown";
    return cls.section ? `${cls.name} - ${cls.section}` : cls.name;
  };

  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Left Students">
        <Button variant="outline" asChild>
          <Link href="/dashboard/students">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Active Students
          </Link>
        </Button>
      </PageHeader>

      <div className="rounded-lg border shadow-sm bg-card overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-medium mb-1">Archived Records</h3>
          <p className="text-sm text-muted-foreground">
            The following students have left the school. Their academic records are preserved and can be viewed or re-admitted if they return.
          </p>
        </div>
        <div className="overflow-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="pl-6">Student ID</TableHead>
                <TableHead>Roll No.</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Last Class</TableHead>
                <TableHead>Address</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.length > 0 ? (
                students.map((student) => (
                  <TableRow key={student.id} className="hover:bg-muted/50">
                    <TableCell className="pl-6">
                      <Link href={`/dashboard/students/${student.id}`} className="font-mono text-xs">
                        {student.sid}
                      </Link>
                    </TableCell>
                    <TableCell>{student.rollNumber || "-"}</TableCell>
                    <TableCell className="font-medium">
                      <Link href={`/dashboard/students/${student.id}`} className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback>
                            <UserIcon className="h-4 w-4" />
                          </AvatarFallback>
                        </Avatar>
                        {student.name}
                      </Link>
                    </TableCell>
                    <TableCell>{getClassName(student.classId)}</TableCell>
                    <TableCell>{student.address || "-"}</TableCell>
                    <TableCell className="text-right pr-6">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleReadmit(student.id, student.name)}
                      >
                        <LogIn className="mr-1.5 h-3.5 w-3.5" />
                        Re-admit
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                    No records found in the leave section.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
