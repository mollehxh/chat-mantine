import { MantineProvider } from '@mantine/core';
import { Pages } from '../pages';
import { Notifications } from '@mantine/notifications';

export function App() {
  return (
    <MantineProvider
      theme={{ colorScheme: 'dark' }}
      withGlobalStyles
      withNormalizeCSS
    >
      <Notifications position="bottom-left" />
      <Pages />
    </MantineProvider>
  );
}
