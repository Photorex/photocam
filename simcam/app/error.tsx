'use client' 
 
import { useEffect } from 'react'

// Import styles
import styles from "./error.module.css";
 
export default function Error({
    error,
    reset,
}: {
    error: Error
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])
 
    return (
        <div className={styles.error_page}>
            <h2>Something went wrong...</h2>
            <button
                className={styles.reset_button}
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
            >
                Try again
            </button>
        </div>
    )
}