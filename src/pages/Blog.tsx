import React from 'react';
import { Link } from 'react-router-dom';
import Navigation from '../components/Navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAllPosts } from '@/lib/blog';
import { format, parseISO } from 'date-fns';

const Blog = () => {
  const posts = getAllPosts();

  return (
    <div className="min-h-screen bg-dogdata-background">
      <Navigation />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-dogdata-text mb-6">Blog</h1>
        <div className="space-y-4">
          {posts.map((post) => (
            <Link key={post.slug} to={`/blog/${post.slug}`} className="block group">
              <Card className="transition-colors group-hover:border-bsl-teal">
                <CardHeader>
                  <p className="text-sm text-bsl-brown/60">
                    {format(parseISO(post.date), 'MMMM d, yyyy')}
                  </p>
                  <CardTitle className="group-hover:text-bsl-teal transition-colors">
                    {post.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-dogdata-text/80">{post.summary}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Blog;
