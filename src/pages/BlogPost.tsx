import React from 'react';
import { useParams, Link } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Navigation from '../components/Navigation';
import { getPostBySlug } from '@/lib/blog';
import { format, parseISO } from 'date-fns';
import { ArrowLeft } from 'lucide-react';

const BlogPostPage = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  if (!post) {
    return (
      <div className="min-h-screen bg-dogdata-background">
        <Navigation />
        <div className="container mx-auto py-8 px-4 text-center">
          <h1 className="text-2xl font-bold text-dogdata-text mb-4">Post not found</h1>
          <Link to="/blog" className="text-bsl-teal hover:underline">
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-dogdata-background">
      <Navigation />
      <div className="container mx-auto py-8 px-4 max-w-3xl">
        <Link
          to="/blog"
          className="inline-flex items-center space-x-1 text-bsl-teal hover:underline mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Blog</span>
        </Link>
        <article>
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-dogdata-text mb-2">{post.title}</h1>
            <p className="text-bsl-brown/60">{format(parseISO(post.date), 'MMMM d, yyyy')}</p>
          </header>
          <div className="prose prose-lg max-w-none prose-headings:text-dogdata-text prose-p:text-dogdata-text prose-li:text-dogdata-text prose-a:text-bsl-teal prose-strong:text-dogdata-text">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
};

export default BlogPostPage;
