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
        // Приємно-яскравий тепло-бурштиновий акцент (заміна теракоти)
        terracotta: '#C6813C', // карамель/бурштин
        'terracotta-soft': '#E0A55E',
        honey: '#F3D9A6', // тілесно-жовтий (світлий кінець градієнта)
        amber: '#DDA45B', // бурштиновий (середина)
        cocoa: '#8A5632', // коричневий (темний кінець градієнта)
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        sans: ['var(--font-sans)', 'system-ui', 'sans-serif'],
        logo: ['var(--font-logo)', 'var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        soft: '0 20px 60px -25px rgba(59, 46, 37, 0.28)',
        card: '0 12px 40px -18px rgba(59, 46, 37, 0.25)',
      },
      backgroundImage: {
        // М’який перехід тілесно-жовтий → бурштин → коричневий
        'warm-gradient': 'linear-gradient(100deg, #F5DCA9 0%, #E3AC63 50%, #B87437 100%)',
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
