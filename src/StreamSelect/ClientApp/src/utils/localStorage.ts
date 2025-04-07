export function setItem(key: string, value: unknown): void {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.error('Error setting item in localStorage:', error);
    }
}

export function getItem(key: string): string | undefined {
    try {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : undefined;
    } catch (error) {
        console.error('Error getting item from localStorage:', error);
    }
}