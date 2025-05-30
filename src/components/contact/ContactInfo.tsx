
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, MapPin } from 'lucide-react';

const ContactInfo = () => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Get in touch</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center space-x-3">
          <Mail className="w-5 h-5 text-bsl-teal" />
          <div>
            <p className="font-medium">Email</p>
            <p className="text-bsl-brown">info@bsldb.app</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <MapPin className="w-5 h-5 text-bsl-teal" />
          <div>
            <p className="font-medium">Address</p>
            <p className="text-bsl-brown">
              6421 N Florida Ave<br />
              Unit D-1679<br />
              Tampa, Florida 33604 
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ContactInfo;
