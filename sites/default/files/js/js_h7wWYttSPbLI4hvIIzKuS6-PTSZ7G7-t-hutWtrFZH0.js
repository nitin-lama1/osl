/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal) {
  var autocomplete = void 0;

  function autocompleteSplitValues(value) {
    var result = [];
    var quote = false;
    var current = '';
    var valueLength = value.length;
    var character = void 0;

    for (var i = 0; i < valueLength; i++) {
      character = value.charAt(i);
      if (character === '"') {
        current += character;
        quote = !quote;
      } else if (character === ',' && !quote) {
        result.push(current.trim());
        current = '';
      } else {
        current += character;
      }
    }
    if (value.length > 0) {
      result.push($.trim(current));
    }

    return result;
  }

  function extractLastTerm(terms) {
    return autocomplete.splitValues(terms).pop();
  }

  function searchHandler(event) {
    var options = autocomplete.options;

    if (options.isComposing) {
      return false;
    }

    var term = autocomplete.extractLastTerm(event.target.value);

    if (term.length > 0 && options.firstCharacterBlacklist.indexOf(term[0]) !== -1) {
      return false;
    }

    return term.length >= options.minLength;
  }

  function sourceData(request, response) {
    var elementId = this.element.attr('id');

    if (!(elementId in autocomplete.cache)) {
      autocomplete.cache[elementId] = {};
    }

    function showSuggestions(suggestions) {
      var tagged = autocomplete.splitValues(request.term);
      var il = tagged.length;
      for (var i = 0; i < il; i++) {
        var index = suggestions.indexOf(tagged[i]);
        if (index >= 0) {
          suggestions.splice(index, 1);
        }
      }
      response(suggestions);
    }

    var term = autocomplete.extractLastTerm(request.term);

    function sourceCallbackHandler(data) {
      autocomplete.cache[elementId][term] = data;

      showSuggestions(data);
    }

    if (autocomplete.cache[elementId].hasOwnProperty(term)) {
      showSuggestions(autocomplete.cache[elementId][term]);
    } else {
      var options = $.extend({ success: sourceCallbackHandler, data: { q: term } }, autocomplete.ajax);
      $.ajax(this.element.attr('data-autocomplete-path'), options);
    }
  }

  function focusHandler() {
    return false;
  }

  function selectHandler(event, ui) {
    var terms = autocomplete.splitValues(event.target.value);

    terms.pop();

    terms.push(ui.item.value);

    event.target.value = terms.join(', ');

    return false;
  }

  function renderItem(ul, item) {
    return $('<li>').append($('<a>').html(item.label)).appendTo(ul);
  }

  Drupal.behaviors.autocomplete = {
    attach: function attach(context) {
      var $autocomplete = $(context).find('input.form-autocomplete').once('autocomplete');
      if ($autocomplete.length) {
        var blacklist = $autocomplete.attr('data-autocomplete-first-character-blacklist');
        $.extend(autocomplete.options, {
          firstCharacterBlacklist: blacklist || ''
        });

        $autocomplete.autocomplete(autocomplete.options).each(function () {
          $(this).data('ui-autocomplete')._renderItem = autocomplete.options.renderItem;
        });

        $autocomplete.on('compositionstart.autocomplete', function () {
          autocomplete.options.isComposing = true;
        });
        $autocomplete.on('compositionend.autocomplete', function () {
          autocomplete.options.isComposing = false;
        });
      }
    },
    detach: function detach(context, settings, trigger) {
      if (trigger === 'unload') {
        $(context).find('input.form-autocomplete').removeOnce('autocomplete').autocomplete('destroy');
      }
    }
  };

  autocomplete = {
    cache: {},

    splitValues: autocompleteSplitValues,
    extractLastTerm: extractLastTerm,

    options: {
      source: sourceData,
      focus: focusHandler,
      search: searchHandler,
      select: selectHandler,
      renderItem: renderItem,
      minLength: 1,

      firstCharacterBlacklist: '',

      isComposing: false
    },
    ajax: {
      dataType: 'json'
    }
  };

  Drupal.autocomplete = autocomplete;
})(jQuery, Drupal);;
/**
 * @file
 * JavaScript behaviors for select menu.
 */

(function ($, Drupal) {

  'use strict';

  /**
   * Disable select menu options using JavaScript.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformSelectOptionsDisabled = {
    attach: function (context) {
      $('select[data-webform-select-options-disabled]', context).once('webform-select-options-disabled').each(function () {
        var $select = $(this);
        var disabled = $select.attr('data-webform-select-options-disabled').split(/\s*,\s*/);
        $select.find('option').filter(function isDisabled() {
          return ($.inArray(this.value, disabled) !== -1);
        }).attr('disabled', 'disabled');
      });
    }
  };


})(jQuery, Drupal);
;
/**
 * @file
 * JavaScript behaviors for checkboxes.
 */

