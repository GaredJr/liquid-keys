import { Soundboard } from '@/components/Soundboard';
import glassBg from '@/assets/glass-bg.jpg';

const Index = () => {
  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `url(${glassBg})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
      }}
    >
      {/* Overlay for better contrast */}
      <div className="absolute inset-0 bg-background/30 backdrop-blur-sm" />
      
      {/* Content */}
      <div className="relative min-h-screen flex flex-col items-center justify-center p-6">
        <Soundboard />
      </div>
    </div>
  );
};

export default Index;
