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
} from "lucide-react"
import Link from "next/link"
import {Badge} from "@/components/ui/badge"

const tenders = [
  { id: "T-2024-001", name: "Regional Highway Maintenance", date: "2024-03-15", bidders: 8, status: "Active", risk: "Low" },
  { id: "T-2024-002", name: "Smart City Grid Expansion", date: "2024-03-12", bidders: 14, status: "Active", risk: "Medium" },
  { id: "T-2024-003", name: "Public Health IT Infrastructure", date: "2024-02-28", bidders: 5, status: "Completed", risk: "Low" },
  { id: "T-2024-004", name: "Water Treatment Facility Upgrade", date: "2024-02-20", bidders: 12, status: "Completed", risk: "High" },
  { id: "T-2024-005", name: "Police Radio Communications", date: "2024-02-15", bidders: 3, status: "Under Review", risk: "Medium" },
]

export default function TendersListPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-bold text-primary">Tender Repository</h1>
          <p className="text-muted-foreground">Manage and track your ongoing and past tender evaluations.</p>
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
              <Input placeholder="Search tenders by name or ID..." className="pl-10" />
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tender ID</TableHead>
                <TableHead>Project Name</TableHead>
                <TableHead>Created Date</TableHead>
                <TableHead>Bidders</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Risk Level</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tenders.map((tender) => (
                <TableRow key={tender.id} className="cursor-pointer hover:bg-muted/30">
                  <TableCell className="font-mono text-xs font-semibold">{tender.id}</TableCell>
                  <TableCell className="font-medium">{tender.name}</TableCell>
                  <TableCell className="text-muted-foreground">{tender.date}</TableCell>
                  <TableCell>{tender.bidders}</TableCell>
                  <TableCell>
                    <Badge variant={tender.status === 'Completed' ? 'default' : 'outline'} className="rounded-md">
                      {tender.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                      tender.risk === 'Low' ? 'text-green-600 bg-green-50' : 
                      tender.risk === 'Medium' ? 'text-amber-600 bg-amber-50' : 
                      'text-destructive bg-destructive/10'
                    }`}>
                      {tender.risk}
                    </span>
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
        </CardContent>
      </Card>
    </div>
  )
}