import ReactDOM from 'react-dom/client';
import { App } from './app/application';
import { appStarted } from './shared/config/init';

const container = document.getElementById('root') as HTMLElement;
const root = ReactDOM.createRoot(container);

appStarted();
root.render(<App />);
