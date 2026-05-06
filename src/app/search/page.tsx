"use client"

import { useState, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, FileText, Calendar, ShieldCheck, Loader2, ArrowRight } from "lucide-react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy } from "firebase/firestore";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default function SearchPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const db = useFirestore();

  const tendersQuery = useMemoFirebase(() => {
    if (!db) return null;
    return query(collection(db, "tenders"), orderBy("createdDateTime", "desc"));
  }, [db]);

  const { data: tenders, isLoading } = useCollection(tendersQuery);

  const filteredResults = useMemo(() => {
    if (!tenders) return [];
    if (!searchTerm.trim()) return tenders;
    
    const term = searchTerm.toLowerCase();
    return tenders.filter(t => 
      t.title?.toLowerCase().includes(term) || 
      t.referenceNumber?.toLowerCase().includes(term) ||
      t.description?.toLowerCase().includes(term)
    );
  }, [tenders, searchTerm]);

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <Search className="h-8 w-8" />
          Global Search
        </h1>
        <p className="text-muted-foreground">Find tenders, evaluations, and audit records across the entire platform.</p>
      </div>

      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-6 w-6 text-muted-foreground" />
        <Input 
          className="h-16 pl-14 text-xl bg-card border-2 focus-visible:ring-primary shadow-lg" 
          placeholder="Search by tender name, reference number, or keywords..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          autoFocus
        />
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-widest text-muted-foreground">
            {searchTerm ? `Search Results (${filteredResults.length})` : "Recent Tenders"}
          </h2>
          {isLoading && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
        </div>

        {filteredResults.length === 0 && !isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 bg-muted/20 rounded-2xl border-2 border-dashed">
            <Search className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="font-semibold text-muted-foreground">No matches found for "{searchTerm}"</p>
            <p className="text-sm text-muted-foreground">Try adjusting your search keywords.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredResults.map((result) => (
              <Card key={result.id} className="hover:shadow-md transition-shadow group">
                <Link href={`/tenders`}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex gap-4">
                        <div className="mt-1 w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <FileText className="h-5 w-5 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-lg group-hover:text-primary transition-colors">{result.title}</h3>
                            <Badge variant="outline" className="font-mono text-[10px]">{result.referenceNumber}</Badge>
                          </div>
                          <p className="text-sm text-muted-foreground line-clamp-1">{result.description}</p>
                          <div className="flex items-center gap-4 text-xs text-muted-foreground pt-1">
                            <span className="flex items-center gap-1">
                              <Calendar className="h-3 w-3" />
                              {result.createdDateTime ? new Date(result.createdDateTime).toLocaleDateString() : 'N/A'}
                            </span>
                            <span className="flex items-center gap-1">
                              <ShieldCheck className="h-3 w-3" />
                              {result.status || 'Active'}
                            </span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </CardContent>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
