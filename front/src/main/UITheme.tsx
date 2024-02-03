import CssBaseline from '@mui/joy/CssBaseline';
import GlobalStyles from '@mui/joy/GlobalStyles';
import { CssVarsProvider, extendTheme } from '@mui/joy/styles';
import { ReactNode, useMemo } from 'react';

type Props = {
  children: ReactNode;
};

export default function UITheme(props: Props) {
  const theme = useMemo(() => {
    return extendTheme({
      fontFamily: {
        body: '"Inter", sans-serif',
      },
      components: {
        JoyInput: {
          defaultProps: {
            size: 'sm',
            variant: 'outlined',
            color: 'neutral',
          },
        },
        JoyTextarea: {
          defaultProps: {
            size: 'sm',
            variant: 'outlined',
            color: 'neutral',
          },
        },
        JoySelect: {
          defaultProps: {
            size: 'sm',
            variant: 'outlined',
            color: 'neutral',
          },
        },
        JoyRadioGroup: {
          defaultProps: {
            size: 'sm',
            color: 'neutral',
          },
        },
        JoyRadio: {
          defaultProps: {
            size: 'sm',
            variant: 'outlined',
            color: 'neutral',
          },
        },
        JoyButton: {
          defaultProps: {
            size: 'sm',
            variant: 'solid',
            color: 'neutral',
          },
        },
        JoyIconButton: {
          defaultProps: {
            size: 'sm',
            variant: 'plain',
            color: 'neutral',
          },
        },
        JoyMenuButton: {
          defaultProps: {
            size: 'sm',
            variant: 'solid',
            color: 'neutral',
          },
        },
        JoyMenu: {
          defaultProps: {
            size: 'sm',
          },
        },
        JoyMenuItem: {
          defaultProps: {
            color: 'primary', // Somehow this doesn't work
          },
        },
        JoyFormControl: {
          defaultProps: {
            size: 'sm',
          },
        },
        JoyTable: {
          defaultProps: {
            size: 'sm',
            borderAxis: 'both',
            noWrap: true,
            hoverRow: true,
            sx: {
              tableLayout: 'auto',
              '--Table-headerUnderlineThickness': '1px',
              '--TableCell-headBackground': '#ebebeb',
              td: {
                whiteSpace: 'normal',
              },
            },
          },
        },
      },
    });
  }, []);

  return (
    <CssVarsProvider theme={theme}>
      <CssBaseline disableColorScheme />
      <GlobalStyles
        styles={{
          ':root': {
            '--font-family-mono':
              'source-code-pro, Menlo, Monaco, Consolas, "Courier New", monospace',
          },
          code: {
            fontFamily: 'var(--font-family-mono)',
          },
          html: { height: '100%' },
          body: {
            height: '100%',
            backgroundColor: '#fff',
            webkitFontSmoothing: 'antialiased',
            mozOsxFontSmoothing: 'grayscale',
          },
          '#root': {
            height: '100%',
            display: 'grid',
            gridTemplateColumns: '1fr',
            gridTemplateRows: '50px 50px auto 50px',
            gridTemplateAreas:
              '"header"' + '"sub-header"' + '"work-area"' + '"bottom-tool-bar"',
            justifyContent: 'stretch',
            alignContent: 'stretch',
          },
        }}
      />
      {props.children}
    </CssVarsProvider>
  );
}
