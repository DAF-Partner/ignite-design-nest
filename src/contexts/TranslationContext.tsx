import React, { createContext, useContext } from 'react';
import { useLanguage } from './LanguageContext';

// Translation dictionaries
const translations = {
  en: {
    // Navigation
    dashboard: 'Dashboard',
    caseManagement: 'Case Management',
    newCase: 'New Case',
    approvals: 'Approvals',
    invoices: 'Invoices',
    gdprRequests: 'GDPR Requests',
    profile: 'Profile',
    settings: 'Settings',
    userManagement: 'User Management',
    tariffManagement: 'Tariff Management',
    messageTemplates: 'Message Templates',
    retentionPolicy: 'Retention Policy',
    dataProtectionOffice: 'Data Protection Office',
    
    // Settings page
    settingsTitle: 'Settings',
    settingsDescription: 'Manage your account settings and preferences',
    notifications: 'Notifications',
    security: 'Security',
    preferences: 'Preferences',
    privacy: 'Privacy',
    
    // Notification settings
    notificationSettings: 'Notification Settings',
    notificationDescription: 'Configure how you want to receive notifications',
    communicationChannels: 'Communication Channels',
    emailNotifications: 'Email Notifications',
    emailNotificationDesc: 'Receive notifications via email',
    smsNotifications: 'SMS Notifications',
    smsNotificationDesc: 'Receive urgent notifications via SMS',
    marketingCommunications: 'Marketing Communications',
    marketingDesc: 'Receive product updates and promotional content',
    notificationTypes: 'Notification Types',
    caseUpdates: 'Case Updates',
    caseUpdatesDesc: 'Get notified when cases are updated',
    approvalRequests: 'Approval Requests',
    approvalRequestsDesc: 'Get notified about pending approvals',
    gdprRequestsNotif: 'GDPR Requests',
    gdprRequestsDesc: 'Get notified about GDPR-related activities',
    saveNotificationSettings: 'Save Notification Settings',
    
    // Password settings
    changePassword: 'Change Password',
    changePasswordDesc: 'Update your password to keep your account secure',
    currentPassword: 'Current Password',
    currentPasswordPlaceholder: 'Enter current password',
    newPassword: 'New Password',
    newPasswordPlaceholder: 'Enter new password',
    confirmPassword: 'Confirm New Password',
    confirmPasswordPlaceholder: 'Confirm new password',
    updatePassword: 'Update Password',
    
    // Preferences
    preferencesTitle: 'Preferences',
    preferencesDesc: 'Customize your application experience',
    language: 'Language',
    selectLanguage: 'Select language',
    timezone: 'Timezone',
    selectTimezone: 'Select timezone',
    dateFormat: 'Date Format',
    selectDateFormat: 'Select date format',
    currency: 'Currency',
    selectCurrency: 'Select currency',
    savePreferences: 'Save Preferences',
    
    // Header
    logout: 'Logout',
    
    // Toast messages
    settingsUpdated: 'Settings updated',
    notificationSettingsSaved: 'Your notification preferences have been saved.',
    passwordUpdated: 'Password updated',
    passwordChangedSuccess: 'Your password has been successfully changed.',
    preferencesUpdated: 'Preferences updated',
    preferencesSaved: 'Your preferences have been saved.',
    error: 'Error',
    updateSettingsError: 'Failed to update settings. Please try again.',
    updatePasswordError: 'Failed to update password. Please try again.',
    updatePreferencesError: 'Failed to update preferences. Please try again.',
  },
  
  de: {
    // Navigation
    dashboard: 'Dashboard',
    caseManagement: 'Fallverwaltung',
    newCase: 'Neuer Fall',
    approvals: 'Genehmigungen',
    invoices: 'Rechnungen',
    gdprRequests: 'DSGVO-Anfragen',
    profile: 'Profil',
    settings: 'Einstellungen',
    userManagement: 'Benutzerverwaltung',
    tariffManagement: 'Tarifverwaltung',
    messageTemplates: 'Nachrichtenvorlagen',
    retentionPolicy: 'Aufbewahrungsrichtlinie',
    dataProtectionOffice: 'Datenschutzbüro',
    
    // Settings page
    settingsTitle: 'Einstellungen',
    settingsDescription: 'Verwalten Sie Ihre Kontoeinstellungen und Präferenzen',
    notifications: 'Benachrichtigungen',
    security: 'Sicherheit',
    preferences: 'Präferenzen',
    privacy: 'Datenschutz',
    
    // Notification settings
    notificationSettings: 'Benachrichtigungseinstellungen',
    notificationDescription: 'Konfigurieren Sie, wie Sie Benachrichtigungen erhalten möchten',
    communicationChannels: 'Kommunikationskanäle',
    emailNotifications: 'E-Mail-Benachrichtigungen',
    emailNotificationDesc: 'Benachrichtigungen per E-Mail erhalten',
    smsNotifications: 'SMS-Benachrichtigungen',
    smsNotificationDesc: 'Dringende Benachrichtigungen per SMS erhalten',
    marketingCommunications: 'Marketing-Kommunikation',
    marketingDesc: 'Produkt-Updates und Werbeinhalte erhalten',
    notificationTypes: 'Benachrichtigungstypen',
    caseUpdates: 'Fall-Updates',
    caseUpdatesDesc: 'Benachrichtigung bei Aktualisierung von Fällen',
    approvalRequests: 'Genehmigungsanfragen',
    approvalRequestsDesc: 'Benachrichtigung über ausstehende Genehmigungen',
    gdprRequestsNotif: 'DSGVO-Anfragen',
    gdprRequestsDesc: 'Benachrichtigung über DSGVO-bezogene Aktivitäten',
    saveNotificationSettings: 'Benachrichtigungseinstellungen speichern',
    
    // Password settings
    changePassword: 'Passwort ändern',
    changePasswordDesc: 'Aktualisieren Sie Ihr Passwort für die Kontosicherheit',
    currentPassword: 'Aktuelles Passwort',
    currentPasswordPlaceholder: 'Aktuelles Passwort eingeben',
    newPassword: 'Neues Passwort',
    newPasswordPlaceholder: 'Neues Passwort eingeben',
    confirmPassword: 'Neues Passwort bestätigen',
    confirmPasswordPlaceholder: 'Neues Passwort bestätigen',
    updatePassword: 'Passwort aktualisieren',
    
    // Preferences
    preferencesTitle: 'Präferenzen',
    preferencesDesc: 'Passen Sie Ihre Anwendungserfahrung an',
    language: 'Sprache',
    selectLanguage: 'Sprache auswählen',
    timezone: 'Zeitzone',
    selectTimezone: 'Zeitzone auswählen',
    dateFormat: 'Datumsformat',
    selectDateFormat: 'Datumsformat auswählen',
    currency: 'Währung',
    selectCurrency: 'Währung auswählen',
    savePreferences: 'Präferenzen speichern',
    
    // Header
    logout: 'Abmelden',
    
    // Toast messages
    settingsUpdated: 'Einstellungen aktualisiert',
    notificationSettingsSaved: 'Ihre Benachrichtigungspräferenzen wurden gespeichert.',
    passwordUpdated: 'Passwort aktualisiert',
    passwordChangedSuccess: 'Ihr Passwort wurde erfolgreich geändert.',
    preferencesUpdated: 'Präferenzen aktualisiert',
    preferencesSaved: 'Ihre Präferenzen wurden gespeichert.',
    error: 'Fehler',
    updateSettingsError: 'Einstellungen konnten nicht aktualisiert werden. Bitte versuchen Sie es erneut.',
    updatePasswordError: 'Passwort konnte nicht aktualisiert werden. Bitte versuchen Sie es erneut.',
    updatePreferencesError: 'Präferenzen konnten nicht aktualisiert werden. Bitte versuchen Sie es erneut.',
  },
  
  fr: {
    // Navigation
    dashboard: 'Tableau de bord',
    caseManagement: 'Gestion des cas',
    newCase: 'Nouveau cas',
    approvals: 'Approbations',
    invoices: 'Factures',
    gdprRequests: 'Demandes RGPD',
    profile: 'Profil',
    settings: 'Paramètres',
    userManagement: 'Gestion des utilisateurs',
    tariffManagement: 'Gestion des tarifs',
    messageTemplates: 'Modèles de messages',
    retentionPolicy: 'Politique de rétention',
    dataProtectionOffice: 'Bureau de protection des données',
    
    // Settings page
    settingsTitle: 'Paramètres',
    settingsDescription: 'Gérez vos paramètres de compte et préférences',
    notifications: 'Notifications',
    security: 'Sécurité',
    preferences: 'Préférences',
    privacy: 'Confidentialité',
    
    // Notification settings
    notificationSettings: 'Paramètres de notification',
    notificationDescription: 'Configurez comment vous souhaitez recevoir les notifications',
    communicationChannels: 'Canaux de communication',
    emailNotifications: 'Notifications par e-mail',
    emailNotificationDesc: 'Recevoir des notifications par e-mail',
    smsNotifications: 'Notifications SMS',
    smsNotificationDesc: 'Recevoir des notifications urgentes par SMS',
    marketingCommunications: 'Communications marketing',
    marketingDesc: 'Recevoir les mises à jour produits et contenu promotionnel',
    notificationTypes: 'Types de notification',
    caseUpdates: 'Mises à jour de cas',
    caseUpdatesDesc: 'Être notifié lors de la mise à jour des cas',
    approvalRequests: 'Demandes d\'approbation',
    approvalRequestsDesc: 'Être notifié des approbations en attente',
    gdprRequestsNotif: 'Demandes RGPD',
    gdprRequestsDesc: 'Être notifié des activités liées au RGPD',
    saveNotificationSettings: 'Enregistrer les paramètres de notification',
    
    // Password settings
    changePassword: 'Changer le mot de passe',
    changePasswordDesc: 'Mettez à jour votre mot de passe pour sécuriser votre compte',
    currentPassword: 'Mot de passe actuel',
    currentPasswordPlaceholder: 'Entrer le mot de passe actuel',
    newPassword: 'Nouveau mot de passe',
    newPasswordPlaceholder: 'Entrer le nouveau mot de passe',
    confirmPassword: 'Confirmer le nouveau mot de passe',
    confirmPasswordPlaceholder: 'Confirmer le nouveau mot de passe',
    updatePassword: 'Mettre à jour le mot de passe',
    
    // Preferences
    preferencesTitle: 'Préférences',
    preferencesDesc: 'Personnalisez votre expérience d\'application',
    language: 'Langue',
    selectLanguage: 'Sélectionner la langue',
    timezone: 'Fuseau horaire',
    selectTimezone: 'Sélectionner le fuseau horaire',
    dateFormat: 'Format de date',
    selectDateFormat: 'Sélectionner le format de date',
    currency: 'Devise',
    selectCurrency: 'Sélectionner la devise',
    savePreferences: 'Enregistrer les préférences',
    
    // Header
    logout: 'Déconnexion',
    
    // Toast messages
    settingsUpdated: 'Paramètres mis à jour',
    notificationSettingsSaved: 'Vos préférences de notification ont été enregistrées.',
    passwordUpdated: 'Mot de passe mis à jour',
    passwordChangedSuccess: 'Votre mot de passe a été changé avec succès.',
    preferencesUpdated: 'Préférences mises à jour',
    preferencesSaved: 'Vos préférences ont été enregistrées.',
    error: 'Erreur',
    updateSettingsError: 'Échec de la mise à jour des paramètres. Veuillez réessayer.',
    updatePasswordError: 'Échec de la mise à jour du mot de passe. Veuillez réessayer.',
    updatePreferencesError: 'Échec de la mise à jour des préférences. Veuillez réessayer.',
  },
  
  es: {
    // Navigation
    dashboard: 'Panel de control',
    caseManagement: 'Gestión de casos',
    newCase: 'Nuevo caso',
    approvals: 'Aprobaciones',
    invoices: 'Facturas',
    gdprRequests: 'Solicitudes RGPD',
    profile: 'Perfil',
    settings: 'Configuración',
    userManagement: 'Gestión de usuarios',
    tariffManagement: 'Gestión de tarifas',
    messageTemplates: 'Plantillas de mensajes',
    retentionPolicy: 'Política de retención',
    dataProtectionOffice: 'Oficina de protección de datos',
    
    // Settings page
    settingsTitle: 'Configuración',
    settingsDescription: 'Gestiona la configuración de tu cuenta y preferencias',
    notifications: 'Notificaciones',
    security: 'Seguridad',
    preferences: 'Preferencias',
    privacy: 'Privacidad',
    
    // Notification settings
    notificationSettings: 'Configuración de notificaciones',
    notificationDescription: 'Configura cómo quieres recibir notificaciones',
    communicationChannels: 'Canales de comunicación',
    emailNotifications: 'Notificaciones por correo',
    emailNotificationDesc: 'Recibir notificaciones por correo electrónico',
    smsNotifications: 'Notificaciones SMS',
    smsNotificationDesc: 'Recibir notificaciones urgentes por SMS',
    marketingCommunications: 'Comunicaciones de marketing',
    marketingDesc: 'Recibir actualizaciones de productos y contenido promocional',
    notificationTypes: 'Tipos de notificación',
    caseUpdates: 'Actualizaciones de casos',
    caseUpdatesDesc: 'Ser notificado cuando se actualicen los casos',
    approvalRequests: 'Solicitudes de aprobación',
    approvalRequestsDesc: 'Ser notificado sobre aprobaciones pendientes',
    gdprRequestsNotif: 'Solicitudes RGPD',
    gdprRequestsDesc: 'Ser notificado sobre actividades relacionadas con RGPD',
    saveNotificationSettings: 'Guardar configuración de notificaciones',
    
    // Password settings
    changePassword: 'Cambiar contraseña',
    changePasswordDesc: 'Actualiza tu contraseña para mantener tu cuenta segura',
    currentPassword: 'Contraseña actual',
    currentPasswordPlaceholder: 'Ingresa la contraseña actual',
    newPassword: 'Nueva contraseña',
    newPasswordPlaceholder: 'Ingresa la nueva contraseña',
    confirmPassword: 'Confirmar nueva contraseña',
    confirmPasswordPlaceholder: 'Confirma la nueva contraseña',
    updatePassword: 'Actualizar contraseña',
    
    // Preferences
    preferencesTitle: 'Preferencias',
    preferencesDesc: 'Personaliza tu experiencia de aplicación',
    language: 'Idioma',
    selectLanguage: 'Seleccionar idioma',
    timezone: 'Zona horaria',
    selectTimezone: 'Seleccionar zona horaria',
    dateFormat: 'Formato de fecha',
    selectDateFormat: 'Seleccionar formato de fecha',
    currency: 'Moneda',
    selectCurrency: 'Seleccionar moneda',
    savePreferences: 'Guardar preferencias',
    
    // Header
    logout: 'Cerrar sesión',
    
    // Toast messages
    settingsUpdated: 'Configuración actualizada',
    notificationSettingsSaved: 'Tus preferencias de notificación han sido guardadas.',
    passwordUpdated: 'Contraseña actualizada',
    passwordChangedSuccess: 'Tu contraseña ha sido cambiada exitosamente.',
    preferencesUpdated: 'Preferencias actualizadas',
    preferencesSaved: 'Tus preferencias han sido guardadas.',
    error: 'Error',
    updateSettingsError: 'Error al actualizar configuración. Por favor, inténtalo de nuevo.',
    updatePasswordError: 'Error al actualizar contraseña. Por favor, inténtalo de nuevo.',
    updatePreferencesError: 'Error al actualizar preferencias. Por favor, inténtalo de nuevo.',
  },
  
  sq: {
    // Navigation
    dashboard: 'Paneli kryesor',
    caseManagement: 'Menaxhimi i rasteve',
    newCase: 'Rast i ri',
    approvals: 'Miratim',
    invoices: 'Fatura',
    gdprRequests: 'Kërkesa GDPR',
    profile: 'Profili',
    settings: 'Cilësimet',
    userManagement: 'Menaxhimi i përdoruesve',
    tariffManagement: 'Menaxhimi i tarifave',
    messageTemplates: 'Shabllonet e mesazheve',
    retentionPolicy: 'Politika e ruajtjes',
    dataProtectionOffice: 'Zyra e mbrojtjes së të dhënave',
    
    // Settings page
    settingsTitle: 'Cilësimet',
    settingsDescription: 'Menaxho cilësimet e llogarisë dhe preferencat tuaja',
    notifications: 'Njoftimet',
    security: 'Siguria',
    preferences: 'Preferencat',
    privacy: 'Privatësia',
    
    // Notification settings
    notificationSettings: 'Cilësimet e njoftimeve',
    notificationDescription: 'Konfiguro se si dëshiron të marrësh njoftimet',
    communicationChannels: 'Kanalet e komunikimit',
    emailNotifications: 'Njoftimet me email',
    emailNotificationDesc: 'Merr njoftimet përmes email-it',
    smsNotifications: 'Njoftimet SMS',
    smsNotificationDesc: 'Merr njoftimet urgjente përmes SMS-it',
    marketingCommunications: 'Komunikimet e marketingut',
    marketingDesc: 'Merr përditësime produkti dhe përmbajtje promovuese',
    notificationTypes: 'Llojet e njoftimeve',
    caseUpdates: 'Përditësimet e rasteve',
    caseUpdatesDesc: 'Merr njoftim kur përditësohen rastet',
    approvalRequests: 'Kërkesa për miratim',
    aprovalRequestsDesc: 'Merr njoftim për miratimet në pritje',
    gdprRequestsNotif: 'Kërkesa GDPR',
    gdprRequestsDesc: 'Merr njoftim për aktivitetet e lidhura me GDPR',
    saveNotificationSettings: 'Ruaj cilësimet e njoftimeve',
    
    // Password settings
    changePassword: 'Ndrysho fjalëkalimin',
    changePasswordDesc: 'Përditëso fjalëkalimin tuaj për të mbajtur llogarinë të sigurt',
    currentPassword: 'Fjalëkalimi aktual',
    currentPasswordPlaceholder: 'Shkruani fjalëkalimin aktual',
    newPassword: 'Fjalëkalimi i ri',
    newPasswordPlaceholder: 'Shkruani fjalëkalimin e ri',
    confirmPassword: 'Konfirmo fjalëkalimin e ri',
    confirmPasswordPlaceholder: 'Konfirmo fjalëkalimin e ri',
    updatePassword: 'Përditëso fjalëkalimin',
    
    // Preferences
    preferencesTitle: 'Preferencat',
    preferencesDesc: 'Personalizoni përvojën tuaj të aplikacionit',
    language: 'Gjuha',
    selectLanguage: 'Zgjidh gjuhën',
    timezone: 'Zona kohore',
    selectTimezone: 'Zgjidh zonën kohore',
    dateFormat: 'Formati i datës',
    selectDateFormat: 'Zgjidh formatin e datës',
    currency: 'Monedha',
    selectCurrency: 'Zgjidh monedha',
    savePreferences: 'Ruaj preferencat',
    
    // Header
    logout: 'Dilni',
    
    // Toast messages
    settingsUpdated: 'Cilësimet u përditësuan',
    notificationSettingsSaved: 'Preferencat tuaja të njoftimeve u ruajtën.',
    passwordUpdated: 'Fjalëkalimi u përditësua',
    passwordChangedSuccess: 'Fjalëkalimi juaj u ndryshua me sukses.',
    preferencesUpdated: 'Preferencat u përditësuan',
    preferencesSaved: 'Preferencat tuaja u ruajtën.',
    error: 'Gabim',
    updateSettingsError: 'Dështoi përditësimi i cilësimeve. Ju lutemi provoni përsëri.',
    updatePasswordError: 'Dështoi përditësimi i fjalëkalimit. Ju lutemi provoni përsëri.',
    updatePreferencesError: 'Dështoi përditësimi i preferencave. Ju lutemi provoni përsëri.',
  },
};

interface TranslationContextType {
  t: (key: string) => string;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export function TranslationProvider({ children }: { children: React.ReactNode }) {
  const { currentLanguage } = useLanguage();

  const t = (key: string): string => {
    const languageTranslations = translations[currentLanguage as keyof typeof translations];
    return languageTranslations?.[key as keyof typeof languageTranslations] || key;
  };

  const value: TranslationContextType = {
    t,
  };

  return (
    <TranslationContext.Provider value={value}>
      {children}
    </TranslationContext.Provider>
  );
}

export function useTranslation() {
  const context = useContext(TranslationContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a TranslationProvider');
  }
  return context;
}