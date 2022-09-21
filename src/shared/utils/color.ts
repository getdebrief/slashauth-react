export const invertColor = (hex: string): string => {
  let color = hex;
  if (color.indexOf('#') === 0) {
    color = color.slice(1);
  }

  if (color.length === 3) {
    color = color[0] + color[0] + color[1] + color[1] + color[2] + color[2];
  }

  if (color.length !== 6) {
    throw new Error('Invalid hex color');
  }

  const r = (255 - parseInt(color.slice(0, 2), 16)).toString(16);
  const g = (255 - parseInt(color.slice(2, 4), 16)).toString(16);
  const b = (255 - parseInt(color.slice(4, 6), 16)).toString(16);
  return `#${padZero(r, 2)}${padZero(g, 2)}${padZero(b, 2)}`;
};

const padZero = (str: string, len: number): string => {
  const zeroes = len - str.length;
  return Array(+(zeroes > 0 && zeroes)).join('0') + str;
};
