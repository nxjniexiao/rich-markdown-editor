import React from "react";
import styled from "styled-components";
import { EditorView } from "prosemirror-view";
import { MenuItem } from "../types";
import theme from "../styles/theme";

type Props = {
  active: boolean;
  tooltip: typeof React.Component | React.FC<any>;
  commands: Record<string, any>;
  view: EditorView;
  theme: typeof theme;
  item: MenuItem;
  forwardedRef?: React.RefObject<HTMLDivElement>;
};

function ColorPanel(props: Props) {
  const { active, commands, forwardedRef } = props;

  const colors = [
    "rgb(33, 37, 41)",
    "rgb(140, 140, 140)",
    "rgb(92, 92, 92)",
    "rgb(163, 67, 31)",
    "rgb(240, 107, 5)",
    "rgb(223, 171, 1)",
    "rgb(3, 135, 102)",
    "rgb(5, 117, 197)",
    "rgb(74, 82, 199)",
    "rgb(136, 49, 204)",
    "rgb(200, 21, 182)",
    "rgb(233, 30, 44)",
  ];

  if (!active) return null;

  return (
    <ColorPanelDiv ref={forwardedRef}>
      <div className="title">文字颜色</div>
      <div className="color-container">
        {colors.map(color => (
          <span
            className="color"
            key={color}
            style={{ color }}
            onClick={() => commands.color({ color })}
          >
            A
          </span>
        ))}
      </div>
    </ColorPanelDiv>
  );
}

const ColorPanelDiv = styled.div`
  position: absolute;
  left: 0;
  top: calc(100% + 20px);
  width: 200px;
  padding: 10px;
  line-height: 1.4;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0px 0px 0px 1px rgba(0, 0, 0, 0.05),
    0px 8px 24px rgba(0, 0, 0, 0.2);
  .title {
    font-size: 12px;
    color: #b3b3b3;
  }
  .color-container {
    display: flex;
    flex-wrap: wrap;
    .color {
      margin: 6px;
      width: 24px;
      line-height: 24px;
      border-radius: 2px;
      text-align: center;
      cursor: pointer;
      &:hover {
        background: rgba(1, 1, 1, 0.1);
      }
    }
  }
`;

export default React.forwardRef(function ColorPanelWithForwardedRef(
  props: Props,
  ref: React.RefObject<HTMLDivElement>
) {
  return <ColorPanel {...props} forwardedRef={ref} />;
});
