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
  ArrowRight,
  TrendingUp,
  PlusCircle,
  ShieldCheck,
} from "lucide-react"
import {Button} from "@/components/ui/button"
import Link from "next/link"

export default function DashboardPage() {
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
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">+2 from last month</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Eligible Bidders</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">48</div>
            <p className="text-xs text-muted-foreground">72% success rate</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Rejected Bidders</CardTitle>
            <XCircle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">14</div>
            <p className="text-xs text-muted-foreground">-5% improvement</p>
          </CardContent>
        </Card>
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Needs Review</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">7</div>
            <p className="text-xs text-muted-foreground">Requires attention</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4">
          <CardHeader>
            <CardTitle>Recent Evaluations</CardTitle>
            <CardDescription>Bidders processed in the last 24 hours.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: "BuildTech Solutions", tender: "Smart City Infrastructure", status: "Eligible", date: "2h ago" },
                { name: "Global Power Corp", tender: "Renewable Energy Grid", status: "Needs Review", date: "5h ago" },
                { name: "SafeWay Logistics", tender: "Public Transport Maintenance", status: "Rejected", date: "1d ago" },
                { name: "Indra Construction", tender: "Smart City Infrastructure", status: "Eligible", date: "1d ago" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border">
                  <div className="flex flex-col">
                    <span className="font-semibold">{item.name}</span>
                    <span className="text-xs text-muted-foreground">{item.tender}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      item.status === 'Eligible' ? 'bg-green-100 text-green-700' :
                      item.status === 'Rejected' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {item.status}
                    </span>
                    <span className="text-xs text-muted-foreground">{item.date}</span>
                  </div>
                </div>
              ))}
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
                  Evaluations are 15% faster when bidders upload typed PDFs instead of scanned images.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
