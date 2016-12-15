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
      var html_comment_text = this.comment().text();
      var plain_text = this.$(html_comment_text).text();

      if (plain_text.length < 1) {
        return true;
      }

      var self = this;
      this.switchTo('modal');
      this.show();
      this.$('.my_modal').modal({
        backdrop: false,
        keyboard: false
      });
      this.$("p#message_to_save").append(html_comment_text);
      this.$('.cancel-ticket-submit').click(function(){
        self.cancel();
        self.init();
      });
      var tick = this.getDelay();
      this.$("#tick_timer").text(tick);
      // bail out if delay set to off
      if (tick <= 0) { return; }

      stopped = false;

      return this.promise(function (done, fail) {
        this.$('.save-ticket-submit').click(function(){
          console.log('clicked save');
          done();
        });
        tickTimer = setInterval(function () {
          if (stopped) {
            clearInterval(tickTimer);
            self.$(".my_modal").hide();
            if (self.setting('allow_agents_choose_timeout')) {
              var delay = self.getDelay();
              self.switchTo('settings');
              self.$('.delay-settings-dropdown').zdSelectMenu('setValue', delay);
            }
            fail(cancelledMessage);
          } else {
            tick--;
            self.$("#tick_timer").text(tick);
            if (tick === 0) {
              clearInterval(tickTimer);
              self.$(".my_modal").hide();
              if (self.setting('allow_agents_choose_timeout')) {
                var delay = self.getDelay();
                self.switchTo('settings');
                self.$('.delay-settings-dropdown').zdSelectMenu('setValue', delay);
              }
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
