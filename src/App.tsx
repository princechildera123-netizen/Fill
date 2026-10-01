import React, { useState, useEffect } from 'react';
import { AppHeader } from './components/AppHeader';
import { AppSidebar, AppNavTab } from './components/AppSidebar';
import { ResponsiveBottomNav } from './components/ResponsiveBottomNav';
import { LandingPage } from './components/LandingPage';
import { AuthModal, AuthView } from './components/AuthModal';
import { DashboardScreen } from './components/DashboardScreen';
import { VaultScreen } from './components/VaultScreen';
import { FormsHistoryScreen } from './components/FormsHistoryScreen';
import { MemoryScreen } from './components/MemoryScreen';
import { ChromeScreen } from './components/ChromeScreen';
import { PlansScreen } from './components/PlansScreen';
import { SettingsScreen } from './components/SettingsScreen';
import { VisionScreen } from './components/VisionScreen';
import { ReviewScreen } from './components/ReviewScreen';
import { CompletedScreen } from './components/CompletedScreen';
import { ImportModal } from './components/ImportModal';
import { WelcomeModal } from './components/WelcomeModal';
import { ProductOnboardingModal } from './components/ProductOnboardingModal';
import { ModeSelectionModal } from './components/ModeSelectionModal';
import { ChromeConnectModal } from './components/ChromeConnectModal';
import { DemoTourGuide } from './components/DemoTourGuide';
import { PaywallModal } from './components/PaywallModal';
import { FormDocument, FormFieldInput, MatchResult, VaultData, LearnedMapping } from './types/fill';
import { calculateVaultCompleteness } from './services/vaultSchema';
import { loadVaultData, saveVaultData, resetToSampleVault } from './services/vaultStorage';
import { loadFormsHistory, saveFormDocument, deleteFormDocument } from './services/historyStorage';
import { loadLearnedMemory } from './services/memoryStorage';
import { DEMO_FORM_A, DEMO_FORM_B } from './services/demoForms';
import { performHybridMatch } from './services/fillSense';
import { canProcessForm } from './services/featureGates';
import { recordFormProcessed } from './services/usageLimit';
import { subscribeToCustomerInfo } from './services/revenueCat';
import { loadModePreferences, saveModePreferences, FillModePreferences } from './services/modeStorage';
import { getCurrentUser, subscribeToAuth, signOut, AuthUser } from './services/authClient';

