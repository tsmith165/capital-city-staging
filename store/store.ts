import { create } from 'zustand';
import { RefObject } from 'react';

type Store = {
    selectedComponent: string;
    componentRefs: RefObject<HTMLDivElement>[];
    setSelectedComponent: (component: string) => void;
    setComponentRefs: (refs: RefObject<HTMLDivElement>[]) => void;
};

export const useStore = create<Store>((set) => ({
    selectedComponent: 'home',
    componentRefs: [],
    setSelectedComponent: (component) => set({ selectedComponent: component }),
    setComponentRefs: (refs) => set({ componentRefs: refs }),
}));
