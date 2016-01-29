Item {
	width: parent.width;
	height: 70;
	clip: true;

	Rectangle {
		anchors.fill: parent;
		color: colorTheme.activeFocusColor;
		visible: parent.activeFocus;
	}

	Image {
		id: menuItemIcon;
		anchors.left: parent.left;
		anchors.verticalCenter: parent.verticalCenter;
		anchors.leftMargin: 13;
		color: parent.activeFocus ? colorTheme.focusedTextColor : colorTheme.activeTextColor;
		source: colorTheme.res + "menu/" + (parent.activeFocus ? "b_" : "") + model.icon;
	}

	MainText {
		id: innerMenuDelegateText;
		anchors.left: parent.left;
		anchors.right: parent.right;
		anchors.leftMargin: 82;
		anchors.verticalCenter: parent.verticalCenter;
		color: parent.activeFocus ? colorTheme.focusedTextColor : colorTheme.textColor;
		text: model.text;
	}
}