import { NextIcon } from "outline-icons";
import React, { useEffect, useRef, useState } from "react";
import { Portal } from "react-portal";
import styled from "styled-components";
import { Props, Wrapper } from "./CommandMenu";
import FixedMenuSub from "./FixedMenuSub";
import getSideMenuItems from "../menus/side";

type FixedMenuProps = Omit<
  Props,
  | "search"
  | "onClearSearch"
  | "uploadImage"
  | "onLinkToolbarOpen"
  | "onImageUploadStart"
  | "onImageUploadStop"
  | "onShowToast"
  | "embeds"
> & {
  anchor: Element | null;
};

type Position = {
  left?: number;
  top?: number;
  bottom?: number;
  isAbove: boolean;
  selectedIndex: number;
};

const defaultPosition: Position = {
  left: -1000,
  top: 0,
  bottom: undefined,
  isAbove: false,
  selectedIndex: 0,
};

function FixedMenu(props: FixedMenuProps) {
  const {
    id = "side-menu-container",
    isActive,
    view,
    onClose,
    renderMenuItem,
  } = props;

  const items = getSideMenuItems(props.dictionary);
  const [position, setPosition] = useState<Position>({ ...defaultPosition });
  const menuRef = useRef<HTMLElement>();

  const handleModalClicked = e => {
    const container = e.target?.closest(`#${id}`);
    if (!container) onClose();
  };

  useEffect(() => {
    if (isActive) {
      const newPosition = calculatePosition(props, menuRef);
      setPosition(position => ({ ...position, ...newPosition }));
      document.body.setAttribute("style", "overflow: hidden;");
    } else {
      setPosition({ ...defaultPosition });
      document.body.setAttribute("style", "");
    }
  }, [isActive]);

  return (
    <Portal>
      <Modal active={isActive} onClick={handleModalClicked}>
        <Container id={id} active={isActive} ref={menuRef} {...position}>
          <List>
            {items.map((item, index) => {
              if (item.name === "separator") {
                return (
                  <ListItem key={index}>
                    <hr />
                  </ListItem>
                );
              }
              const selected = index === position.selectedIndex && isActive;

              if (!item.title) {
                return null;
              }

              return (
                <ListItem key={index}>
                  {renderMenuItem(item as any, index, {
                    selected,
                    onClick: () => item.onClick?.(view, onClose),
                  })}
                  {item.subMenus && (
                    <>
                      <NextIcon className="next" />
                      <FixedMenuSub
                        className="submenu-wrapper"
                        subMenus={item.subMenus}
                        renderMenuItem={renderMenuItem}
                        view={view}
                        onClose={onClose}
                      />
                    </>
                  )}
                </ListItem>
              );
            })}
          </List>
          {items.length === 0 && (
            <ListItem>
              <Empty>{props.dictionary.noResults}</Empty>
            </ListItem>
          )}
        </Container>
      </Modal>
    </Portal>
  );
}

export const List = styled.ol`
  list-style: none;
  text-align: left;
  height: 100%;
  padding: 8px 0;
  margin: 0;
`;

export const ListItem = styled.li`
  padding: 0;
  margin: 0;
  position: relative;
  .next {
    position: absolute;
    right: 0;
    top: 6px;
  }
  .submenu-wrapper {
    display: none;
  }
  &:hover {
    .submenu-wrapper {
      display: block;
    }
  }
`;

const Empty = styled.div`
  display: flex;
  align-items: center;
  color: ${props => props.theme.textSecondary};
  font-weight: 500;
  font-size: 14px;
  height: 36px;
  padding: 0 16px;
`;

const Modal = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  visibility: ${props => (props.active ? "visible" : "hidden")};
  z-index: 999;
`;

const Container = styled(Wrapper)`
  width: 220px;
  max-height: initial;
  overflow: visible;
`;

function calculatePosition(
  props: FixedMenuProps,
  menuRef: React.MutableRefObject<HTMLElement | undefined>
) {
  const { anchor } = props;
  const ref = menuRef.current;
  const margin = 24;
  if (!ref || !anchor) return defaultPosition;

  const anchorRect = anchor.getBoundingClientRect();
  const offsetHeight = ref.offsetHeight;
  let top = anchorRect.top - offsetHeight / 2 + anchor.clientHeight / 2;
  const bottom = anchorRect.bottom + offsetHeight / 2;

  if (top < 0) {
    top = margin;
  } else if (bottom > window.innerHeight) {
    top -= bottom - window.innerHeight;
  }

  return {
    left: anchorRect.right,
    top,
    bottom: undefined,
  };
}

export default FixedMenu;
