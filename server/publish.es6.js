Meteor.publish('teams', function() {
  return [
    Teams.find(),
    TeamChannels.find()
  ]
});

Meteor.publish('teamChannel', function(channelId) {
  return [
    TeamChannels.find({channelId: channelId}),
    TeamChannelMessages.find({channelId: channelId})
  ]
});
