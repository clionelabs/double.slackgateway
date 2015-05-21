Teams = new Meteor.Collection("teams", {transform: function(doc) {
  return _.extend(doc, Team);
}});

Team = {
  channels: function() {
    return TeamChannels.find({teamId: this.teamId}, {sort: {lastMessageTS: -1}});
  }
}
