import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: ["./pages/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}", "./src/**/*.{ts,tsx}"],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        christmas: ['"Mountains of Christmas"', 'cursive'],
        sans: ['Nunito', 'sans-serif'],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
        christmas: {
          red: "hsl(var(--christmas-red))",
          green: "hsl(var(--christmas-green))",
          gold: "hsl(var(--christmas-gold))",
          snow: "hsl(var(--christmas-snow))",
          dark: "hsl(var(--christmas-dark))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        snowfall: {
          "0%": { transform: "translateY(-10vh) translateX(0)", opacity: "1" },
          "100%": { transform: "translateY(100vh) translateX(20px)", opacity: "0.3" },
        },
        "twinkle": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        "bounce-slow": {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow": {
          "0%, 100%": { boxShadow: "0 0 20px hsl(var(--christmas-gold) / 0.5)" },
          "50%": { boxShadow: "0 0 40px hsl(var(--christmas-gold) / 0.8)" },
        },
        "slide-up": {
          "0%": { transform: "translateY(20px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          "0%": { transform: "scale(0.9)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
        "fly-across": {
          "0%": { 
            transform: "translateX(100vw) translateY(0) rotate(-5deg)",
            opacity: "0"
          },
          "10%": {
            opacity: "1"
          },
          "50%": { 
            transform: "translateX(0vw) translateY(-20px) rotate(0deg)",
          },
          "90%": {
            opacity: "1"
          },
          "100%": { 
            transform: "translateX(-100vw) translateY(0) rotate(5deg)",
            opacity: "0"
          },
        },
        "logo-entrance": {
          "0%": { 
            transform: "scale(0.3) rotate(-10deg)", 
            opacity: "0",
            filter: "blur(10px)"
          },
          "50%": { 
            transform: "scale(1.1) rotate(2deg)", 
            opacity: "1",
            filter: "blur(0)"
          },
          "70%": { 
            transform: "scale(0.95) rotate(-1deg)", 
          },
          "85%": { 
            transform: "scale(1.02) rotate(0deg)", 
          },
          "100%": { 
            transform: "scale(1) rotate(0deg)", 
            opacity: "1",
            filter: "blur(0)"
          },
        },
        "logo-glow": {
          "0%, 100%": { 
            filter: "drop-shadow(0 0 20px hsl(var(--christmas-gold) / 0.5))"
          },
          "50%": { 
            filter: "drop-shadow(0 0 40px hsl(var(--christmas-gold) / 0.8))"
          },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "snowfall": "snowfall 10s linear infinite",
        "twinkle": "twinkle 2s ease-in-out infinite",
        "bounce-slow": "bounce-slow 2s ease-in-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
        "slide-up": "slide-up 0.5s ease-out",
        "scale-in": "scale-in 0.3s ease-out",
        "fly-across": "fly-across 12s ease-in-out infinite",
        "logo-entrance": "logo-entrance 1s ease-out forwards",
        "logo-glow": "logo-glow 3s ease-in-out infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;