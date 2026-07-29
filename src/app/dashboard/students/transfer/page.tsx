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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { getStudents, getClasses, batchTransferStudents } from "@/lib/data"
import { ArrowLeft, Loader2, User as UserIcon, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Student, Class, TransferAction } from "@/lib/types"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

export default function BatchTransferPage() {
  const { toast } = useToast();
  const [classes, setClasses] = React.useState<Class[]>([]);
  const [students, setStudents] = React.useState<Student[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [transferring, setTransferring] = React.useState(false);

  // Filter States
  const [sourceClassId, setSourceClassId] = React.useState<string>("");
  const [sourceYear, setSourceYear] = React.useState<number>(2081);
  const [targetYear, setTargetYear] = React.useState<number>(2082);

  // Table Selection & Action states
  const [selectedStudentIds, setSelectedStudentIds] = React.useState<string[]>([]);
  const [studentActions, setStudentActions] = React.useState<Record<string, { type: 'upgrade' | 'repeat' | 'jump' | 'leave'; targetClassId?: string }>>({});

  // Bulk Apply States
  const [bulkType, setBulkType] = React.useState<'upgrade' | 'repeat' | 'jump' | 'leave'>('upgrade');
  const [bulkTargetClassId, setBulkTargetClassId] = React.useState<string>("");

  React.useEffect(() => {
    getClasses().then((data) => {
      setClasses(data);
      if (data.length > 0) {
        setSourceClassId(data[0].id);
      }
      setLoading(false);
    });
  }, []);

  const loadStudents = React.useCallback(async () => {
    if (!sourceClassId) return;
    setLoading(true);
    try {
      const data = await getStudents({
        classId: sourceClassId,
        academicYear: sourceYear,
        status: "active",
      });
      setStudents(data);
      setSelectedStudentIds([]);
      
      // Initialize all students with no target class — user must pick via bulk bar
      const initialActions: Record<string, { type: 'upgrade' | 'repeat' | 'jump' | 'leave'; targetClassId?: string }> = {};
      data.forEach(s => {
        initialActions[s.id] = {
          type: 'upgrade',
          targetClassId: undefined,
        };
      });
      setStudentActions(initialActions);
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load students.",
      });
    } finally {
      setLoading(false);
    }
  }, [sourceClassId, sourceYear, toast]);

  React.useEffect(() => {
    if (sourceClassId) {
      loadStudents();
    }
  }, [sourceClassId, sourceYear, loadStudents]);

  // KEY FIX: When bulk target class changes, IMMEDIATELY sync all individual student rows
  React.useEffect(() => {
    if (!bulkTargetClassId || students.length === 0) return;
    setStudentActions(prev => {
      const updated = { ...prev };
      students.forEach(s => {
        if (updated[s.id] && (updated[s.id].type === 'upgrade' || updated[s.id].type === 'jump')) {
          updated[s.id] = { ...updated[s.id], targetClassId: bulkTargetClassId };
        }
      });
      return updated;
    });
  }, [bulkTargetClassId, students]);

  // When bulk type changes, sync the action type for all students too
  React.useEffect(() => {
    if (students.length === 0) return;
    setStudentActions(prev => {
      const updated = { ...prev };
      students.forEach(s => {
        const currentTarget = updated[s.id]?.targetClassId;
        updated[s.id] = {
          type: bulkType,
          targetClassId: bulkType === 'repeat' ? sourceClassId
            : bulkType === 'leave' ? undefined
            : (bulkTargetClassId || currentTarget),
        };
      });
      return updated;
    });
  }, [bulkType, students, sourceClassId, bulkTargetClassId]);

  // Handle single student action type change
  const handleActionTypeChange = (studentId: string, type: 'upgrade' | 'repeat' | 'jump' | 'leave') => {
    setStudentActions(prev => {
      let targetClassId = prev[studentId]?.targetClassId;
      if (type === 'repeat') {
        targetClassId = sourceClassId;
      } else if (type === 'leave') {
        targetClassId = undefined;
      } else if (type === 'upgrade' || type === 'jump') {
        // Keep existing target or use bulk if set
        targetClassId = targetClassId || bulkTargetClassId || undefined;
      }
      return {
        ...prev,
        [studentId]: { type, targetClassId }
      };
    });
  };

  // Handle single student target class change
  const handleTargetClassChange = (studentId: string, classId: string) => {
    setStudentActions(prev => ({
      ...prev,
      [studentId]: { ...prev[studentId], targetClassId: classId }
    }));
  };

  // Bulk apply to selected checkboxes
  const handleBulkApply = () => {
    if (selectedStudentIds.length === 0) {
      toast({
        title: "No Students Selected",
        description: "Please check the students you want to apply the bulk action to.",
      });
      return;
    }

    setStudentActions(prev => {
      const updated = { ...prev };
      selectedStudentIds.forEach(id => {
        updated[id] = {
          type: bulkType,
          targetClassId: (bulkType === 'upgrade' || bulkType === 'jump') ? bulkTargetClassId : (bulkType === 'repeat' ? sourceClassId : undefined)
        };
      });
      return updated;
    });

    toast({
      title: "Bulk Action Applied",
      description: `Applied ${bulkType.toUpperCase()} action to ${selectedStudentIds.length} selected students.`,
    });
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(students.map(s => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  const handleToggleStudent = (studentId: string, checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(prev => [...prev, studentId]);
    } else {
      setSelectedStudentIds(prev => prev.filter(id => id !== studentId));
    }
  };

  const handleTransferSubmit = async () => {
    if (selectedStudentIds.length === 0) {
      toast({
        variant: "destructive",
        title: "No selection",
        description: "Please select at least one student to transfer.",
      });
      return;
    }

    // Validate: no selected student should be missing a target class
    const missingTarget = selectedStudentIds.filter(id => {
      const action = studentActions[id];
      return (action?.type === 'upgrade' || action?.type === 'jump') && !action?.targetClassId;
    });

    if (missingTarget.length > 0) {
      toast({
        variant: "destructive",
        title: "Target Class Missing",
        description: `${missingTarget.length} selected student(s) have no target class set. Please set a Bulk Target Class first.`,
      });
      return;
    }

    if (sourceYear === targetYear) {
      if (!confirm("Source academic year and Target academic year are the same. Are you sure you want to proceed?")) {
        return;
      }
    }

    setTransferring(true);
    try {
      const transferActions: TransferAction[] = selectedStudentIds.map(studentId => {
        const action = studentActions[studentId];
        return {
          studentId,
          type: action.type,
          targetClassId: action.targetClassId
        };
      });

      const result = await batchTransferStudents(transferActions, targetYear);
      toast({
        title: "Transfer Complete",
        description: `Successfully processed transfers for ${result.count} students.`,
      });
      loadStudents();
    } catch (e) {
      console.error(e);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to process transfer.",
      });
    } finally {
      setTransferring(false);
    }
  };

  const currentNepaliYears = [2078, 2079, 2080, 2081, 2082, 2083, 2084, 2085];

  if (loading && classes.length === 0) {
    return (
      <div className="flex h-full w-full items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Batch Student Transfer">
        <Button variant="outline" asChild>
          <Link href="/dashboard/students">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Students
          </Link>
        </Button>
      </PageHeader>

      {/* Filter and Configurations Card */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Transfer Parameters</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-4 items-end">
          <div>
            <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">Source Class</label>
            <Select value={sourceClassId} onValueChange={setSourceClassId}>
              <SelectTrigger>
                <SelectValue placeholder="Select class" />
              </SelectTrigger>
              <SelectContent>
                {classes.map(c => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.section ? `${c.name} - ${c.section}` : c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">Source Year (Nepali)</label>
            <Select value={sourceYear.toString()} onValueChange={(val) => {
              const yr = Number(val);
              setSourceYear(yr);
              setTargetYear(yr + 1);
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {currentNepaliYears.map(yr => (
                  <SelectItem key={yr} value={yr.toString()}>{yr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">Target Year (Nepali)</label>
            <Select value={targetYear.toString()} onValueChange={(val) => setTargetYear(Number(val))}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {currentNepaliYears.map(yr => (
                  <SelectItem key={yr} value={yr.toString()}>{yr}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Button className="w-full" variant="secondary" onClick={loadStudents}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Reload List
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Bulk Apply Action Bar */}
      {students.length > 0 && (
        <Card className="bg-muted/40">
          <CardContent className="py-4 flex flex-wrap gap-4 items-end justify-between">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">Bulk Action Type</label>
                <Select value={bulkType} onValueChange={(val: any) => setBulkType(val)}>
                  <SelectTrigger className="w-[150px] bg-background">
                    <SelectValue placeholder="Select action" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upgrade">Upgrade</SelectItem>
                    <SelectItem value="repeat">Repeat</SelectItem>
                    <SelectItem value="jump">Jump</SelectItem>
                    <SelectItem value="leave">Leave</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {(bulkType === 'upgrade' || bulkType === 'jump') && (
                <div>
                  <label className="text-xs font-semibold mb-1.5 block text-muted-foreground">Bulk Target Class</label>
                  <Select value={bulkTargetClassId} onValueChange={setBulkTargetClassId}>
                    <SelectTrigger className="w-[180px] bg-background">
                      <SelectValue placeholder="Select class" />
                    </SelectTrigger>
                    <SelectContent>
                      {classes.map(c => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.section ? `${c.name} - ${c.section}` : c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="flex gap-2">
                <Button variant="outline" onClick={handleBulkApply}>Apply to Checked ({selectedStudentIds.length})</Button>
                <Button 
                  onClick={handleTransferSubmit} 
                  disabled={transferring || selectedStudentIds.length === 0}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
                >
                  {transferring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Execute Transfer ({selectedStudentIds.length})
                </Button>
              </div>
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              Selected: {selectedStudentIds.length} / {students.length}
            </div>

          </CardContent>
        </Card>
      )}

      {/* Students List Table */}
      <div className="rounded-lg border shadow-sm bg-card overflow-hidden">
        {loading ? (
          <div className="flex h-32 w-full items-center justify-center">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : students.length > 0 ? (
          <div>
            <div className="overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[50px] pl-6">
                      <Checkbox
                        checked={selectedStudentIds.length === students.length}
                        onCheckedChange={handleSelectAll}
                      />
                    </TableHead>
                    <TableHead>Student ID</TableHead>
                    <TableHead>Roll No.</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Transfer Type</TableHead>
                    <TableHead>Target Class</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {students.map((student) => {
                    const action = studentActions[student.id] || { type: 'upgrade' };
                    const isSelected = selectedStudentIds.includes(student.id);
                    const needsTarget = (action.type === 'upgrade' || action.type === 'jump') && !action.targetClassId;

                    return (
                      <TableRow key={student.id} className={
                        needsTarget && isSelected ? "bg-orange-50 dark:bg-orange-950/20 hover:bg-orange-100 dark:hover:bg-orange-950/30"
                        : isSelected ? "bg-muted/30 hover:bg-muted/40"
                        : "hover:bg-muted/50"
                      }>
                        <TableCell className="pl-6">
                          <Checkbox
                            checked={isSelected}
                            onCheckedChange={(checked) => handleToggleStudent(student.id, !!checked)}
                          />
                        </TableCell>
                        <TableCell className="font-mono text-xs">{student.sid}</TableCell>
                        <TableCell>{student.rollNumber || "-"}</TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback>
                                <UserIcon className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            {student.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Select
                            value={action.type}
                            onValueChange={(val: any) => handleActionTypeChange(student.id, val)}
                          >
                            <SelectTrigger className="w-[120px] h-8 text-xs bg-background">
                              <SelectValue placeholder="Action" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="upgrade">Upgrade</SelectItem>
                              <SelectItem value="repeat">Repeat</SelectItem>
                              <SelectItem value="jump">Jump</SelectItem>
                              <SelectItem value="leave">Leave</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {(action.type === 'upgrade' || action.type === 'jump') ? (
                            <Select
                              value={action.targetClassId || ""}
                              onValueChange={(val) => handleTargetClassChange(student.id, val)}
                            >
                              <SelectTrigger className={`w-[180px] h-8 text-xs bg-background ${needsTarget ? 'border-orange-400 text-orange-600 dark:text-orange-400' : ''}`}>
                                <SelectValue placeholder="⚠ Select target class" />
                              </SelectTrigger>
                              <SelectContent>
                                {classes.map(c => (
                                  <SelectItem key={c.id} value={c.id}>
                                    {c.section ? `${c.name} - ${c.section}` : c.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>

                          ) : action.type === 'repeat' ? (
                            <span className="text-xs text-muted-foreground italic">Kept in same class</span>
                          ) : (
                            <span className="text-xs text-destructive italic">Leaving school</span>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            
            <div className="p-6 border-t bg-muted/10 flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Confirming transfer of <strong className="text-foreground">{selectedStudentIds.length}</strong> selected students to academic year <strong className="text-foreground">{targetYear}</strong>.
              </div>
              <Button onClick={handleTransferSubmit} disabled={transferring || selectedStudentIds.length === 0}>
                {transferring && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Execute Transfer
              </Button>
            </div>
          </div>
        ) : (
          <div className="h-32 flex flex-col justify-center items-center text-muted-foreground p-6">
            <p>No active students found in this class for year {sourceYear}.</p>
            <p className="text-xs mt-1">They might have already been transferred or marked as left.</p>
          </div>
        )}
      </div>
    </div>
  );
}
