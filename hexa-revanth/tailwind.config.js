/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,jsx}",
    "./components/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        /* --- PRIMARY: Racing Yellow — unchanged, core brand --- */
        "primary":                    "#B6B2A5",
        "on-primary":                 "#1A1300",
        "primary-container":          "#F5C518",
        "on-primary-container":       "#332700",
        "primary-fixed":              "#FFD64D",
        "primary-fixed-dim":          "#B6B2A5",
        "on-primary-fixed":           "#1A1300",
        "on-primary-fixed-variant":   "#4D3B00",
        "inverse-primary":            "#CC9E00",
        "surface-tint":               "#B6B2A5",

        /* --- BACKGROUND & SURFACES --- */
        "background":                 "#E8EDF5",
        "on-background":              "#0D1A3A",
        "surface":                    "#FFFFFF",
        "on-surface":                 "#0D1A3A",
        "surface-variant":            "#D4DCE8",
        "on-surface-variant":         "#3D5070",
        "inverse-surface":            "#0D1A3A",
        "inverse-on-surface":         "#E8EDF5",

        "surface-dim":                "#D4DCE8",
        "surface-bright":             "#FFFFFF",
        "surface-container-lowest":   "#F4F7FB",
        "surface-container-low":      "#EDF1F8",
        "surface-container":          "#E8EDF5",
        "surface-container-high":     "#D4DCE8",
        "surface-container-highest":  "#C0CEDF",

        "outline":                    "#8FA8C8",
        "outline-variant":            "#C8D4E4",

        /* --- SECONDARY --- */
        "secondary":                  "#3D5070",
        "on-secondary":               "#FFFFFF",
        "secondary-container":        "#C0CEDF",
        "on-secondary-container":     "#0D1A3A",
        "secondary-fixed":            "#8FA8C8",
        "secondary-fixed-dim":        "#6B8AAD",
        "on-secondary-fixed":         "#0D1A3A",
        "on-secondary-fixed-variant": "#1E3A6E",

        /* --- TERTIARY --- */
        "tertiary":                   "#1B6FE8",
        "on-tertiary":                "#FFFFFF",
        "tertiary-container":         "#E6F1FB",
        "on-tertiary-container":      "#0C447C",
        "tertiary-fixed":             "#B5D4F4",
        "tertiary-fixed-dim":         "#85B7EB",
        "on-tertiary-fixed":          "#042C53",
        "on-tertiary-fixed-variant":  "#185FA5",

        /* --- DARK NAVY --- */
        "navy":                       "#0D1A3A",
        "navy-elevated":              "#1E3A6E",
        "navy-muted":                 "#8FA8C8",
        "navy-subtle":                "#C8D4E4",

        /* --- ERRORS --- */
        "error":                      "#C0392B",
        "on-error":                   "#FFFFFF",
        "error-container":            "#FDECEA",
        "on-error-container":         "#7B241C",
      },

      borderRadius: {
        DEFAULT: "0.125rem",
        lg: "0.25rem",
        xl: "0.5rem",
        full: "0.75rem",
      },

      spacing: {
        unit: "4px",
        margin: "40px",
        "container-max": "1280px",
        gutter: "24px",
      },

      fontFamily: {
        "body-lg":      ["Inter", "sans-serif"],
        "data-mono":    ["Space Grotesk", "monospace"],
        "body-md":      ["Inter", "sans-serif"],
        "headline-xl":  ["Space Grotesk", "sans-serif"],
        "headline-md":  ["Space Grotesk", "sans-serif"],
        "label-caps":   ["Space Grotesk", "sans-serif"],
        "headline-lg":  ["Space Grotesk", "sans-serif"],
        grotesk:        ["Space Grotesk", "sans-serif"],
      },

      fontSize: {
        "body-lg":      ["18px", { lineHeight: "1.6",  letterSpacing: "0em",    fontWeight: "400" }],
        "data-mono":    ["14px", { lineHeight: "1",    letterSpacing: "0.05em", fontWeight: "500" }],
        "body-md":      ["16px", { lineHeight: "1.6",  letterSpacing: "0em",    fontWeight: "400" }],
        "headline-xl":  ["72px", { lineHeight: "1.1",  letterSpacing: "-0.04em",fontWeight: "700" }],
        "headline-md":  ["32px", { lineHeight: "1.3",  letterSpacing: "0em",    fontWeight: "600" }],
        "label-caps":   ["12px", { lineHeight: "1",    letterSpacing: "0.15em", fontWeight: "700" }],
        "headline-lg":  ["48px", { lineHeight: "1.2",  letterSpacing: "-0.02em",fontWeight: "600" }],
      },

      // ✅ MARQUEE ANIMATIONS - Added here
      animation: {
        'marquee': 'marquee 30s linear infinite',
        'marquee-reverse': 'marquee-reverse 30s linear infinite',
        'marquee-slow': 'marquee 50s linear infinite',
      },
      keyframes: {
        marquee: {
          '0%': { transform: 'translateX(0%)' },
          '100%': { transform: 'translateX(-50%)' },
        },
        'marquee-reverse': {
          '0%': { transform: 'translateX(-50%)' },
          '100%': { transform: 'translateX(0%)' },
        },
      },
    },
  },
  plugins: [],
};