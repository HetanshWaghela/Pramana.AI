// Global animation configuration for consistency across Pramana.ai

export const transitions = {
  smooth: { duration: 0.4, ease: "easeOut" },
  medium: { duration: 0.6, ease: "easeOut" },
  slow: { duration: 0.8, ease: [0.4, 0, 0.2, 1] },
  quick: { duration: 0.3, ease: "easeOut" },
};

export const variants = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
  },
  slideUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  },
  slideDown: {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 },
  },
  slideLeft: {
    hidden: { opacity: 0, x: 60 },
    visible: { opacity: 1, x: 0 },
  },
  slideRight: {
    hidden: { opacity: 0, x: -40 },
    visible: { opacity: 1, x: 0 },
  },
  scaleIn: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { opacity: 1, scale: 1 },
  },
  scaleInSmall: {
    hidden: { opacity: 0, scale: 0.9 },
    visible: { opacity: 1, scale: 1 },
  },
};

export const staggerTiming = {
  fast: 0.08,
  normal: 0.12,
  slow: 0.15,
};

export const hoverVariants = {
  subtle: {
    scale: 1.02,
    transition: { duration: 0.3 },
  },
  medium: {
    scale: 1.03,
    transition: { duration: 0.3 },
  },
  lift: {
    y: -4,
    scale: 1.02,
    transition: { duration: 0.3 },
  },
};

export const viewportConfig = {
  once: true,
  amount: 0.3,
};
