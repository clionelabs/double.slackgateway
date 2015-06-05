SlackService = {
  teamClients: {},

  startup: () => {
    console.log("SlackService startup");

    // Setup base slack team
    if (Meteor.settings.baseTeamAuthToken) {
      let authToken = Meteor.settings.baseTeamAuthToken;
      SlackService.baseTeamClient = new BaseSlackTeamClient(authToken);
    }

    // Setup client slack teams
    Teams.find().observe({
      added: function(teamDoc) {
        console.log('adding team: ', teamDoc);
        let teamClient = new SlackTeamClient(teamDoc.authToken);
        SlackService.teamClients[teamDoc._id] = teamClient;
      },

      removed: function(id) {
        console.log('removing team: ', id);
        // TODO: close client connection
      }
    });

  }
}
