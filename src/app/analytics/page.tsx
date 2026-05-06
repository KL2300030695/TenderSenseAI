
'use client';

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  FileCheck, 
  AlertCircle,
  Loader2,
  PieChart
} from "lucide-react"
import { 
  useFirestore, 
  useCollection, 
  useMemoFirebase 
} from "@/firebase"
import { collection } from "firebase/firestore"
import { 
  Bar, 
  BarChart, 
  ResponsiveContainer, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  CartesianGrid
} from "recharts"
import { 
  ChartContainer, 
  ChartTooltip, 
  ChartTooltipContent 
} from "@/components/ui/chart"

export default function AnalyticsPage() {
  const db = useFirestore();

  // Fetch all evaluation summaries for live calculations
  const summariesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "tenderEvaluationSummaries");
  }, [db]);

  const { data: summaries, isLoading } = useCollection(summariesQuery);

  const analytics = useMemo(() => {
    if (!summaries) return null;

    const total = summaries.length;
    const eligible = summaries.filter(s => s.overallDecision === 'Eligible').length;
    const notEligible = summaries.filter(s => s.overallDecision === 'Not Eligible').length;
    const needsReview = summaries.filter(s => s.overallDecision === 'Needs Review').length;

    const successRate = total > 0 ? Math.round((eligible / total) * 100) : 0;
    const reviewRate = total > 0 ? Math.round((needsReview / total) * 100) : 0;

    // Group by month for the trend chart
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const d = new Date();
      d.setMonth(d.getMonth() - (5 - i));
      return d.toLocaleString('default', { month: 'short' });
    });

    const trendData = last6Months.map(month => {
      const monthSummaries = summaries.filter(s => {
        const date = s.evaluationDateTime ? new Date(s.evaluationDateTime) : null;
        return date && date.toLocaleString('default', { month: 'short' }) === month;
      });

      return {
        month,
        eligible: monthSummaries.filter(s => s.overallDecision === 'Eligible').length,
        notEligible: monthSummaries.filter(s => s.overallDecision === 'Not Eligible').length,
        needsReview: monthSummaries.filter(s => s.overallDecision === 'Needs Review').length,
      };
    });

    return {
      total,
      successRate,
      reviewRate,
      trendData
    };
  }, [summaries]);

  const chartConfig = {
    eligible: {
      label: "Eligible",
      color: "hsl(var(--primary))",
    },
    notEligible: {
      label: "Not Eligible",
      color: "hsl(var(--destructive))",
    },
    needsReview: {
      label: "Needs Review",
      color: "hsl(var(--secondary))",
    },
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">Calculating live metrics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <BarChart3 className="h-8 w-8" />
          Evaluation Analytics
        </h1>
        <p className="text-muted-foreground">Insightful metrics on your procurement performance and AI accuracy derived from your database.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Bidders</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Unique processed submissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <FileCheck className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.successRate || 0}%</div>
            <p className="text-xs text-green-600">Eligible outcomes</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Review Rate</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analytics?.reviewRate || 0}%</div>
            <p className="text-xs text-amber-600">Require human attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Data Sync</CardTitle>
            <PieChart className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Live</div>
            <p className="text-xs text-muted-foreground">Connected to Firestore</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evaluation Trends</CardTitle>
          <CardDescription>Visualizing tender eligibility results over the past 6 months.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[400px] w-full mt-4">
            <ChartContainer config={chartConfig}>
              <BarChart data={analytics?.trendData || []}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" />
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  axisLine={false} 
                  tickMargin={8}
                />
                <YAxis hide />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend iconType="circle" verticalAlign="top" height={36}/>
                <Bar 
                  dataKey="eligible" 
                  name="Eligible" 
                  fill="var(--color-eligible)" 
                  stackId="a" 
                  radius={[0, 0, 0, 0]} 
                />
                <Bar 
                  dataKey="notEligible" 
                  name="Not Eligible" 
                  fill="var(--color-notEligible)" 
                  stackId="a" 
                  radius={[0, 0, 0, 0]} 
                />
                <Bar 
                  dataKey="needsReview" 
                  name="Needs Review" 
                  fill="var(--color-needsReview)" 
                  stackId="a" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ChartContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
