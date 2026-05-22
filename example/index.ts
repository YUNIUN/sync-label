import { registerEvent } from "./event";
import { init } from "./init";

(async function () {
  registerEvent();
  init();
})();
