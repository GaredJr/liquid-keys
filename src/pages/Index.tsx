import { Soundboard } from '@/components/Soundboard';
import glassBg from '@/assets/glass-bg.jpg';
const Index = () => {
  return <div className="min-h-screen relative overflow-hidden" style={{
    backgroundImage: `url(${glassBg})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundAttachment: 'fixed'
  }}>
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
      
      {/* Glass overlay for better contrast */}
      <div className="absolute inset-0 bg-background/40 backdrop-blur-sm" />
      
      {/* Floating orbs for visual interest */}
      <div className="absolute top-1/4 -left-20 w-72 h-72 bg-primary/20 rounded-full blur-3xl animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse" style={{
      animationDelay: '1s'
    }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl" />
      
      {/* Content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center p-4 sm:p-6 bg-slate-100">
        {/* Header section */}
        <header className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-strong text-xs font-medium text-foreground/70 mb-4">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            Web Audio API Powered
          </div>
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-foreground via-foreground/80 to-foreground bg-clip-text mb-3">
            Glass Soundboard
          </h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            A minimal, beautiful soundboard with glass morphism design. 
            Upload your sounds and create music.
          </p>
        </header>

        {/* Main soundboard */}
        <main className="w-full animate-scale-in" style={{
        animationDelay: '0.1s'
      }}>
          <Soundboard />
        </main>

        {/* Footer */}
        <footer className="mt-8 text-center animate-fade-in" style={{
        animationDelay: '0.2s'
      }}>
          <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 rounded glass-strong font-mono">1-9</kbd>
              <span>Play sounds</span>
            </span>
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 rounded glass-strong font-mono">⚙️</kbd>
              <span>Customize</span>
            </span>
          </div>
        </footer>
      </div>
    </div>;
};
export default Index;