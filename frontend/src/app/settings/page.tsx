"use client";

import { useState } from "react";
import { Save, Moon, Sun, Laptop } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { setTheme, theme } = useTheme();
  const [apiKey, setApiKey] = useState("");
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, you would save these settings to your backend
    setTimeout(() => {
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    }, 500);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Settings</h1>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="appearance">Appearance</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>
        
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>General Settings</CardTitle>
              <CardDescription>
                Configure general application settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select defaultValue="en">
                  <SelectTrigger id="language">
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Spanish</SelectItem>
                    <SelectItem value="fr">French</SelectItem>
                    <SelectItem value="de">German</SelectItem>
                    <SelectItem value="zh">Chinese</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select defaultValue="utc">
                  <SelectTrigger id="timezone">
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="utc">UTC</SelectItem>
                    <SelectItem value="est">Eastern Standard Time</SelectItem>
                    <SelectItem value="cst">Central Standard Time</SelectItem>
                    <SelectItem value="mst">Mountain Standard Time</SelectItem>
                    <SelectItem value="pst">Pacific Standard Time</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="notifications">Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive notifications about your activity
                  </p>
                </div>
                <Switch id="notifications" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto" onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
                {saveSuccess && <span className="ml-2 text-xs">✓ Saved</span>}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Appearance</CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Theme</Label>
                <div className="flex gap-2">
                  <Button
                    variant={theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("light")}
                  >
                    <Sun className="mr-2 h-4 w-4" />
                    Light
                  </Button>
                  <Button
                    variant={theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("dark")}
                  >
                    <Moon className="mr-2 h-4 w-4" />
                    Dark
                  </Button>
                  <Button
                    variant={theme === "system" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setTheme("system")}
                  >
                    <Laptop className="mr-2 h-4 w-4" />
                    System
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="font-size">Font Size</Label>
                <Select defaultValue="medium">
                  <SelectTrigger id="font-size">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Small</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="large">Large</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="density">Layout Density</Label>
                <Select defaultValue="comfortable">
                  <SelectTrigger id="density">
                    <SelectValue placeholder="Select density" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="compact">Compact</SelectItem>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="spacious">Spacious</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto" onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="api" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>API Settings</CardTitle>
              <CardDescription>
                Configure API integration settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <Input
                  id="api-key"
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter your API key"
                />
                <p className="text-xs text-muted-foreground">
                  Your API key is used for authentication with the backend services
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="model">AI Model</Label>
                <Select defaultValue="gpt-4">
                  <SelectTrigger id="model">
                    <SelectValue placeholder="Select AI model" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gpt-4">GPT-4</SelectItem>
                    <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                    <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                    <SelectItem value="custom">Custom Model</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="streaming">Enable Streaming</Label>
                  <p className="text-sm text-muted-foreground">
                    Stream AI responses in real-time
                  </p>
                </div>
                <Switch id="streaming" defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto" onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Settings</CardTitle>
              <CardDescription>
                Configure advanced application settings
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max-tokens">Maximum Response Length</Label>
                <Select defaultValue="2048">
                  <SelectTrigger id="max-tokens">
                    <SelectValue placeholder="Select maximum tokens" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="512">512 tokens</SelectItem>
                    <SelectItem value="1024">1024 tokens</SelectItem>
                    <SelectItem value="2048">2048 tokens</SelectItem>
                    <SelectItem value="4096">4096 tokens</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="temperature">Temperature</Label>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">0.0</span>
                    <input
                      id="temperature"
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      defaultValue="0.7"
                      className="w-full"
                    />
                    <span className="text-sm text-muted-foreground">1.0</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Controls randomness: Lower values are more deterministic, higher values are more creative
                  </p>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="debug">Debug Mode</Label>
                  <p className="text-sm text-muted-foreground">
                    Show debug information in the UI
                  </p>
                </div>
                <Switch id="debug" />
              </div>
            </CardContent>
            <CardFooter>
              <Button className="ml-auto" onClick={handleSaveSettings}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
