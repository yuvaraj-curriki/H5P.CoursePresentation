import { addClickAndKeyboardListeners } from './utils';
import { jQuery as $, EventDispatcher } from './globals';

/**
 * Enum containing possible navigation types
 * @readonly
 * @enum {string}
 */
const navigationType = {
  SPECIFIED: 'specified',
  NEXT: 'next',
  PREVIOUS: 'previous'
};

/**
 * @class
 */
export default class GoToSlide {
  /**
   * Element for linking between slides in presentations.
   *
   * @constructor
   * @param {string} title
   * @param {number} goToSlide
   * @param {boolean} invisible
   * @param {string} goToSlideType
   * @param {object} l10n
   * @param {number} currentIndex
   * @param {object} parent
   */
  constructor({ title, goToSlide = 1, invisible, goToSlideType  = navigationType.SPECIFIED }, { l10n, currentIndex, parent }) {
    this.eventDispatcher = new EventDispatcher();
    let classes = 'h5p-press-to-go';
    let tabindex = 0;

    if (invisible) {
      title = undefined;
      tabindex = -1;
    }
    else {
      if (!title) {
        // No title so use the slide number, prev, or next.
        switch (goToSlideType) {
          case navigationType.SPECIFIED:
            title = l10n.goToSlide.replace(':num', goToSlide.toString());
            break;
          case navigationType.NEXT:
            title = l10n.goToSlide.replace(':num', l10n.nextSlide);
            break;
          case navigationType.PREVIOUS:
            title = l10n.goToSlide.replace(':num', l10n.prevSlide);
            break;
        }
      }
      classes += ' h5p-visible';
    }

    // Default goes to the set number
    let goTo = goToSlide - 1;

    // Check if previous or next is selected.
    if (goToSlideType === navigationType.NEXT) {
      goTo = currentIndex + 1;
    }
    else if (goToSlideType === navigationType.PREVIOUS) {
      goTo = currentIndex - 1;
    }

    // Create button that leads to another slide
    this.$element = $('<a/>', {
      href: '#',
      'class': classes,
      tabindex: tabindex,
      title: title
    });

    addClickAndKeyboardListeners(this.$element, event => {
      this.triggerXAPIConsumed(title, parent);
      this.eventDispatcher.trigger('navigate', goTo);
      event.preventDefault();
    });
  }

  /**
   * Attach element to the given container.
   *
   * @public
   * @param {jQuery} $container
   */
  attach($container) {
    $container.html('').addClass('h5p-go-to-slide').append(this.$element);
  }

  /**
   * Register an event listener
   *
   * @param {string} name
   * @param {function} callback
   */
  on(name, callback) {
    this.eventDispatcher.on(name, callback);
  }


  /**
   * Trigger the 'consumed' xAPI event
   *
   */
  triggerXAPIConsumed(title, parent) {
    var xAPIEvent = parent.parent.createXAPIEventTemplate({
      id: 'http://activitystrea.ms/schema/1.0/consume',
      display: {
        'en-US': 'consumed'
      }
    }, {
      result: {
        completion: true
      }
    });

    Object.assign(xAPIEvent.data.statement.object.definition, {
      name: {
        'en-US': title || 'Go To slide'
      }
    });

    parent.parent.trigger(xAPIEvent);
  };
}
