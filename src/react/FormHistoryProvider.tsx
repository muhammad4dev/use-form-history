import { createContext, useContext, ReactNode } from 'react';
import { useFormHistory, UseFormHistoryReturn } from './useFormHistory';
import type { HistoryOptions } from '../core/types';

const FormHistoryContext = createContext<UseFormHistoryReturn<unknown> | null>(null);

export interface FormHistoryProviderProps<T> {
    initialState: T;
    options?: HistoryOptions;
    children: ReactNode;
}

/**
 * Provider component for sharing form history across components
 * 
 * @example
 * ```tsx
 * <FormHistoryProvider initialState={{ name: '', email: '' }}>
 *   <MyForm />
 * </FormHistoryProvider>
 * ```
 */
export function FormHistoryProvider<T>({
    initialState,
    options,
    children,
}: FormHistoryProviderProps<T>) {
    const history = useFormHistory(initialState, options);

    return (
        <FormHistoryContext.Provider value={history as unknown as UseFormHistoryReturn<unknown>}>
            {children}
        </FormHistoryContext.Provider>
    );
}

/**
 * Hook to access form history from context
 * 
 * @example
 * ```tsx
 * const { state, setState, undo, redo } = useFormHistoryContext();
 * ```
 */
export function useFormHistoryContext<T>(): UseFormHistoryReturn<T> {
    const context = useContext(FormHistoryContext);

    if (!context) {
        throw new Error(
            'useFormHistoryContext must be used within a FormHistoryProvider'
        );
    }

    return context as UseFormHistoryReturn<T>;
}
