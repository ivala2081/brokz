import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    keywords?: string;
    ogTitle?: string;
    ogDescription?: string;
}

export default function SEO({ title, description, keywords, ogTitle, ogDescription }: SEOProps) {
    return (
        <Helmet>
            <title>{title}</title>
            <meta name="description" content={description} />
            {keywords && <meta name="keywords" content={keywords} />}

            {/* Open Graph */}
            <meta property="og:title" content={ogTitle || title} />
            <meta property="og:description" content={ogDescription || description} />
            <meta property="og:type" content="website" />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={ogTitle || title} />
            <meta name="twitter:description" content={ogDescription || description} />
        </Helmet>
    );
}
