import React from 'react';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const About = () => {
  return (
    <div className="min-h-screen bg-dogdata-background">
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-dogdata-text mb-4">About This Project</h1>
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Purpose & Scope</CardTitle>
            </CardHeader>
            <CardContent className="text-dogdata-text space-y-4">
              <p>
                This application serves as a comprehensive resource for tracking breed-specific legislation (BSL)
                across municipalities in the United States. BSL refers to laws that regulate or ban certain dog
                breeds based on their perceived danger to public safety.
              </p>
              <p>
                Our database includes information on:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Municipality names and types (city or county)</li>
                <li>Specific breeds included in legislation</li>
                <li>Relevant ordinance or municipal code references</li>
                <li>Population data where available</li>
              </ul>
              <p>
                The goal of this resource is to provide accurate, up-to-date information on breed-specific
                legislation to assist pet owners, animal welfare organizations, lawmakers, and researchers.
              </p>
            </CardContent>
          </Card>

          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Data Sources & Methodology</CardTitle>
            </CardHeader>
            <CardContent className="text-dogdata-text space-y-4">
              <p>
                The database was personally researched and curated through extensive investigation of:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Municipal code databases and official city/county websites</li>
                <li>Direct communication with animal control departments</li>
                <li>Legal research databases and court records</li>
                <li>Animal welfare organizations tracking BSL</li>
                <li>News reports and legislative documents</li>
              </ul>
              <p>
                Every effort is made to ensure the accuracy and currency of this information. However,
                municipal ordinances change frequently, and we recommend verifying any information with
                the relevant local authorities before making decisions based on this data.
              </p>
              <p>
                Population data is sourced from the most recent available census or population estimates.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Disclaimer</CardTitle>
            </CardHeader>
            <CardContent className="text-dogdata-text space-y-4">
              <p>
                This application is provided for informational purposes only and does not constitute legal advice.
                The creators of this database make no warranties or representations regarding the accuracy,
                completeness, or reliability of the information contained herein.
              </p>
              <p>
                Laws and ordinances change frequently, and this database may not reflect the most current
                legislation or legal interpretations. Users should consult with qualified legal professionals
                or local authorities for current information regarding specific municipalities.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default About;
