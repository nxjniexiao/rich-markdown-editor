import React from "react";
import { Props } from "./CommandMenu";
import BlockMenuItem from "./BlockMenuItem";
import getSideMenuItems from "../menus/side";
import FixedMenu from "./FixedMenu";

type SideMenuProps = Omit<
  Props,
  | "renderMenuItem"
  | "items"
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

function SideMenu(props: SideMenuProps) {
  const items = props.isActive
    ? getSideMenuItems({
        dictionary: props.dictionary,
        state: props.view.state,
      })
    : [];

  const renderMenuItem = (item, _index, options) => {
    return (
      <BlockMenuItem
        onClick={options.onClick}
        active={item.active?.(props.view.state)}
        icon={item.icon}
        title={item.title}
        shortcut={item.shortcut}
      />
    );
  };

  return (
    <FixedMenu
      {...props}
      filterable={true}
      renderMenuItem={renderMenuItem}
      items={items}
    />
  );
}

export default SideMenu;
