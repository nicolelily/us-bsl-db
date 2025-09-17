
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ExternalLink } from 'lucide-react';

const ResourcesSection = () => {
  const resources = [
    {
      title: "National Canine Research Council",
      description: "Evidence-based research on dog bite prevention and breed policies",
      url: "https://www.nationalcanineresearchcouncil.com"
    },
    {
      title: "ASPCA Position on Breed-Specific Legislation",
      description: "Comprehensive policy statement and alternatives to BSL",
      url: "https://www.aspca.org/about-us/aspca-policy-and-position-statements/position-statement-breed-specific-legislation"
    },
    {
      title: "Animal Farm Foundation",
      description: "Resources and research on pit bull type dogs and BSL alternatives",
      url: "https://animalfarmfoundation.org"
    },
    {
      title: "American Veterinary Medical Association",
      description: "Scientific literature review on dog bite risk factors",
      url: "https://www.avma.org/resources-tools/literature-reviews/dog-bite-risk-and-prevention-role-breed"
    }
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>BSL Resources</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-sm text-bsl-brown mb-4">
          Explore additional resources about breed-specific legislation and evidence-based alternatives.
        </p>
        <div className="space-y-3">
          {resources.map((resource, index) => (
            <a
              key={index}
              href={resource.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-3 rounded-lg border border-bsl-border hover:bg-bsl-cream transition-colors group"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-bsl-brown group-hover:text-bsl-teal transition-colors text-sm">
                    {resource.title}
                  </h4>
                  <p className="text-xs text-bsl-brown/70 mt-1 line-clamp-2">
                    {resource.description}
                  </p>
                </div>
                <ExternalLink className="w-4 h-4 text-bsl-brown/50 group-hover:text-bsl-teal transition-colors flex-shrink-0 ml-2" />
              </div>
            </a>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default ResourcesSection;
