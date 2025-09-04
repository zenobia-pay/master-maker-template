import {
  createContext,
  useContext,
  type ParentComponent,
  createMemo,
  onCleanup,
} from "solid-js";
import { createStore, type SetStoreFunction } from "solid-js/store";

// Store types
export interface Sample {
  id: string;
  name: string;
  url: string;
  duration: number;
  type: "audio" | "video";
  thumbnail?: string;
}

export interface ProjectStore {
  // Project data
  projectId: string;
  projectName: string;

  // Samples
  samples: Sample[];
  selectedSampleId: string | null;

  // UI state
  viewMode: "library" | "editor" | "export";
  sidebarShown: "samples" | "properties" | "assistant" | null;
  isPlaying: boolean;
  currentTime: number;

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
    play: () => void;
    pause: () => void;
    seek: (time: number) => void;
  };
  derived: {
    selectedSample: () => Sample | null;
    sampleCount: () => number;
  };
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
  // Initialize store with default values
  const [store, setStore] = createStore<ProjectStore>({
    projectId: props.projectId,
    projectName: props.projectName || "Untitled Project",

    // Sample data (mock for now)
    samples: [
      {
        id: "1",
        name: "Kick Drum",
        url: "/samples/kick.wav",
        duration: 0.5,
        type: "audio",
      },
      {
        id: "2",
        name: "Snare",
        url: "/samples/snare.wav",
        duration: 0.3,
        type: "audio",
      },
      {
        id: "3",
        name: "Hi-Hat",
        url: "/samples/hihat.wav",
        duration: 0.2,
        type: "audio",
      },
      {
        id: "4",
        name: "Bass Loop",
        url: "/samples/bass.wav",
        duration: 4.0,
        type: "audio",
      },
    ],
    selectedSampleId: null,

    // UI state
    viewMode: "library",
    sidebarShown: null,
    isPlaying: false,
    currentTime: 0,

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

    play: () => {
      setStore("isPlaying", true);
    },

    pause: () => {
      setStore("isPlaying", false);
    },

    seek: (time: number) => {
      setStore("currentTime", time);
    },
  };

  // Cleanup
  onCleanup(() => {
    // Clean up any resources if needed
  });

  const value: ProjectContextValue = {
    store,
    setStore,
    actions,
    derived: {
      selectedSample,
      sampleCount,
    },
  };

  return (
    <ProjectContext.Provider value={value}>
      {props.children}
    </ProjectContext.Provider>
  );
};
