import { useState } from 'react';

export function AIFeature() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<null | 'urgent' | 'safe'>(null);

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    setTimeout(() => {
      setIsAnalyzing(false);
      setResult('urgent');
    }, 2500);
  };

  return (
    null
  );
}
