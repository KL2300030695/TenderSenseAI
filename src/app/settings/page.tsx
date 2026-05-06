"use client"

import { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Settings, Shield, Bell, Database, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function SettingsPage() {
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

  const handleSave = () => {
    setIsSaving(true);
    // Simulate API call
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Settings Saved",
        description: "Your platform preferences have been updated successfully.",
      });
    }, 1000);
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <Settings className="h-8 w-8" />
          Platform Settings
        </h1>
        <p className="text-muted-foreground">Manage your TenderSense AI configuration and security preferences.</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-primary" />
              AI Evaluation Control
            </CardTitle>
            <CardDescription>Configure how the AI evaluates bidder submissions.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Strict Compliance Mode</Label>
                <p className="text-xs text-muted-foreground">Require 100% keyword match for mandatory criteria.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Confidence Threshold</Label>
                <p className="text-xs text-muted-foreground">Flag evaluations below 80% for manual review.</p>
              </div>
              <Select defaultValue="80">
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="70">70%</SelectItem>
                  <SelectItem value="80">80%</SelectItem>
                  <SelectItem value="90">90%</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-primary" />
              Notifications
            </CardTitle>
            <CardDescription>Stay updated on evaluation progress.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Evaluation Completed</Label>
                <p className="text-xs text-muted-foreground">Receive a notification when an AI report is ready.</p>
              </div>
              <Switch defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Security Alerts</Label>
                <p className="text-xs text-muted-foreground">Get notified about unauthorized access attempts.</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              Data Retention
            </CardTitle>
            <CardDescription>Manage your Firestore audit logs.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Auto-Archive History</Label>
              <Select defaultValue="90">
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">After 30 days</SelectItem>
                  <SelectItem value="90">After 90 days</SelectItem>
                  <SelectItem value="365">After 1 year</SelectItem>
                  <SelectItem value="never">Never archive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>System API Key</Label>
              <Input type="password" value="••••••••••••••••" readOnly />
              <p className="text-[10px] text-muted-foreground">Used for external procurement system integrations.</p>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4 pt-4">
          <Button variant="outline">Reset to Defaults</Button>
          <Button className="gap-2 min-w-[120px]" onClick={handleSave} disabled={isSaving}>
            {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save Settings
          </Button>
        </div>
      </div>
    </div>
  );
}
