/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    // Демо-фотографії підвантажуються з Unsplash (ліниве завантаження next/image).
    // Після підключення Supabase Storage додайте сюди свій домен *.supabase.co.
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};

export default nextConfig;
