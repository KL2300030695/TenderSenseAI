
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { ShieldCheck, Clock, CheckCircle2, XCircle, AlertCircle, Loader2 } from "lucide-react"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"

export default function HistoryPage() {
  const db = useFirestore();
  
  const historyQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "tenderEvaluationSummaries"), orderBy("evaluationDateTime", "desc"));
  }, [db]);

  const { data: history, isLoading } = useCollection(historyQuery);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <ShieldCheck className="h-8 w-8" />
          Audit History
        </h1>
        <p className="text-muted-foreground">A complete log of all past tender evaluations and system actions synced from Firestore.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>View the outcome and details of previous AI evaluations.</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Retrieving history...</p>
            </div>
          ) : !history || history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <Clock className="h-12 w-12 text-muted-foreground/20" />
              <div>
                <p className="font-semibold">No history found</p>
                <p className="text-sm text-muted-foreground">Processed evaluations will appear here.</p>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Eval ID</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Outcome</TableHead>
                  <TableHead>Reasoning</TableHead>
                  <TableHead>Risk Flags</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-[10px] text-muted-foreground">{item.id.substring(0, 8)}...</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {item.evaluationDateTime ? new Date(item.evaluationDateTime).toLocaleDateString() : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <span className={`flex items-center gap-1.5 text-xs font-bold ${
                        item.overallDecision === 'Eligible' ? 'text-green-600' :
                        item.overallDecision === 'Not Eligible' ? 'text-destructive' :
                        'text-amber-600'
                      }`}>
                        {item.overallDecision === 'Eligible' && <CheckCircle2 className="h-3 w-3" />}
                        {item.overallDecision === 'Not Eligible' && <XCircle className="h-3 w-3" />}
                        {item.overallDecision === 'Needs Review' && <AlertCircle className="h-3 w-3" />}
                        {item.overallDecision}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-xs" title={item.summaryReason}>
                      {item.summaryReason}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {item.riskFlags?.length > 0 ? (
                          <span className="text-[10px] bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full font-medium">
                            {item.riskFlags.length} Flags
                          </span>
                        ) : (
                          <span className="text-[10px] text-muted-foreground italic">None</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