(function ($, Drupal) {

  'use strict';

  /**
   * Adds check all or none checkboxes support.
   *
   * @type {Drupal~behavior}
   *
   * @see https://www.drupal.org/project/webform/issues/3068998
   */
  Drupal.behaviors.webformCheckboxesAllorNone = {
    attach: function (context) {
      $('[data-options-all], [data-options-none]', context)
        .once('webform-checkboxes-all-or-none')
        .each(function () {
          var $element = $(this);

          var options_all_value = $element.data('options-all');
          var options_none_value = $element.data('options-none');

          // Get all checkboxes.
          var $checkboxes = $element.find('input[type="checkbox"]');
          // Get all options/checkboxes.
          var $options = $checkboxes
            .not('[value="' + options_all_value + '"]')
            .not('[value="' + options_none_value + '"]');

          // All of the above.
          if (options_all_value) {
            var $options_all = $element
              .find(':checkbox[value="' + options_all_value + '"]');
            $options_all.on('click', function () {
              var checked = this.checked;
              $checkboxes.each(function () {
                if (this.value === options_none_value) {
                  this.checked = false;
                }
                else {
                  this.checked = checked;
                }
              });
            });

            $options.on('click', toggleCheckAllEventHandler);
            toggleCheckAllEventHandler();

            /**
             * Toggle check all checkbox checked state.
             */
            function toggleCheckAllEventHandler() {
              var checked = true;
              $options.each(function () {
                if (!this.checked) {
                  checked = false;
                }
              });
              $options_all[0].checked = checked;
            }
          }

          // None of the above.
          if (options_none_value) {
            var $options_none = $element.find(':checkbox[value="' + options_none_value + '"]');
            $options_none.on('click', toggleCheckNoneEventHandler);
            toggleCheckNoneEventHandler();

            /**
             * Toggle check none checkbox checked state.
             */
            function toggleCheckNoneEventHandler() {
              var checked = $options_none[0].checked;
              $checkboxes.each(function () {
                if (this.value !== options_none_value) {
                  if (checked && this.checked) {
                    this.checked = false;
                    $(this).change();
                  }
                  this.disabled = checked;
                }
              });
            }

          }
        });
    }
  };

  /**
   * Adds HTML5 validation to required checkboxes.
   *
   * @type {Drupal~behavior}
   *
   * @see https://www.drupal.org/project/webform/issues/3068998
   */
  Drupal.behaviors.webformCheckboxesRadiosRequired = {
    attach: function (context) {
      $('.js-webform-type-checkboxes.required, .js-webform-type-webform-radios-other.checkboxes', context)
        .once('webform-checkboxes-required')
        .each(function () {
          var $element = $(this);
          var $firstCheckbox = $element
            .find('input[type="checkbox"]')
            .first();

          // Copy clientside_validation.module's message to the checkboxes.
          if ($element.attr('data-msg-required')) {
            $firstCheckbox.attr('data-msg-required', $element.attr('data-msg-required'));
          }

          $element.find('input[type="checkbox"]').on('click', required);
          required();

          function required() {
            var isChecked = $element.find('input[type="checkbox"]:checked');
            if (isChecked.length) {
              $firstCheckbox
                .removeAttr('required')
                .removeAttr('aria-required');
            }
            else {
              $firstCheckbox.attr({
                'required': 'required',
                'aria-required': 'true'
              });
            }
          }
        });
    }
  };

})(jQuery, Drupal);
;
/**
 * @file
 * JavaScript behaviors for radio buttons.
 */

(function ($, Drupal) {

  'use strict';

  /**
   * Adds HTML5 validation to required radios buttons.
   *
   * @type {Drupal~behavior}
   *
   * @see Issue #2856795: If radio buttons are required but not filled form is nevertheless submitted.
   */
  Drupal.behaviors.webformRadiosRequired = {
    attach: function (context) {
      $('.js-webform-type-radios, .js-webform-type-webform-radios-other', context).each(function () {
        var $element = $(this);
        var $radios = $element.find('input[type="radio"]');
        if ($element.hasClass('required')) {
          $radios.attr({'required': 'required', 'aria-required': 'true'});
        }
        // Copy clientside_validation.module's message to the radio buttons.
        if ($element.attr('data-msg-required')) {
          $radios.attr({'data-msg-required': $element.attr('data-msg-required')});
        }
      });
    }
  };

})(jQuery, Drupal);
;
/**
 * @file
 * JavaScript behaviors for options elements.
 */

(function ($, Drupal) {

  'use strict';

  /**
   * Attach handlers to options buttons element.
   *
   * @type {Drupal~behavior}
   */
  Drupal.behaviors.webformOptionsButtons = {
    attach: function (context) {
      // Place <input> inside of <label> before the label.
      $(context).find('label.webform-options-display-buttons-label > input[type="checkbox"], label.webform-options-display-buttons-label > input[type="radio"]').each(function () {
        var $input = $(this);
        var $label = $input.parent();
        $input.detach().insertBefore($label);
      });
    }
  };


})(jQuery, Drupal);
;