export function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalView, setAuthModalView] = useState<AuthView>('login');

  // Navigation & Workspace State
  const [activeTab, setActiveTab] = useState<AppNavTab>('home');
  const [vault, setVault] = useState<VaultData>(loadVaultData);
  const [forms, setForms] = useState<FormDocument[]>(loadFormsHistory);
  const [learnedMemory, setLearnedMemory] = useState<LearnedMapping[]>(loadLearnedMemory);
  const [modePrefs, setModePrefs] = useState<FillModePreferences>(() => loadModePreferences());
  const [, setMonetizationUpdateTick] = useState<number>(0);

  // Active Document Flow State
  const [activeFlow, setActiveFlow] = useState<'none' | 'vision' | 'review' | 'completed'>('none');
  const [currentForm, setCurrentForm] = useState<FormDocument | null>(null);
  const [activeImportFields, setActiveImportFields] = useState<FormFieldInput[]>([]);

  // Modals
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isWelcomeOpen, setIsWelcomeOpen] = useState(false);
  const [isProductOnboardingOpen, setIsProductOnboardingOpen] = useState(false);
  const [isModeSelectionOpen, setIsModeSelectionOpen] = useState(false);
  const [isChromeConnectOpen, setIsChromeConnectOpen] = useState(false);
  const [isDemoTourOpen, setIsDemoTourOpen] = useState(false);
  const [isPaywallOpen, setIsPaywallOpen] = useState(false);
  const [paywallTrigger, setPaywallTrigger] = useState<string>('upgrade');

  // Trigger Guided Onboarding for authenticated users on first entry
  useEffect(() => {
    if (currentUser) {
      const hasCompleted = localStorage.getItem(`fill_onboarding_completed_${currentUser.id}`);
      if (!hasCompleted) {
        setIsProductOnboardingOpen(true);
      }
    }
  }, [currentUser]);

  // Sync Auth State
  useEffect(() => {
    const unsub = subscribeToAuth((user) => {
      setCurrentUser(user);
    });
    return unsub;
  }, []);

  // Subscribe to real-time RevenueCat entitlement updates
  useEffect(() => {
    const unsubscribe = subscribeToCustomerInfo(() => {
      setMonetizationUpdateTick((t) => t + 1);
    });
    return unsubscribe;
  }, []);

  // Form State Persistence (recover active form on reload if present)
  useEffect(() => {
    try {
      const savedActiveFormId = localStorage.getItem('fill_active_form_id');
      const savedActiveFlow = localStorage.getItem('fill_active_flow') as any;
      if (savedActiveFormId && (savedActiveFlow === 'review' || savedActiveFlow === 'completed')) {
        const found = forms.find((f) => f.id === savedActiveFormId);
        if (found) {
          setCurrentForm(found);
          setActiveFlow(savedActiveFlow);
        }
      }
    } catch {
      // Ignore recovery errors
    }
  }, []);

  // Sync active flow changes to persistence
  useEffect(() => {
    if (currentForm && (activeFlow === 'review' || activeFlow === 'completed')) {
      localStorage.setItem('fill_active_form_id', currentForm.id);
      localStorage.setItem('fill_active_flow', activeFlow);
    } else {
      localStorage.removeItem('fill_active_form_id');
      localStorage.removeItem('fill_active_flow');
    }
  }, [currentForm, activeFlow]);

  // Sync Vault changes
  const handleUpdateVault = (updated: VaultData) => {
    setVault(updated);
    saveVaultData(updated);
  };

  // Sync Forms changes
  const handleRefreshForms = () => {
    setForms(loadFormsHistory());
  };

  const handleRefreshMemory = () => {
    setLearnedMemory(loadLearnedMemory());
  };

  // Unreviewed count
  const unreviewedCount = forms.filter((f) => f.status === 'needs_review').length;

  const calculateCompletionRate = (matches: MatchResult[]): number => {
    if (!matches || matches.length === 0) return 0;
    const filledOrConfirmed = matches.filter(
      (m) => (m.currentValue && m.status !== 'skipped' && !m.isSkipped) || m.status === 'confirmed'
    ).length;
    return Math.round((filledOrConfirmed / matches.length) * 100);
  };

  // Document Imported
  const handleFormImported = async (importedData: {
    title: string;
    sourceType: 'demo' | 'pdf' | 'image' | 'scan';
    fileName: string;
    fields: FormFieldInput[];
  }) => {
    if (importedData.sourceType !== 'demo') {
      const gate = canProcessForm();
      if (!gate.allowed) {
        setPaywallTrigger('usage_limit');
        setIsPaywallOpen(true);
        return;
      }
    }

    setIsImportModalOpen(false);
    setActiveImportFields(importedData.fields);

    let cleanTitle = importedData.title;
    if (cleanTitle.toLowerCase().endsWith('.pdf') || cleanTitle.toLowerCase().endsWith('.png') || cleanTitle.toLowerCase().endsWith('.jpg')) {
      cleanTitle = cleanTitle.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
      cleanTitle = cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1);
    }

    const newFormDoc: FormDocument = {
      id: `form_${Date.now()}`,
      title: cleanTitle,
      sourceType: importedData.sourceType,
      fileName: importedData.fileName,
      status: 'in_progress',
      completionRate: 0,
      importedAt: Date.now(),
      lastModifiedAt: Date.now(),
      fields: [],
    };

    setCurrentForm(newFormDoc);
    setActiveFlow('vision');
  };

  const handleVisionFinished = async () => {
    if (!currentForm) return;
    const matches = await performHybridMatch(activeImportFields, vault);
    const completionRate = calculateCompletionRate(matches);

    const updatedForm: FormDocument = {
      ...currentForm,
      status: 'needs_review',
      fields: matches,
      completionRate,
      lastModifiedAt: Date.now(),
    };

    setCurrentForm(updatedForm);
    saveFormDocument(updatedForm);
    handleRefreshForms();
    handleRefreshMemory();

    if (currentForm.sourceType !== 'demo') {
      recordFormProcessed();
    }

    setActiveFlow('review');
  };

  const handleUpdateReviewMatches = (updatedMatches: MatchResult[]) => {
    if (!currentForm) return;
    const completionRate = calculateCompletionRate(updatedMatches);

    const updated: FormDocument = {
      ...currentForm,
      fields: updatedMatches,
      completionRate,
      lastModifiedAt: Date.now(),
    };
    setCurrentForm(updated);
    saveFormDocument(updated);
    handleRefreshForms();
    handleRefreshMemory();
  };

  const handleRenameForm = (newTitle: string) => {
    if (!currentForm) return;
    const updated: FormDocument = {
      ...currentForm,
      title: newTitle,
      lastModifiedAt: Date.now(),
    };
    setCurrentForm(updated);
    saveFormDocument(updated);
    handleRefreshForms();
  };

  const handleCompleteReview = () => {
    if (!currentForm) return;
    const completionRate = calculateCompletionRate(currentForm.fields);
    const updated: FormDocument = {
      ...currentForm,
      status: 'ready',
      completionRate,
      lastModifiedAt: Date.now(),
    };
    setCurrentForm(updated);
    saveFormDocument(updated);
    handleRefreshForms();
    setActiveFlow('completed');
  };

  const handleUpdateCompletedForm = (updatedForm: FormDocument) => {
    setCurrentForm(updatedForm);
    saveFormDocument(updatedForm);
    handleRefreshForms();
  };

  const handleSelectForm = (form: FormDocument) => {
    setCurrentForm(form);
    if (form.status === 'ready' || form.status === 'exported') {
      setActiveFlow('completed');
    } else {
      setActiveFlow('review');
    }
  };

  const handlePreviewForm = (form: FormDocument) => {
    setCurrentForm(form);
    setActiveFlow('completed');
  };

  const handleDeleteForm = (formId: string) => {
    deleteFormDocument(formId);
    handleRefreshForms();
    if (currentForm && currentForm.id === formId) {
      setCurrentForm(null);
      setActiveFlow('none');
    }
  };

  const handleStartDemoA = () => {
    handleFormImported({
      title: DEMO_FORM_A.title,
      sourceType: 'demo',
      fileName: 'scholarship_application_form_a.pdf',
      fields: DEMO_FORM_A.fields,
    });
  };

  const handleStartDemoB = () => {
    handleFormImported({
      title: DEMO_FORM_B.title,
      sourceType: 'demo',
      fileName: 'commonwealth_fellowship_form_b.pdf',
      fields: DEMO_FORM_B.fields,
    });
  };

  // If user is unauthenticated and not inside a demo, present the Landing Page
  if (!currentUser) {
    return (
      <>
        <LandingPage
          onGetStarted={() => {
            setAuthModalView('signup');
            setIsAuthModalOpen(true);
          }}
          onLogin={() => {
            setAuthModalView('login');
            setIsAuthModalOpen(true);
          }}
          onExploreDemo={() => {
            // Seed student profile and open demo tour
            const sample = resetToSampleVault();
            handleUpdateVault(sample);
            setIsDemoTourOpen(true);
          }}
          onOpenPlans={() => {
            setAuthModalView('signup');
            setIsAuthModalOpen(true);
          }}
        />

        <AuthModal
          isOpen={isAuthModalOpen}
          initialView={authModalView}
          onClose={() => setIsAuthModalOpen(false)}
          onSuccess={(user) => {
            setCurrentUser(user);
            setIsAuthModalOpen(false);
          }}
        />

        <DemoTourGuide
          isOpen={isDemoTourOpen}
          onClose={() => setIsDemoTourOpen(false)}
          onStartFormA={handleStartDemoA}
          onStartFormB={handleStartDemoB}
        />
      </>
    );
  }

  // Authenticated Application Shell
  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans selection:bg-slate-900 selection:text-white">
      {/* Desktop Sidebar (Requirement 5) */}
      <div className="hidden md:block">
        <AppSidebar
          currentTab={activeTab}
          onSelectTab={(tab) => {
            setActiveFlow('none');
            setActiveTab(tab);
          }}
          user={currentUser}
          onSignOut={async () => {
            await signOut();
            setCurrentUser(null);
          }}
          unreviewedCount={unreviewedCount}
        />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 min-h-screen">
        {/* Top Header */}
        <AppHeader
          vaultCompleteness={calculateVaultCompleteness(vault).percentage}
          onOpenDemoTour={() => setIsDemoTourOpen(true)}
          onNavigateToVault={() => setActiveTab('vault')}
          onOpenWelcome={() => setIsWelcomeOpen(true)}
          onOpenPaywall={() => {
            setPaywallTrigger('header');
            setIsPaywallOpen(true);
          }}
        />

        <main className="flex-1">
          {/* Active Flow: Vision / Extracting */}
          {activeFlow === 'vision' && currentForm && (
            <VisionScreen
              documentTitle={currentForm.title}
              fields={activeImportFields}
              onAnalysisComplete={handleVisionFinished}
            />
          )}

          {/* Active Flow: Review */}
          {activeFlow === 'review' && currentForm && (
            <ReviewScreen
              documentTitle={currentForm.title}
              sourceType={currentForm.sourceType}
              fileName={currentForm.fileName}
              matches={currentForm.fields}
              vault={vault}
              onUpdateMatches={handleUpdateReviewMatches}
              onUpdateVault={handleUpdateVault}
              onCompleteReview={handleCompleteReview}
              onRenameForm={handleRenameForm}
              onOpenPaywall={() => {
                setPaywallTrigger('review_screen');
                setIsPaywallOpen(true);
              }}
            />
          )}

          {/* Active Flow: Completed & Export */}
          {activeFlow === 'completed' && currentForm && (
            <CompletedScreen
              form={currentForm}
              onBackToReview={() => setActiveFlow('review')}
              onUpdateForm={handleUpdateCompletedForm}
              onFillAnotherForm={() => {
                setActiveFlow('none');
                setIsImportModalOpen(true);
              }}
              onNavigateToHistory={() => {
                setActiveFlow('none');
                setActiveTab('forms');
              }}
            />
          )}

          {/* Standard Navigation Tabs */}
          {activeFlow === 'none' && (
            <>
              {activeTab === 'home' && (
                <DashboardScreen
                  user={currentUser}
                  vault={vault}
                  recentForms={forms}
                  learnedMemory={learnedMemory}
                  onFillDocument={() => setIsImportModalOpen(true)}
                  onOpenChromeConnect={() => setIsChromeConnectOpen(true)}
                  onNavigateToVault={() => setActiveTab('vault')}
                  onNavigateToForms={() => setActiveTab('forms')}
                  onNavigateToMemory={() => setActiveTab('memory')}
                  onSelectForm={handleSelectForm}
                  onStartDemoA={handleStartDemoA}
                  onStartDemoB={handleStartDemoB}
                  onOpenPaywall={() => {
                    setPaywallTrigger('dashboard');
                    setIsPaywallOpen(true);
                  }}
                />
              )}

              {activeTab === 'vault' && (
                <VaultScreen
                  vault={vault}
                  onUpdateVault={handleUpdateVault}
                  onNavigateHome={() => setActiveTab('home')}
                />
              )}

              {activeTab === 'forms' && (
                <FormsHistoryScreen
                  forms={forms}
                  onSelectForm={handleSelectForm}
                  onPreviewForm={handlePreviewForm}
                  onDeleteForm={handleDeleteForm}
                  onFillAForm={() => setIsImportModalOpen(true)}
                />
              )}

              {activeTab === 'memory' && (
                <MemoryScreen
                  learnedMemory={learnedMemory}
                  onMemoryUpdated={handleRefreshMemory}
                  onOpenDemoB={handleStartDemoB}
                />
              )}

              {activeTab === 'chrome' && (
                <ChromeScreen />
              )}

              {activeTab === 'plans' && (
                <PlansScreen
                  onOpenPaywallModal={(trigger) => {
                    setPaywallTrigger(trigger || 'plans_screen');
                    setIsPaywallOpen(true);
                  }}
                />
              )}

              {activeTab === 'settings' && (
                <SettingsScreen
                  vault={vault}
                  onUpdateVault={handleUpdateVault}
                  onOpenWelcome={() => setIsWelcomeOpen(true)}
                  onOpenChromeConnect={() => setIsChromeConnectOpen(true)}
                  onOpenPaywall={() => {
                    setPaywallTrigger('settings');
                    setIsPaywallOpen(true);
                  }}
                />
              )}
            </>
          )}
        </main>

        {/* Mobile Responsive Navigation (Requirement 5 & 19) */}
        <ResponsiveBottomNav
          currentTab={activeTab}
          onSelectTab={(tab) => {
            setActiveFlow('none');
            setActiveTab(tab);
          }}
          unreviewedCount={unreviewedCount}
        />
      </div>

      {/* Global Modals */}
      <ImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onFormImported={handleFormImported}
      />

      <ProductOnboardingModal
        isOpen={isProductOnboardingOpen}
        vault={vault}
        onUpdateVault={handleUpdateVault}
        onFinishOnboarding={(choice) => {
          if (currentUser) {
            localStorage.setItem(`fill_onboarding_completed_${currentUser.id}`, 'true');
          }
          saveModePreferences({
            useDocuments: choice === 'documents' || choice === 'both',
            useWebsites: choice === 'websites' || choice === 'both',
            hasCompletedModeOnboarding: true,
          });
          setModePrefs(loadModePreferences());
          setIsProductOnboardingOpen(false);

          if (choice === 'documents') {
            setIsImportModalOpen(true);
          } else if (choice === 'websites') {
            setIsChromeConnectOpen(true);
          }
        }}
        onClose={() => setIsProductOnboardingOpen(false)}
      />

      <WelcomeModal
        isOpen={isWelcomeOpen}
        onGetStarted={() => {
          setIsWelcomeOpen(false);
          setIsModeSelectionOpen(true);
        }}
        onLoadDemoData={() => {
          const sample = resetToSampleVault();
          handleUpdateVault(sample);
          setIsWelcomeOpen(false);
          setIsDemoTourOpen(true);
        }}
      />

      <ModeSelectionModal
        isOpen={isModeSelectionOpen}
        initialUseDocuments={modePrefs.useDocuments}
        initialUseWebsites={modePrefs.useWebsites}
        onConfirm={(selection) => {
          const updated = saveModePreferences({
            useDocuments: selection.useDocuments,
            useWebsites: selection.useWebsites,
            hasCompletedModeOnboarding: true,
          });
          setModePrefs(updated);
          setIsModeSelectionOpen(false);

          if (selection.mode === 'documents') {
            setIsImportModalOpen(true);
          } else if (selection.mode === 'websites') {
            setIsChromeConnectOpen(true);
          }
        }}
        onClose={() => setIsModeSelectionOpen(false)}
      />

      <ChromeConnectModal
        isOpen={isChromeConnectOpen}
        onClose={() => setIsChromeConnectOpen(false)}
      />

      <DemoTourGuide
        isOpen={isDemoTourOpen}
        onClose={() => setIsDemoTourOpen(false)}
        onStartFormA={handleStartDemoA}
        onStartFormB={handleStartDemoB}
      />

      <PaywallModal
        isOpen={isPaywallOpen}
        onClose={() => setIsPaywallOpen(false)}
        sourceTrigger={paywallTrigger}
        onSubscriptionUpdated={() => {
          setVault({ ...vault });
        }}
      />
    </div>
  );
}

export default App;
