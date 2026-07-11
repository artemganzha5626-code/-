import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Палітра BENCH — спокійна, тепла, «дорога».
        cream: '#F7F2EA', // кремовий фон
        milk: '#FBF8F3', // молочний
        sand: '#EDE3D3', // теплий бежевий
        latte: '#D8C4A8', // латте
        mocha: '#6F5844', // кавово-коричневий (текст/акцент)
        espresso: '#3B2E25', // еспресо (заголовки)
        graphite: '#2A2622', // глибокий графіт
        terracotta: '#B5613F', // приглушений теракотовий акцент
        'terracotta-soft': '#C9825F',
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 60px -25px rgba(59, 46, 37, 0.28)',
        card: '0 12px 40px -18px rgba(59, 46, 37, 0.25)',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-8px)' },
        },
        shimmer: {
          '100%': { transform: 'translateX(100%)' },
        },
      },
      animation: {
        'fade-up': 'fade-up 0.6s ease-out both',
        float: 'float 6s ease-in-out infinite',
        shimmer: 'shimmer 1.6s infinite',
      },
    },
  },
  plugins: [],
};

export default config;
