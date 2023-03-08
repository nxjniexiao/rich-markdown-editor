import React from "react";
import styled from "styled-components";
import { EditorView } from "prosemirror-view";
import { MenuItem } from "../types";
import theme from "../styles/theme";
import useComponentSize from "../hooks/useComponentSize";
import useViewportHeight from "../hooks/useViewportHeight";

type Props = {
  active: boolean;
  tooltip: typeof React.Component | React.FC<any>;
  commands: Record<string, any>;
  view: EditorView;
  theme: typeof theme;
  item: MenuItem;
  anchorRef: React.RefObject<HTMLElement>;
};

function ColorPanel(props: Props) {
  const { active, commands, anchorRef } = props;

  const colorPanelRef = React.useRef<HTMLDivElement>(null);
  const { width: panelWidth, height: panelHeight } = useComponentSize(
    colorPanelRef
  );
  const viewportHeight = useViewportHeight();
  const position = calcPosition(
    anchorRef,
    panelWidth,
    panelHeight,
    viewportHeight
  );

  const colors = [
    "", // "rgb(33, 37, 41)"
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

  const backgroundColors = [
    "", // "transparent"
    "rgba(140, 140, 140, 0.12)",
    "rgba(92, 92, 92, 0.2)",
    "rgba(163, 67, 31, 0.2)",
    "rgba(240, 107, 5, 0.2)",
    "rgba(240, 200, 0, 0.2)",
    "rgba(3, 135, 102, 0.2)",
    "rgba(5, 117, 197, 0.2)",
    "rgba(74, 82, 199, 0.2)",
    "rgba(136, 49, 204, 0.2)",
    "rgba(200, 21, 182, 0.2)",
    "rgba(233, 30, 44, 0.2)",
  ];

  if (!active) return null;

  return (
    <ColorPanelDiv ref={colorPanelRef} position={position}>
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
      <div className="title">背景颜色</div>
      <div className="color-container">
        {backgroundColors.map(backgroundColor => {
          let style: React.CSSProperties = {
            backgroundColor,
          };
          if (backgroundColor === "") {
            style = {
              backgroundColor: "transparent",
              backgroundImage: `linear-gradient(45deg, rgba(0, 0, 0, .25) 25%, transparent 0, transparent 75%, rgba(0, 0, 0, .25) 0), linear-gradient(45deg, rgba(0, 0, 0, .25) 25%, transparent 0, transparent 75%, rgba(0, 0, 0, .25) 0)`,
              backgroundPosition: "0 0, 6px 6px",
              backgroundSize: "12px 12px",
            };
          }

          return (
            <span
              className="color bg"
              key={backgroundColor}
              style={style}
              onClick={() => commands.backgroundColor({ backgroundColor })}
            ></span>
          );
        })}
      </div>
    </ColorPanelDiv>
  );
}

const ColorPanelDiv = styled.div<{
  position: Position;
}>`
  position: absolute;
  ${({ position }) => {
    let str = "";
    ["left", "right", "top", "bottom"].forEach(pos => {
      if (position[pos] !== undefined) str += `${pos}: ${position[pos]};`;
    });
    return str;
  }}
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
      height: 24px;
      border-radius: 2px;
      text-align: center;
      cursor: pointer;
      &:not(.bg):hover {
        background: rgba(1, 1, 1, 0.1);
      }
      &.bg:hover {
        box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.2);
      }
    }
  }
`;

export default ColorPanel;

type Position = {
  left?: string;
  bottom?: string;
  right?: string;
  top?: string;
};

function calcPosition(
  ref: React.RefObject<HTMLElement>,
  width: number,
  height: number,
  viewPortHeight: number | void
): Position {
  if (width === 0 || height === 0 || !viewPortHeight) {
    return {
      left: "-1000px",
      top: "0",
    };
  }
  const rect = ref.current?.getBoundingClientRect();
  if (rect && rect.bottom + height + 20 > viewPortHeight) {
    return {
      left: "0",
      bottom: "40px",
    };
  } else {
    return {
      left: "0",
      top: "calc(100% + 20px)",
    };
  }
}
