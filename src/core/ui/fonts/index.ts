export const supportedFontFamilies = {
  Roboto: true,
  'Open Sans': true,
  Inter: true,
  Lato: true,
  Poppins: true,
  Catamaran: true,
  'Roboto Mono': true,
  'Noto Sans': true,
  Ubuntu: true,
  'Work Sans': true,
  Karla: true,
  'Dancing Script': true,
  'Source Code Pro': true,
  'Joefin Sans': true,
  'Josefin Slab': true,
};

export const isFamilySupported = (family: string): boolean =>
  !!supportedFontFamilies[family];

export const addFontFamily = (fontFamily: string) => {
  let url = 'https://fonts.googleapis.com/css?family=';
  url += fontFamily.replace(' ', '+');
  url += ':wght@400;700';

  const precon1Link = document.createElement('link');
  precon1Link.href = 'https://fonts.googleapis.com';
  precon1Link.rel = 'preconnect';
  const precon2Link = document.createElement('link');
  precon2Link.href = 'https://fonts.googleapis.com';
  precon2Link.rel = 'preconnect';
  precon2Link.setAttribute('crossorigin', '');

  const link = document.createElement('link');
  link.href = url;
  link.rel = 'stylesheet';
  link.type = 'text/css';

  document.head.appendChild(precon1Link);
  document.head.appendChild(precon2Link);
  document.head.appendChild(link);
};

export const addAllFontFamilies = () => {
  let url = 'https://fonts.googleapis.com/css2';
  const queryPaths = [];
  Object.keys(supportedFontFamilies).forEach((family) => {
    queryPaths.push(`family=${family.replace(' ', '+')}:wght@400;700`);
  });
  url = `${url}?${queryPaths.join('&')}`;

  const precon1Link = document.createElement('link');
  precon1Link.href = 'https://fonts.googleapis.com';
  precon1Link.rel = 'preconnect';
  const precon2Link = document.createElement('link');
  precon2Link.href = 'https://fonts.googleapis.com';
  precon2Link.rel = 'preconnect';
  precon2Link.setAttribute('crossorigin', '');

  const link = document.createElement('link');
  link.href = url;
  link.rel = 'stylesheet';
  link.type = 'text/css';

  document.head.appendChild(precon1Link);
  document.head.appendChild(precon2Link);
  document.head.appendChild(link);
};
