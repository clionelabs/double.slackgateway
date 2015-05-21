TeamChannels = new Meteor.Collection("team_channels", {transform: function(doc){
  return _.extend(doc, TeamChannel);
}});

_.extend(TeamChannels, {
  findOrCreate: function(options) {
    let teamChannel = TeamChannels.findOne({teamId: options.teamId, channelId: options.channelId});
    if (!teamChannel) {
      let id = TeamChannels.insert(options);
    }
  }
});

TeamChannel = {
  messages: function() {
    return TeamChannelMessages.find({channelId: this.channelId}, {sort: {ts: -1}});
  }
}
