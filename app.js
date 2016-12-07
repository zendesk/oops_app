(function () {

  var DEFAULT_DELAY = 10,
      cancelMessage,
      cancelledMessage,
      tickTimer,
      stopped,
      delay;

  return {
    events: {
      'app.activated': 'init',
      'ticket.save': 'save',
      'ticket.submit.always': 'cleanTimer',
      'click .cancel-ticket-submit': 'cancel',
      'zd_ui_change .delay-settings-dropdown': 'updateSettings'
    },

    init: function () {
      cancelMessage = helpers.fmt("<a tabindex='-1' onclick='$(\"#cancel-ticket-submit\").trigger(\"click\");'><strong>%@</strong></a>", this.I18n.t('cancelMessage'));
      cancelledMessage = this.I18n.t('cancelledMessage');
      delay = this.getDelay();
      this.store({'ticketSubmissionUserDelay': delay});

      this.switchTo('settings');
      this.$('.delay-settings-dropdown').zdSelectMenu('setValue', delay);
      if (!this.setting('allow_agents_choose_timeout')) {
        this.hide();
      }
    },

    updateSettings: function () {
      var userDelay = parseInt(this.$('.delay-settings-dropdown').zdSelectMenu('value'), 10);
      this.store({'ticketSubmissionUserDelay': userDelay});
    },

    cancel: function() {
      stopped = true;
    },

    cleanTimer: function () {
      clearInterval(tickTimer);
    },

    save: function () {
      var self = this;
      this.switchTo('modal');
      this.show();
      this.$('.my_modal').modal({
        backdrop: true,
        keyboard: false
      });
      var comment_text = this.comment().text();
      this.$("p#message_to_save").append(comment_text);
      this.$('.cancel-ticket-submit').click(function(){
        self.cancel();
        self.hide();
      });
      var tick = this.getDelay();
      // bail out if delay set to off
      if (tick <= 0) { return; }

      stopped = false;

      return this.promise(function (done, fail) {
        tickTimer = setInterval(function () {
          if (stopped) {
            clearInterval(tickTimer);
            fail(cancelledMessage);
          } else {
            tick--;
            if (tick === 0) {
              clearInterval(tickTimer);
              done();
            }
          }
        }, 1000);
      });
    },

    getDelay: function () {
      var myDelay = this.store('ticketSubmissionUserDelay');
      if (myDelay !== 0 && !myDelay) {
        myDelay = DEFAULT_DELAY;
      }

      return myDelay;
    }
  };
}());
