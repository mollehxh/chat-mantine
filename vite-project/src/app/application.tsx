import { MantineProvider } from '@mantine/core';
import { Pages } from '../pages';
import { Notifications } from '@mantine/notifications';
import { ModalsProvider } from '@mantine/modals';

export function App() {
  return (
    <MantineProvider
      theme={{ colorScheme: 'light' }}
      withGlobalStyles
      withNormalizeCSS
    >
      <ModalsProvider>
        <Notifications position="top-center" limit={2} />
        <Pages />
      </ModalsProvider>
    </MantineProvider>
  );
}
