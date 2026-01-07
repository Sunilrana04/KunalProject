import { useEffect } from 'react';

interface SEOProps {
  title: string;
  description: string;
}

export const useSEO = ({ title, description }: SEOProps) => {
  useEffect(() => {
    document.title = `${title} | BelleDiscovery`;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', description);
  }, [title, description]);
};