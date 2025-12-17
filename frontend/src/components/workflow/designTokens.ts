/**
 * Design Tokens for Workflow Visualization
 * Pramana.ai enterprise aesthetic - calm, premium, minimal
 * Type-safe constants for consistent theming
 */

// Color palette - muted, sophisticated tones
export const Colors = {
  // Canvas & backgrounds
  canvas: {
    background: '#FAFBFC',
    grid: '#E8ECF0',
    gridOpacity: 0.4,
  },
  
  // Node categories - soft, muted semantic colors
  node: {
    entry: {
      background: '#FFFFFF',
      border: '#A7F3D0',
      borderActive: '#6EE7B7',
      icon: '#10B981',
      iconGradient: {
        from: '#10B981',
        to: '#059669',
      },
    },
    orchestrator: {
      background: '#FFFFFF',
      border: '#C7D2FE',
      borderActive: '#A5B4FC',
      icon: '#6366F1',
      iconGradient: {
        from: '#6366F1',
        to: '#4F46E5',
      },
    },
    worker: {
      background: '#FFFFFF',
      border: '#FED7AA',
      borderActive: '#FDBA74',
      icon: '#F97316',
      iconGradient: {
        from: '#F97316',
        to: '#EA580C',
      },
    },
    aggregator: {
      background: '#FFFFFF',
      border: '#DDD6FE',
      borderActive: '#C4B5FD',
      icon: '#8B5CF6',
      iconGradient: {
        from: '#8B5CF6',
        to: '#7C3AED',
      },
    },
    output: {
      background: '#FFFFFF',
      border: '#99F6E4',
      borderActive: '#5EEAD4',
      icon: '#14B8A6',
      iconGradient: {
        from: '#14B8A6',
        to: '#0D9488',
      },
    },
    report: {
      background: '#FFFFFF',
      border: '#E9D5FF',
      borderActive: '#D8B4FE',
      icon: '#A855F7',
      iconGradient: {
        from: '#A855F7',
        to: '#9333EA',
      },
    },
    inactive: {
      background: '#F8FAFC',
      border: '#E2E8F0',
      icon: '#94A3B8',
    },
  },
  
  // Connection lines
  edge: {
    inactive: '#CBD5E1',
    active: '#3B82F6',
    flow: '#60A5FA',
    gradient: {
      from: '#3B82F6',
      mid: '#60A5FA',
      to: '#3B82F6',
    },
  },
  
  // Status indicators
  status: {
    running: '#3B82F6',
    completed: '#10B981',
    error: '#EF4444',
    pending: '#F59E0B',
  },
  
  // UI elements
  ui: {
    text: {
      primary: '#1E293B',
      secondary: '#64748B',
      muted: '#94A3B8',
      inverse: '#FFFFFF',
    },
    glass: {
      background: 'rgba(255, 255, 255, 0.85)',
      border: 'rgba(226, 232, 240, 0.8)',
      shadow: 'rgba(0, 0, 0, 0.08)',
    },
    selection: {
      ring: '#3B82F6',
      ringOpacity: 0.5,
    },
  },
} as const;

// Typography scale
export const Typography = {
  fontFamily: {
    sans: 'Inter, system-ui, -apple-system, sans-serif',
    mono: 'JetBrains Mono, Consolas, monospace',
  },
  fontSize: {
    xs: '0.688rem',    // 11px
    sm: '0.813rem',    // 13px
    base: '0.938rem',  // 15px
    md: '1rem',        // 16px
    lg: '1.125rem',    // 18px
    xl: '1.25rem',     // 20px
    '2xl': '1.5rem',   // 24px
  },
  fontWeight: {
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
  },
  lineHeight: {
    tight: 1.2,
    snug: 1.4,
    normal: 1.5,
    relaxed: 1.6,
  },
} as const;

// Spacing system (px values)
export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 48,
  '4xl': 64,
} as const;

// Border radius
export const Radii = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  '2xl': '20px',
  full: '9999px',
} as const;

// Shadows - soft, minimal
export const Shadows = {
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  base: '0 2px 8px -1px rgba(0, 0, 0, 0.08), 0 1px 3px -1px rgba(0, 0, 0, 0.06)',
  md: '0 4px 12px -2px rgba(0, 0, 0, 0.1), 0 2px 6px -1px rgba(0, 0, 0, 0.06)',
  lg: '0 8px 20px -4px rgba(0, 0, 0, 0.12), 0 4px 10px -2px rgba(0, 0, 0, 0.08)',
  xl: '0 16px 32px -8px rgba(0, 0, 0, 0.14), 0 8px 16px -4px rgba(0, 0, 0, 0.1)',
  focus: '0 0 0 3px rgba(59, 130, 246, 0.5)',
  glow: {
    sm: '0 0 8px',
    md: '0 0 16px',
    lg: '0 0 24px',
  },
} as const;

// Animation timing
export const Transitions = {
  duration: {
    instant: 0.1,
    fast: 0.15,
    base: 0.2,
    slow: 0.3,
    slower: 0.5,
  },
  easing: {
    easeInOut: [0.4, 0.0, 0.2, 1],
    easeOut: [0.0, 0.0, 0.2, 1],
    easeIn: [0.4, 0.0, 1, 1],
    spring: { type: 'spring', stiffness: 300, damping: 30 },
  },
} as const;

// Node dimensions
export const NodeDimensions = {
  icon: {
    wrapper: 60,
    inner: 40,
  },
  minWidth: 100,
  maxWidth: 180,
  labelMaxWidth: 140,
} as const;

// Canvas layout
export const CanvasLayout = {
  minZoom: 0.3,
  maxZoom: 2,
  defaultZoom: 0.85,
  grid: {
    size: 20,
    dotRadius: 1,
  },
  node: {
    horizontal: 240,  // spacing between columns
    vertical: 120,    // spacing between rows
  },
} as const;

// Z-index layers
export const ZIndex = {
  canvas: 0,
  connections: 1,
  nodes: 10,
  selectedNode: 20,
  toolbar: 30,
  modal: 40,
  tooltip: 50,
} as const;

// Type exports for TypeScript
export type ColorCategory = keyof typeof Colors.node;
export type NodeColorScheme = typeof Colors.node[ColorCategory];

// Helper to get node colors by category with type safety
export function getNodeColors(category: ColorCategory, isActive: boolean = true): NodeColorScheme {
  const scheme = Colors.node[category];
  return scheme;
}

// Helper to get status color
export function getStatusColor(status: 'running' | 'completed' | 'error' | 'pending'): string {
  return Colors.status[status];
}
