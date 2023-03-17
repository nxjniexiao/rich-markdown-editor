import * as React from "react";
import styled from "styled-components";
import { List, ListItem } from "./FixedMenu";
import { Props } from "./CommandMenu";
import { MenuItem } from "../types";

type FixedMenuSubProps = {
  className: string;
  subMenus: MenuItem["subMenus"];
  renderMenuItem: Props["renderMenuItem"];
  view: Props["view"];
  onClose: Props["onClose"];
};

function FixedMenuSub(props: FixedMenuSubProps) {
  const { className, subMenus = [], renderMenuItem, view, onClose } = props;

  return (
    <SubMenusWrapper className={className}>
      <List>
        {subMenus.map((item, index) => {
          if (item.name === "separator") {
            return (
              <ListItem key={index}>
                <hr />
              </ListItem>
            );
          }
          return (
            <ListItem key={index}>
              {renderMenuItem(item, index, {
                selected: false,
                onClick: () => item.onClick?.(view, onClose),
              })}
            </ListItem>
          );
        })}
      </List>
    </SubMenusWrapper>
  );
}

const SubMenusWrapper = styled.div`
  position: absolute;
  left: 100%;
  top: 0;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 0px 0px 1px,
    rgba(0, 0, 0, 0.08) 0px 4px 8px, rgba(0, 0, 0, 0.08) 0px 2px 4px;
`;

export default FixedMenuSub;
