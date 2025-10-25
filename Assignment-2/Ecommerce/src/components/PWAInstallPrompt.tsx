import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download, X } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setShowPrompt(true);
    };

    window.addEventListener('beforeinstallprompt', handler);

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;

    if (outcome === 'accepted') {
      setDeferredPrompt(null);
      setShowPrompt(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  if (!showPrompt || localStorage.getItem('pwa-install-dismissed')) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:w-96 z-50 animate-slide-in-right">
      <Card className="p-4 border-border shadow-glow bg-gradient-card">
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
        
        <div className="flex gap-3">
          <div className="flex-shrink-0">
            <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center">
              <Download className="h-6 w-6 text-white" />
            </div>
          </div>
          
          <div className="flex-1">
            <h3 className="font-semibold mb-1">Install ShopHub</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Install our app for a better shopping experience with offline access
            </p>
            
            <div className="flex gap-2">
              <Button
                onClick={handleInstall}
                size="sm"
                className="bg-gradient-primary"
              >
                Install
              </Button>
              <Button
                onClick={handleDismiss}
                size="sm"
                variant="ghost"
              >
                Not Now
              </Button>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};
