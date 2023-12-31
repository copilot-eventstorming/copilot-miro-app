import React from "react";
import styled from "@emotion/styled";

const backgroundColor = '#FFFFFF'; // 灰色

const DrawerOpen = styled.div`
    width: 0;
    height: 0;
    padding: 0px;
    border-left: 8px solid transparent;
    border-right: 8px solid transparent;
    border-top: 8px solid #FF7600;
    border-bottom: 0px solid transparent; /* 修改这一行 */
    background-color: ${backgroundColor};
`;

const DrawerClosed = styled.div`
    width: 0;
    height: 0;
    margin-left: 8px;
    border-top: 8px solid ${backgroundColor};
    border-bottom: 8px solid ${backgroundColor};
    border-left: 8px solid #FF7600;
    border-right: 0px solid transparent; /* 修改这一行 */
    background-color: ${backgroundColor}; /* 添加这一行 */
    margin-right: 0px;
    padding: 0px;
`;
interface DrawerProps {
    isOpen: boolean;
    toggleDrawer: () => void;
    style?: React.CSSProperties;
}

export const Drawer: React.FC<DrawerProps> = ({isOpen, toggleDrawer}) => {
    return isOpen ? <DrawerOpen onClick={toggleDrawer}/> : <DrawerClosed onClick={toggleDrawer}/>;
}