/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: ['class', 'class'],
  theme: {
  	extend: {
  		colors: {
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			success: {
  				DEFAULT: 'hsl(var(--success))',
  				foreground: 'hsl(var(--success-foreground))'
  			},
  			warning: {
  				DEFAULT: 'hsl(var(--warning))',
  				foreground: 'hsl(var(--warning-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out',
  			'slide-in-right': 'slide-in-right 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
  			'slide-in-left': 'slide-in-left 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
  			'slide-out-right': 'slide-out-right 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
  			'slide-out-left': 'slide-out-left 0.5s cubic-bezier(0.25, 0.46, 0.45, 0.94) both',
  			'fade-in': 'fade-in 0.5s ease-out',
  			'fade-out': 'fade-out 0.5s ease-out'
  		},
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: 0
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: 0
  				}
  			},
  			'slide-in-right': {
  				'0%': {
  					transform: 'translateX(1000px)',
  					opacity: 0
  				},
  				'100%': {
  					transform: 'translateX(0)',
  					opacity: 1
  				}
  			},
  			'slide-in-left': {
  				'0%': {
  					transform: 'translateX(-1000px)',
  					opacity: 0
  				},
  				'100%': {
  					transform: 'translateX(0)',
  					opacity: 1
  				}
  			},
  			'slide-out-right': {
  				'0%': {
  					transform: 'translateX(0)',
  					opacity: 1
  				},
  				'100%': {
  					transform: 'translateX(1000px)',
  					opacity: 0
  				}
  			},
  			'slide-out-left': {
  				'0%': {
  					transform: 'translateX(0)',
  					opacity: 1
  				},
  				'100%': {
  					transform: 'translateX(-1000px)',
  					opacity: 0
  				}
  			},
  			'fade-in': {
  				'0%': {
  					opacity: 0
  				},
  				'100%': {
  					opacity: 1
  				}
  			},
  			'fade-out': {
  				'0%': {
  					opacity: 1
  				},
  				'100%': {
  					opacity: 0
  				}
  			}
  		}
  	}
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('daisyui'),
      require("tailwindcss-animate")
],
  daisyui: {
    themes: ["dark"],
  }
} 