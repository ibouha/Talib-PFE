import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';


const Housing = () => {
  const { t } = useTranslation();
  
  
  // Update document title
  useEffect(() => {
    document.title = `${t('housing.title')} | ${t('app.name')}`;
  }, [t]);
  
 
  return (
    <div className="container-custom py-8">
      <h1 className="text-3xl font-bold mb-6">{t('housing.title')}</h1>
      
      
    </div>
  );
};

export default Housing;