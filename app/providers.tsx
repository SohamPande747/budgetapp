'use client'

import { Toaster } from 'react-hot-toast'

export default function Providers({
    children,
}: {
    children: React.ReactNode
}) {
    return (
        <>
            {children}
            <Toaster
                position="top-right"
                toastOptions={{
                    style: {
                        background: 'rgba(17, 24, 39, 0.9)',
                        color: '#fff',
                        backdropFilter: 'blur(10px)',
                        borderRadius: '14px',
                        padding: '14px 18px',
                    },
                }}
            />
        </>
    )
}