export function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {  // 'en-GB' gives dd/mm/yyyy format
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

export function formatTime(isoString) {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
    });
}

export function formatDateMini(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {  // 'en-GB' gives dd/mm/yyyy format
        year: 'numeric',
        month: 'numeric',
        day: 'numeric'
    });
}