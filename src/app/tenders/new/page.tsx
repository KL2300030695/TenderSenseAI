
"use client"

import {useState, useRef} from "react"
import {useRouter} from "next/navigation"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Label} from "@/components/ui/label"
import {Textarea} from "@/components/ui/textarea"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import {
  Upload,
  FileUp,
  Loader2,
  CheckCircle2,
  Info,
  FileText,
  X,
  Type,
  Link as LinkIcon,
  Globe,
  ShieldCheck,
} from "lucide-react"
import {useToast} from "@/hooks/use-toast"
import {explainableDecisionReporting} from "@/ai/flows/explainable-decision-reporting"
import { useFirestore, useUser, addDocumentNonBlocking } from "@/firebase"
import { collection } from "firebase/firestore"

type InputType = 'pdf' | 'text' | 'url';

interface DocumentState {
  type: InputType;
  file: File | null;
  text: string;
  url: string;
}

export default function NewEvaluationPage() {
  const [loading, setLoading] = useState(false)
  const [tenderName, setTenderName] = useState("")
  
  const [tenderDoc, setTenderDoc] = useState<DocumentState>({ type: 'pdf', file: null, text: '', url: '' })
  const [bidderDoc, setBidderDoc] = useState<DocumentState>({ type: 'pdf', file: null, text: '', url: '' })
  
  const tenderInputRef = useRef<HTMLInputElement>(null)
  const bidderInputRef = useRef<HTMLInputElement>(null)
  
  const router = useRouter()
  const {toast} = useToast()
  const db = useFirestore()
  const { user } = useUser()

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = (error) => reject(error)
    })
  }

  const prepareInput = async (doc: DocumentState) => {
    if (doc.type === 'pdf') {
      if (!doc.file) return null;
      const base64 = await fileToBase64(doc.file);
      return { type: 'pdf' as const, value: base64 };
    } else if (doc.type === 'text') {
      if (!doc.text.trim()) return null;
      return { type: 'text' as const, value: doc.text };
    } else if (doc.type === 'url') {
      if (!doc.url.trim()) return null;
      return { type: 'url' as const, value: doc.url };
    }
    return null;
  }

  const handleProcess = async () => {
    if (!tenderName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please provide a name for this evaluation.",
        variant: "destructive",
      })
      return
    }

    const tenderInput = await prepareInput(tenderDoc);
    const bidderInput = await prepareInput(bidderDoc);

    if (!tenderInput) {
      toast({
        title: "Tender Source Missing",
        description: "Please provide the tender source via text, PDF, or URL.",
        variant: "destructive",
      })
      return
    }

    if (!bidderInput) {
      toast({
        title: "Bidder Submission Missing",
        description: "Please provide the bidder submission via text, PDF, or URL.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)
    try {
      const result = await explainableDecisionReporting({
        tenderDoc: tenderInput,
        bidderDoc: bidderInput,
      })
      
      sessionStorage.setItem('last_evaluation', JSON.stringify({
        name: tenderName,
        result: result,
        timestamp: new Date().toISOString()
      }))

      if (db) {
        const timestamp = new Date().toISOString();
        const tenderRef = collection(db, "tenders");
        const evaluationRef = collection(db, "tenderEvaluationSummaries");

        const tenderData = {
          title: tenderName,
          referenceNumber: `TR-${Math.floor(Math.random() * 10000)}`,
          status: "Active",
          createdDateTime: timestamp,
          publicationDate: timestamp,
          submissionDeadline: timestamp,
          description: `AI-Generated Evaluation for ${tenderName}`
        };

        addDocumentNonBlocking(tenderRef, tenderData).then((docRef) => {
           if (docRef) {
             const summaryData = {
               tenderId: docRef.id,
               bidderId: user?.uid || "anonymous",
               overallDecision: result.summary.final_decision,
               summaryReason: result.summary.reason,
               riskFlags: result.summary.risk_flags,
               evaluationDateTime: timestamp
             };
             addDocumentNonBlocking(evaluationRef, summaryData);
           }
        });
      }

      toast({
        title: "Evaluation Successful",
        description: "Your results have been processed and saved.",
      })
      
      router.push("/tenders/report")
    } catch (error) {
      console.error(error)
      toast({
        title: "Evaluation Failed",
        description: "There was an error processing the documents. Please check your inputs and try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setDoc: React.Dispatch<React.SetStateAction<DocumentState>>) => {
    const file = e.target.files?.[0]
    if (file && file.type === 'application/pdf') {
      setDoc(prev => ({ ...prev, file }))
    } else if (file) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a PDF document.",
        variant: "destructive",
      })
    }
  }

  const DocumentInput = ({ 
    label, 
    description, 
    state, 
    setState, 
    inputRef, 
    onFileClick 
  }: { 
    label: string, 
    description: string, 
    state: DocumentState, 
    setState: React.Dispatch<React.SetStateAction<DocumentState>>,
    inputRef: React.RefObject<HTMLInputElement>,
    onFileClick: () => void
  }) => (
    <Card className="flex flex-col border-2 overflow-hidden bg-card shadow-sm hover:shadow-md transition-all">
      <CardHeader className="bg-muted/30 pb-4 border-b">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FileUp className="h-5 w-5 text-primary" />
          {label}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 p-0">
        <Tabs defaultValue={state.type} className="w-full" onValueChange={(v) => setState(prev => ({ ...prev, type: v as InputType }))}>
          <div className="bg-muted/20 p-4 border-b">
            <TabsList className="grid grid-cols-3 w-full max-w-sm mx-auto">
              <TabsTrigger value="text" className="gap-2"><Type className="h-3.5 w-3.5" /> Paste Text</TabsTrigger>
              <TabsTrigger value="pdf" className="gap-2"><Upload className="h-3.5 w-3.5" /> Upload PDF</TabsTrigger>
              <TabsTrigger value="url" className="gap-2"><Globe className="h-3.5 w-3.5" /> From URL</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="text" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Document Content</Label>
                <Textarea 
                  placeholder="Paste your full document content here..." 
                  className="min-h-[200px] resize-none focus-visible:ring-primary"
                  value={state.text}
                  onChange={(e) => setState(prev => ({ ...prev, text: e.target.value }))}
                />
              </div>
            </TabsContent>

            <TabsContent value="pdf" className="mt-0 flex flex-col items-center justify-center min-h-[200px]">
              {!state.file ? (
                <div 
                  className="flex flex-col items-center gap-4 cursor-pointer hover:bg-muted/50 w-full p-8 rounded-xl border-2 border-dashed transition-colors group"
                  onClick={onFileClick}
                >
                  <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center group-hover:bg-primary/10 transition-colors">
                    <Upload className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-semibold">Click to upload PDF</p>
                    <p className="text-xs text-muted-foreground mt-1">Maximum size: 10MB</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-primary/5 border-2 border-primary/20 w-full animate-in fade-in slide-in-from-bottom-2">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{state.file.name}</p>
                    <p className="text-xs text-muted-foreground">{(state.file.size / 1024 / 1024).toFixed(2)} MB • PDF Document</p>
                  </div>
                  <Button variant="ghost" size="icon" className="hover:bg-destructive/10 hover:text-destructive" onClick={() => setState(prev => ({ ...prev, file: null }))}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <input 
                type="file" 
                ref={inputRef} 
                className="hidden" 
                accept="application/pdf"
                onChange={(e) => handleFileChange(e, setState)}
              />
            </TabsContent>

            <TabsContent value="url" className="mt-0 space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Document URL</Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input 
                      placeholder="https://example.com/document.pdf" 
                      className="pl-10 focus-visible:ring-primary"
                      value={state.url}
                      onChange={(e) => setState(prev => ({ ...prev, url: e.target.value }))}
                    />
                  </div>
                  <Button variant="outline" size="icon" className="shrink-0"><LinkIcon className="h-4 w-4" /></Button>
                </div>
                <p className="text-xs text-muted-foreground italic">AI will automatically crawl and process content from this URL.</p>
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </CardContent>
    </Card>
  )

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col gap-2">
        <h1 className="text-4xl font-extrabold tracking-tight text-primary">New Evaluation</h1>
        <p className="text-muted-foreground text-lg">Provide your tender source and bidder submission via text, PDF, or URL for a comprehensive AI evaluation.</p>
      </div>

      <div className="grid gap-8">
        <Card className="shadow-sm border-2">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg flex items-center gap-2">
              <Info className="h-5 w-5 text-primary" />
              Evaluation Identity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="tender-name" className="text-sm font-semibold">Tender / Project Name</Label>
              <Input 
                id="tender-name" 
                placeholder="e.g., Regional Highway Maintenance 2024" 
                className="h-12 text-lg focus-visible:ring-primary"
                value={tenderName}
                onChange={(e) => setTenderName(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-8">
          <DocumentInput 
            label="Tender Source" 
            description="The official tender or RFP requirements." 
            state={tenderDoc}
            setState={setTenderDoc}
            inputRef={tenderInputRef}
            onFileClick={() => tenderInputRef.current?.click()}
          />
          <DocumentInput 
            label="Bidder Submission" 
            description="The proposal or bid documents to evaluate." 
            state={bidderDoc}
            setState={setBidderDoc}
            inputRef={bidderInputRef}
            onFileClick={() => bidderInputRef.current?.click()}
          />
        </div>

        <div className="flex items-center justify-between bg-muted/20 p-6 rounded-2xl border-2">
          <div className="flex items-center gap-3 text-muted-foreground">
            <ShieldCheck className="h-5 w-5" />
            <span className="text-sm font-medium">All data is processed securely and encrypted.</span>
          </div>
          <div className="flex gap-4">
            <Button variant="ghost" size="lg" onClick={() => router.back()}>Cancel</Button>
            <Button 
              size="lg" 
              className="gap-2 min-w-[200px] h-14 text-lg font-bold shadow-lg shadow-primary/20" 
              onClick={handleProcess}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5" />
                  Start Evaluation
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
