import { useProject } from "../../contexts/ProjectContext";
import FolderOpen from "lucide-solid/icons/folder-open";
import Music from "lucide-solid/icons/music";

export default function PrimarySidebar() {
  const { store, actions } = useProject();

  const NavIcon = (props: {icon: any;label: string;viewMode: string;}) =>
  <button
    class="w-8 h-8 flex items-center justify-center rounded transition-all duration-150 relative group"
    classList={{
      "text-white": store.viewMode === props.viewMode
    }}
    style={{
      color:
      store.viewMode === props.viewMode ?
      "var(--color-text-primary)" :
      "var(--color-text-muted)",
      background:
      store.viewMode === props.viewMode ?
      "var(--color-3000-400)" :
      "transparent"
    }}
    onClick={() => actions.setViewMode(props.viewMode as any)}
    title={props.label} data-xid="xsEHCzp1">

      {props.icon}

      {/* Tooltip */}
      <div
      class="absolute left-full ml-2 px-2 py-1 rounded text-xs whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10"
      style={{
        background: "var(--color-bg-surface-tertiary)",
        color: "var(--color-text-primary)",
        border: "1px solid var(--color-border)"
      }} data-xid="MRkUnOur">

        {props.label}
      </div>
    </button>;


  return (
    <div
      class="w-12 flex flex-col items-center py-3 gap-2 border-r"
      style={{
        background: "var(--color-bg-surface-secondary)",
        "border-color": "var(--color-border)"
      }} data-xid="tmdxNRHJ">

      <NavIcon
        icon={<FolderOpen size={16} strokeWidth={1.5} data-xid="OcxG7hXx" />}
        label="Library"
        viewMode="library" data-xid="gru1-5sU" />

      <NavIcon
        icon={<Music size={16} strokeWidth={1.5} data-xid="A32Kz2YG" />}
        label="Editor"
        viewMode="editor" data-xid="FCTwLxed" />

    </div>);

}