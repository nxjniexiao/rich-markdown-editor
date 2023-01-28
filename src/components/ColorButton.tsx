import * as React from "react";
import styled from "styled-components";
import { EditorView } from "prosemirror-view";
import { HighlightIcon } from "outline-icons";
import ToolbarButton from "./ToolbarButton";
import ColorPanel from "./ColorPanel";
import theme from "../styles/theme";
import { MenuItem } from "../types";

type Props = {
  tooltip: typeof React.Component | React.FC<any>;
  commands: Record<string, any>;
  view: EditorView;
  theme: typeof theme;
  item: MenuItem;
};

function ColorButton(props: Props) {
  const { item, theme, tooltip: Tooltip } = props;

  const colorPanelRef = React.useRef<HTMLDivElement>(null);
  const [active, setActive] = React.useState(false);
  const isActive = false;

  return (
    <ColorButtonDiv>
      <ToolbarButton
        active={isActive}
        onClick={() => setActive(active => !active)}
      >
        <Tooltip tooltip={item.tooltip} placement="top">
          <HighlightIcon color={theme.toolbarItem} />
        </Tooltip>
      </ToolbarButton>
      <ColorPanel ref={colorPanelRef} active={active} {...props} />
    </ColorButtonDiv>
  );
}

const ColorButtonDiv = styled.div`
  position: relative;
  margin-left: 8px;
  pointer-events: all;
`;

export default ColorButton;
