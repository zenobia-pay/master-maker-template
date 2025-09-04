import {
  createContext,
  useContext,
  type ParentComponent,
  createMemo,
  onCleanup,
  createSignal,
  createEffect,
  on,
} from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";
import { AutosaveService } from "../services/AutosaveService";
import type { EditorEvent } from "@shared/types/events";
import type { Sample } from "@shared/types/primitives";
import { processEventQueue } from "../editor/eventProcessor";
import { apiClient } from "../utils/api/client";

// Additional UI-specific sample properties
export interface UISample extends Sample {
  url?: string;
  duration?: number;
  type?: "audio" | "video";
  thumbnail?: string;
}


export interface ProjectStore {
  // Project data
  projectId: string;
  projectName: string;

  // Samples
  samples: UISample[];
  selectedSampleId: string | null;

  // UI state
  viewMode: "library" | "editor" | "export";
  sidebarShown: "samples" | "properties" | "assistant" | null;

  // Layout
  previewHeight: number;
  sidebarWidth: number;
}

// Context type
interface ProjectContextValue {
  store: ProjectStore;
  setStore: SetStoreFunction<ProjectStore>;
  actions: {
    selectSample: (sampleId: string | null) => void;
    toggleSidebar: (
      panel: "samples" | "properties" | "assistant" | null
    ) => void;
    setViewMode: (mode: "library" | "editor" | "export") => void;
    addSample: (sampleData: Partial<UISample> & { name: string }) => void;
    removeSample: (sampleId: string) => void;
  };
  derived: {
    selectedSample: () => UISample | null;
    sampleCount: () => number;
  };

  emitEvent: (event: EditorEvent) => void;
}

const ProjectContext = createContext<ProjectContextValue>();

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error("useProject must be used within ProjectProvider");
  }
  return context;
};

interface ProjectProviderProps {
  projectId: string;
  projectName?: string;
}

export const ProjectProvider: ParentComponent<ProjectProviderProps> = (
  props
) => {
  // Event queue for batching editor events
  const [eventQueue, setEventQueue] = createSignal<EditorEvent[]>([]);

  // Initialize autosave service
  const autosaveService = new AutosaveService(props.projectId);

  // Initialize store with default values
  const [store, setStore] = createStore<ProjectStore>({
    projectId: props.projectId,
    projectName: props.projectName || "Untitled Project",

    // Sample data (loaded from project)
    samples: [],
    selectedSampleId: null,

    // UI state
    viewMode: "library",
    sidebarShown: null,

    // Layout
    previewHeight: 40,
    sidebarWidth: 400,
  });

  // Derived values
  const selectedSample = createMemo(() => {
    if (!store.selectedSampleId) return null;
    return store.samples.find((s) => s.id === store.selectedSampleId) || null;
  });

  const sampleCount = createMemo(() => {
    return store.samples.length;
  });

  // Actions
  const actions = {
    selectSample: (sampleId: string | null) => {
      setStore("selectedSampleId", sampleId);
    },

    toggleSidebar: (panel: "samples" | "properties" | "assistant" | null) => {
      setStore("sidebarShown", store.sidebarShown === panel ? null : panel);
    },

    setViewMode: (mode: "library" | "editor" | "export") => {
      setStore("viewMode", mode);
    },

    addSample: (sampleData: Partial<UISample> & { name: string }) => {
      emitEvent({
        type: "SAMPLE_CREATED",
        projectId: store.projectId,
        sample: {
          ...sampleData,
          id: crypto.randomUUID(),
          description: sampleData.description || null,
          projectId: store.projectId,
          status: "draft",
          value: null,
          count: 0,
          isEnabled: true,
          metadata: null,
          createdAt: Date.now(),
          updatedAt: Date.now(),
        },
      });
    },

    removeSample: (sampleId: string) => {
      emitEvent({
        type: "SAMPLE_DELETED",
        sampleId,
        projectId: store.projectId,
        previousSample: store.samples.find((s) => s.id === sampleId)!,
      });
    },
  };

  const emitEvent = (event: EditorEvent) => {
    setEventQueue((prev) => [...prev, event]);
  };

  // Load project data on mount
  createEffect(async () => {
    try {
      const projectData = await apiClient.loadProject(props.projectId);
      if (projectData.samples) {
        setStore("samples", projectData.samples);
      }
      if (projectData.project) {
        setStore("projectName", projectData.project.name);
      }
    } catch (error) {
      console.error("Failed to load project data:", error);
    }
  });

  // Single effect to handle all events and update composition
  createEffect(
    on(eventQueue, (events) => {
      if (events.length === 0) return;

      // Process events using extracted processor (updates client-side store immediately)
      processEventQueue(events, store, setStore);

      // Queue events for autosave (separate from immediate client updates)
      autosaveService.queueMultipleForSave(events);

      // Clear event queue
      setEventQueue([]);
    })
  );

  // Cleanup
  onCleanup(() => {
    autosaveService.destroy();
  });

  const value: ProjectContextValue = {
    store,
    setStore,
    actions,
    derived: {
      selectedSample,
      sampleCount,
    },
    emitEvent,
  };

  return (
    <ProjectContext.Provider value={value}>
      {props.children}
    </ProjectContext.Provider>
  );
};
