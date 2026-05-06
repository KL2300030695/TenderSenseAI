"use client"

import {useState} from "react"
import {useRouter} from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {
  Upload,
  FileUp,
  Loader2,
  CheckCircle2,
  Info,
} from "lucide-react"
import {useToast} from "@/hooks/use-toast"
import {explainableDecisionReporting} from "@/ai/flows/explainable-decision-reporting"

export default function NewEvaluationPage() {
  const [loading, setLoading] = useState(false)
  const [tenderText, setTenderText] = useState("")
  const [bidderText, setBidderText] = useState("")
  const [tenderName, setTenderName] = useState("")
  const router = useRouter()
  const {toast} = useToast()

  const handleProcess = async () => {
    if (!tenderText || !bidderText || !tenderName) {
      toast({
        title: "Missing Information",
        description: "Please provide the tender name and the text content of both documents.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await explainableDecisionReporting({
        tenderDocumentText: tenderText,
        bidderDocumentText: bidderText,
      })
      
      sessionStorage.setItem('last_evaluation', JSON.stringify({
        name: tenderName,
        result: result,
        timestamp: new Date().toISOString()
      }))

      toast({
        title: "Processing Complete",
        description: "AI has successfully evaluated the PDF submission.",
      })
      
      router.push("/tenders/report")
    } catch (error) {
      toast({
        title: "Evaluation Failed",
        description: "There was an error processing the PDF documents. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary">New PDF Evaluation</h1>
        <p className="text-muted-foreground">Upload your tender and bidder PDFs to generate an explainable eligibility report.</p>
      </div>

      <div className="grid gap-6">
        {/* Tender Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Evaluation Identity
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tender-name">Tender / Project Name</Label>
              <Input 
                id="tender-name" 
                placeholder="e.g., Regional Highway Maintenance 2024" 
                value={tenderName}
                onChange={(e) => setTenderName(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Tender Document */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUp className="h-5 w-5 text-primary" />
                Tender PDF
              </CardTitle>
              <CardDescription>Paste the extracted text from the tender PDF.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <Textarea 
                placeholder="Paste tender PDF content here..." 
                className="min-h-[300px] resize-none"
                value={tenderText}
                onChange={(e) => setTenderText(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Upload className="h-3 w-3" />
                Max size: 5MB (PDF only)
              </div>
            </CardFooter>
          </Card>

          {/* Bidder Document */}
          <Card className="flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUp className="h-5 w-5 text-primary" />
                Bidder PDF
              </CardTitle>
              <CardDescription>Paste the extracted text from the bidder's PDF.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <Textarea 
                placeholder="Paste bidder PDF content here..." 
                className="min-h-[300px] resize-none"
                value={bidderText}
                onChange={(e) => setBidderText(e.target.value)}
              />
            </CardContent>
            <CardFooter>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Upload className="h-3 w-3" />
                Max size: 10MB (PDF only)
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button 
            size="lg" 
            className="gap-2" 
            onClick={handleProcess}
            disabled={loading}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing PDF...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Run Evaluation
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
