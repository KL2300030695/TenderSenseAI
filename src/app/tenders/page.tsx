
'use client';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Search,
  PlusCircle,
  MoreVertical,
  Filter,
  Eye,
  FileDown,
  Loader2,
  Database,
} from "lucide-react"
import Link from "next/link"
import {Badge} from "@/components/ui/badge"
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { collection, query, orderBy } from "firebase/firestore"

export default function TendersListPage() {
  const db = useFirestore();
  
  const tendersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "tenders"), orderBy("createdDateTime", "desc"));
  }, [db]);

  const { data: tenders, isLoading } = useCollection(tendersQuery);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-primary flex items-center gap-2">
            <Database className="h-8 w-8" />
            Live Repository
          </h1>
          <p className="text-muted-foreground">Manage and track your ongoing evaluations directly from Firestore.</p>
        </div>
        <Button asChild className="gap-2">
          <Link href="/tenders/new">
            <PlusCircle className="h-4 w-4" />
            New Evaluation
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Search live database..." className="pl-10" />
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <Button variant="outline" size="sm" className="gap-2 flex-1 md:flex-none">
                <Filter className="h-4 w-4" /> Filter
              </Button>
              <Button variant="outline" size="sm" className="gap-2 flex-1 md:flex-none">
                <FileDown className="h-4 w-4" /> Export All
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">Syncing with Firestore...</p>
            </div>
          ) : !tenders || tenders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
              <Database className="h-12 w-12 text-muted-foreground/20" />
              <div>
                <p className="font-semibold">No evaluations found</p>
                <p className="text-sm text-muted-foreground">Start by creating your first tender evaluation.</p>
              </div>
              <Button asChild variant="outline" size="sm">
                <Link href="/tenders/new">Create Evaluation</Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Created Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenders.map((tender) => (
                  <TableRow key={tender.id} className="cursor-pointer hover:bg-muted/30">
                    <TableCell className="font-mono text-xs font-semibold">{tender.referenceNumber || 'N/A'}</TableCell>
                    <TableCell className="font-medium">{tender.title}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {tender.createdDateTime ? new Date(tender.createdDateTime).toLocaleDateString() : 'Unknown'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={tender.status === 'Completed' ? 'default' : 'outline'} className="rounded-md">
                        {tender.status || 'Active'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                        </Button>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4 text-muted-foreground" />
                        </Button>
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
