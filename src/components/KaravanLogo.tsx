interface KaravanLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showText?: boolean;
  className?: string;
}

export default function KaravanLogo({ size = 'md', showText = true, className = '' }: KaravanLogoProps) {
  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10', 
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  };

  const textSizeClasses = {
    sm: 'text-lg',
    md: 'text-xl',
    lg: 'text-2xl', 
    xl: 'text-3xl'
  };

  const logoSizeClasses = {
    sm: 'w-5 h-3',
    md: 'w-6 h-4',
    lg: 'w-10 h-6',
    xl: 'w-12 h-8'
  };

  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <div className={`${sizeClasses[size]} bg-emerald-800 rounded-lg flex items-center justify-center shadow-md`}>
        <div className="text-center">
          <div className={`${logoSizeClasses[size]} mx-auto mb-0.5 relative`}>
            {/* Karavan Logo - Layered Design */}
            <div className="absolute inset-0 bg-orange-200 transform rotate-45 rounded-sm scale-75"></div>
            <div className="absolute inset-0 bg-orange-100 transform rotate-45 rounded-sm translate-x-0.5 translate-y-0.5 scale-75"></div>
            <div className="absolute inset-0 bg-white transform rotate-45 rounded-sm translate-x-1 translate-y-1 scale-75"></div>
          </div>
        </div>
      </div>
      {showText && (
        <div>
          <span className={`${textSizeClasses[size]} font-bold text-emerald-700`} style={{ fontFamily: 'Inter, system-ui, sans-serif', letterSpacing: '0.02em' }}>
            KARAVAN
          </span>
          <div className="text-xs text-emerald-600 font-medium -mt-1" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>
            Layers of Happiness!
          </div>
        </div>
      )}
    </div>
  );
}
