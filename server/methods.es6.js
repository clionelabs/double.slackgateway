Meteor.methods({
  addAuthToken: function(authToken) {
    let url = 'https://slack.com/api/auth.test';
    console.log("token: ", authToken);
    let result = HTTP.post(url, {params: {token: authToken}});
    let data = result.data;
    if (data.ok) {
      let teamId = data.team_id;
      let teamName = data.team;
      let team = Teams.findOne({teamId: teamId});
      if (team) {
        throw new Meteor.Error("Auth Failed", "Team already existed");
      }
      Teams.insert({teamId: teamId, teamName: teamName, authToken: authToken});
    } else {
      throw new Meteor.Error("Auth Failed", "Invalid token");
    }
  }
});
