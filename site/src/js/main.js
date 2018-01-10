import riot from "riot";
import "./app.tag";
import "./md.tag";
import "./menubar.tag";


var state = {
  menuBar: {
    selected: "musee"
  }
}

riot.mount("app", state);

