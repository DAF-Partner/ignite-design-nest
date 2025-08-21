import React, { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/contexts/TranslationContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { 
  Settings as SettingsIcon, 
  Bell, 
  Lock, 
  Palette, 
  Globe, 
  Shield,
  Mail,
  Smartphone,
  AlertTriangle
} from 'lucide-react';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';

const notificationSchema = z.object({
  emailNotifications: z.boolean(),
  pushNotifications: z.boolean(),
  smsNotifications: z.boolean(),
  marketingEmails: z.boolean(),
  caseUpdates: z.boolean(),
  approvalRequests: z.boolean(),
  gdprRequests: z.boolean(),
});

const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const preferencesSchema = z.object({
  language: z.string(),
  timezone: z.string(),
  dateFormat: z.string(),
  currency: z.string(),
});

type NotificationSettings = z.infer<typeof notificationSchema>;
type PasswordSettings = z.infer<typeof passwordSchema>;
type PreferencesSettings = z.infer<typeof preferencesSchema>;

export default function Settings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const { currentLanguage, setLanguage, getSupportedLanguages } = useLanguage();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState('notifications');

  const notificationForm = useForm<NotificationSettings>({
    resolver: zodResolver(notificationSchema),
    defaultValues: {
      emailNotifications: true,
      pushNotifications: false,
      smsNotifications: false,
      marketingEmails: false,
      caseUpdates: true,
      approvalRequests: true,
      gdprRequests: true,
    },
  });

  const passwordForm = useForm<PasswordSettings>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  const preferencesForm = useForm<PreferencesSettings>({
    resolver: zodResolver(preferencesSchema),
    defaultValues: {
      language: currentLanguage,
      timezone: 'UTC',
      dateFormat: 'MM/DD/YYYY',
      currency: 'EUR',
    },
  });

  // Update form when language changes in context
  React.useEffect(() => {
    preferencesForm.setValue('language', currentLanguage);
  }, [currentLanguage, preferencesForm]);

  const onNotificationSubmit = async (data: NotificationSettings) => {
    try {
      // TODO: Implement API call to update notification settings
      console.log('Notification settings:', data);
      
      toast({
        title: t('settingsUpdated'),
        description: t('notificationSettingsSaved'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('updateSettingsError'),
        variant: 'destructive',
      });
    }
  };

  const onPasswordSubmit = async (data: PasswordSettings) => {
    try {
      // TODO: Implement API call to change password
      console.log('Password change:', data);
      
      toast({
        title: t('passwordUpdated'),
        description: t('passwordChangedSuccess'),
      });
      
      passwordForm.reset();
    } catch (error) {
      toast({
        title: t('error'),
        description: t('updatePasswordError'),
        variant: 'destructive',
      });
    }
  };

  const onPreferencesSubmit = async (data: PreferencesSettings) => {
    try {
      // Update language setting
      setLanguage(data.language);
      
      // TODO: Implement API call to update other preferences
      console.log('Preferences:', data);
      
      toast({
        title: t('preferencesUpdated'),
        description: t('preferencesSaved'),
      });
    } catch (error) {
      toast({
        title: t('error'),
        description: t('updatePreferencesError'),
        variant: 'destructive',
      });
    }
  };

  const handleDeleteAccount = async () => {
    try {
      // TODO: Implement API call to delete account
      console.log('Account deletion requested');
      
      toast({
        title: 'Account deletion requested',
        description: 'Your account deletion request has been submitted for review.',
        variant: 'destructive',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to process account deletion. Please contact support.',
        variant: 'destructive',
      });
    }
  };

  const tabs = [
    { id: 'notifications', label: t('notifications'), icon: Bell },
    { id: 'security', label: t('security'), icon: Lock },
    { id: 'preferences', label: t('preferences'), icon: Palette },
    { id: 'privacy', label: t('privacy'), icon: Shield },
  ];

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
            <SettingsIcon className="h-8 w-8" />
            {t('settingsTitle')}
          </h1>
          <p className="text-muted-foreground mt-2">
            {t('settingsDescription')}
          </p>
        </div>

        <Separator />

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent hover:text-accent-foreground'
                  }`}
                >
                  <tab.icon className="h-4 w-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Content Area */}
          <div className="lg:col-span-3">
            {activeTab === 'notifications' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    {t('notificationSettings')}
                  </CardTitle>
                  <CardDescription>
                    {t('notificationDescription')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...notificationForm}>
                    <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-6">
                      <div className="space-y-4">
                        <h4 className="font-medium">{t('communicationChannels')}</h4>
                        
                        <FormField
                          control={notificationForm.control}
                          name="emailNotifications"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <FormLabel className="flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  {t('emailNotifications')}
                                </FormLabel>
                                <FormDescription>
                                  {t('emailNotificationDesc')}
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={notificationForm.control}
                          name="smsNotifications"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                 <FormLabel className="flex items-center gap-2">
                                   <Smartphone className="h-4 w-4" />
                                   {t('smsNotifications')}
                                 </FormLabel>
                                 <FormDescription>
                                   {t('smsNotificationDesc')}
                                 </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={notificationForm.control}
                          name="marketingEmails"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <FormLabel>Marketing Communications</FormLabel>
                                <FormDescription>
                                  Receive product updates and promotional content
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <Separator />

                      <div className="space-y-4">
                        <h4 className="font-medium">Notification Types</h4>
                        
                        <FormField
                          control={notificationForm.control}
                          name="caseUpdates"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <FormLabel>Case Updates</FormLabel>
                                <FormDescription>
                                  Get notified when cases are updated
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={notificationForm.control}
                          name="approvalRequests"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <FormLabel>Approval Requests</FormLabel>
                                <FormDescription>
                                  Get notified about pending approvals
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={notificationForm.control}
                          name="gdprRequests"
                          render={({ field }) => (
                            <FormItem className="flex items-center justify-between">
                              <div className="space-y-0.5">
                                <FormLabel>GDPR Requests</FormLabel>
                                <FormDescription>
                                  Get notified about GDPR-related activities
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch checked={field.value} onCheckedChange={field.onChange} />
                              </FormControl>
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button type="submit">Save Notification Settings</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'security' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Lock className="h-5 w-5" />
                      Change Password
                    </CardTitle>
                    <CardDescription>
                      Update your password to keep your account secure
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Form {...passwordForm}>
                      <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
                        <FormField
                          control={passwordForm.control}
                          name="currentPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Current Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter current password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="newPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>New Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Enter new password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={passwordForm.control}
                          name="confirmPassword"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Confirm New Password</FormLabel>
                              <FormControl>
                                <Input type="password" placeholder="Confirm new password" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <Button type="submit">Update Password</Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'preferences' && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-5 w-5" />
                    {t('preferencesTitle')}
                  </CardTitle>
                  <CardDescription>
                    {t('preferencesDesc')}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Form {...preferencesForm}>
                    <form onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)} className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                          control={preferencesForm.control}
                          name="language"
                          render={({ field }) => (
                            <FormItem>
                               <FormLabel>{t('language')}</FormLabel>
                               <Select onValueChange={field.onChange} value={field.value}>
                                 <FormControl>
                                   <SelectTrigger>
                                     <SelectValue placeholder={t('selectLanguage')} />
                                   </SelectTrigger>
                                 </FormControl>
                                <SelectContent>
                                  {getSupportedLanguages().map((lang) => (
                                    <SelectItem key={lang.code} value={lang.code}>
                                      {lang.nativeName} ({lang.name})
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={preferencesForm.control}
                          name="timezone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Timezone</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select timezone" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="UTC">UTC</SelectItem>
                                  <SelectItem value="EST">Eastern Time</SelectItem>
                                  <SelectItem value="PST">Pacific Time</SelectItem>
                                  <SelectItem value="CET">Central European Time</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={preferencesForm.control}
                          name="dateFormat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Date Format</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select date format" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
                                  <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
                                  <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={preferencesForm.control}
                          name="currency"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Currency</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Select currency" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="EUR">EUR (€)</SelectItem>
                                  <SelectItem value="USD">USD ($)</SelectItem>
                                  <SelectItem value="GBP">GBP (£)</SelectItem>
                                  <SelectItem value="CHF">CHF</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <Button type="submit">{t('savePreferences')}</Button>
                    </form>
                  </Form>
                </CardContent>
              </Card>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Shield className="h-5 w-5" />
                      Privacy & Data
                    </CardTitle>
                    <CardDescription>
                      Manage your privacy settings and data
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Data Export</h4>
                          <p className="text-sm text-muted-foreground">
                            Download all your personal data and case information
                          </p>
                        </div>
                        <Button variant="outline">Export Data</Button>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium">Data Retention</h4>
                          <p className="text-sm text-muted-foreground">
                            View our data retention policy and your data lifecycle
                          </p>
                        </div>
                        <Button variant="outline">View Policy</Button>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-medium text-destructive">Delete Account</h4>
                          <p className="text-sm text-muted-foreground">
                            Permanently delete your account and all associated data
                          </p>
                        </div>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="destructive" className="flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4" />
                              Delete Account
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This action cannot be undone. This will permanently delete your
                                account and remove all your data from our servers, including all
                                cases, documents, and personal information.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteAccount}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete Account
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}