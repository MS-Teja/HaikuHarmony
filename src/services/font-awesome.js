import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { faCoffee, faBars } from '@fortawesome/free-solid-svg-icons'; // Import specific icons

library.add(faCoffee, faBars); // Add icons to the library

export { FontAwesomeIcon };