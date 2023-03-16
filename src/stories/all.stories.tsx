import Editor from "./index";
import { Props } from "..";
import React from "react";
import { Story, Meta } from "@storybook/react/types-6-0";
import * as stories from "./index.stories";
import "./style.css";

export default {
  title: "Editor",
  component: Editor,
  argTypes: {
    value: { control: "text" },
    readOnly: { control: "boolean" },
    onSave: { action: "save" },
    onCancel: { action: "cancel" },
    onClickHashtag: { action: "hashtag clicked" },
    onClickLink: { action: "link clicked" },
    onHoverLink: { action: "link hovered" },
    onShowToast: { action: "toast" },
    onFocus: { action: "focused" },
    onBlur: { action: "blurred" },
    disableExtensions: { control: "array" },
  },
  args: {
    disableExtensions: [],
  },
} as Meta;

const Template: Story<Props> = args => <Editor {...args} />;

export const All = Template.bind({});
All.args = { defaultValue: "" };
All.args.defaultValue = Object.keys(stories).reduce((prev, name) => {
  if (name === "default") return prev;
  // eslint-disable-next-line import/namespace
  return (prev += stories[name].args.defaultValue + "\n");
}, "");
