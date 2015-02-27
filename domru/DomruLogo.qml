Item {
	height: logoImage.height;
	anchors.top: renderer.top;
	anchors.left: renderer.left;
	anchors.leftMargin: 75;
	anchors.topMargin: 42;

	Image {
		id: logoImage;
		anchors.top: parent.top;
		anchors.left: parent.left;
		source: "res/logoDomru.png";
	}

	CurrentTimeText {
		anchors.top: logoImage.top;
		anchors.left: logoImage.right;
		anchors.leftMargin: 10;
		color: "white";
		font.pointSize: 16;
	}

	CurrentDateText {
		anchors.bottom: logoImage.bottom;
		anchors.left: logoImage.right;
		anchors.leftMargin: 10;
		color: "#ccc";
	}
}