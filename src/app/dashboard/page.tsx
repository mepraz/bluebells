
"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { 
  BarChart as BarChartIcon, 
  Users, 
  Loader2, 
  ArrowUpRight, 
  PlusCircle, 
  BookOpen, 
  TrendingUp, 
  AlertCircle,
  Clock,
  DollarSign,
  ChevronRight,
  School,
  Wallet
} from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { getStudents, getClasses, getPayments } from "@/lib/data"
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartConfig,
} from "@/components/ui/chart"
import { Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, BarChart as RechartsBarChart } from "recharts"
import type { Student, Class, PaymentTransaction } from "@/lib/types"
import { useSession } from "@/hooks/use-session"

export default function DashboardPage() {
  const [students, setStudents] = useState<Student[] | null>(null)
  const [classes, setClasses] = useState<Class[] | null>(null)
  const [payments, setPayments] = useState<PaymentTransaction[] | null>(null)
  const [loading, setLoading] = useState(true)
  const { session } = useSession()

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true)
        const [studentsData, classesData, paymentsData] = await Promise.all([
          getStudents(),
          getClasses(),
          getPayments(),
        ]);
        setStudents(studentsData)
        setClasses(classesData)
        setPayments(paymentsData)
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading || !students || !classes || !payments) {
    return (
      <div className="flex h-[70vh] w-full items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
          <p className="text-sm font-medium text-slate-500">Loading school analytics...</p>
        </div>
      </div>
    )
  }

  const totalStudents = students.length;

  const totalReceivable = classes.reduce((acc, c) => {
    const studentsInClass = students.filter(s => s.classId === c.id).length;
    const classTotalFees = Object.values(c.fees).reduce((sum, fee) => sum + (fee || 0), 0);
    return acc + studentsInClass * classTotalFees;
  }, 0);

  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0)
  const outstandingDues = totalReceivable - totalCollected
  const collectionPercentage = totalReceivable > 0 ? Math.round((totalCollected / totalReceivable) * 100) : 0;

  const chartData = [
    { name: "Receivable", value: totalReceivable, fill: "var(--color-receivable)" },
    { name: "Collected", value: totalCollected, fill: "var(--color-collected)" },
    { name: "Outstanding", value: outstandingDues, fill: "var(--color-outstanding)" },
  ]

  const chartConfig = {
    value: {
      label: "Amount (NPR)",
    },
    receivable: {
      label: "Receivable",
      color: "hsl(var(--primary))",
    },
    collected: {
      label: "Collected",
      color: "hsl(var(--accent))",
    },
    outstanding: {
      label: "Outstanding",
      color: "hsl(var(--destructive))",
    },
  } satisfies ChartConfig

  // Analytics: Top classes by enrollment
  const classBreakdown = classes.map(c => {
    const count = students.filter(s => s.classId === c.id).length;
    const classFees = Object.values(c.fees).reduce((sum, fee) => sum + (fee || 0), 0);
    return {
      id: c.id,
      name: `${c.name} - ${c.section}`,
      count,
      totalFees: count * classFees
    };
  }).sort((a, b) => b.count - a.count).slice(0, 5);

  // Formatting currency
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-NP', { style: 'currency', currency: 'NPR', maximumFractionDigits: 0 }).format(val).replace('NPR', 'रु');
  }

  // Recent payments
  const recentPayments = [...payments].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5);

  return (
    <div className="space-y-8 pb-10">
      {/* Welcome Hero Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 text-white shadow-xl shadow-indigo-950/15 border border-slate-800">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 h-32 w-32 rounded-full bg-indigo-500/10 blur-3xl" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-indigo-200 bg-clip-text text-transparent">
              Welcome back, {session?.username || 'Admin'}!
            </h1>
            <p className="text-slate-300 text-sm max-w-xl">
              Bluebells Academy school dashboard is up to date. Here is a summary of the current academic and financial status.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard/students">
              <span className="flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-indigo-600/30 hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95 cursor-pointer">
                <PlusCircle className="h-4 w-4" />
                Add Student
              </span>
            </Link>
            <Link href="/dashboard/accounting">
              <span className="flex items-center gap-2 rounded-xl bg-slate-800/80 backdrop-blur border border-slate-700 px-4 py-2.5 text-xs font-semibold text-slate-100 hover:bg-slate-700 transition-all hover:scale-105 active:scale-95 cursor-pointer">
                <Wallet className="h-4 w-4" />
                Record Fees
              </span>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Students */}
        <Card className="relative overflow-hidden border border-slate-100 dark:border-slate-850 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Total Students</CardTitle>
            <div className="p-2 bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 rounded-lg">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{totalStudents}</div>
            <p className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
              Active enrolled students
            </p>
          </CardContent>
        </Card>

        {/* Total Receivable */}
        <Card className="relative overflow-hidden border border-slate-100 dark:border-slate-850 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Expected Revenue</CardTitle>
            <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-lg">
              <TrendingUp className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100">{formatCurrency(totalReceivable)}</div>
            <p className="text-[10px] text-emerald-500 mt-1 flex items-center gap-1 font-medium">
              Class fees projection
            </p>
          </CardContent>
        </Card>

        {/* Total Collected */}
        <Card className="relative overflow-hidden border border-slate-100 dark:border-slate-850 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Revenue Collected</CardTitle>
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 rounded-lg">
              <DollarSign className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2 space-y-2">
            <div>
              <div className="text-3xl font-extrabold text-indigo-600 dark:text-indigo-400">{formatCurrency(totalCollected)}</div>
              <div className="flex items-center justify-between text-[10px] text-slate-400 mt-1 font-medium">
                <span>Collection rate</span>
                <span>{collectionPercentage}%</span>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="h-1.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-indigo-600 rounded-full transition-all duration-500" 
                style={{ width: `${Math.min(collectionPercentage, 100)}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Outstanding Dues */}
        <Card className="relative overflow-hidden border border-slate-100 dark:border-slate-850 hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-xs font-semibold tracking-wider text-slate-500 uppercase">Outstanding Dues</CardTitle>
            <div className="p-2 bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 rounded-lg">
              <AlertCircle className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="text-3xl font-extrabold text-rose-600 dark:text-rose-400">{formatCurrency(outstandingDues)}</div>
            <p className="text-[10px] text-rose-500 mt-1 flex items-center gap-1 font-medium">
              Requires review and billing
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Sections Split */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Financial Analytics Chart */}
        <Card className="lg:col-span-2 border border-slate-100 dark:border-slate-850">
          <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 dark:border-slate-850 pb-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-850 dark:text-slate-100">Fee Collection Overview</CardTitle>
              <CardDescription className="text-xs">Visual breakdown of receivables, collections, and dues.</CardDescription>
            </div>
            <div className="p-2 bg-slate-50 dark:bg-slate-900 rounded-lg">
              <BarChartIcon className="h-4 w-4 text-slate-500" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <ChartContainer config={chartConfig} className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsBarChart data={chartData} margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                  <CartesianGrid vertical={false} strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="name" 
                    tickLine={false} 
                    tickMargin={10} 
                    axisLine={false} 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11} 
                    fontWeight={500}
                  />
                  <YAxis 
                    tickFormatter={(value) => `रु${Number(value) / 1000}k`} 
                    stroke="hsl(var(--muted-foreground))" 
                    fontSize={11} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <ChartTooltip
                    cursor={{ fill: 'rgba(99, 102, 241, 0.04)' }}
                    content={<ChartTooltipContent indicator="line" className="rounded-xl border border-slate-200 shadow-md bg-white p-2" />}
                  />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={50} />
                </RechartsBarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Analytics sidebar / Top Classes & Quick stats */}
        <div className="space-y-6">
          {/* Class Enrollment Breakdown */}
          <Card className="border border-slate-100 dark:border-slate-850">
            <CardHeader className="border-b border-slate-50 dark:border-slate-850 pb-4">
              <CardTitle className="text-md font-bold text-slate-850 dark:text-slate-100">Popular Classes</CardTitle>
              <CardDescription className="text-xs">Classes sorted by student count.</CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                {classBreakdown.map((item, idx) => {
                  const maxCount = Math.max(...classBreakdown.map(i => i.count));
                  const widthPercent = maxCount > 0 ? (item.count / maxCount) * 100 : 0;
                  return (
                    <div key={item.id} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-700 dark:text-slate-300">{item.name}</span>
                        <span className="text-slate-500">{item.count} students</span>
                      </div>
                      <div className="h-2 w-full bg-slate-50 dark:bg-slate-800 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full ${
                            idx === 0 ? "bg-indigo-500" :
                            idx === 1 ? "bg-blue-500" :
                            idx === 2 ? "bg-teal-500" :
                            "bg-slate-400"
                          }`}
                          style={{ width: `${widthPercent}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Quick Info Alerts */}
          <Card className="border border-slate-100 dark:border-slate-850 bg-slate-50/50 dark:bg-slate-900/30">
            <CardContent className="p-4 flex items-start gap-3">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 rounded-lg shrink-0">
                <School className="h-5 w-5" />
              </div>
              <div className="space-y-1">
                <h4 className="text-xs font-bold text-slate-850 dark:text-slate-200">System Overview</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                  You are managing {classes.length} active classes and sections. Make sure to generate monthly bills on time.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Payments Section */}
      <Card className="border border-slate-100 dark:border-slate-850">
        <CardHeader className="flex flex-row items-center justify-between border-b border-slate-50 dark:border-slate-850 pb-4">
          <div>
            <CardTitle className="text-lg font-bold text-slate-850 dark:text-slate-100">Recent Payment Transactions</CardTitle>
            <CardDescription className="text-xs">Latest recorded transactions on the portal.</CardDescription>
          </div>
          <Link href="/dashboard/accounting">
            <span className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 flex items-center gap-1 cursor-pointer">
              View Journal
              <ChevronRight className="h-3 w-3" />
            </span>
          </Link>
        </CardHeader>
        <CardContent className="p-0">
          {recentPayments.length > 0 ? (
            <div className="divide-y divide-slate-100 dark:divide-slate-850">
              {recentPayments.map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-4 sm:px-6 hover:bg-slate-50/50 dark:hover:bg-slate-900/20 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-xl">
                      <Wallet className="h-4 w-4" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">Payment Confirmed</p>
                      <p className="text-[10px] text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {new Date(payment.date).toLocaleDateString()} at {new Date(payment.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">+{formatCurrency(payment.amount)}</p>
                    <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/50">
                      Success
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 text-center text-slate-400">
              <Wallet className="h-8 w-8 mb-2 stroke-1" />
              <p className="text-xs">No recent transactions recorded</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

