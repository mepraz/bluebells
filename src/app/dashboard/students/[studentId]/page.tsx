

"use client";

import { getStudentById, getClassById, getInvoicesForStudent, getLatestInvoice, addPayment } from "@/lib/data";
import { PageHeader } from "@/components/page-header";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, IndianRupee } from "lucide-react";
import * as React from "react";
import type { Student, Class, Invoice } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"


function PaymentDialog({ student, latestInvoice, onPaymentSuccess }: { student: Student | null, latestInvoice: Invoice | null, onPaymentSuccess: () => void }) {
    const { toast } = useToast();
    const [isOpen, setIsOpen] = React.useState(false);
    const [isLoading, setIsLoading] = React.useState(false);

    async function handlePayment(formData: FormData) {
        if (!student || !latestInvoice) return;
        
        setIsLoading(true);
        try {
            const amount = Number(formData.get("amount"));
            await addPayment(student.id, latestInvoice.id, amount);
            toast({ title: "Success", description: "Payment recorded successfully." });
            onPaymentSuccess();
            setIsOpen(false);
        } catch (error) {
            console.error(error);
            toast({ variant: "destructive", title: "Error", description: "Failed to record payment." });
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button disabled={!latestInvoice}>
                  <IndianRupee className="mr-2 h-4 w-4" />
                  Record Payment
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form action={handlePayment}>
                    <DialogHeader>
                        <DialogTitle>Record Payment for {student?.name}</DialogTitle>
                        <DialogDescription>
                            Current Balance: रु{latestInvoice?.balance.toLocaleString()}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4">
                        <Label htmlFor="amount">Amount Paid</Label>
                        <Input id="amount" name="amount" type="number" placeholder="Enter amount" required />
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={isLoading}>
                            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Payment
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}


export default function StudentProfilePage({ params }: { params: { studentId: string } }) {
  const studentId = React.use(params).studentId;
  const [student, setStudent] = React.useState<Student | null>(null);
  const [studentClass, setStudentClass] = React.useState<Class | null>(null);
  const [invoices, setInvoices] = React.useState<Invoice[]>([]);
  const [latestInvoice, setLatestInvoice] = React.useState<Invoice | null>(null);
  const [loading, setLoading] = React.useState(true);
  const { toast } = useToast();

  const fetchData = React.useCallback(async () => {
    setLoading(true);
    try {
      const studentData = await getStudentById(studentId);
      if (!studentData) {
        toast({ variant: "destructive", title: "Error", description: "Student not found." });
        return;
      }
      setStudent(studentData);

      const [sClass, invoicesData, latestInv] = await Promise.all([
        getClassById(studentData.classId),
        getInvoicesForStudent(studentData.id),
        getLatestInvoice(studentData.id)
      ]);
      setStudentClass(sClass);
      setInvoices(invoicesData);
      setLatestInvoice(latestInv);

    } catch (error) {
      console.error("Failed to fetch student profile", error);
      toast({ variant: "destructive", title: "Error", description: "Failed to load student profile." });
    } finally {
      setLoading(false);
    }
  }, [studentId, toast]);

  React.useEffect(() => {
    fetchData();
  }, [fetchData]);


  if (loading) {
    return (
      <div className="flex h-full w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!student) {
    return (
      <div>
        <PageHeader title="Student Not Found" />
        <p>The requested student could not be found.</p>
        <Button asChild variant="outline" className="mt-4">
            <Link href="/dashboard/students">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Students
            </Link>
        </Button>
      </div>
    )
  }

  const totalPaid = invoices.reduce((acc, inv) => acc + inv.totalPaid, 0);
  const totalBalance = latestInvoice?.balance ?? student.openingBalance ?? 0;
  const getDisplayName = (c: Class | null) => c ? (c.section ? `${c.name} - ${c.section}` : c.name) : 'N/A';

  return (
    <div>
      <PageHeader title="Student Profile">
        <div className="flex items-center gap-2">
            <PaymentDialog student={student} latestInvoice={latestInvoice} onPaymentSuccess={fetchData} />
            <Button asChild variant="outline">
                <Link href="/dashboard/students">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All Students
                </Link>
            </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Student Info Card */}
        <div className="lg:col-span-1">
            <Card>
                <CardHeader className="items-center text-center">
                    <Avatar className="w-24 h-24 mb-4">
                        <AvatarImage src={student.profilePicture} alt={student.name} data-ai-hint="person face" />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <CardTitle className="text-2xl">{student.name}</CardTitle>
                    <CardDescription>Student ID: {student.sid}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm">
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Class</span>
                        <span className="font-medium">{getDisplayName(studentClass)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Roll Number</span>
                        <span className="font-medium">{student.rollNumber || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Address</span>
                        <span className="font-medium">{student.address || 'N/A'}</span>
                    </div>
                     <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">In Tuition</span>
                        <span className="font-medium">{student.inTuition ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b">
                        <span className="text-muted-foreground">Overall Paid</span>
                        <span className="font-medium text-green-600">रु{totalPaid.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between py-2">
                        <span className="text-muted-foreground">Current Balance</span>
                        <span className={`font-medium ${totalBalance > 0 ? 'text-red-600' : 'text-green-600'}`}>
                           रु{totalBalance.toLocaleString()}
                        </span>
                    </div>
                </CardContent>
            </Card>
        </div>

        {/* Payment History */}
        <div className="lg:col-span-2">
            <Card>
                <CardHeader>
                    <CardTitle>Payment History</CardTitle>
                    <CardDescription>A complete log of all invoices and payments for {student.name}.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Month/Year</TableHead>
                                <TableHead className="text-right">Billed</TableHead>
                                <TableHead className="text-right">Paid</TableHead>
                                <TableHead className="text-right">Balance</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {invoices.length > 0 ? invoices.map(invoice => {
                                let status: 'Paid' | 'Partial' | 'Unpaid' | 'Overpaid';
                                if (invoice.balance <= 0) {
                                    status = 'Paid';
                                    if (invoice.balance < 0) {
                                        status = 'Overpaid';
                                    }
                                } else if (invoice.totalPaid > 0) {
                                    status = 'Partial';
                                } else {
                                    status = 'Unpaid';
                                }

                                return (
                                <TableRow key={invoice.id}>
                                    <TableCell className="font-mono">{invoice.month}, {invoice.year}</TableCell>
                                    <TableCell className="text-right">रु{invoice.totalBilled.toLocaleString()}</TableCell>
                                    <TableCell className="text-right text-green-600">रु{invoice.totalPaid.toLocaleString()}</TableCell>
                                    <TableCell className="text-right font-medium">रु{invoice.balance.toLocaleString()}</TableCell>
                                    <TableCell className="text-center">
                                        <Badge 
                                            variant={
                                                status === 'Paid' ? 'default' : 
                                                status === 'Overpaid' ? 'default' :
                                                status === 'Partial' ? 'secondary' : 'destructive'
                                            }
                                            className={status === 'Paid' ? 'bg-green-600 text-white' : status === 'Overpaid' ? 'bg-blue-500 text-white' : ''}
                                        >
                                            {status}
                                        </Badge>
                                    </TableCell>
                                </TableRow>
                            )}) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                                        No invoice history found.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  )
}
