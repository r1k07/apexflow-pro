import { useState } from "react";
import { User, Bell, Palette, Shield, Download, Upload, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Layout from "@/components/Layout";

const Settings = () => {
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    profile: {
      name: "Alex Morgan",
      email: "alex.morgan@example.com",
      avatar: ""
    },
    notifications: {
      emailNotifications: true,
      pushNotifications: true,
      taskReminders: true,
      weeklyDigest: false
    },
    appearance: {
      theme: "dark",
      compactMode: false,
      showCompleted: true,
      animationsEnabled: true
    },
    privacy: {
      publicProfile: false,
      shareAnalytics: true,
      dataCollection: false
    }
  });

  const handleSaveSettings = () => {
    // Here you would typically save to a backend or localStorage
    localStorage.setItem('taskflow-settings', JSON.stringify(settings));
    toast({
      title: "Settings saved",
      description: "Your preferences have been updated successfully.",
    });
  };

  const handleExportData = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'taskflow-settings.json';
    link.click();
    URL.revokeObjectURL(url);
    
    toast({
      title: "Data exported",
      description: "Your settings have been downloaded as a JSON file.",
    });
  };

  const updateSetting = (category: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category as keyof typeof prev],
        [key]: value
      }
    }));
  };

  return (
    <Layout>
      <div className="min-h-screen p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Settings</h1>
            <p className="text-muted-foreground">
              Manage your account and application preferences
            </p>
          </div>
          <Button onClick={handleSaveSettings} className="shadow-glow-blue">
            <Save className="h-4 w-4 mr-2" />
            Save Changes
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Profile Settings */}
          <Card className="gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <User className="h-5 w-5 mr-2" />
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={settings.profile.name}
                  onChange={(e) => updateSetting('profile', 'name', e.target.value)}
                  className="bg-secondary/50 border-border/50"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={settings.profile.email}
                  onChange={(e) => updateSetting('profile', 'email', e.target.value)}
                  className="bg-secondary/50 border-border/50"
                />
              </div>
              <div>
                <Label>Status</Label>
                <div className="flex items-center space-x-2 mt-2">
                  <Badge variant="outline" className="text-green-success bg-green-success/10">
                    ● Active
                  </Badge>
                  <Badge variant="secondary">Pro Plan</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Bell className="h-5 w-5 mr-2" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">Receive updates via email</p>
                </div>
                <Switch
                  checked={settings.notifications.emailNotifications}
                  onCheckedChange={(checked) => updateSetting('notifications', 'emailNotifications', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Push Notifications</Label>
                  <p className="text-sm text-muted-foreground">Browser notifications</p>
                </div>
                <Switch
                  checked={settings.notifications.pushNotifications}
                  onCheckedChange={(checked) => updateSetting('notifications', 'pushNotifications', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Task Reminders</Label>
                  <p className="text-sm text-muted-foreground">Reminders for due tasks</p>
                </div>
                <Switch
                  checked={settings.notifications.taskReminders}
                  onCheckedChange={(checked) => updateSetting('notifications', 'taskReminders', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Weekly Digest</Label>
                  <p className="text-sm text-muted-foreground">Summary of your week</p>
                </div>
                <Switch
                  checked={settings.notifications.weeklyDigest}
                  onCheckedChange={(checked) => updateSetting('notifications', 'weeklyDigest', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Palette className="h-5 w-5 mr-2" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Theme</Label>
                <div className="grid grid-cols-2 gap-2 mt-2">
                  <Button
                    variant={settings.appearance.theme === "dark" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSetting('appearance', 'theme', 'dark')}
                  >
                    Dark
                  </Button>
                  <Button
                    variant={settings.appearance.theme === "light" ? "default" : "outline"}
                    size="sm"
                    onClick={() => updateSetting('appearance', 'theme', 'light')}
                  >
                    Light
                  </Button>
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Compact Mode</Label>
                  <p className="text-sm text-muted-foreground">Reduced spacing</p>
                </div>
                <Switch
                  checked={settings.appearance.compactMode}
                  onCheckedChange={(checked) => updateSetting('appearance', 'compactMode', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Show Completed Tasks</Label>
                  <p className="text-sm text-muted-foreground">Display finished tasks</p>
                </div>
                <Switch
                  checked={settings.appearance.showCompleted}
                  onCheckedChange={(checked) => updateSetting('appearance', 'showCompleted', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Animations</Label>
                  <p className="text-sm text-muted-foreground">Enable smooth transitions</p>
                </div>
                <Switch
                  checked={settings.appearance.animationsEnabled}
                  onCheckedChange={(checked) => updateSetting('appearance', 'animationsEnabled', checked)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="gradient-card shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center text-foreground">
                <Shield className="h-5 w-5 mr-2" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Public Profile</Label>
                  <p className="text-sm text-muted-foreground">Make profile visible to others</p>
                </div>
                <Switch
                  checked={settings.privacy.publicProfile}
                  onCheckedChange={(checked) => updateSetting('privacy', 'publicProfile', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Share Analytics</Label>
                  <p className="text-sm text-muted-foreground">Help improve the app</p>
                </div>
                <Switch
                  checked={settings.privacy.shareAnalytics}
                  onCheckedChange={(checked) => updateSetting('privacy', 'shareAnalytics', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <Label>Data Collection</Label>
                  <p className="text-sm text-muted-foreground">Allow usage tracking</p>
                </div>
                <Switch
                  checked={settings.privacy.dataCollection}
                  onCheckedChange={(checked) => updateSetting('privacy', 'dataCollection', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Data Management */}
        <Card className="gradient-card shadow-card">
          <CardHeader>
            <CardTitle className="text-foreground">Data Management</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" onClick={handleExportData}>
                <Download className="h-4 w-4 mr-2" />
                Export Data
              </Button>
              <Button variant="outline">
                <Upload className="h-4 w-4 mr-2" />
                Import Data
              </Button>
              <Button variant="destructive">
                <Shield className="h-4 w-4 mr-2" />
                Delete Account
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-4">
              Export your data anytime or permanently delete your account and all associated data.
            </p>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
};

export default Settings;