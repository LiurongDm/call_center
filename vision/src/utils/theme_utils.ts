interface Theme {
    chalk: {
      backgroundColor: string;
      titleColor: string;
      themeSrc: string;
      headerBorderSrc: string;
    };
    vintage: {
      backgroundColor: string;
      titleColor: string;
      themeSrc: string;
      headerBorderSrc: string;
    };
  }
  
  const theme: Theme = {
    chalk: {
      backgroundColor: '#161522',
      titleColor: '#ffffff',
      themeSrc: 'qiehuan_dark.png',
      headerBorderSrc: 'header_border_dark.png',
    },
    vintage: {
      backgroundColor: '#eeeeee',
      titleColor: '#000000',
      themeSrc: 'qiehuan_light.png',
      headerBorderSrc: 'header_border_light.png',
    }
  };


  function getThemeValue(themeName: keyof Theme): Theme[keyof Theme] {
    return theme[themeName];
  }
  

  export { theme, getThemeValue };



