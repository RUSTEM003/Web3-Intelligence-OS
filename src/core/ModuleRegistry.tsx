import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export interface Module {
  id: string;
  name: string;
  description: string;
  version: string;
  dependencies: string[];
  component: React.ComponentType<any>;
  initialize?: () => Promise<void>;
  cleanup?: () => Promise<void>;
  isEnabled: boolean;
}

interface ModuleRegistryContextType {
  modules: Record<string, Module>;
  registerModule: (module: Module) => void;
  unregisterModule: (moduleId: string) => void;
  enableModule: (moduleId: string) => Promise<void>;
  disableModule: (moduleId: string) => Promise<void>;
  getModule: (moduleId: string) => Module | undefined;
  getEnabledModules: () => Module[];
}

const ModuleRegistryContext = createContext<ModuleRegistryContextType | undefined>(undefined);

interface ModuleRegistryProviderProps {
  children: ReactNode;
}

export const ModuleRegistryProvider: React.FC<ModuleRegistryProviderProps> = ({ children }) => {
  const [modules, setModules] = useState<Record<string, Module>>({});

  const registerModule = (module: Module) => {
    setModules(prevModules => ({
      ...prevModules,
      [module.id]: module
    }));
    console.log(`Module registered: ${module.name} (${module.id})`);
  };

  const unregisterModule = (moduleId: string) => {
    setModules(prevModules => {
      const newModules = { ...prevModules };
      delete newModules[moduleId];
      return newModules;
    });
    console.log(`Module unregistered: ${moduleId}`);
  };

  const enableModule = async (moduleId: string) => {
    const module = modules[moduleId];
    if (!module) {
      console.error(`Module not found: ${moduleId}`);
      return;
    }

    for (const depId of module.dependencies) {
      if (modules[depId] && !modules[depId].isEnabled) {
        await enableModule(depId);
      }
    }

    if (module.initialize) {
      try {
        await module.initialize();
      } catch (error) {
        console.error(`Failed to initialize module ${module.name}:`, error);
        return;
      }
    }

    setModules(prevModules => ({
      ...prevModules,
      [moduleId]: {
        ...prevModules[moduleId],
        isEnabled: true
      }
    }));

    console.log(`Module enabled: ${module.name} (${moduleId})`);
  };

  const disableModule = async (moduleId: string) => {
    const module = modules[moduleId];
    if (!module) {
      console.error(`Module not found: ${moduleId}`);
      return;
    }

    const dependentModules = Object.values(modules).filter(
      m => m.isEnabled && m.dependencies.includes(moduleId)
    );

    if (dependentModules.length > 0) {
      console.error(
        `Cannot disable module ${module.name} because it is required by: ${dependentModules
          .map(m => m.name)
          .join(', ')}`
      );
      return;
    }

    if (module.cleanup) {
      try {
        await module.cleanup();
      } catch (error) {
        console.error(`Failed to cleanup module ${module.name}:`, error);
      }
    }

    setModules(prevModules => ({
      ...prevModules,
      [moduleId]: {
        ...prevModules[moduleId],
        isEnabled: false
      }
    }));

    console.log(`Module disabled: ${module.name} (${moduleId})`);
  };

  const getModule = (moduleId: string) => {
    return modules[moduleId];
  };

  const getEnabledModules = () => {
    return Object.values(modules).filter(module => module.isEnabled);
  };

  const value = {
    modules,
    registerModule,
    unregisterModule,
    enableModule,
    disableModule,
    getModule,
    getEnabledModules
  };

  return (
    <ModuleRegistryContext.Provider value={value}>
      {children}
    </ModuleRegistryContext.Provider>
  );
};

export const useModuleRegistry = () => {
  const context = useContext(ModuleRegistryContext);
  if (context === undefined) {
    throw new Error('useModuleRegistry must be used within a ModuleRegistryProvider');
  }
  return context;
};

interface ModuleRendererProps {
  moduleId: string;
  fallback?: React.ReactNode;
  props?: Record<string, any>;
}

export const ModuleRenderer: React.FC<ModuleRendererProps> = ({ 
  moduleId, 
  fallback = null,
  props = {} 
}) => {
  const { getModule } = useModuleRegistry();
  const module = getModule(moduleId);

  if (!module || !module.isEnabled) {
    return <>{fallback}</>;
  }

  const ModuleComponent = module.component;
  return <ModuleComponent {...props} />;
};

interface ModuleDependenciesProps {
  children: ReactNode;
  dependencies: string[];
  fallback?: React.ReactNode;
}

export const ModuleDependencies: React.FC<ModuleDependenciesProps> = ({
  children,
  dependencies,
  fallback = null
}) => {
  const { modules } = useModuleRegistry();
  const allDependenciesEnabled = dependencies.every(
    depId => modules[depId] && modules[depId].isEnabled
  );

  return <>{allDependenciesEnabled ? children : fallback}</>;
};

type EventCallback = (data: any) => void;

class EventBus {
  private events: Record<string, EventCallback[]> = {};

  subscribe(event: string, callback: EventCallback) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(callback);

    return () => {
      this.events[event] = this.events[event].filter(cb => cb !== callback);
    };
  }

  publish(event: string, data: any) {
    if (this.events[event]) {
      this.events[event].forEach(callback => callback(data));
    }
  }
}

export const eventBus = new EventBus();

export const useEventBus = () => {
  return {
    subscribe: eventBus.subscribe.bind(eventBus),
    publish: eventBus.publish.bind(eventBus)
  };
};
