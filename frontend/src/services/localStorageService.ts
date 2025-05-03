/**
 * Retrieves a value from localStorage by key
 * @param key The key to look up
 * @returns The value or null if the key is not found
 */
export const getItem = (key: string): string | null => {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.error(`Error retrieving ${key} from localStorage:`, error);
        return null;
    }
};

/**
 * Stores a value in localStorage
 * @param key The key
 * @param value The value to store
 */
export const setItem = (key: string, value: string): void => {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.error(`Error saving ${key} to localStorage:`, error);
    }
};

/**
 * Removes a value from localStorage by key
 * @param key The key to remove
 */
export const removeItem = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Error removing ${key} from localStorage:`, error);
    }
};

/**
 * Retrieves the user ID from the token stored in localStorage
 * @returns The user ID or null if the token is invalid
 */
export const getUserIdFromToken = (): string | null => {
    const token = getItem('authToken');
    if (!token) return null;

    try {
        const payload: { id?: string } = JSON.parse(atob(token.split('.')[1]));
        return payload.id ?? null;
    } catch (error) {
        console.error('Error decoding token:', error);
        removeItem('authToken');
        return null;
    }
};
