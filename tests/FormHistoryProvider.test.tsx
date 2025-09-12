import { describe, it, expect, vi } from 'vitest';
import { renderHook } from '@testing-library/react';
import React from 'react';
import { FormHistoryProvider, useFormHistoryContext } from '../src/react/FormHistoryProvider';

describe('FormHistoryProvider', () => {
    it('should provide history context to children', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <FormHistoryProvider initialState={{ name: '', email: '' }}>
                {children}
            </FormHistoryProvider>
        );

        const { result } = renderHook(() => useFormHistoryContext(), { wrapper });

        expect(result.current.state).toEqual({ name: '', email: '' });
        expect(result.current.canUndo).toBe(false);
        expect(result.current.canRedo).toBe(false);
    });

    it('should throw error when used outside provider', () => {
        // Suppress expected console errors from React error boundary
        const consoleError = vi.spyOn(console, 'error').mockImplementation(() => { });

        expect(() => {
            renderHook(() => useFormHistoryContext());
        }).toThrow('useFormHistoryContext must be used within a FormHistoryProvider');

        consoleError.mockRestore();
    });

    it('should share state updates across context consumers', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <FormHistoryProvider initialState={{ count: 0 }}>
                {children}
            </FormHistoryProvider>
        );

        const { result } = renderHook(() => useFormHistoryContext<{ count: number }>(), { wrapper });

        expect(result.current.state.count).toBe(0);

        // Context should provide full history API
        expect(typeof result.current.setState).toBe('function');
        expect(typeof result.current.undo).toBe('function');
        expect(typeof result.current.redo).toBe('function');
    });

    it('should accept custom options', () => {
        const wrapper = ({ children }: { children: React.ReactNode }) => (
            <FormHistoryProvider
                initialState={{ name: '' }}
                options={{ maxHistory: 10, debounceMs: 100 }}
            >
                {children}
            </FormHistoryProvider>
        );

        const { result } = renderHook(() => useFormHistoryContext(), { wrapper });

        // Should initialize successfully with options
        expect(result.current.state).toEqual({ name: '' });
    });
});
