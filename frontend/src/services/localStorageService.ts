/**
 * Отримує значення з localStorage за ключем
 * @param key Ключ для пошуку
 * @returns Значення або null, якщо ключ не знайдено
 */
export const getItem = (key: string): string | null => {
    try {
        return localStorage.getItem(key);
    } catch (error) {
        console.error(`Помилка при отриманні ${key} з localStorage:`, error);
        return null;
    }
};

/**
 * Зберігає значення в localStorage
 * @param key Ключ
 * @param value Значення
 */
export const setItem = (key: string, value: string): void => {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.error(`Помилка при збереженні ${key} в localStorage:`, error);
    }
};

/**
 * Видаляє значення з localStorage за ключем
 * @param key Ключ для видалення
 */
export const removeItem = (key: string): void => {
    try {
        localStorage.removeItem(key);
    } catch (error) {
        console.error(`Помилка при видаленні ${key} з localStorage:`, error);
    }
};

/**
 * Отримує userId з токена в localStorage
 * @returns ID користувача або null, якщо токен недійсний
 */
export const getUserIdFromToken = (): string | null => {
    const token = getItem('authToken');
    if (!token) return null;

    try {
        const payload: { id?: string } = JSON.parse(atob(token.split('.')[1]));
        return payload.id ?? null;
    } catch (error) {
        console.error('Помилка при декодуванні токена:', error);
        removeItem('authToken');
        return null;
    }
};