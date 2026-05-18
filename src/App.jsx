import { ThemeProvider } from '@jetbrains/int-ui-kit';
import ResolveConflictsProgressDialog from './ResolveConflictsProgressDialog.jsx';
import './App.css';

export default function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <main className="dialog-demo-screen">
        <ResolveConflictsProgressDialog />
      </main>
    </ThemeProvider>
  );
}
