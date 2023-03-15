import React from "react";
import { findParentNode } from "prosemirror-utils";
import CommandMenu, { Props } from "./CommandMenu";
import BlockMenuItem from "./BlockMenuItem";
import getSideMenuItems from "../menus/side";

type SideMenuProps = Omit<Props, "renderMenuItem" | "items" | "onClearSearch"> &
  Required<Pick<Props, "onLinkToolbarOpen" | "embeds">>;

class SideMenu extends React.Component<SideMenuProps> {
  get items() {
    return getSideMenuItems(this.props.dictionary);
  }

  clearSearch = () => {
    const { state, dispatch } = this.props.view;
    const parent = findParentNode(node => !!node)(state.selection);

    if (parent) {
      dispatch(state.tr.insertText("", parent.pos, state.selection.to));
    }
  };

  render() {
    return (
      <CommandMenu
        {...this.props}
        filterable={true}
        onClearSearch={this.clearSearch}
        renderMenuItem={(item, _index, options) => {
          return (
            <BlockMenuItem
              onClick={options.onClick}
              selected={options.selected}
              icon={item.icon}
              title={item.title}
              shortcut={item.shortcut}
            />
          );
        }}
        items={this.items}
      />
    );
  }
}

export default SideMenu;
