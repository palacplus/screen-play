import { useState } from "react";
import { useEffect } from "react";
import { getItem, setItem } from "../utils/localStorage";

export function usePersistedState<T>(key: string, initialValue: T): [T, (value: T) => void] {
    const [value, setValue] = useState<T>(() => {
        const item = getItem(key);
        return (item as T) || initialValue;
    });

    useEffect(() => {
        setItem(key, value);
    }, [value]);

    return [value, setValue] as const;
}