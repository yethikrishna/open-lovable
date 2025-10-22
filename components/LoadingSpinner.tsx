import { motion } from 'framer-motion';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  text?: string;
}

export default function LoadingSpinner({
  size = 'md',
  color = '#0078d4',
  text,
}: LoadingSpinnerProps) {
  const sizeMap = {
    sm: 20,
    md: 40,
    lg: 60,
  };

  const spinnerSize = sizeMap[size];

  return (
    <div className="flex flex-col items-center justify-center gap-3">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: 'linear',
        }}
        style={{
          width: spinnerSize,
          height: spinnerSize,
          border: `${spinnerSize / 10}px solid rgba(255, 255, 255, 0.1)`,
          borderTopColor: color,
          borderRadius: '50%',
        }}
        aria-label="Loading"
        role="status"
      />
      {text && <p className="text-sm text-[#b0b0b0]">{text}</p>}
    </div>
  );
}
