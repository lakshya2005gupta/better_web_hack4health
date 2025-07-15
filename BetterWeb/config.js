// // Default configuration
// const config = {
//     apiKey: 'FdSNITT5WANFBPHHXj645GonfiFZzdMyqkiZ49ha', // Add your API key here if needed
//     settings: {
//         voice: 'default',
//         speed: 1.0,
//         pitch: 1.0
//     }
// };

// // Export the config
// export default config;


// Configuration settings for BetterWeb extension
const CONFIG = {
    // Default accessibility settings
    defaults: {
      fontSize: 16,
      lineHeight: 1.5,
      fontFamily: "Arial, sans-serif",
      backgroundColor: "#ffffff",
      textColor: "#000000",
      linkColor: "#0000EE"
    },
    
    // Color schemes including dark mode
    colorSchemes: {
      default: {
        backgroundColor: "#ffffff",
        textColor: "#000000",
        linkColor: "#0000EE"
      },
      darkMode: {
        backgroundColor: "#121212",
        textColor: "#e0e0e0",
        linkColor: "#90caf9"
      },
      highContrast: {
        backgroundColor: "#000000",
        textColor: "#ffffff",
        linkColor: "#ffff00"
      },
      sepia: {
        backgroundColor: "#f5e8d0",
        textColor: "#5b4636",
        linkColor: "#0000EE"
      }
    }
  };
  
  // Simple utility functions to manipulate webpage styling
  const StyleUtils = {
    // Apply a CSS style to the document body or specified element
    applyStyle: function(element, property, value) {
      if (!element) element = document.body;
      element.style[property] = value;
    },
    
    // Create and inject a style element with CSS rules
    injectCSS: function(cssRules) {
      const styleEl = document.createElement('style');
      styleEl.id = 'betterweb-styles';
      styleEl.textContent = cssRules;
      document.head.appendChild(styleEl);
    },
    
    // Remove injected styles
    removeInjectedStyles: function() {
      const styleEl = document.getElementById('betterweb-styles');
      if (styleEl) styleEl.remove();
    },
    
    // Apply styles to make font size larger or smaller
    changeFontSize: function(direction, amount = 2) {
      const elements = document.querySelectorAll('p, h1, h2, h3, h4, h5, h6, span, div, a, li, td, th');
      elements.forEach(el => {
        const currentSize = window.getComputedStyle(el).fontSize;
        const currentSizeValue = parseFloat(currentSize);
        const newSize = direction === 'increase' 
          ? currentSizeValue + amount 
          : Math.max(8, currentSizeValue - amount);
        el.style.fontSize = `${newSize}px`;
      });
    }
  };