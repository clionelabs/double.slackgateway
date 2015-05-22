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
      let teamChannel = TeamChannels.findOne({teamId: teamId, channelId: channelId});
      let lastMessageTS = teamChannel.lastMessageTS;
      if (!lastMessageTS || lastMessageTS < options.ts) {
        lastMessageTS = options.ts;
      }
      TeamChannels.update({teamId: teamId, channelId: channelId}, {$set: {lastMessageTS: lastMessageTS}, $inc: {messageCount: 1}});
    }
  }
});

TeamChannelMessage = {

}

