
import React from 'react';
import Navigation from '../components/Navigation';
import ContactForm from '../components/contact/ContactForm';
import ResourcesSection from '../components/contact/ResourcesSection';
import ContactInfo from '../components/contact/ContactInfo';
import HelpSection from '../components/contact/HelpSection';

const Contact = () => {
  return (
    <div className="min-h-screen bg-bsl-background">
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-bsl-brown mb-4">Contact Us</h1>
          <p className="text-bsl-brown mb-8">
            Do you have questions about breed-specific legislation, need help with a specific case, or want to learn more about our work?
            We'd love to hear from you.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          <ContactForm />

          <div className="space-y-6">
            <ResourcesSection />
            <ContactInfo />
            <HelpSection />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;
