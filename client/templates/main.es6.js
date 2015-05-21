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
