Meteor.publish('teams', function() {
  if (!this.userId) return [];

  return [
    Teams.find(),
    TeamChannels.find()
  ]
});

Meteor.publish('teamChannel', function(channelId) {
  if (!this.userId) return [];

  return [
    TeamChannels.find({channelId: channelId}),
    TeamChannelMessages.find({channelId: channelId})
  ]
});
