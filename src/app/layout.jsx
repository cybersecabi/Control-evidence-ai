import './globals.css';

export const metadata = {
    title: 'ControlEvidence AI | Compliance Evidence Management',
    description: 'AI-assisted evidence intake, validation, and control mapping for compliance teams. Supports SOC 2, ISO 27001, SOX ITGC, and NIST CSF frameworks.',
    keywords: 'compliance, audit, evidence, SOC 2, ISO 27001, AI, automation',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <link rel="icon" href="/favicon.ico" />
            </head>
            <body>
                {children}
            </body>
        </html>
    );
}
