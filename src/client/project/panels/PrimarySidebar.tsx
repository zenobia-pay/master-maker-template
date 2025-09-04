import { useProject } from "../../contexts/ProjectContext";
import { FolderOpen, Music, Package } from "lucide-solid";

export default function PrimarySidebar() {
  const { store, actions } = useProject();

  const NavIcon = (props: { icon: any; label: string; viewMode: string }) => (
    <button
      class="w-8 h-8 flex items-center justify-center rounded transition-all duration-150 relative group"
      classList={{
        "text-white": store.viewMode === props.viewMode,
      }}
      style={{
        color:
          store.viewMode === props.viewMode
            ? "var(--color-text-primary)"
            : "var(--color-text-muted)",
        background:
          store.viewMode === props.viewMode
            ? "var(--color-3000-400)"
            : "transparent",
      }}
      onClick={() => actions.setViewMode(props.viewMode as any)}
      title={props.label}
    >
      {props.icon}

      {/* Tooltip */}
      <div
        class="absolute left-full ml-2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10"
        style={{
          background: "var(--color-bg-surface-tertiary)",
          color: "var(--color-text-primary)",
          border: "1px solid var(--color-border)",
        }}
      >
        {props.label}
      </div>
    </button>
  );

  return (
    <div
      class="w-12 flex flex-col items-center py-3 gap-2 border-r"
      style={{
        background: "var(--color-bg-surface-secondary)",
        "border-color": "var(--color-border)",
      }}
    >
      <NavIcon
        icon={<FolderOpen size={16} strokeWidth={1.5} />}
        label="Library"
        viewMode="library"
      />
      <NavIcon
        icon={<Music size={16} strokeWidth={1.5} />}
        label="Editor"
        viewMode="editor"
      />
      <NavIcon
        icon={<Package size={16} strokeWidth={1.5} />}
        label="Export"
        viewMode="export"
      />
    </div>
  );
}