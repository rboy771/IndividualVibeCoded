/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // Brand palette
        'brand-primary': '#6366F1', // Indigo 500
        'brand-accent': '#8B5CF6',  // Purple 500
        'surface-page': '#0F172A',  // Slate 900
        'surface-card': '#1E293B',  // Slate 800
        'text-primary': '#F8FAFC',  // Slate 50
        'text-muted': '#94A3B8',    // Slate 400

        // Task types (M6 tag-style)
        'type-feature': '#10B981',  // Emerald 500
        'type-bug': '#EF4444',      // Red 500
        feature: '#10B981',         // Backward compatibility
        bug: '#EF4444',             // Backward compatibility

        // Due-date states (M8 due-tint)
        'due-safe': '#10B981',      // Emerald 500 (> 2 days)
        'due-warning': '#F59E0B',   // Amber 500 (< 24h)
        'due-overdue': '#EF4444',   // Red 500 (overdue)
        'due-neutral': '#64748B',   // Slate 500 (done/cleared)
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"Fira Code"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },
      boxShadow: {
        card: '0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)',
        'card-hover': '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -2px rgba(0, 0, 0, 0.4)',
      },
    },
  },
  plugins: [],
};
