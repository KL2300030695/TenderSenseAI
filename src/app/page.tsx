
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  FileText,
  CheckCircle2,
  XCircle,
  AlertCircle,
  TrendingUp,
  PlusCircle,
  ShieldCheck,
  Loader2,
} from "lucide-react"
import {Button} from "@/components/ui/button"
import Link from "next/link"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy, limit } from "firebase/firestore"

export default function DashboardPage() {
  const db = useFirestore();

  // Fetch all tenders to count active ones
  const tendersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "tenders");
  }, [db]);

  // Fetch recent summaries for the "Recent Evaluations" list
  const summariesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "tenderEvaluationSummaries"), orderBy("evaluationDateTime", "desc"), limit(5));
  }, [db]);

  // Fetch all summaries to calculate statistics
  const allSummariesQuery = useMemoFirebase(() => {
    if (!db) return null;
    return collection(db, "tenderEvaluationSummaries");
  }, [db]);

  const { data: tenders, isLoading: loadingTenders } = useCollection(tendersQuery);
  const { data: recentSummaries, isLoading: loadingRecent } = useCollection(summariesQuery);
  const { data: allSummaries, isLoading: loadingAll } = useCollection(allSummariesQuery);

  const stats = {
    activeTenders: tenders?.filter(t => t.status === 'Active').length || 0,
    eligible: allSummaries?.filter(s => s.overallDecision === 'Eligible').length || 0,
    rejected: allSummaries?.filter(s => s.overallDecision === 'Not Eligible').length || 0,
    needsReview: allSummaries?.filter(s => s.overallDecision === 'Needs Review').length || 0,
  };

  const isLoading = loadingTenders || loadingRecent || loadingAll;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary">Evaluation Dashboard</h1>
        <p className="text-muted-foreground">Welcome back. Here is an overview of the current procurement cycle.</p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Tenders</CardTitle>
            <FileText className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : stats.activeTenders}</div>
            <p className="text-xs text-muted-foreground">Live from database</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Eligible Bidders</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : stats.eligible}</div>
            <p className="text-xs text-muted-foreground">Successfully evaluated</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected Bidders</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : stats.rejected}</div>
            <p className="text-xs text-muted-foreground">Did not meet criteria</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Needs Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : stats.needsReview}</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Evaluations</CardTitle>
            <CardDescription>Latest bidders processed in real-time.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
              ) : !recentSummaries || recentSummaries.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8 italic">No evaluations yet.</p>
              ) : (
                recentSummaries.map((item) => {
                   const tender = tenders?.find(t => t.id === item.tenderId);
                   const dateStr = item.evaluationDateTime ? new Date(item.evaluationDateTime).toLocaleDateString() : 'Recently';
                   return (
                    <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                      <div className="flex flex-col">
                        <span className="font-semibold">{tender?.title || 'Processed Evaluation'}</span>
                        <span className="text-xs text-muted-foreground">ID: {item.id.substring(0, 8)}...</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          item.overallDecision === 'Eligible' ? 'bg-green-100 text-green-700' :
                          item.overallDecision === 'Not Eligible' ? 'bg-red-100 text-red-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>
                          {item.overallDecision}
                        </span>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">{dateStr}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Shortcuts to key tasks.</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <Button asChild className="w-full justify-start gap-2 h-12">
              <Link href="/tenders/new">
                <PlusCircle className="h-4 w-4" />
                Start New Evaluation
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start gap-2 h-12">
              <Link href="/tenders">
                <FileText className="h-4 w-4" />
                Browse Active Tenders
              </Link>
            </Button>
            <Button variant="outline" asChild className="w-full justify-start gap-2 h-12">
              <Link href="/history">
                <ShieldCheck className="h-4 w-4" />
                View Audit Log
              </Link>
            </Button>
            <div className="mt-4 p-4 rounded-xl bg-accent/30 border border-accent flex items-start gap-3">
              <TrendingUp className="h-5 w-5 text-primary mt-0.5" />
              <div>
                <p className="text-sm font-semibold text-primary">AI Optimization Tip</p>
                <p className="text-xs text-muted-foreground mt-1">
                  Evaluations are 30% more accurate when using high-quality PDF source documents.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
