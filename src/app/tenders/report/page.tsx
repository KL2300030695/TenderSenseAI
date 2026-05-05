"use client"

import {useEffect, useState} from "react"
import {useRouter} from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  ShieldCheck,
  FileDown,
  ArrowLeft,
  Info,
  ExternalLink,
  Target,
  Quote,
} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Progress} from "@/components/ui/progress"
import {Badge} from "@/components/ui/badge"
import {ExplainableDecisionReportingOutput} from "@/ai/flows/explainable-decision-reporting"

export default function ReportPage() {
  const [data, setData] = useState<{name: string, result: ExplainableDecisionReportingOutput} | null>(null)
  const router = useRouter()

  useEffect(() => {
    const lastEval = sessionStorage.getItem('last_evaluation')
    if (lastEval) {
      setData(JSON.parse(lastEval))
    } else {
      router.push("/tenders/new")
    }
  }, [router])

  if (!data) return null

  const {result, name} = data
  const {summary, evaluation, criteria} = result

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Eligible": return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case "Not Eligible": return <XCircle className="h-5 w-5 text-destructive" />
      case "Needs Review": return <AlertCircle className="h-5 w-5 text-amber-500" />
      default: return null
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "Eligible": return "default"
      case "Not Eligible": return "destructive"
      case "Needs Review": return "secondary"
      default: return "outline"
    }
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-20">
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Button variant="ghost" size="sm" className="w-fit -ml-2 gap-2 text-muted-foreground" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </Button>
          <h1 className="text-3xl font-bold text-primary">{name}</h1>
          <p className="text-muted-foreground">Evaluation generated on {new Date().toLocaleDateString()}</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="gap-2">
            <FileDown className="h-4 w-4" /> Export Report
          </Button>
          <Button className="gap-2">
            <ShieldCheck className="h-4 w-4" /> Verify Result
          </Button>
        </div>
      </div>

      {/* Summary Card */}
      <Card className={`border-2 ${
        summary.final_decision === 'Eligible' ? 'border-green-200 bg-green-50/30' : 
        summary.final_decision === 'Not Eligible' ? 'border-destructive/20 bg-destructive/5' : 
        'border-amber-200 bg-amber-50/30'
      }`}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl flex items-center gap-2">
              Overall Result: 
              <span className={
                summary.final_decision === 'Eligible' ? 'text-green-700' : 
                summary.final_decision === 'Not Eligible' ? 'text-destructive' : 
                'text-amber-700'
              }>
                {summary.final_decision}
              </span>
            </CardTitle>
            <Badge className="h-6" variant={getStatusBadgeVariant(summary.final_decision)}>
              AI Decision
            </Badge>
          </div>
          <CardDescription className="text-base text-foreground mt-2">
            {summary.reason}
          </CardDescription>
        </CardHeader>
        {summary.risk_flags.length > 0 && (
          <CardContent>
            <div className="flex flex-wrap gap-2 mt-2">
              {summary.risk_flags.map((flag, i) => (
                <Badge key={i} variant="outline" className="bg-white/50 border-amber-200 text-amber-800 flex gap-2 py-1">
                  <AlertCircle className="h-3 w-3" />
                  {flag}
                </Badge>
              ))}
            </div>
          </CardContent>
        )}
      </Card>

      <Tabs defaultValue="evaluation" className="space-y-6">
        <TabsList className="bg-muted/50 p-1">
          <TabsTrigger value="evaluation" className="gap-2">
            <Target className="h-4 w-4" /> Detailed Evaluation
          </TabsTrigger>
          <TabsTrigger value="criteria" className="gap-2">
            <Info className="h-4 w-4" /> Extracted Criteria
          </TabsTrigger>
        </TabsList>

        <TabsContent value="evaluation" className="space-y-6">
          <div className="grid gap-6">
            {evaluation.map((item, index) => (
              <Card key={index} className="overflow-hidden border-l-4" style={{borderLeftColor: `var(--${item.status === 'Eligible' ? 'primary' : item.status === 'Not Eligible' ? 'destructive' : 'accent'})`}}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(item.status)}
                        <h3 className="text-lg font-bold">{item.criterion}</h3>
                      </div>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1.5"><Badge variant="outline">Required: {item.required_value}</Badge></span>
                        <span className="flex items-center gap-1.5"><Badge variant="outline">Bidder: {item.bidder_value}</Badge></span>
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end gap-2">
                      <div className="flex flex-col gap-1 w-24">
                        <div className="flex justify-between text-[10px] font-bold text-muted-foreground">
                          <span>Confidence</span>
                          <span>{item.confidence}%</span>
                        </div>
                        <Progress value={item.confidence} className="h-1.5" />
                      </div>
                      <Badge variant={getStatusBadgeVariant(item.status)}>{item.status}</Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="bg-muted/10 pt-4 pb-6 space-y-4">
                  <div className="space-y-2">
                    <h4 className="text-sm font-bold flex items-center gap-2">
                      <ExternalLink className="h-4 w-4 text-primary" />
                      AI Explanation
                    </h4>
                    <p className="text-sm leading-relaxed text-muted-foreground bg-white p-3 rounded-lg border">
                      {item.explanation}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                        <Quote className="h-3 w-3" />
                        Bidder Evidence
                      </h4>
                      <div className="text-xs italic p-3 rounded-lg bg-accent/20 border border-accent/40 text-accent-foreground">
                        "{item.evidence.bidder_text}"
                      </div>
                    </div>
                    {item.evidence.tender_text && (
                      <div className="space-y-2">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                          <Quote className="h-3 w-3" />
                          Tender Context
                        </h4>
                        <div className="text-xs italic p-3 rounded-lg bg-primary/5 border border-primary/10 text-primary">
                          "{item.evidence.tender_text}"
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="criteria">
          <Card>
            <CardHeader>
              <CardTitle>Extracted Eligibility Criteria</CardTitle>
              <CardDescription>All requirements identified from the tender document.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="divide-y">
                {criteria.map((c, i) => (
                  <div key={i} className="py-4 flex items-start justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{c.criterion}</span>
                        <Badge variant="secondary" className="text-[10px] px-1.5 py-0">{c.type}</Badge>
                        {c.mandatory && <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary text-primary">Mandatory</Badge>}
                      </div>
                      <p className="text-sm text-muted-foreground">{c.notes}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-sm font-mono bg-muted px-2 py-1 rounded">{c.required_value}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}