import { useProject } from "../../contexts/ProjectContext";
import MessageSquare from "lucide-solid/icons/message-square";
import EllipsisVertical from "lucide-solid/icons/ellipsis-vertical";

export default function RightSidebar() {
  const { store, actions } = useProject();

  const RightSidebarIcon = (props: {
    icon: any;
    label: string;
    sidebarType: "assistant";
  }) =>
  <button
    class="w-full flex flex-col items-center justify-center gap-2 transition-all duration-150 relative group hover:bg-opacity-10"
    classList={{
      "text-white": store.sidebarShown === props.sidebarType
    }}
    style={{
      color:
      store.sidebarShown === props.sidebarType ?
      "var(--color-text-primary)" :
      "var(--color-text-muted)",
      background:
      store.sidebarShown === props.sidebarType ?
      "var(--color-3000-400)" :
      "transparent"
    }}
    onClick={() =>
    actions.toggleSidebar(
      store.sidebarShown === props.sidebarType ? null : props.sidebarType
    )
    }
    title={props.label} data-xid="_feNJd3E">

      <div style={{ transform: "rotate(90deg)" }} data-xid="L-gD_NFg">{props.icon}</div>

      {/* Vertical text */}
      <div
      class="text-xs font-medium leading-tight tracking-wider"
      style={{
        "writing-mode": "vertical-lr",
        "text-orientation": "mixed",
        "letter-spacing": "0.5px"
      }} data-xid="pOqGPf73">

        {props.label}
      </div>
    </button>;


  return (
    <div
      class="w-8 flex flex-col border-l"
      style={{
        background: "var(--color-bg-surface-secondary)",
        "border-color": "var(--color-border)"
      }} data-xid="7qvHBjVo">

      <RightSidebarIcon
        icon={<MessageSquare size={16} strokeWidth={1.5} data-xid="RFHSZJ2W" />}
        label="ASSISTANT"
        sidebarType="assistant" data-xid="aNXkskie" />


      {/* Spacer to push menu to bottom */}
      <div class="flex-1" data-xid="SpOmdLUu" />

      {/* Menu Button */}
      <button
        class="w-full h-12 flex items-center justify-center transition-all duration-150 hover:bg-opacity-10"
        style={{
          color: "var(--color-text-muted)"
        }}
        title="Menu" data-xid="_GNVf-FC">

        <div style={{ transform: "rotate(90deg)" }} data-xid="5yUEtsJK">
          <EllipsisVertical size={16} strokeWidth={1.5} data-xid="s-esyL1K" />
        </div>
      </button>
    </div>);

}