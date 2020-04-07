const COLORS = [
  '#2196f3',
  '#ff5722',
  '#673ab7',
  '#00bcd4',
  '#e91e63',
  '#009688',
  '#3f51b5',
  '#ffc107',
  '#8bc34a',
  '#f44336',
  '#03a9f4',
  '#cddc39',
  '#ff9800',
  '#9c27b0',
  '#795548',
  '#4caf50',
  '#ffeb3b',
  '#4e342e',
  '#707ea7',
  '#222a41'
];

export function getColor(index) {
  return COLORS[index % COLORS.length];
}

export function hexToRgb(hex) {
  return hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i,(m, r, g, b) => '#' + r + r + g + g + b + b)
    .substring(1).match(/.{2}/g)
    .map(x => parseInt(x, 16))
}
