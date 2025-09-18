import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Mail, 
  Users, 
  Send, 
  Eye, 
  Calendar,
  TrendingUp,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { useEmailService } from '@/hooks/useEmailService';
import { supabase } from '@/integrations/supabase/client';

interface NewsletterStats {
  totalSubscribers: number;
  confirmedSubscribers: number;
  lastCampaignDate?: string;
  totalCampaigns: number;
}

export function NewsletterManager() {
  const { sendEmail, isLoading } = useEmailService();
  const [stats, setStats] = useState<NewsletterStats>({
    totalSubscribers: 0,
    confirmedSubscribers: 0,
    totalCampaigns: 0
  });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  
  const [newsletterForm, setNewsletterForm] = useState({
    subject: '',
    title: '',
    content: '',
    previewMode: false
  });

  const [testEmail, setTestEmail] = useState('');

  // Load newsletter statistics
  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      // Get subscriber count
      const { data: subscribers } = await supabase
        .from('user_preferences')
        .select('newsletter_subscribed, newsletter_confirmed')
        .eq('newsletter_subscribed', true);

      const totalSubscribers = subscribers?.length || 0;
      const confirmedSubscribers = subscribers?.filter(s => s.newsletter_confirmed).length || 0;

      // Get campaign stats
      const { data: campaigns } = await supabase
        .from('newsletter_campaigns')
        .select('sent_at')
        .order('sent_at', { ascending: false })
        .limit(1);

      const totalCampaigns = campaigns?.length || 0;
      const lastCampaignDate = campaigns?.[0]?.sent_at;

      setStats({
        totalSubscribers,
        confirmedSubscribers,
        totalCampaigns,
        lastCampaignDate
      });
    } catch (error) {
      console.error('Failed to load newsletter stats:', error);
    }
  };

  const sendTestEmail = async () => {
    if (!testEmail || !newsletterForm.subject || !newsletterForm.content) {
      setMessage({ type: 'error', text: 'Please fill in all fields and provide a test email address.' });
      return;
    }

    try {
      setMessage(null);
      await sendEmail({
        to: testEmail,
        subject: `[TEST] ${newsletterForm.subject}`,
        template: 'newsletter',
        data: {
          title: newsletterForm.title,
          subject: newsletterForm.subject,
          content: newsletterForm.content
        }
      });

      setMessage({ type: 'success', text: 'Test email sent successfully!' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to send test email.' });
    }
  };

  const sendNewsletter = async () => {
    if (!newsletterForm.subject || !newsletterForm.content) {
      setMessage({ type: 'error', text: 'Please fill in all required fields.' });
      return;
    }

    if (stats.confirmedSubscribers === 0) {
      setMessage({ type: 'error', text: 'No confirmed subscribers to send to.' });
      return;
    }

    try {
      setMessage(null);
      
      // Get all confirmed subscribers
      const { data: subscribers } = await supabase.rpc('get_newsletter_subscribers');

      if (!subscribers || subscribers.length === 0) {
        setMessage({ type: 'error', text: 'No subscribers found.' });
        return;
      }

      // Create campaign record
      const { data: campaign, error: campaignError } = await supabase
        .from('newsletter_campaigns')
        .insert({
          title: newsletterForm.title,
          subject: newsletterForm.subject,
          content: newsletterForm.content,
          recipient_count: subscribers.length,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (campaignError) {
        throw campaignError;
      }

      // Send emails to all subscribers
      let successCount = 0;
      for (const subscriber of subscribers) {
        try {
          await sendEmail({
            to: subscriber.email,
            subject: newsletterForm.subject,
            template: 'newsletter',
            data: {
              title: newsletterForm.title,
              subject: newsletterForm.subject,
              content: newsletterForm.content,
              userName: subscriber.display_name
            },
            userId: subscriber.user_id
          });
          successCount++;
        } catch (error) {
          console.error(`Failed to send to ${subscriber.email}:`, error);
        }
      }

      // Update campaign with results
      await supabase
        .from('newsletter_campaigns')
        .update({
          sent_at: new Date().toISOString(),
          delivered_count: successCount
        })
        .eq('id', campaign.id);

      setMessage({ 
        type: 'success', 
        text: `Newsletter sent successfully to ${successCount} of ${subscribers.length} subscribers!` 
      });

      // Reset form
      setNewsletterForm({
        subject: '',
        title: '',
        content: '',
        previewMode: false
      });

      // Reload stats
      loadStats();

    } catch (error) {
      console.error('Newsletter send error:', error);
      setMessage({ type: 'error', text: 'Failed to send newsletter.' });
    }
  };

  return (
    <div className="space-y-6">
      {/* Newsletter Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalSubscribers}</p>
                <p className="text-sm text-muted-foreground">Total Subscribers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-8 w-8 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{stats.confirmedSubscribers}</p>
                <p className="text-sm text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Mail className="h-8 w-8 text-purple-500" />
              <div>
                <p className="text-2xl font-bold">{stats.totalCampaigns}</p>
                <p className="text-sm text-muted-foreground">Campaigns Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Calendar className="h-8 w-8 text-orange-500" />
              <div>
                <p className="text-sm font-bold">
                  {stats.lastCampaignDate 
                    ? new Date(stats.lastCampaignDate).toLocaleDateString()
                    : 'Never'
                  }
                </p>
                <p className="text-sm text-muted-foreground">Last Campaign</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {message && (
        <Alert className={message.type === 'error' ? 'border-red-200 bg-red-50' : 'border-green-200 bg-green-50'}>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription className={message.type === 'error' ? 'text-red-800' : 'text-green-800'}>
            {message.text}
          </AlertDescription>
        </Alert>
      )}

      {/* Newsletter Composer */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Newsletter Composer
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="compose" className="w-full">
            <TabsList>
              <TabsTrigger value="compose">Compose</TabsTrigger>
              <TabsTrigger value="preview">Preview</TabsTrigger>
            </TabsList>

            <TabsContent value="compose" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="newsletter-title">Newsletter Title</Label>
                  <Input
                    id="newsletter-title"
                    value={newsletterForm.title}
                    onChange={(e) => setNewsletterForm(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Monthly BSL Database Update"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="newsletter-subject">Email Subject</Label>
                  <Input
                    id="newsletter-subject"
                    value={newsletterForm.subject}
                    onChange={(e) => setNewsletterForm(prev => ({ ...prev, subject: e.target.value }))}
                    placeholder="BSL Database Newsletter - January 2025"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newsletter-content">Newsletter Content</Label>
                <Textarea
                  id="newsletter-content"
                  value={newsletterForm.content}
                  onChange={(e) => setNewsletterForm(prev => ({ ...prev, content: e.target.value }))}
                  placeholder="Write your newsletter content here..."
                  rows={12}
                />
                <p className="text-sm text-muted-foreground">
                  You can use basic HTML tags for formatting.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1">
                  <Label htmlFor="test-email">Test Email Address</Label>
                  <Input
                    id="test-email"
                    type="email"
                    value={testEmail}
                    onChange={(e) => setTestEmail(e.target.value)}
                    placeholder="your-email@example.com"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <Button 
                    onClick={sendTestEmail} 
                    disabled={isLoading}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <Eye className="h-4 w-4" />
                    Send Test
                  </Button>
                  <Button 
                    onClick={sendNewsletter} 
                    disabled={isLoading || stats.confirmedSubscribers === 0}
                    className="flex items-center gap-2"
                  >
                    <Send className="h-4 w-4" />
                    Send to {stats.confirmedSubscribers} Subscribers
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="preview">
              <div className="border rounded-lg p-6 bg-gray-50">
                <div className="bg-white p-6 rounded-lg shadow-sm max-w-2xl mx-auto">
                  <h1 className="text-2xl font-bold mb-4">{newsletterForm.title || 'Newsletter Title'}</h1>
                  <div 
                    className="prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ 
                      __html: newsletterForm.content || '<p>Newsletter content will appear here...</p>' 
                    }}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}