"use client"

import {useState, useRef} from "react"
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
import {
  Upload,
  FileUp,
  Loader2,
  CheckCircle2,
  Info,
  FileText,
  X,
} from "lucide-react"
import {useToast} from "@/hooks/use-toast"
import {explainableDecisionReporting} from "@/ai/flows/explainable-decision-reporting"

export default function NewEvaluationPage() {
  const [loading, setLoading] = useState(false)
  const [tenderName, setTenderName] = useState("")
  const [tenderFile, setTenderFile] = useState<File | null>(null)
  const [bidderFile, setBidderFile] = useState<File | null>(null)
  
  const tenderInputRef = useRef<HTMLInputElement>(null)
  const bidderInputRef = useRef<HTMLInputElement>(null)
  
  const router = useRouter()
  const {toast} = useToast()

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const handleProcess = async () => {
    if (!tenderFile || !bidderFile || !tenderName) {
      toast({
        title: "Missing Information",
        description: "Please provide the tender name and upload both PDF documents.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const tenderPdfUri = await fileToBase64(tenderFile)
      const bidderPdfUri = await fileToBase64(bidderFile)

      const result = await explainableDecisionReporting({
        tenderPdfUri,
        bidderPdfUri,
      })
      
      sessionStorage.setItem('last_evaluation', JSON.stringify({
        name: tenderName,
        result: result,
        timestamp: new Date().toISOString()
      }))

      toast({
        title: "Processing Complete",
        description: "AI has successfully evaluated the PDF submissions.",
      })
      
      router.push("/tenders/report")
    } catch (error) {
      console.error(error)
      toast({
        title: "Evaluation Failed",
        description: "There was an error processing the PDF documents. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'tender' | 'bidder') => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      if (type === 'tender') setTenderFile(file)
      else setBidderFile(file)
    } else if (file) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF document.",
        variant: "destructive",
      })
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
          <Card className="flex flex-col border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUp className="h-5 w-5 text-primary" />
                Tender PDF
              </CardTitle>
              <CardDescription>Upload the official tender document.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center py-10">
              {!tenderFile ? (
                <div 
                  className="flex flex-col items-center gap-4 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => tenderInputRef.current?.click()}
                >
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to upload PDF</p>
                    <p className="text-xs text-muted-foreground mt-1">Maximum size: 5MB</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 rounded-lg bg-accent/20 border w-full">
                  <FileText className="h-10 w-10 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{tenderFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(tenderFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setTenderFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <input 
                type="file" 
                ref={tenderInputRef} 
                className="hidden" 
                accept="application/pdf"
                onChange={(e) => handleFileChange(e, 'tender')}
              />
            </CardContent>
          </Card>

          {/* Bidder Document */}
          <Card className="flex flex-col border-dashed">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileUp className="h-5 w-5 text-primary" />
                Bidder PDF
              </CardTitle>
              <CardDescription>Upload the bidder's proposal proposal.</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col items-center justify-center py-10">
              {!bidderFile ? (
                <div 
                  className="flex flex-col items-center gap-4 cursor-pointer hover:text-primary transition-colors"
                  onClick={() => bidderInputRef.current?.click()}
                >
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center">
                    <Upload className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium">Click to upload PDF</p>
                    <p className="text-xs text-muted-foreground mt-1">Maximum size: 10MB</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 rounded-lg bg-accent/20 border w-full">
                  <FileText className="h-10 w-10 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{bidderFile.name}</p>
                    <p className="text-xs text-muted-foreground">{(bidderFile.size / 1024 / 1024).toFixed(2)} MB</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => setBidderFile(null)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <input 
                type="file" 
                ref={bidderInputRef} 
                className="hidden" 
                accept="application/pdf"
                onChange={(e) => handleFileChange(e, 'bidder')}
              />
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.back()}>Cancel</Button>
          <Button 
            size="lg" 
            className="gap-2" 
            onClick={handleProcess}
            disabled={loading || !tenderFile || !bidderFile || !tenderName}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Analyzing Documents...
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
