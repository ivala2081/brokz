import { Routes, Route } from 'react-router-dom';

import HomePage from './pages/HomePage';
import SolutionsPage from './pages/SolutionsPage';
import ProductsPage from './pages/ProductsPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import BlogPage from './pages/BlogPage';
import BlogPostPage from './pages/BlogPostPage';
import AdminBlogPage from './pages/AdminBlogPage';
import LegalPage from './pages/LegalPage';
import LegalLandingPage from './pages/LegalLandingPage';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/solutions" element={<SolutionsPage />} />
      <Route path="/products" element={<ProductsPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/contact" element={<ContactPage />} />
      <Route path="/blog" element={<BlogPage />} />
      <Route path="/blog/:slug" element={<BlogPostPage />} />
      <Route path="/admin" element={<AdminBlogPage />} />
      <Route path="/legal" element={<LegalLandingPage />} />
      <Route path="/legal/:slug" element={<LegalPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}
