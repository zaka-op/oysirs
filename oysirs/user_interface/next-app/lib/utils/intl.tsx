// Format currency amount
export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-NG', {
        style: 'currency',
        currency: 'NGN',
        minimumFractionDigits: 2
    }).format(amount);
};

export const formatDate = (isoDateStr: string): string => {
    const date = new Date(isoDateStr);
    return date.toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });
};