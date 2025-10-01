// Utility to create test submission data for development
import { supabase } from '@/integrations/supabase/client';

export const createTestSubmission = async (userId: string) => {
  const testSubmissionData = {
    municipality: 'Test City',
    state: 'California',
    municipality_type: 'City',
    banned_breeds: ['Pit Bull', 'Rottweiler', 'German Shepherd'],
    ordinance: 'Test ordinance prohibiting certain dog breeds within city limits',
    legislation_type: 'ban',
    population: 50000,
    ordinance_url: 'https://example.com/ordinance.pdf',
    verification_date: new Date().toISOString().split('T')[0]
  };

  try {
    const { data, error } = await supabase
      .from('submissions' as any)
      .insert({
        user_id: userId,
        type: 'new_legislation',
        status: 'pending',
        submitted_data: testSubmissionData
      })
      .select()
      .single();

    if (error) throw error;
    
    console.log('Test submission created:', data);
    return data;
  } catch (error) {
    console.error('Error creating test submission:', error);
    throw error;
  }
};

export const createMultipleTestSubmissions = async (userId: string) => {
  const submissions = [
    {
      municipality: 'Los Angeles',
      state: 'California',
      municipality_type: 'City',
      banned_breeds: ['Pit Bull', 'Staffordshire Terrier'],
      ordinance: 'Ordinance 123456 - Dangerous Dog Breeds',
      legislation_type: 'ban',
      status: 'approved'
    },
    {
      municipality: 'Miami',
      state: 'Florida',
      municipality_type: 'City',
      banned_breeds: ['Pit Bull', 'Rottweiler', 'Doberman'],
      ordinance: 'City Code Section 7-15 - Restricted Dog Breeds',
      legislation_type: 'restriction',
      status: 'pending'
    },
    {
      municipality: 'Denver',
      state: 'Colorado',
      municipality_type: 'City',
      banned_breeds: ['Pit Bull'],
      ordinance: 'Municipal Code 8-55 - Pit Bull Ban',
      legislation_type: 'ban',
      status: 'rejected',
      admin_feedback: 'This ordinance was repealed in 2020. Please verify current status.'
    },
    {
      municipality: 'Austin',
      state: 'Texas',
      municipality_type: 'City',
      banned_breeds: ['Pit Bull', 'Chow Chow'],
      ordinance: 'Animal Services Code - Breed Restrictions',
      legislation_type: 'restriction',
      status: 'needs_changes',
      admin_feedback: 'Please provide more specific ordinance number and verification date.'
    }
  ];

  const results = [];
  
  for (const submission of submissions) {
    try {
      const { data, error } = await supabase
        .from('submissions' as any)
        .insert({
          user_id: userId,
          type: 'new_legislation',
          status: submission.status,
          submitted_data: {
            municipality: submission.municipality,
            state: submission.state,
            municipality_type: submission.municipality_type,
            banned_breeds: submission.banned_breeds,
            ordinance: submission.ordinance,
            legislation_type: submission.legislation_type,
            population: Math.floor(Math.random() * 1000000) + 50000,
            verification_date: new Date().toISOString().split('T')[0]
          },
          admin_feedback: submission.admin_feedback,
          reviewed_at: ['approved', 'rejected', 'needs_changes'].includes(submission.status) 
            ? new Date().toISOString() 
            : null
        })
        .select()
        .single();

      if (error) throw error;
      results.push(data);
    } catch (error) {
      console.error(`Error creating submission for ${submission.municipality}:`, error);
    }
  }

  console.log(`Created ${results.length} test submissions`);
  return results;
};