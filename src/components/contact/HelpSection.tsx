
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const HelpSection = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>How can you help?</CardTitle>
      </CardHeader>
      <CardContent className="text-bsl-brown space-y-3">
        <p>
          We're always looking for help to keep our database accurate and up-to-date:
        </p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Report changes in local legislation</li>
          <li>Share links to news reports about ban repeals or changes</li>
          <li>Request the dataset</li>
          <li>Contribute research or analysis</li>
        </ul>
      </CardContent>
    </Card>
  );
};

export default HelpSection;
