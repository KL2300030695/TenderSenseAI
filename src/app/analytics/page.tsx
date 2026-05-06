import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { BarChart3, TrendingUp, Users, FileCheck } from "lucide-react"

export default function AnalyticsPage() {
  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <BarChart3 className="h-8 w-8" />
          Evaluation Analytics
        </h1>
        <p className="text-muted-foreground">Insightful metrics on your procurement performance and AI accuracy.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[
          { title: "Avg. Processing Time", value: "42s", icon: TrendingUp, delta: "-12%" },
          { title: "Total Bidders", value: "1,284", icon: Users, delta: "+5%" },
          { title: "Success Rate", value: "78%", icon: FileCheck, delta: "+2%" },
          { title: "Audit Pass Rate", value: "100%", icon: BarChart3, delta: "0%" },
        ].map((stat, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className={`text-xs ${stat.delta.startsWith('+') ? 'text-green-600' : stat.delta === '0%' ? 'text-muted-foreground' : 'text-red-600'}`}>
                {stat.delta} from last period
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evaluation Trends</CardTitle>
          <CardDescription>Visualizing tender eligibility over the past 6 months.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center border-2 border-dashed rounded-xl">
          <p className="text-muted-foreground">Chart visualization placeholder (Recharts implementation pending data)</p>
        </CardContent>
      </Card>
    </div>
  )
}
