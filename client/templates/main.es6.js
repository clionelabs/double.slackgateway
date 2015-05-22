Template.main.rendered = function() {
  let team = Teams.findOne();
  if (team) {
    Session.set("mainTabActiveTeamId", team.teamId);
  }
};

Template.main.destroyed = function() {
  Session.set("mainTabActiveTeamId", null);
};

Template.main.events({
  'click .team-tab': function(event) {
    Session.set("mainTabActiveTeamId", this.teamId);
  },

  'click .team-setup-tab': function(event) {
    Session.set("mainTabActiveTeamId", null);
  }
});

Template.main.helpers({
  isActiveTeam: function(team) {
    return Session.get("mainTabActiveTeamId") === team.teamId;
  },

  isSetup: function() {
    return !Session.get("mainTabActiveTeamId");
  },

  activeTeam: function() {
    let teamId = Session.get("mainTabActiveTeamId");
    return Teams.findOne({teamId: teamId});
  }
});

Template.team.events({
  'click .channel-row': function(event) {
    Router.go('channel', {channelId: this.channelId});
  }
});

Template.teamSetup.events({
  "submit #add-team-form": function(event) {
    event.preventDefault();

    let form = event.target;
    let authToken = form.authToken.value;
    Meteor.call('addAuthToken', authToken, function(error) {
      if (error) {
        Notifications.error(error.error, error.reason);
        jQuery('html,body').animate({scrollTop:0},0);
      } else {
        Notifications.success("Successful", "Team added");
        form.authToken.value = '';
      }
    });
  }
});
