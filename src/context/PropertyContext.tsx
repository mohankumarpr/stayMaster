import React, { createContext, useContext, useState } from 'react';

interface PropertyContextType {
    selectedProperty: string;
    setSelectedProperty: (id: string) => void;
}
 
 

const PropertyContext = createContext<PropertyContextType | undefined>(undefined);

export const PropertyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [selectedProperty, setSelectedProperty] = useState('');

    return (
        <PropertyContext.Provider value={{ selectedProperty, setSelectedProperty }}>
            {children}
        </PropertyContext.Provider>
    );
};

export const useProperty = () => {
    const context = useContext(PropertyContext);
    if (context === undefined) {
        throw new Error('useProperty must be used within a PropertyProvider');
    }
    return context;
}; 