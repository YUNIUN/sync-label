import { init } from './init';
import { registerEvent } from './millionEvent';

(async function () {
  registerEvent();
  init();
})();
