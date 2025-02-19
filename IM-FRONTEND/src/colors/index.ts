/* eslint-disable no-magic-numbers */
import { CSSProperties } from 'react';

interface IColor {
  [color: string]: string;
}

export const mitreChartColors = {
  notBypassed: '#42ba96',
  bypassed: '#a60f0f',
  notTested: '#FFCC00'
};

/* charts colors start */
export const chartColors = {
  themeColors: ['#111C4E', '#691F74', '#FF595A', '#9D1D96', '#E50695', '#CC3362'],
  themeTransparentColors: [
    'rgba(17, 28, 78, 0.8)',
    'rgba(105, 31, 116, 0.8)',
    'rgba(255, 89, 90, 0.8)',
    'rgba(157, 29, 150, 0.8)',
    'rgba(255, 130,80, 0.4)',
    'rgba(229, 6, 149, 0.8)',
    'rgba(204, 51, 98, 0.8)'
  ]
};

export const filterColors = ['#111C4E', '#691F74', '#FF595A', '#9D1D96', '#E50695', '#CC3362'];
export const analyticSeverityColors = [
  '#CC3362',
  '#FF595A',
  '#691F74',
  '#E50695',
  '#111C4E',
  '#9D1D96'
];

export const defaultLegend = {
  legend: {
    position: 'left',
    align: 'center',
    labels: {
      boxWidth: 10
    }
  }
};

export const defaultElements = {
  elements: {
    line: {
      borderWidth: 1
    }
  }
};

export const chartOptions = {
  maintainAspectRatio: false,
  responsive: true
};

/* Theme COlors */

const color: IColor = {
  /**
   * general
   */
  info: '#9D1D96',
  primary: '#111C4E',
  white: '#ffff',
  /**
   * Severity
   */
  critical: 'rgba(204, 51, 98, 1)',
  high: 'rgba(255, 89, 90, 1)',
  medium: 'rgba(255, 193, 7, 0.7)',
  low: '#E50695',
  /**
   * Progress
   */
  completed: '#45BF55',
  scheduled: '#FF595A',
  partial: '#FF595A',
  'in progress': '#111C4E',
  in_progress: '#111C4E',
  pending: '#111C4E',
  failed: '#CC3362',
  /**
   * Verification
   */
  false: '#CC3362',
  true: '#45BF55',

  /**
   * Assessment Type
   */
  half: '#e3c620',
  full: '#185e21',
  single: '#302f9b',

  /**
   * Alert Status colors
   */
  notfound: '#FF595A',
  prevented: '#45BF55',
  detected: '#45BF55',
  blocked: '#45BF55',
  alerted: '#45BF55',
  notalerted: 'rgba(204, 51, 98, 1)',

  /**
   * Exploit Type
   */
  custom: '#377a37',
  public: '#b52626',
  'public customized': '#bd7920',
  'blocked-heatmap':
    'linear-gradient(90deg, rgba(52,203,57,1) 0%, rgba(56,213,42,1) 20%,  rgba(89,221,34,1) 30%, rgba(113,234,21,1) 40%,rgba(132,247,8,1) 50%, rgba(161,252,3,1) 60%,  rgba(183,255,0,1) 70%)',
  'breached-heatmap':
    'linear-gradient(90deg, rgba(255,142,0,1) 0%, rgba(254,111,1,1) 40%, rgba(254,84,1,1) 50%, rgba(254,65,1,1) 60%, rgba(253,48,2,1) 70%, rgba(254,4,1,1) 80%, rgba(228,27,31,1) 90%)',
  'not tested-heatmap':
    'linear-gradient(90deg, rgba(238,253,2,1) 0%, rgba(252,248,3,1) 40%, rgba(250,234,5,1) 50%, rgba(253,223,2,1) 60%, rgba(252,218,3,1) 70%, rgba(254,211,1,1) 80%, rgba(255,194,0,1) 90%)'
};

/**
 * Color used in tags and other components are defined here
 * @param {string} type - color type
 * @returns {string} color - color value
 */
export const getColor = (type: string): string => {
  return color[type.toLowerCase()];
};

interface IAlertTypes {
  [key: string]: CSSProperties;
}

// alert styles
const getAlertColors: IAlertTypes = {
  success: {
    color: 'rgba(0, 0, 0, 0.65)',
    border: '1px solid #b7eb8f',
    backgroundColor: '#f6ffed'
  },
  warning: {
    color: 'rgba(0, 0, 0, 0.65)',
    border: '1px solid #ffe58f',
    backgroundColor: '#fffbe6'
  },
  error: {
    color: 'rgba(0, 0, 0, 0.65)',
    border: '1px solid #ffa39e',
    backgroundColor: '#fff1f0'
  },
  info: {
    color: 'rgba(0, 0, 0, 0.65)',
    border: '1px solid #91d5ff',
    backgroundColor: '#e6f7ff'
  }
};

/**
 * Color used in alert here
 * @param {string} type - color type
 * @returns {CSSProperties} color - color value
 */
export const getAlertStyle = (type: string): CSSProperties => {
  if (type === 'danger') {
    return getAlertColors.error;
  }
  return getAlertColors[type];
};
