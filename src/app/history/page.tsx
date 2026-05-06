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
import { ShieldCheck, Clock, CheckCircle2, XCircle, AlertCircle } from "lucide-react"

export default function HistoryPage() {
  const history = [
    { id: "EV-001", name: "Regional Highway Maintenance", date: "2024-03-15", result: "Eligible", user: "Admin User" },
    { id: "EV-002", name: "Smart City Grid Expansion", date: "2024-03-12", result: "Needs Review", user: "Lead Auditor" },
    { id: "EV-003", name: "Public Health IT", date: "2024-02-28", result: "Rejected", user: "Admin User" },
  ]

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <ShieldCheck className="h-8 w-8" />
          Audit History
        </h1>
        <p className="text-muted-foreground">A complete log of all past tender evaluations and system actions.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Activity
          </CardTitle>
          <CardDescription>View the outcome and details of previous evaluations.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Eval ID</TableHead>
                <TableHead>Project Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Outcome</TableHead>
                <TableHead>Performed By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {history.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-mono text-xs">{item.id}</TableCell>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.date}</TableCell>
                  <TableCell>
                    <span className={`flex items-center gap-1.5 text-xs font-bold ${
                      item.result === 'Eligible' ? 'text-green-600' :
                      item.result === 'Rejected' ? 'text-destructive' :
                      'text-amber-600'
                    }`}>
                      {item.result === 'Eligible' && <CheckCircle2 className="h-3 w-3" />}
                      {item.result === 'Rejected' && <XCircle className="h-3 w-3" />}
                      {item.result === 'Needs Review' && <AlertCircle className="h-3 w-3" />}
                      {item.result}
                    </span>
                  </TableCell>
                  <TableCell>{item.user}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
