import { ThemeProvider, MainWindow } from '@jetbrains/int-ui-kit';

export default function App() {
    return (
        <ThemeProvider defaultTheme="dark">
            <MainWindow />
        </ThemeProvider>
    );
}