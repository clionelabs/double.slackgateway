TeamChannelMessages = new Meteor.Collection("team_channel_messages", {transform: function(doc) {
  return _.extend(doc, TeamChannelMessage);
}});

_.extend(TeamChannelMessages, {
  insertIfNotExisted: function(options) {
    let teamId = options.teamId;
    let channelId = options.channelId;
    let message = TeamChannelMessages.findOne({teamId: teamId, channelId: channelId, ts: options.ts});
    if (!message) {
      TeamChannelMessages.insert(options);
      TeamChannels.update({teamId: teamId, channelId: channelId}, {$max: {lastMessageTS: options.ts}, $inc: {messageCount: 1}});
    }
  }
});

TeamChannelMessage = {

}

