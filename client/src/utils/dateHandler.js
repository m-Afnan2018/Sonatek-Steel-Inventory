export function formatDate(isoString) {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-GB', {  // 'en-GB' gives dd/mm/yyyy format
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}