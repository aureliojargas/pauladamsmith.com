(function($) {
  function getPosition(element, tooltip) {
    var position = $(element).offset(),
        top = position.top,
        left = position.left,
        width = $(tooltip).outerWidth(),
        height = $(tooltip).outerHeight();

    top -= height;
    //left += ($(element).outerWidth() / 2) - (width / 2);
    return {top: top, left: left};
  }

  function Tooltip(trigger) {
    var self = this,
        tooltip = $('<div class="tooltip"><div class="wrap"></div></div>'),
        content = $(trigger).attr('title');

    tooltip.find('.wrap').html(content);
    $(document.body).append(tooltip);

    $.extend(this, {
      show: function() {
        var pos = getPosition(trigger, tooltip);

        tooltip.show();
        tooltip.css({
          position: 'absolute',
          top: pos.top,
          left: pos.left
        });
      },

      hide: function() {
        tooltip.hide();
      }
    });

    $(trigger).bind('mouseenter', function() {
      self.show();
    });

    $(trigger).bind('mouseleave', function() {
      self.hide();
    });
  }

  $.fn.tooltip = function(content) {
    this.each(function() {
      var tooltip = new Tooltip($(this), content);
    });
    return this;
  };
})(jQuery);

$('.team').tooltip();
